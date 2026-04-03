import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <section className="about-intro">
          <h1>关于我</h1>
          <div className="intro-content">
            <div className="avatar">
              <div className="avatar-placeholder">👨‍💻</div>
            </div>
            <div className="intro-text">
              <p>
                我是一名充满热情的前端开发工程师，对创建美观、高效的用户界面和改善用户体验充满兴趣。
              </p>
              <p>
                我喜欢探索最新的 Web 技术，并将其应用到实际项目中。通过这个博客，我希望与大家分享我的学习成果和技术思考。
              </p>
            </div>
          </div>
        </section>

        <section className="skills-section">
          <h2>技能</h2>
          <div className="skills-grid">
            <div className="skill-item">
              <h3>前端框架</h3>
              <ul>
                <li>React</li>
                <li>Vue</li>
                <li>Angular</li>
              </ul>
            </div>
            <div className="skill-item">
              <h3>编程语言</h3>
              <ul>
                <li>JavaScript</li>
                <li>TypeScript</li>
                <li>Python</li>
              </ul>
            </div>
            <div className="skill-item">
              <h3>工具 & 构建</h3>
              <ul>
                <li>Vite</li>
                <li>Webpack</li>
                <li>Git</li>
              </ul>
            </div>
            <div className="skill-item">
              <h3>样式 & 设计</h3>
              <ul>
                <li>CSS / SCSS</li>
                <li>Responsive Design</li>
                <li>UI/UX</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="experience-section">
          <h2>经验</h2>
          <div className="experience-list">
            <div className="experience-item">
              <div className="exp-header">
                <h3>高级前端工程师</h3>
                <span className="date">2022 - 现在</span>
              </div>
              <p className="company">某科技公司</p>
              <p>领导前端团队开发企业应用，负责技术选型和架构设计。</p>
            </div>
            <div className="experience-item">
              <div className="exp-header">
                <h3>前端工程师</h3>
                <span className="date">2020 - 2022</span>
              </div>
              <p className="company">某 Web 公司</p>
              <p>开发并维护多个 Web 应用，优化页面性能和用户体验。</p>
            </div>
            <div className="experience-item">
              <div className="exp-header">
                <h3>初级前端工程师</h3>
                <span className="date">2018 - 2020</span>
              </div>
              <p className="company">某初创公司</p>
              <p>学习和掌握前端基础技术，参与产品开发。</p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>联系我</h2>
          <div className="contact-info">
            <p>如果你有任何问题或建议，欢迎通过以下方式联系我：</p>
            <div className="contact-links">
              <a href="mailto:example@email.com" className="contact-link">
                📧 email@example.com
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                🐙 GitHub
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                🐦 Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                💼 LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
