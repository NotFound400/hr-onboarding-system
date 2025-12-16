import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectRole, selectIsHR } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  /** 允许访问的角色列表 */
  allowedRoles?: ('HR' | 'Employee')[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHR = useAppSelector(selectIsHR);
  const storedRole = useAppSelector(selectRole);
  const effectiveRole: 'HR' | 'Employee' = isHR ? 'HR' : storedRole ?? 'Employee';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

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
