import { useNavigate } from 'react-router'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">页面未找到</h1>
        <p className="error-description">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="error-suggestions">
          <p>可能的原因：</p>
          <ul>
            <li>URL 地址输入有误</li>
            <li>页面已被删除或重命名</li>
            <li>您没有访问权限</li>
          </ul>
        </div>
        <div className="error-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            返回首页
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
