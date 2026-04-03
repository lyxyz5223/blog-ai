import { Navigate } from 'react-router'

/**
 * ProtectedRoute - 保护路由的高阶组件
 * 用于仅允许已认证的管理员用户访问
 */
function ProtectedRoute({ isAuthenticated, component: Component }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Component />
}

export default ProtectedRoute
