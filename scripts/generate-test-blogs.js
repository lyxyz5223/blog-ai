#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 博客分类
const categories = [
  'JavaScript',
  'React',
  'Vue',
  'TypeScript',
  'CSS',
  'HTML',
  'Node.js',
  'Web API',
  'Performance',
  'Security',
  'DevOps',
  'Testing',
  'Database',
  'Git',
  'Tools',
  'Best Practices',
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile'
];

// 博客主题模板
const blogTopics = [
  { title: '深入理解{topic}的核心概念', template: 'concept' },
  { title: '{topic}最佳实践指南', template: 'guide' },
  { title: '如何在项目中使用{topic}', template: 'tutorial' },
  { title: '{topic}常见问题解答', template: 'faq' },
  { title: '掌握{topic}的高级技巧', template: 'advanced' },
  { title: '{topic}性能优化方案', template: 'performance' },
  { title: '{topic}初学者快速入门', template: 'beginner' },
  { title: '{topic}生产环境实践', template: 'production' },
  { title: '{topic}与其他技术的对比', template: 'comparison' },
  { title: '{topic}错误排查完全指南', template: 'troubleshooting' }
];

// 帮助函数：生成随机日期
function generateRandomDate(startDate = new Date('2023-01-01'), endDate = new Date()) {
  const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(timestamp).toISOString();
}

