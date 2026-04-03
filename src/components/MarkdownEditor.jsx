import { useEffect, useRef, useState } from 'react'
import EasyMDE from 'easymde'
import MarkdownIt from 'markdown-it'
import katex from 'markdown-it-katex'
import 'easymde/dist/easymde.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './MarkdownEditor.css'

function MarkdownEditor({ value, onChange, placeholder = '输入内容，支持 Markdown 格式...' }) {
  const textareaRef = useRef(null)
  const editorRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [isSideBySide, setIsSideBySide] = useState(false)
  const onChangeRef = useRef(onChange)

  // 确保 onChange 引用总是最新的
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!textareaRef.current || editorRef.current) return

    // 创建 Markdown-it 实例用于预览渲染
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true,
    }).use(katex)

    const mde = new EasyMDE({
      element: textareaRef.current,
      initialValue: value || '',
      placeholder: placeholder,
      spellChecker: false,
      autoDownloadFontAwesome: false,
      indentWithTabs: false,
      lineWrapping: true,
      minHeight: '400px',
      toolbar: [
        'bold',
        'italic',
        'strikethrough',
        '|',
        'heading',
        'heading-1',
        'heading-2',
        'heading-3',
        '|',
        'quote',
        'code',
        'table',
        '|',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
        'undo',
        'redo',
      ],
      shortcuts: {
        'drawTable': 'Cmd-Alt-T'
      },
      status: ['lines', 'words', 'cursor'],
      promptURLs: true,
      syncSideBySidePreviewScroll: true,
      sideBySideFullscreen: false,
      previewClass: 'markdown-preview',
      previewRender: (plainText) => md.render(plainText),
      parsingConfig: {
        allowAtxHeaderWithoutSpace: true,
        strikethrough: true,
        underscoresBreakWords: true,
      },
    })

    // 同步编辑器内容到组件状态
    const codeMirrorInstance = mde.codemirror
    codeMirrorInstance.on('change', () => {
      const newValue = codeMirrorInstance.getValue() || ''
      console.log('📝 [MarkdownEditor] change事件被触发，新内容:', newValue.substring(0, 50) + '...')
      onChangeRef.current(newValue)
    })

    // 监听全屏事件
    codeMirrorInstance.on('fullscreenToggle', (isOn) => {
      setIsFullscreen(isOn)
    })

    const syncViewState = () => {
      const wrapper = codeMirrorInstance.getWrapperElement()
      const previewSide = wrapper?.nextSibling
      const previewNormal = wrapper?.lastChild
      const sideBySideActive = !!previewSide?.classList?.contains('editor-preview-active-side')
      const previewOnlyActive = !!previewNormal?.classList?.contains('editor-preview-active')
      setIsSideBySide(sideBySideActive)
      setIsPreviewOnly(previewOnlyActive)
    }

    const container = codeMirrorInstance.getWrapperElement()?.parentNode
    const observer = new MutationObserver(syncViewState)
    if (container) {
      observer.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class'],
      })
    }

    // 初始化一次，避免首次切换前状态不同步
    syncViewState()

    editorRef.current = mde

    return () => {
      observer.disconnect()
      if (editorRef.current) {
        editorRef.current.toTextArea()
        editorRef.current = null
      }
    }
  }, [])

  // 当外部 value 改变时同步编辑器
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentValue = editorRef.current.value()
      if (currentValue !== value) {
        // 暂时移除change事件监听，避免触发onChange
        const codeMirrorInstance = editorRef.current.codemirror
        codeMirrorInstance.off('change')
        
        // 更新值
        editorRef.current.value(value)
        
        // 重新绑定change事件监听
        codeMirrorInstance.on('change', () => {
          onChangeRef.current(codeMirrorInstance.getValue() || '')
        })
      }
    }
  }, [value])

  return (
    <div
      className={`markdown-editor-wrapper ${isFullscreen ? 'fullscreen-active' : ''} ${isPreviewOnly ? 'preview-active' : ''} ${isSideBySide ? 'side-by-side-active' : ''}`}
    >
      <textarea 
        ref={textareaRef}
        defaultValue={value}
        className="md-editor"
      />
    </div>
  )
}

export default MarkdownEditor
