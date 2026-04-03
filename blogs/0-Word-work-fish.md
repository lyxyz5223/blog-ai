## 灵感来源
**近期在Bilibili刷到这样一个视频**：
&emsp;&emsp;有网友制作了这样一个网页，网页是一个伪装的Word，这个Word没有什么编辑功能，但是有一个主要作用，那就是摸鱼。这个网页可以导入txt文本（比如小说），然后到伪装的Word打字就能一点一点地把小说内容显示出来，假装自己在努力工作。
&emsp;&emsp;这个想法真的惊到我了，只不过现成的网页功能方面不太完善，用户体验感不太好，于是我决定自己动手丰衣足食。

那么话不多说，直接进入主题，开始动手！

---
## 方案选择与文档资料，Q&A
我目前采用的方案是C++ + MFC + COM的方案。
**选用C++不如Python或者vue/react好写？** 使用C++纯纯是因为个人喜好，如果你不喜欢，没关系，下面的原理依然可以参考。
**为什么使用MFC而不是Qt？** 主要原因是这个框架节省存储占用，而我的这款软件又属于小工具。
**COM方案？** 考虑到自己设计一个类似于Word的界面的软件，成本较高，且学业繁忙时间有限，于是我决定直接采用COM组件方案，只需稍微查阅Microsoft Office 的 Visual Basic for Application文档即可：
[Office Visual Basic for Applications (VBA) 参考 | Microsoft Learn](https://learn.microsoft.com/zh-cn/office/vba/api/overview/ "Office Visual Basic for Applications (VBA) 参考 | Microsoft Learn")
这是Word相关的文档
[Word Visual Basic for Applications (VBA) 参考 | Microsoft Learn](https://learn.microsoft.com/zh-cn/office/vba/api/overview/word "Word Visual Basic for Applications (VBA) 参考 | Microsoft Learn")

---
## 声明
**软件代码发布至Github，请在遵循开源协议的情况下使用！请勿侵权！**
[GitHub - lyxyz5223/FakeWordMfc: Word工作学习伪装，可以在Word中偷偷看小说](https://github.com/lyxyz5223/FakeWordMfc)

---

## 界面设计：
- **主窗口**：
![image](https://img2024.cnblogs.com/blog/3496432/202512/3496432-20251221232150007-1760990218.png)
- **设置窗口**：
![image](https://img2024.cnblogs.com/blog/3496432/202512/3496432-20251221232306988-421202834.png)
- **状态显示窗口**：
![image](https://img2024.cnblogs.com/blog/3496432/202512/3496432-20251221232330169-1228628945.png)

---
## 设计思路与代码讲解
设计完毕，开始Coding.

首先需要包含COM相关的库：
需要注意的是，下面代码中“导入Word库”不是一次性完成的，步骤如下：
1. 打开电脑上的Word/WPS Office，通过任务管理器找到其安装路径，如图：
![image](https://img2024.cnblogs.com/blog/3496432/202512/3496432-20251221233444739-887422691.png)
2. 在相同目录下找到MSWORD.OLB文件，复制其路径，然后写入代码中，使用#import 导入：
```cpp
#import "C:\\Program Files\\Microsoft Office\\root\\Office16\\MSWORD.OLB"
```
3. 直接编译，编译器会自动生成相关文件，会发现编译失败且出现99+个错误，不必理会，双击任意一个与Word相关的报错，进入头文件MSWORD.tlh，手动回到该文件开头(Ctrl + Home)，发现如下模板内容
```cpp
// Created by Microsoft (R) C/C++ Compiler Version 14.40.33813.0 (9dc93bb3).
//
// D:\C++\FakeWordMfc\FakeWordMfc\x64\Debug\MSWORD.tlh
//
// C++ source equivalent of Win32 type library C:\\Program Files\\Microsoft Office\\root\\Office16\\MSWORD.OLB
// compiler-generated file - DO NOT EDIT!

//
// Cross-referenced type libraries:
// #import "C:\Program Files\Microsoft Office\Root\VFS\ProgramFilesCommonX64\Microsoft Shared\OFFICE16\MSO.DLL"
// #import "C:\Program Files\Microsoft Office\Root\VFS\ProgramFilesCommonX86\Microsoft Shared\VBA\VBA6\VBE6EXT.OLB"
//

#pragma once
#pragma pack(push, 8)

#include <comdef.h>

namespace Word {...}
```
其中 **Cross-referenced type libraries:** 部分有一个/多个#import语句，直接复制粘贴到步骤2语句的上一行并去掉注释，但是不要着急立即编译，立即编译同样失败，这时候请看步骤4
4. 回到MSWORD.tlh头文件，直接修改该头文件，编写任意内容保存再次编译即可，例如：
![image](https://img2024.cnblogs.com/blog/3496432/202512/3496432-20251221234623687-682594929.png)

至此，恭喜你完成了COM组件Word库的导入。
完整导入代码如下，注意添加#include <atlbase.h>和#include <atlcom.h>：
```cpp
// 先保存并取消相关宏定义（Windows.h）
#pragma push_macro("FindText")
#pragma push_macro("ExitWindows")
#pragma push_macro("RGB")
#undef FindText
#undef ExitWindows
#undef RGB
// 导入Word库
#import "C:\\Program Files\\Microsoft Office\\Root\\VFS\\ProgramFilesCommonX64\\Microsoft Shared\\OFFICE16\\MSO.DLL"
#import "C:\\Program Files\\Microsoft Office\\Root\\VFS\\ProgramFilesCommonX86\\Microsoft Shared\\VBA\\VBA6\\VBE6EXT.OLB"
#import "C:\\Program Files\\Microsoft Office\\root\\Office16\\MSWORD.OLB"/* rename("FindText", "FindText") rename("ExitWindows", "ExitWindows")*/
// 恢复相关宏定义
#pragma pop_macro("RGB")
#pragma pop_macro("ExitWindows")
#pragma pop_macro("FindText")

#include <atlbase.h>
#include <atlcom.h>
```

接下来就是编写Word的控制，比如打开Word，打开文档...
首先编写WordEventSink类，用于接收Word事件（如文档打开、选中区域更改...）
WordEventSink类继承自IDispatch，IDispatch是COM的底层接口，用于管理WordEventSink对象本身的生命周期（引用计数接口实现），还有QueryInterface方法用于查询当前类支持的接口有哪些，实现的时候只要return S_OK便是支持，并且需要手动赋值对应接口的地址\*ppvObject = static_cast<IDispatch\*>(this)，Invoke方法用于分发事件，实现Invoke方法可以捕获到Word触发的事件并进行处理。
具体事件的绑定方法为，代码包含详细注释
```cpp
Word::_ApplicationPtr pWordApp;
HRESULT hr = pWordApp.CreateInstance(__uuidof(Word::Application)); // 创建Word应用实例
// 挂接事件第一步：通过任一Word的接口地址（如Word::_ApplicationPtr类型变量pWordApp的地址或者Word::_Document类型变量document的地址）获取连接点容器，用于获取事件连接点
CComQIPtr<IConnectionPointContainer> pCPC(pWordApp);
if (!pCPC)
	return E_NOINTERFACE;
// 第二步：通过连接点容器查找对应事件接口的连接点
CComPtr<IConnectionPoint> pCP;
HRESULT hr = pCPC->FindConnectionPoint(eventUuid, &pCP);
if (FAILED(hr))
	return hr;
// 第三步：将当前WordEventSink类挂接上去，从而WordEventSink对象能够收到事件通知
return pCP->Advise(this, &dwCookie); // 挂接
```


**完整代码如下：**

---
**WordController.h**
```cpp
#include "ComResultAndCatch.h"

std::wstring HResultToWString(HRESULT hr);


// 定义事件接收器类
class WordEventSink : public IDispatch
{
public:
    // IUnknown 方法
    STDMETHOD(QueryInterface)(REFIID riid, void** ppvObject) override
    {
        if (riid == IID_IUnknown || riid == IID_IDispatch || riid == eventUuid)
        {
            *ppvObject = static_cast<IDispatch*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    STDMETHOD_(ULONG, AddRef)() override
    {
        return InterlockedIncrement(&_refCount);
    }

    STDMETHOD_(ULONG, Release)() override
    {
        ULONG count = InterlockedDecrement(&_refCount);
        if (count == 0)
        {
            delete this;
        }
        return count;
    }

    // IDispatch 方法
    STDMETHOD(GetTypeInfoCount)(UINT* pctinfo) override
    {
        *pctinfo = 0;
        return S_OK;
    }

    STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo** ppTInfo) override
    {
        *ppTInfo = nullptr;
        return E_NOTIMPL;
    }

    STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR* rgszNames, UINT cNames, LCID lcid, DISPID* rgDispId) override
    {
        return E_NOTIMPL;
    }

    STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pDispParams, VARIANT* pVarResult, EXCEPINFO* pExcepInfo, UINT* puArgErr) override
    {
        std::cout << "dispIdMember: " << dispIdMember << std::endl;
        // 进行事件处理函数分发
        if (callbackInfoMap.count(dispIdMember))
        {
            auto [begin, end] = callbackInfoMap.equal_range(dispIdMember);
            for (auto &it = begin; it != end; it++)
            {
                auto& info = it->second;
                info.callback(pDispParams, info.userData);
            }
            return S_OK;
        }
        return E_NOTIMPL;
    }

public:
    //enum class CallbackExecType {
    //    Sync,
    //    Async
    //};
    typedef std::any UserDataType;
    typedef std::function<Result<bool>(DISPPARAMS* pDispParams, UserDataType userData)> DispatchInvokeCallbackFunction;

private:
    struct DispatchInvokeCallbackInfo {
        DISPID dispIdMember;
        //CallbackExecType execType;
        DispatchInvokeCallbackFunction callback;
        UserDataType userData;
    };
    typedef std::unordered_multimap<DISPID, DispatchInvokeCallbackInfo> CallbackInfoMapType;
    ULONG _refCount = 1;
    IUnknown* ptr = nullptr;
    DWORD dwCookie = 0;
    IID eventUuid;
    CallbackInfoMapType callbackInfoMap;
public:
    /**
     * @param p 需要绑定的接口
     * @param eventUuid 需要绑定的事件的uuid
     */
    WordEventSink(IUnknown* p, const IID eventUuid) {
        this->ptr = p;
        this->eventUuid = eventUuid;
    }

    // 一键绑定
    HRESULT attach()
    {
        try {
            if (!ptr)
                return E_POINTER;
            if (dwCookie)
                return E_PENDING;

            CComQIPtr<IConnectionPointContainer> pCPC(ptr);
            if (!pCPC)
                return E_NOINTERFACE;

            CComPtr<IConnectionPoint> pCP;
            HRESULT hr = pCPC->FindConnectionPoint(eventUuid, &pCP);
            if (FAILED(hr))
                return hr;

            return pCP->Advise(this, &dwCookie); // 挂接
        }
        catch (...) {
            return E_POINTER;
        }
    }

    void detach()
    {
        try {
            if (dwCookie != 0)
            {
                CComQIPtr<IConnectionPointContainer> pCPC(ptr);
                if (pCPC)
                {
                    CComPtr<IConnectionPoint> pCP;
                    if (SUCCEEDED(pCPC->FindConnectionPoint(eventUuid, &pCP)))
                        pCP->Unadvise(dwCookie);
                }
                dwCookie = 0;
            }
        }
        catch (...) {
        }
    }

    /**
     * 注册事件
     * @param eventDispIdMember 注册的事件号码
     * @param callback 回调函数
     */
    void registerEvent(DISPID dispIdMember, DispatchInvokeCallbackFunction callback, UserDataType userData) {
        DispatchInvokeCallbackInfo info{
            dispIdMember,
            callback,
            userData
        };
        this->callbackInfoMap.insert(CallbackInfoMapType::value_type(dispIdMember, info));
    }
};

#define ERRORRESULT_IDNOTFOUND(type) ErrorResult<type>(E_FAIL, L"Id not found")

class WordController
{
    typedef unsigned long long IdType;

public:
	~WordController();
	WordController(bool bCreateApp = true, bool bComInit = false, bool bCreateAppIfComInitFail = true);
    
	// 初始化com组件
    static Result<bool> comInitialize() {
        HRESULT hr = CoInitializeEx(0, COINIT_MULTITHREADED);
        //HRESULT hr = CoInitialize(0);
        return Result<bool>::CreateFromHRESULT(hr, 0);
    }
	// com组件取消初始化
    static void comUninitialize() {
        CoUninitialize();
    }
	// 获取当前对象的Word app实例
    Word::_ApplicationPtr getApp() const {
        return pWordApp;
    }
	// 通过id获取打开的文档地址
    Result<Word::_DocumentPtr> getDocument(IdType id) const {
        if (pWordDocumentMap.count(id))
            return SuccessResult(0, pWordDocumentMap.at(id));
        return ERRORRESULT_IDNOTFOUND(Word::_DocumentPtr);
    }

	// 通过id获取打开的Word窗口
    Result<Word::WindowPtr> getWindow(IdType id) const {
        if (pWordWindowMap.count(id))
            return SuccessResult(0, pWordWindowMap.at(id));
        return ERRORRESULT_IDNOTFOUND(Word::WindowPtr);
    }
	// 获取当前激活的文档
    Result<Word::_DocumentPtr> getActiveDocument() const;
	// 创建Word app实例
    Result<Word::_ApplicationPtr> createApp();
    /**
     * 打开 Word 文档
     * @param file 要打开的文档路径
     * @param ConfirmConversions 是否显示转换对话框（默认 false）
     * @param ReadOnly 是否以只读方式打开（默认 false）
     * @param AddToRecentFiles 是否添加到最近文件列表（默认 true）
     * @param PasswordDocument 打开文档所需密码（默认空）
     * @param PasswordTemplate 打开模板所需密码（默认空）
     * @param Revert 如果文档已打开，是否放弃未保存更改并重新打开（默认 false）
     * @param WritePasswordDocument 保存文档所需密码（默认空）
     * @param WritePasswordTemplate 保存模板所需密码（默认空）
     * @param Format 文档格式（默认 wdOpenFormatAuto）
     * @param Encoding 文档编码（默认 msoEncodingAutoDetect）
     * @param Visible 打开后是否可见（默认 true）
     * @param OpenAndRepair 是否尝试修复损坏文档（默认 false）
     * @param DocumentDirection 文档方向（默认从左到右）
     * @param NoEncodingDialog 是否隐藏编码对话框（默认 false）
     * @param XMLTransform 指定XML文件，用于将 XML 数据转换为格式化的 Word 文档
     */
    Result<Word::_DocumentPtr> openDocument(
      IdType id,
      std::wstring file,
      bool ConfirmConversions = false,
      bool ReadOnly = false,
      bool AddToRecentFiles = true,
      std::wstring PasswordDocument = L"",
      std::wstring PasswordTemplate = L"",
      bool Revert = false,
      std::wstring WritePasswordDocument = L"",
      std::wstring WritePasswordTemplate = L"",
      Word::WdOpenFormat Format = Word::WdOpenFormat::wdOpenFormatAuto,
      Office::MsoEncoding Encoding = Office::MsoEncoding::msoEncodingAutoDetect,
      bool Visible = true,
      bool OpenAndRepair = false,
      Word::WdDocumentDirection DocumentDirection = Word::WdDocumentDirection::wdLeftToRight,
      bool NoEncodingDialog = false,
      std::wstring XMLTransform = L""
    );
    struct DocumentOpenOptions {
      bool confirmConversions = false;
      bool readOnly = false;
      bool addToRecentFiles = true;
      std::wstring passwordDocument = L"";
      std::wstring passwordTemplate = L"";
      bool revert = false;
      std::wstring writePasswordDocument = L"";
      std::wstring writePasswordTemplate = L"";
      Word::WdOpenFormat format = Word::WdOpenFormat::wdOpenFormatAuto;
      Office::MsoEncoding encoding = Office::MsoEncoding::msoEncodingAutoDetect;
      bool visible = true;
      bool openAndRepair = false;
      Word::WdDocumentDirection documentDirection = Word::WdDocumentDirection::wdLeftToRight;
      bool noEncodingDialog = false;
      std::wstring xmlTransform = L"";
    };
    Result<Word::_DocumentPtr> openDocument(IdType docId, std::wstring filePath, DocumentOpenOptions options);
    struct DocumentCloseOptions {
      Word::WdSaveOptions saveChanges = Word::wdPromptToSaveChanges;
      Word::WdOriginalFormat originalFormat = Word::wdWordDocument;
      bool routeDocument = false;
    };
    Result<bool> closeDocument(IdType docId, DocumentCloseOptions options);

    Result<Word::_DocumentPtr> addDocument(IdType id, bool visible = false, std::wstring templateName = L"", bool asNewTemplate = false, Word::WdNewDocumentType documentType = Word::wdNewBlankDocument);
    Result<Word::WindowPtr> newWindow(IdType id);

    Result<bool> setAppVisible(bool visible) const;

    /**
     * 注册事件分发槽
     * @param parent 事件隶属的接口
     * @param eventUuid 事件
     */
    Result<bool> registerEventSink(IUnknown* parent, const IID& eventUuid) {
        // 实例化并存储事件槽对象
        WordEventSink* pWordAppSink = new WordEventSink(parent, eventUuid);
        //// 获取Word事件连接点容器
        //CComPtr<IConnectionPointContainer> icpc;
        //HRESULT hr = pWordApp.QueryInterface(IID_IConnectionPointContainer, &icpc);
        //Result icpcResult = Result<int>::CreateFromHRESULT(hr, 0);
        //if (!icpcResult)
        //{
        //    MessageBox(0, icpcResult.getMessage().c_str(), L"error", MB_ICONERROR);
        //    return;
        //}
        //// 获取Word事件连接点
        //CComPtr<IConnectionPoint> icp;
        //hr = icpc->FindConnectionPoint(__uuidof(Word::ApplicationEvents4), &icp);
        //Result icpResult = Result<int>::CreateFromHRESULT(hr, 0);
        //if (!icpResult)
        //{
        //    MessageBox(0, icpResult.getMessage().c_str(), L"error", MB_ICONERROR);
        //    return;
        //}
        //// 将事件接收器绑定到连接点
        //DWORD dwCookie;
        //hr = icp->Advise(pWordAppSink, &dwCookie);
        //Result adviseResult = Result<int>::CreateFromHRESULT(hr, 0);
        //if (!adviseResult)
        //{
        //    MessageBox(0, adviseResult.getMessage().c_str(), L"error", MB_ICONERROR);
        //    return;
        //}

        // 在EventSink中实现了Advise，因此不需要重新写一遍上述流程，改为下面步骤
        HRESULT hr = dynamic_cast<WordEventSink*>(pWordAppSink)->attach();
        Result pSinkAttachResult = Result<bool>::CreateFromHRESULT(hr, 0);
        if (!pSinkAttachResult)
        {
            delete pWordAppSink;
            std::wstring msg = L"无法注册Word事件槽！\n";
            msg += pSinkAttachResult.getMessage();
            MessageBox(0, msg.c_str(), L"Error", MB_ICONERROR);
        }
        else
            eventSinkMap[eventUuid] = pWordAppSink;
        return pSinkAttachResult;
    }

    /**
     * 注册事件
     * @param eventUuid 之前注册事件槽使用的eventUuid
     * @param 
     */
    Result<bool> registerEvent(const IID& eventUuid, DISPID dispIdMember, WordEventSink::DispatchInvokeCallbackFunction callback, WordEventSink::UserDataType userData) {
        if (!eventSinkMap.count(eventUuid))
        {
            LPOLESTR guidStr = NULL;
            HRESULT hr = StringFromCLSID(eventUuid, &guidStr);
            std::wstring errMsg = L"该事件槽未注册："; errMsg += guidStr ? guidStr : L"";
            std::wstring msg = L"无法注册Word事件！\n"; msg += errMsg;
            if (SUCCEEDED(hr))
            {
                CoTaskMemFree(guidStr);
            }
            MessageBox(0, msg.c_str(), L"Error", MB_ICONERROR);
            return ErrorResult<bool>(0, errMsg);
        }
        eventSinkMap[eventUuid]->registerEvent(dispIdMember, callback, userData);
        return SuccessResult(true);
    }

private:
    // 哈希函数
    struct IIDHash {
        std::size_t operator()(const IID& iid) const noexcept {
            // 把 16 字节当成两个 64 位整数来 hash
            const std::uint64_t* p = reinterpret_cast<const std::uint64_t*>(&iid);
            std::hash<std::uint64_t> h;
            return h(p[0]) ^ (h(p[1]) + 0x9e3779b97f4a7c15ULL);
        }
    };

    // 相等比较（IID 是 POD，直接按位比）
    struct IIDEqual {
        bool operator()(const IID& a, const IID& b) const noexcept {
            return InlineIsEqualGUID(a, b) != FALSE;   // 用 MS 提供的内联函数
            // 或者 return memcmp(&a, &b, sizeof(GUID)) == 0;
        }
    };
    Word::_ApplicationPtr pWordApp;
    std::unordered_map<IdType, Word::_DocumentPtr> pWordDocumentMap;
    std::unordered_map<IdType, Word::WindowPtr> pWordWindowMap;
    std::unordered_map<const IID, WordEventSink*, IIDHash, IIDEqual> eventSinkMap;
};

```
---
**WordController.cpp**
```cpp
#include "pch.h"
#include "WordController.h"


std::wstring HResultToWString(HRESULT hr)
{
    WCHAR* lpBuffer = new WCHAR[sizeof(WCHAR*) * 8];
    // 获取错误消息的长度
    DWORD messageSize = FormatMessage(
        FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
        NULL,
        hr,
        MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
        lpBuffer,
        0,
        NULL);
    delete[] lpBuffer;
    lpBuffer = new WCHAR[messageSize];
    //MessageBox(0, std::to_wstring(messageSize).c_str(), L"messageSize", 0);
    // 将错误消息复制到字符串
    FormatMessage(
        FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
        NULL,
        hr,
        MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
        lpBuffer,
        messageSize,
        NULL);
    std::wstring message = lpBuffer;
    delete[] lpBuffer;
    return message;
}

WordController::~WordController()
{
  // 析构时自动调用Release，因此不需要手动调用
  //pWordApp.Release();
    for (auto it = eventSinkMap.begin(); it != eventSinkMap.end(); it++)
    {
        it->second->detach();
        it->second->Release();
        //delete it->second;
    }
    eventSinkMap.clear();
    // 智能指针不需要手动调用Release
    pWordDocumentMap.clear();
    pWordWindowMap.clear();

    if (pWordApp)
    {
        try {
            pWordApp->Application->Quit();
        }
        COM_CATCH_NORESULT(L"Word quit error.")
        COM_CATCH_ALL_NORESULT(L"Word quit error.")
    }
}

WordController::WordController(bool bCreateApp, bool bComInit, bool bCreateAppIfComInitFail)
{
  Result<bool> comInitResult{ true };
  if (bComInit)
  {
    comInitResult = comInitialize();
    if (!comInitResult)
    {
      std::wstring msg = L"无法初始化COM服务！\n原因：\n";
      msg += comInitResult.getMessage();
      MessageBeep(MB_ICONERROR);
      MessageBox(0, msg.c_str(), L"Error", MB_ICONERROR);
    }
  }
  if (bCreateApp && (comInitResult.getSuccess() || bCreateAppIfComInitFail))
  {
    auto createResult = createApp();
    if (!createResult)
    {
      std::wstring msg = L"无法打开Word！\n原因：\n";
      msg += createResult.getMessage();
      MessageBeep(MB_ICONERROR);
      MessageBox(0, msg.c_str(), L"Error", MB_ICONERROR);
    }
  }
}

Result<Word::_DocumentPtr> WordController::getActiveDocument() const
{
    Result<Word::_DocumentPtr> docRst(false, 0, L"Unknown error.");
    try {
        Word::_DocumentPtr docPtr = pWordApp->ActiveDocument;
        return SuccessResult(0, docPtr);
    }
    COM_CATCH_NOMSGBOX(L"无法获取当前活动文档！", docRst)
    COM_CATCH_ALL_NOMSGBOX(L"无法获取当前活动文档！", docRst)
    return docRst;
}

Result<Word::_ApplicationPtr> WordController::createApp()
{
    auto& app = pWordApp;
    HRESULT hr = app.CreateInstance(__uuidof(Word::Application)); // 创建Word应用实例
    return Result<Word::_ApplicationPtr>::CreateFromHRESULT(hr, app);
}

Result<Word::_DocumentPtr> WordController::openDocument(IdType docId, std::wstring file, bool ConfirmConversions, bool ReadOnly, bool AddToRecentFiles, std::wstring PasswordDocument, std::wstring PasswordTemplate, bool Revert, std::wstring WritePasswordDocument, std::wstring WritePasswordTemplate, Word::WdOpenFormat Format, Office::MsoEncoding Encoding, bool Visible, bool OpenAndRepair, Word::WdDocumentDirection DocumentDirection, bool NoEncodingDialog, std::wstring XMLTransform)
{
    // 原生类型 -> _variant_t，必须小心，这里极易容易出现错误导致无法正常运行
    _variant_t vFile(file.empty() ? vtMissing : file.c_str());
    _variant_t vConfirm(ConfirmConversions);
    _variant_t vReadOnly(ReadOnly);
    _variant_t vAddRecent(AddToRecentFiles);
    _variant_t vPwdDoc(PasswordDocument.empty() ? vtMissing : PasswordDocument.c_str());
    _variant_t vPwdTpl(PasswordTemplate.empty() ? vtMissing : PasswordTemplate.c_str());
    _variant_t vRevert(Revert);
    _variant_t vWrPwdDoc(WritePasswordDocument.empty() ? vtMissing : WritePasswordDocument.c_str());
    _variant_t vWrPwdTpl(WritePasswordTemplate.empty() ? vtMissing : WritePasswordTemplate.c_str());
    _variant_t vFormat((long)Format); // 枚举类型必须是long
    _variant_t vEnc((long)Encoding); // 枚举类型必须是long
    _variant_t vVisible(Visible);
    _variant_t vRepair(OpenAndRepair);
    _variant_t vDir((long)DocumentDirection); // 枚举类型必须是long
    _variant_t vNoEnc(NoEncodingDialog);
    _variant_t vXMLTransform(XMLTransform.empty() ? vtMissing : XMLTransform.c_str());
    Result<Word::_DocumentPtr> result(true);
    try {
      if (pWordDocumentMap.count(docId)) // 如果存在先关闭
      {
        //try {
        //  auto& pDoc = pWordDocumentMap[docId];
        //  pDoc->Close();
        //}
        //catch (...) {}
        closeDocument(docId, DocumentCloseOptions());
      }
      //pWordApp->Documents->Open(
        //    _com_util::ConvertStringToBSTR(wstr2str_2ANSI(file).c_str()),
        //    ConfirmConversions, ReadOnly, AddToRecentFiles, PasswordDocument, PasswordTemplate,
        //    Revert, WritePasswordDocument, WritePasswordTemplate, Format, Encoding,
        //    Visible, OpenConflictDocument, OpenAndRepair, DocumentDirection, NoEncodingDialog
        //);
        Word::DocumentsPtr dsp = pWordApp->Documents;
        Word::_DocumentPtr docPtr = pWordApp->Documents->Open(
            &vFile, &vConfirm, &vReadOnly, &vAddRecent,
            &vPwdDoc, &vPwdTpl, &vRevert,
            &vWrPwdDoc, &vWrPwdTpl,
            &vFormat, &vEnc,
            &vVisible, &vRepair,
            &vDir, &vNoEnc,
            &vXMLTransform);
        pWordDocumentMap[docId] = docPtr;
        return SuccessResult(0, docPtr);
    }
    COM_CATCH(L"无法打开文档！", result)
    COM_CATCH_ALL(L"无法打开文档！", result)
    return result;
}

Result<Word::_DocumentPtr> WordController::openDocument(IdType docId, std::wstring filePath, DocumentOpenOptions options)
{
    return openDocument(docId, filePath, options.confirmConversions, options.readOnly, options.addToRecentFiles, options.passwordDocument, options.passwordTemplate, options.revert, options.writePasswordDocument, options.writePasswordTemplate, options.format, options.encoding, options.visible, options.openAndRepair, options.documentDirection, options.noEncodingDialog, options.xmlTransform);
}

Result<bool> WordController::closeDocument(IdType docId, DocumentCloseOptions options)
{
    Result<bool> result(true);
    _variant_t vSaveChanges((long)options.saveChanges);
    _variant_t vOriginalFormat((long)options.originalFormat);
    _variant_t vRouteDocument(options.routeDocument);
    try {
      if (pWordDocumentMap.count(docId))
      {
        pWordDocumentMap[docId]->Close(&vSaveChanges, &vOriginalFormat, &vRouteDocument);
        pWordDocumentMap.erase(docId);
      }
      else
        return ERRORRESULT_IDNOTFOUND(bool);
    }
    COM_CATCH(L"无法关闭文档！", result)
    COM_CATCH_ALL(L"无法关闭文档！", result)
    return result;
}

Result<Word::_DocumentPtr> WordController::addDocument(IdType id, bool visible, std::wstring templateName, bool asNewTemplate, Word::WdNewDocumentType documentType)
{
    _variant_t vTemplateName(templateName.empty() ? vtMissing : templateName.c_str());
    _variant_t vAsNewTemplate(asNewTemplate);
    _variant_t vDocumentType((long)documentType);
    _variant_t vVisible(visible);
    Result<Word::_DocumentPtr> result(true);
    try {
        Word::DocumentsPtr dsp = pWordApp->Documents;
        //Word::_DocumentPtr docPtr = pWordApp->Documents->Add();
        Word::_DocumentPtr docPtr = pWordApp->Documents->Add(&vTemplateName, &vAsNewTemplate, &vDocumentType, &vVisible);
        pWordDocumentMap[id] = docPtr;
        return SuccessResult(0, docPtr);
    }
    COM_CATCH(L"无法添加新文档！", result)
    COM_CATCH_ALL(L"无法添加新文档！", result)
    return result;
}

Result<Word::WindowPtr> WordController::newWindow(IdType id)
{
    Result<Word::WindowPtr> result(true);
    try {
        Word::WindowPtr windowPtr = pWordApp->NewWindow();
        pWordWindowMap[id] = windowPtr;
        return SuccessResult(0, windowPtr);
    }
    COM_CATCH(L"无法创建新窗口！", result)
    COM_CATCH_ALL(L"无法创建新窗口！", result)
    return result;
}


Result<bool> WordController::setAppVisible(bool visible) const
{
    _variant_t vVisible(visible);
    Result<bool> result(true);
    try {
        pWordApp->PutVisible(vVisible.boolVal);
        return SuccessResult(0, true);
    }
    COM_CATCH(L"无法设置窗口可见性", result)
    COM_CATCH_ALL(L"无法设置窗口可见性", result)
    return result;
}

//// Define type info structure
//_ATL_FUNC_INFO EventSink::OnDocChangeInfo = { CC_STDCALL, VT_EMPTY, 0 };
//_ATL_FUNC_INFO EventSink::OnQuitInfo = { CC_STDCALL, VT_EMPTY, 0 };
//// (don't actually need two structure since they're the same)
```

---
通过在WordEventSink的Invoke函数中打印dispIdMember值，发现dispIdMember与具体事件名称的对应值为
- 6 -> 文档即将关闭
- 10 -> 窗口激活
- 11 -> 窗口去激活
- 12 -> 窗口选中区域改变
查阅文档，或者使用Qt的COM功能生成接口表，可以发现这4个事件的函数原型：
```cpp
HRESULT DocumentBeforeClose(struct _Document* Doc, VARIANT* Cancel/*设置为true则取消关闭，否则继续关闭*/); // dispIdMember: 6
HRESULT WindowActivate(struct _Document* Doc, struct Window* Wn); // dispIdMember: 10
HRESULT WindowDeactivate(struct _Document* Doc, struct Window* Wn); // dispIdMember: 11
HRESULT WindowSelectionChange(struct Selection* Sel); // dispIdMember: 12
```
当然Invoke显然不存在上述函数原型的参数，必须通过pDispParams参数通过QueryInterface方法查询接口才能得到Doc真正的接口地址才能够使用，方法如下（以WindowActivate事件回调函数为例）：
先看Invoke函数原型与相关定义：
```cpp
typedef struct tagDISPPARAMS
{
    /* [size_is] */ VARIANTARG *rgvarg; // 参数数组。注意：这些参数以相反的顺序显示
    /* [size_is] */ DISPID *rgdispidNamedArgs; // 命名参数的调度 ID。
    UINT cArgs; // 自变量的数量。
    UINT cNamedArgs; // 命名参数的数目。
} 	DISPPARAMS;

virtual /* [local] */ HRESULT STDMETHODCALLTYPE Invoke( 
	/* [annotation][in] */ 
	_In_  DISPID dispIdMember, // 事件唯一id，每个事件对应不同的id // 标识成员。 使用 GetIDsOfNames 或对象的文档获取调度标识符。
	/* [annotation][in] */ 
	_In_  REFIID riid, // 留待将来使用。 必须为 IID_NULL。
	/* [annotation][in] */ 
	_In_  LCID lcid, // 要在其中解释自变量的区域设置上下文。 lcid 由 GetIDsOfNames 函数使用，并且还传递给 Invoke，以允许对象解释其特定于区域设置的参数。不支持多个国家/地区语言的应用程序可以忽略此参数。 有关详细信息，请参阅 支持多个国家/地区语言 和 公开 ActiveX 对象。
	/* [annotation][in] */ 
	_In_  WORD wFlags, // 描述 Invoke 调用上下文的标志。标志都有如下：
					// DISPATCH_METHOD 成员作为方法调用。 如果属性具有相同的名称，则可以设置此属性和DISPATCH_PROPERTYGET标志。
					// DISPATCH_PROPERTYGET 成员作为属性或数据成员进行检索。
					// DISPATCH_PROPERTYPUT 成员将更改为属性或数据成员。
					// DISPATCH_PROPERTYPUTREF 成员由引用赋值而不是值赋值更改。 仅当属性接受对 对象的引用时，此标志才有效。
	/* [annotation][out][in] */ 
	_In_  DISPPARAMS *pDispParams, // 事件处理的函数原型的参数 // 指向 DISPPARAMS 结构的指针，该结构包含参数数组、命名参数 DISPID 数组以及数组中元素数的计数。
	/* [annotation][out] */ 
	_Out_opt_  VARIANT *pVarResult, // 事件处理结果 // 指向存储结果的位置的指针;如果调用方不需要任何结果，则为 NULL。 如果指定了DISPATCH_PROPERTYPUT或DISPATCH_PROPERTYPUTREF，则忽略此参数。
	/* [annotation][out] */ 
	_Out_opt_  EXCEPINFO *pExcepInfo, // 异常信息 // 指向一个包含异常信息的结构的指针。 如果返回DISP_E_EXCEPTION，则应填充此结构。 可以为 NULL。
	/* [annotation][out] */ 
	_Out_opt_  UINT *puArgErr) = 0; // 错误码 // 具有错误的第一个参数的 rgvarg 中的索引。 参数以相反的顺序存储在 pDispParams-rgvarg> 中，因此第一个参数是数组中索引最高的参数。 仅当生成的返回值DISP_E_TYPEMISMATCH或DISP_E_PARAMNOTFOUND时，才会返回此参数。 此参数可以设置为 null。 有关详细信息，请参阅 返回错误。
/*
	返回值
	此方法可以返回其中一个值。
	返回代码	说明
	S_OK	成功。
	DISP_E_BADPARAMCOUNT	提供给 DISPPARAMS 的元素数不同于方法或属性接受的参数数。
	DISP_E_BADVARTYPE	DISPPARAMS 中的一个参数不是有效的变体类型。
	DISP_E_EXCEPTION	应用程序需要引发异常。 在这种情况下，应填充在 pexcepinfo 中传递的结构。
	DISP_E_MEMBERNOTFOUND	请求的成员不存在。
	DISP_E_NONAMEDARGS	IDispatch 的此实现不支持命名参数。
	DISP_E_OVERFLOW	DISPPARAMS 中的一个参数无法强制为指定的类型。
	DISP_E_PARAMNOTFOUND	其中一个参数 ID 与 方法上的参数不对应。 在这种情况下， puArgErr 设置为包含错误的第一个参数。
	DISP_E_TYPEMISMATCH	无法强制一个或多个参数。 rgvarg 中类型不正确的第一个参数的索引在 puArgErr 中返回。
	DISP_E_UNKNOWNINTERFACE	riid 中传递的接口标识符未IID_NULL。
	DISP_E_UNKNOWNLCID	正在调用的成员根据 LCID 解释字符串参数，并且无法识别 LCID。 如果不需要 LCID 来解释参数，则不应返回此错误
	DISP_E_PARAMNOTOPTIONAL	省略了必需的参数。
*/

// 下面是一个简单的Invoke实现
STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pDispParams, VARIANT* pVarResult, EXCEPINFO* pExcepInfo, UINT* puArgErr) override
{
	std::cout << "dispIdMember: " << dispIdMember << std::endl;
	// 进行事件处理函数分发
	if (callbackInfoMap.count(dispIdMember))
	{
		auto [begin, end] = callbackInfoMap.equal_range(dispIdMember);
		for (auto &it = begin; it != end; it++)
		{
			auto& info = it->second;
			info.callback(pDispParams, info.userData);
		}
		return S_OK;
	}
	return E_NOTIMPL;
}

```
参考：[IDispatch::Invoke (oaidl.h) - Win32 apps | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/win32/api/oaidl/nf-oaidl-idispatch-invoke)
查阅官方文档可知内容我已标注到上述代码中，值得注意的是虽然rgvarg保存的参数是以相反的顺序显示，但是经过摸索尝试，我发现rgvarg中保存的参数依旧与Word事件参数顺序保持一致。

```cpp
auto paramCount = params->cArgs;
if (paramCount < 2)
	return Result<bool>::CreateFromHRESULT(E_INVALIDARG, 0);
IDispatch* documentDisp = params->rgvarg[0].pdispVal; // 获取第一个参数的disp地址值
IDispatch* windowDisp = params->rgvarg[1].pdispVal; // 获取第二个参数的disp地址值
Word::_DocumentPtr docPtr;
Word::WindowPtr windowPtr;
HRESULT hr = documentDisp->QueryInterface(&docPtr); // 查询第一个参数的真正接口地址
// 错误处理if (FAILED(hr)) {...}
hr = windowDisp->QueryInterface(&windowPtr); // 查询第二个参数的真正接口地址
// 错误处理if (FAILED(hr)) {...}
```
不过本程序最主要还是依赖于WindowSelectionChange事件（在活动窗口中的所选内容更改时发生），只要使用中文编辑文本或者光标位置或者选择内容都会发出该事件，只要收到该事件，说明需要检测文本是否更改，然后进行小说文本的替换，检测原理可以自己研究，这里仅仅提供一个简单方法：使用std::mismatch检测纯文本内容变动。
```cpp
Result<bool> CFakeWordMfcDlg::onWordWindowSelectionChangeEvent(DISPPARAMS* params, WordEventSink::UserDataType userData)
{
	IDispatch* disp = params->rgvarg[0].pdispVal;
	CComPtr<IDispatch> selDisp(disp);
	DISPID dispid;
	OLECHAR* name = (OLECHAR*)L"Text";
	HRESULT hr = selDisp->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_NAME_USER_DEFAULT, &dispid);
	if (FAILED(hr))
		return Result<bool>::CreateFromHRESULT(hr, true);
	VARIANT result = { 0 };
	DISPPARAMS invokeDispParams = { 0 };
	hr = selDisp->Invoke(dispid, IID_NULL, LOCALE_NAME_USER_DEFAULT, DISPATCH_PROPERTYGET, &invokeDispParams, &result, nullptr, nullptr);
	if (FAILED(hr))
		return Result<bool>::CreateFromHRESULT(hr, true);
	std::wstring selectedText;
	if (result.bstrVal)
		selectedText += result.bstrVal;
	VariantClear(&result);
	std::cout << "Selected text: " << wstr2str_2ANSI(selectedText) << std::endl;
	return processTextChange();
}
Result<bool> CFakeWordMfcDlg::processTextChange()
{
	auto rstGetActiveDoc = wordCtrller->getActiveDocument();
	if (!rstGetActiveDoc)
		return ErrorResult<bool>(rstGetActiveDoc);
	Result<bool> rst(true, 0, true);
	try {
		Word::_DocumentPtr docPtr = rstGetActiveDoc.getData();
		docPtr->Application->ScreenUpdating = VARIANT_FALSE;
		try {
			docPtr->Application->UndoRecord->StartCustomRecord(_bstr_t(L"Fish update"));
			try {
				Word::RangePtr mainTextRangePtr = docPtr->Range();
				std::wstring currentText = mainTextRangePtr->Text;
				auto lenCur = currentText.size() - 1;
				auto lenLast = wordLastText.size() - 1;

				// 寻找差异位置
				std::pair<std::wstring::iterator, std::wstring::iterator> diffResult;
				std::reference_wrapper<std::wstring> repTxtFullText(processedFishFileTxtWordText);
        WordController* repWordController{ fishFileWordController };
        SupportedFileType selectedRepFileType = selectedFishFile.fileType;
				switch (replaceMode)
				{
				case ReplaceMode::Work:
				{
					diffResult = std::mismatch(currentText.begin(), currentText.end(), processedWorkFileTxtWordText.begin(), processedWorkFileTxtWordText.end());
					repTxtFullText = processedWorkFileTxtWordText;
          repWordController = workFileWordController;
          selectedRepFileType = selectedWorkFile.fileType;
          break;
				}
				default:
				case ReplaceMode::SlackOff:
				{
					diffResult = std::mismatch(currentText.begin(), currentText.end(), processedFishFileTxtWordText.begin(), processedFishFileTxtWordText.end());
          repTxtFullText = processedFishFileTxtWordText;
          repWordController = fishFileWordController;
          selectedRepFileType = selectedFishFile.fileType;
          break;
				}
				}
				// 返回第一个不匹配字符的位置
				auto diffStart = std::distance(currentText.begin(), diffResult.first);
				//if (lenCur > lenLast)
				//{
				//	// 新增小说文本
				//	wordTextUpdateTxtSubTextRange.start = diffStart;
				//	//wordTextUpdateTxtSubTextRange.start = lenLast - 1;
				//	//wordTextUpdateTxtSubTextRange.length = lenCur - lenLast;
				//	wordTextUpdateTxtSubTextRange.end = lenCur;
				//	wordTextUpdateTxtSubTextRange.newLength = (lenCur - diffStart) * GetEditNumber(IDC_EDITOIRATIO);
				//	updateWordText(docPtr, txtFullText.get(), wordTextUpdateTxtSubTextRange.start, wordTextUpdateTxtSubTextRange.end, wordTextUpdateTxtSubTextRange.newLength);
				//}
				//else if (lenCur < lenLast)
				//{
				//	wordTextUpdateTxtSubTextRange.start = 0;
				//	wordTextUpdateTxtSubTextRange.end = lenCur;
				//	wordTextUpdateTxtSubTextRange.newLength = lenCur - 0;
				//	updateWordText(docPtr, txtFullText.get(), wordTextUpdateTxtSubTextRange.start, wordTextUpdateTxtSubTextRange.end, wordTextUpdateTxtSubTextRange.newLength);
				//}
				auto& rangeStart = wordTextUpdateTxtSubTextRange.start = diffStart;
				auto& rangeEnd = wordTextUpdateTxtSubTextRange.end = lenCur;
				auto& newLen = wordTextUpdateTxtSubTextRange.newLength = (static_cast<long double>(lenCur - diffStart)) * oiRatio;
				if (!(rangeStart == rangeEnd && newLen == 0))
				{
          updateWordText(docPtr, [docPtr, selectedRepFileType, repWordController, toRepFullText=repTxtFullText.get(), this](Word::RangePtr range, size_t newRangeStart, size_t newRangeLen, std::any userData) {
            auto&& rangeText = range->Text;
            std::wstring oldText = rangeText.GetBSTR() ? rangeText.GetBSTR() : L"";
            std::wstring newText;
            switch (selectedRepFileType)
              {
              case SupportedFileType::Word:
              {
                auto rst = repWordController->getDocument(0);
                if (rst)
                {
                  auto oriFullRange = range->Document->Range();
                  auto repDocPtr = rst.getData();
                  auto repRange = repDocPtr->Range(&_variant_t(0), &_variant_t(newRangeStart + newRangeLen));
                  //auto repRange = repDocPtr->Range(&_variant_t(newRangeStart), &_variant_t(newRangeStart + newRangeLen));
                  auto repText = repRange->Text;
                  if (repText.GetBSTR())
                    newText = repText;

                  oriFullRange->Delete();
                  oriFullRange->InsertXML(repRange->GetXML(VARIANT_FALSE), &_variant_t(false));

                  //range->Collapse(&_variant_t((long)Word::wdCollapseStart));
                  // 使用FormattedText属性复制格式化的文本
                  //range->FormattedText = repRange->FormattedText;
                  //HRESULT hr = S_OK;
                  //hr = repRange->Copy();
                  //hr = range->Paste();

                }
                break;
              }
              default:
              case SupportedFileType::Txt:
              {
                newText = toRepFullText.substr(newRangeStart, newRangeLen);
                //range->Text = _bstr_t(addText.c_str());
                range->Delete();
                range->InsertAfter(newText.c_str());
                break;
              }
              }
              // 插入文本后将输入光标位置移动到刚刚输入的内容后面
              Word::SelectionPtr selection = docPtr->Application->Selection;
              if (selection) {
                _variant_t vSelEnd(Word::wdStory);
                selection->EndKey(&vSelEnd, &vtMissing);
                //selection->SetRange(from + length, from + length);
                //selection->SetRange(from + length, from + length);
              }
              //selection->Text =  _bstr_t(txtFullText.substr(0, from + length).c_str());
              //selection->InsertAfter(_bstr_t(txtFullText.substr(0, from + length).c_str()));
              //variant_t vCollapseEnd(Word::wdCollapseEnd);
              //selection->Collapse(&vCollapseEnd);
              std::cout << "Document text updating: \n\tRange: [" << newRangeStart << "," << range->End - range->Start + newRangeStart << ") "
                << "\tOld text: " << wstr2str_2ANSI(oldText) << " -> "
                << "\tNew text: " << wstr2str_2ANSI(newText)
                << std::endl;
            }, repTxtFullText.get().size(), rangeStart, rangeEnd, newLen, 0);
					Word::RangePtr newMainTextRangePtr = docPtr->Range();
					std::wstring newCurText = newMainTextRangePtr->Text;
					wordLastText = newCurText;
				}
			}
			COM_CATCH_NOMSGBOX(L"", rst)
			COM_CATCH_ALL_NOMSGBOX(L"", rst)
			docPtr->Application->UndoRecord->EndCustomRecord();
		}
		COM_CATCH_NOMSGBOX(L"", rst)
		COM_CATCH_ALL_NOMSGBOX(L"", rst)
		docPtr->Application->ScreenUpdating = VARIANT_TRUE;
	}
	COM_CATCH_NOMSGBOX(L"", rst)
	COM_CATCH_ALL_NOMSGBOX(L"", rst)
	return rst;
}

// 一定会更新，即使rangeStart == rangeEnd && newLen == 0
void CFakeWordMfcDlg::updateWordText(Word::_DocumentPtr doc, UpdateWordContentsReplaceFunction replaceFunction, size_t fullTextLen, size_t rangeStart, size_t rangeEnd, size_t newLen, std::any userData)
{
	try {
		// 修改输入的文本
		//Word::_DocumentPtr doc = wordCtrller->getActiveDocument().getData();
		_variant_t vFrom(rangeStart);
		_variant_t vEnd(rangeEnd);
		Word::RangePtr range = doc->Range(&vFrom, &vEnd);
		if (rangeStart < fullTextLen)
		{
			if (rangeStart + newLen > fullTextLen)
				newLen = fullTextLen - rangeStart;
      replaceFunction(range, rangeStart, newLen, userData);
		}
		else
		{
			range->Text = L"";
		}
	}
	COM_CATCH_NORESULT(L"Word文本更新失败！")
	COM_CATCH_ALL_NORESULT(L"Word文本更新失败！")
}

```

## 恭喜
至此，恭喜你完成了通过替换Word文本实现的工作摸鱼神器！