// 帮助函数：生成博客内容
function generateBlogContent(title, category, template) {
  const templates = {
    concept: `# ${title}\n\n## 介绍\n\n${title}是现代开发中的一个重要概念。本文将深入探讨其核心原理和应用场景。\n\n## 核心概念\n\n### 定义\n${title}是指...\n\n### 特点\n\n- 特点1：提高开发效率\n- 特点2：增强代码可维护性\n- 特点3：改善性能\n\n## 实现原理\n\n### 基础原理\n\n\`\`\`javascript\nconst example = () => {\n  console.log('示例代码');\n};\n\`\`\`\n\n### 工作流程\n\n1. 初始化阶段\n2. 处理阶段\n3. 输出阶段\n\n## 应用场景\n\n在以下场景中可以充分发挥${title}的优势：\n\n1. **场景一**：大型项目开发\n2. **场景二**：团队协作\n3. **场景三**：性能敏感的应用\n\n## 总结\n\n${title}是一项值得学习和掌握的技术。通过系统的学习和实践，可以有效提升开发效率。\n\n## 参考资源\n\n- [官方文档](#)\n- [相关教程](#)\n- [社区讨论](#)`,
    
    guide: `# ${title}\n\n这是${title}的实用指南。本文将为您提供分步骤的实施方案。\n\n## 入门准备\n\n在开始之前，您需要准备以下工具和环境：\n\n- 开发环境\n- 必要的依赖库\n- 基础知识\n\n## 步骤指南\n\n### 第一步：环境配置\n\n首先配置您的开发环境...\n\n### 第二步：基础设置\n\n\`\`\`\n基础配置代码\n\`\`\`\n\n### 第三步：开发实现\n\n### 第四步：测试验证\n\n## 常见问题\n\n### Q: 如何...\nA: 您可以通过...\n\n### Q: 为什么...\nA: 这是因为...\n\n## 最佳实践\n\n1. 始终保持代码清晰\n2. 编写充分的测试\n3. 定期重构代码\n\n## 进阶主题\n\n- 性能优化\n- 安全考虑\n- 扩展可能性`,
    
    tutorial: `# ${title}\n\n一个完整的${category}教程，从零开始学习。\n\n## 你将学到什么\n\n- 基础概念\n- 实操技能\n- 实战项目\n- 调试技巧\n\n## 前置需求\n\n- 基础的编程知识\n- 熟悉命令行操作\n- 一个文本编辑器\n\n## 快速开始\n\n### 安装\n\n\`\`\`bash\nnpm install package-name\n\`\`\`\n\n### 你的第一个程序\n\n\`\`\`javascript\nconsole.log('Hello, World!');\n\`\`\`\n\n## 进阶练习\n\n### 练习1：基础功能\n\n要求：\n- 实现功能A\n- 实现功能B\n- 通过测试\n\n### 练习2：集成应用\n\n构建一个完整的应用，结合所学的所有内容。\n\n## 调试和排查\n\n常见错误及解决方案：\n\n1. 错误X - 解决方案\n2. 错误Y - 解决方案\n\n## 下一步\n\n- 学习相关的高级话题\n- 加入社区\n- 参与开源项目`,
    
    faq: `# ${title}\n\n关于${category}最常见的问题解答。\n\n## 常见问题\n\n### Q1: 什么是${title}?\nA: ${title}是一个用于...的技术/概念。它允许开发者...\n\n### Q2: 何时应该使用${title}?\nA: 在以下场景中建议使用：\n- 场景A\n- 场景B\n- 场景C\n\n### Q3: 如何快速入门?\nA: 您可以：\n1. 阅读官方文档\n2. 跟随教程\n3. 进行实践项目\n\n### Q4: 性能如何?\nA: 性能指标：\n- 速度：优秀\n- 内存：中等\n- CPU：低消耗\n\n### Q5: 有什么常见的陷阱吗?\nA: 需要避免的陷阱：\n- 陷阱1：${title}\n- 陷阱2：配置错误\n- 陷阱3：冗余代码\n\n### Q6: 如何调试问题?\nA: 调试步骤：\n1. 检查错误消息\n2. 将代码简化\n3. 使用调试工具\n4. 查阅文档\n\n### Q7: 有哪些替代方案?\nA: 可选的替代方案：\n- 方案A\n- 方案B\n- 方案C\n\n### Q8: 如何扩展功能?\nA: 扩展时可以...\n\n### Q9: 与其他技术兼容吗?\nA: 兼容性如下：\n- 技术A：完全兼容\n- 技术B：部分兼容\n- 技术C：需要适配\n\n### Q10: 如何获得帮助?\nA: 支持渠道：\n- 官方文档\n- GitHub Issues\n- 社区论坛\n- Stack Overflow`,
    
    advanced: `# ${title}\n\n掌握${category}的高级技巧和深层原理。\n\n## 前置知识\n\n本文假设您已经\n- 熟悉基础概念\n- 有实际项目经验\n- 理解相关原理\n\n## 高级特性\n\n### 特性1：（高级概念）\n\n\`\`\`javascript\n// 高级用法示例\nconst advanced = {\n  // 实现细节\n};\n\`\`\`\n\n### 特性2：性能优化\n\n优化策略：\n1. 缓存机制\n2. 异步处理\n3. 并发控制\n\n### 特性3：扩展原理\n\n如何扩展和定制：\n- 插件系统\n- 中间件\n- 自定义配置\n\n## 实战案例\n\n### 案例1：生产级应用\n\n这个案例演示了如何在大规模应用中使用${title}...\n\n### 案例2：性能优化实例\n\n通过优化实现了...\n- 性能提升：50%\n- 内存优化：30%\n\n## 常见陷阱\n\n避免这些常见错误：\n\n1. **陷阱1** - 后果和解决方案\n2. **陷阱2** - 后果和解决方案\n\n## 最佳实践\n\n1. 遵循设计模式\n2. 充分测试覆盖\n3. 定期审查代码\n4. 性能监控\n\n## 前沿发展\n\n未来趋势和新功能...\n\n## 总结\n\n通过掌握这些高级技巧，可以显著提升开发能力。`,

    performance: `# ${title}\n\n${category}的性能优化完整方案。\n\n## 性能指标\n\n关键性能指标（KPI）：\n- 响应时间：<100ms\n- 吞吐量：1000 req/s\n- CPU使用率：<50%\n- 内存占用：<500MB\n\n## 优化策略\n\n### 1. 缓存优化\n\n实现多层缓存：\n- L1: 内存缓存\n- L2: 分布式缓存\n- L3: CDN缓存\n\n### 2. 算法优化\n\n选择合适的算法：\n\`\`\`javascript\n// 优化前：O(n²)\n// 优化后：O(n log n)\n\`\`\`\n\n### 3. 资源优化\n\n- 代码分割\n- 树摇\n- 压缩资源\n\n## 测试和基准\n\n### 基准测试\n\n\`\`\`\n方案A: 1000ms\n方案B: 500ms\n方案C: 250ms\n\`\`\`\n\n### 性能监控\n\n- 实时监控\n- 告警机制\n- 数据分析\n\n## 实施建议\n\n1. 建立性能基准线\n2. 定期进行审计\n3. 优先优化瓶颈\n4. 持续监控改进\n\n## 总结\n\n通过系统的优化方案，可以获得显著的性能提升。`,
    
    beginner: `# ${title}\n\n${category}初学者的快速入门指南。\n\n## 你需要知道的基础知识\n\n- ${title}是什么\n- 为什么要学习它\n- 实际应用场景\n\n## 安装和配置\n\n### 第一步：安装\n\n按照以下步骤安装...\n\n### 第二步：验证安装\n\n\`\`\`bash\ncommand --version\n\`\`\`\n\n## 你的第一个程序\n\n### Hello World\n\n\`\`\`javascript\nconsole.log('Hello, World!');\n\`\`\`\n\n### 分析代码\n\n这段代码做了什么...\n\n## 核心概念\n\n### 概念1\n\n简单解释：...\n\n### 概念2\n\n简单解释：...\n\n## 实操练习\n\n### 练习1：修改代码\n\n尝试修改上面的代码，实现...\n\n### 练习2：新建项目\n\n创建一个新项目，实现基本功能。\n\n## 常见问题\n\n- 问题1：... 解答1\n- 问题2：... 解答2\n\n## 下一步学习\n\n- 学习中级话题\n- 跟随完整教程\n- 做一些小项目\n\n## 资源链接\n\n- [官方文档](#)\n- [社区论坛](#)\n- [视频教程](#)`,
    
    production: `# ${title}\n\n在生产环境中使用${category}的实践指南。\n\n## 部署前清单\n\n- [ ] 代码审查完成\n- [ ] 充分的测试覆盖\n- [ ] 性能基准达成\n- [ ] 安全审计通过\n- [ ] 监控和告警配置\n- [ ] 灾难恢复计划\n- [ ] 文档完整\n- [ ] 团队培训完成\n\n## 架构设计\n\n### 高可用架构\n\n使用负载均衡和冗余...\n\n### 容错设计\n\n实现故障转移和降级...\n\n### 监控和告警\n\n- 关键指标监控\n- 异常告警\n- 日志聚合\n\n## 配置管理\n\n### 环境变量\n\n\`\`\`\nDATABASE_URL=...\nAPI_KEY=...\n\`\`\`\n\n### 密钥管理\n\n使用密钥管理服务管理敏感信息...\n\n## 运维指南\n\n### 日常维护\n\n- 日志检查\n- 性能监控\n- 更新管理\n\n### 故障处理\n\n1. 快速响应\n2. 问题诊断\n3. 快速恢复\n4. 事后总结\n\n## 安全考虑\n\n- 数据加密\n- 访问控制\n- 安全审计\n- 漏洞管理\n\n## 性能调优\n\n- 性能基准\n- 优化策略\n- 持续改进\n\n## 总结\n\n生产级应用需要全面考虑..`,
    
    comparison: `# ${title}\n\n对比分析不同的${category}解决方案。\n\n## 概览\n\n本文对比了主流的几种方案：\n| 方案 | 优点 | 缺点 | 适用场景 |\n|------|------|------|----------|\n| **方案A** | 性能好 | 学习曲线陡 | 高性能场景 |\n| **方案B** | 易用性好 | 性能一般 | 快速开发 |\n| **方案C** | 功能完整 | 资源消耗大 | 企业级应用 |\n\n## 详细对比\n\n### 性能对比\n\n- 方案A：最快，100ms\n- 方案B：中等，500ms\n- 方案C：最慢，1000ms\n\n### 易用性对比\n\n- 方案A：学习难度大\n- 方案B：学习难度小\n- 方案C：学习难度中等\n\n### 生态和社区\n\n- 方案A：社区活跃\n- 方案B：文档完善\n- 方案C：商业支持\n\n## 选择建议\n\n### 如果你需要...\n\n**最高性能**：方案A\n**快速开发**：方案B\n**企业级**：方案C\n\n## 迁移指南\n\n如何从一个方案迁移到另一个：\n\n1. 评估成本\n2. 制定计划\n3. 渐进迁移\n4. 充分测试\n5. 逐步验证\n\n## 总结\n\n选择合适的方案很重要，需要根据实际需求..`,
    
    troubleshooting: `# ${title}\n\n${category}错误排查和问题解决完全指南。\n\n## 常见错误\n\n### 错误1：配置错误\n\n**症状**：应用无法启动\n**原因**：配置文件格式错误\n**解决方案**：\n1. 检查配置文件\n2. 参考文档示例\n3. 验证配置语法\n\n### 错误2：运行时异常\n\n**症状**：运行时崩溃\n**原因**：未处理的异常\n**解决方案**：\n1. 查看错误日志\n2. 添加合适的异常处理\n3. 增加防御性编程\n\n### 错误3：性能问题\n\n**症状**：响应缓慢\n**原因**：算法复杂度高或资源泄漏\n**解决方案**：\n1. 进行性能分析\n2. 寻找瓶颈\n3. 优化算法\n4. 检查资源泄漏\n\n## 调试技巧\n\n### 工具\n\n- 调试器\n- 日志系统\n- 性能分析工具\n\n### 方法\n\n1. 重现问题\n2. 简化测试用例\n3. 使用调试器逐步执行\n4. 检查日志输出\n5. 利用性能工具\n\n## 日志分析\n\n### 日志级别\n\n- DEBUG：详细信息\n- INFO：一般信息\n- WARN：警告信息\n- ERROR：错误信息\n\n### 分析步骤\n\n1. 收集日志\n2. 查找异常\n3. 分析时序\n4. 关联相关日志\n\n## 资源泄漏排查\n\n- 内存泄漏\n- 连接泄漏\n- 文件描述符泄漏\n\n## 高级调试\n\n- 远程调试\n- 性能剖析\n- 内存转储分析\n\n## 获得帮助\n\n- 查阅文档\n- 搜索已知问题\n- 社区讨论\n- 提交bug报告`
  };
  
  return templates[template] || templates.concept;
}

