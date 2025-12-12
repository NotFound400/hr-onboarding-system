/**
 * Auth Guard Component
 * 路由守卫：保护需要登录的路由，并实现权限控制
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectRole, selectIsHR } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  /** 允许访问的角色列表 */
  allowedRoles?: ('HR' | 'Employee')[];
}

/**
 * AuthGuard Component
 * 
 * 路由保护规则 (按 frontend_requirement.md 5.1 定义):
 * - 未登录访问受保护页面 → /login?redirect=xxx
 * - 登录后角色不匹配 → 跳转到对应的 Dashboard
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHR = useAppSelector(selectIsHR);
  const storedRole = useAppSelector(selectRole);
  const effectiveRole: 'HR' | 'Employee' = isHR ? 'HR' : storedRole ?? 'Employee';
  const location = useLocation();

  // 未登录，重定向到登录页并携带当前路径
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 已登录但角色不匹配，重定向到对应的 Dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    const matchesAllowedRole = allowedRoles.some((targetRole) => {
      if (targetRole === 'HR') {
        return isHR;
      }
      return effectiveRole === 'Employee';
    });

    if (!matchesAllowedRole) {
      const redirectPath = effectiveRole === 'HR' ? '/hr/home' : '/employee/home';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
