import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const normalizeRole = (role?: string): string | undefined =>
  typeof role === 'string' ? role.trim().toUpperCase() : undefined;

const getDefaultRouteByRole = (role?: string): string => {
  const normalized = normalizeRole(role);
  if (normalized === 'ADMIN') return '/admin';
  if (normalized === 'SHOP_OWNER') return '/market';
  return '/';
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
  fallback,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, role, token } = useAuth();

  const effectiveToken = token || localStorage.getItem('token');

  if (!effectiveToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <>
        {fallback ?? (
          <div className="flex items-center justify-center min-h-screen w-full bg-surface">
            <svg
              className="animate-spin h-10 w-10 text-brand"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedUserRole = normalizeRole(role);
    const normalizedAllowed = allowedRoles.map((r) => r.trim().toUpperCase());

    if (!normalizedUserRole || !normalizedAllowed.includes(normalizedUserRole)) {
      const target = getDefaultRouteByRole(normalizedUserRole);
      if (target !== location.pathname) {
        return <Navigate to={target} replace />;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;