// 帮助函数：将标题转换为 slug
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

// 生成元数据
function generateMeta(id, title, category, author, datetime) {
  const slug = titleToSlug(title);
  const filename = `${id}-${slug}.md`;
  
  // 生成简短的 excerpt
  const excerpts = [
    `深入探讨${title}的核心概念和实现方法...`,
    `${title}是现代开发中不可或缺的技能，本文详细讲解...`,
    `想要掌握${title}？这份完整指南为您解答所有疑问！`,
    `通过实践项目学习${title}，从入门到精通...`,
    `${category}系列：${title}最常见的问题和解决方案...`,
    `优化${title}性能的10个技巧...`,
    `${title}与其他技术的完整对比分析...`,
    `生产环境下${title}的最佳实践...`,
    `初学者快速掌握${title}的完整教程...`,
    `${title}高级用法和常见陷阱解析...`
  ];
  
  return {
    id,
    title,
    excerpt: excerpts[Math.floor(Math.random() * excerpts.length)],
    filename,
    datetime,
    category,
    author
  };
}

// 主函数
async function generateBlogs() {
  try {
    const blogsDir = path.join(__dirname, '../public/blogs');
    const metaFilePath = path.join(blogsDir, 'meta.json');
    
    // 确保目录存在
    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true });
    }
    
    // 读取现有的 meta.json
    let existingMeta = [];
    if (fs.existsSync(metaFilePath)) {
      const content = fs.readFileSync(metaFilePath, 'utf-8');
      existingMeta = JSON.parse(content);
    }
    
    const newMeta = [];
    const existingIds = new Set(existingMeta.map(m => m.id));
    
    // 生成 100 篇博客（6-105）
    for (let i = 6; i <= 105; i++) {
      // 随机选择分类和主题
      const category = categories[Math.floor(Math.random() * categories.length)];
      const topicTemplate = blogTopics[Math.floor(Math.random() * blogTopics.length)];
      const title = topicTemplate.title.replace('{topic}', category);
      
      // 随机选择作者
      const author = Math.random() > 0.7 ? 'lyxyz5223' : '技术博主';
      
      // 生成日期
      const datetime = generateRandomDate();
      
      // 生成元数据
      const meta = generateMeta(i, title, category, author, datetime);
      newMeta.push(meta);
      
      // 生成博客内容
      const content = generateBlogContent(title, category, topicTemplate.template);
      
      // 写入文件
      const filePath = path.join(blogsDir, meta.filename);
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✓ 生成博客: ${i} - ${title}`);
    }
    
    // 合并元数据
    const allMeta = [...existingMeta, ...newMeta];
    
    // 写入 meta.json
    fs.writeFileSync(metaFilePath, JSON.stringify(allMeta, null, 2), 'utf-8');
    
    console.log(`\n✓ 成功生成 100 篇测试博客！`);
    console.log(`✓ 总博客数: ${allMeta.length}`);
    console.log(`✓ meta.json 已更新`);
    
  } catch (error) {
    console.error('生成博客时出错:', error);
    process.exit(1);
  }
}

// 运行脚本
generateBlogs();
