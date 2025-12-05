import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  // Esperar a que termine de cargar antes de verificar autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación - también verificar localStorage como fallback
  const hasUserInState = !!user;
  const hasUserInStorage = typeof window !== 'undefined' && !!localStorage.getItem('portfolio_user');
  const hasSession = typeof window !== 'undefined' && (() => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'supabase';
      const storageKey = `sb-${projectRef}-auth-token`;
      return !!localStorage.getItem(storageKey);
    } catch {
      return false;
    }
  })();

  const actuallyAuthenticated = hasUserInState || (hasUserInStorage && hasSession);

  if (!actuallyAuthenticated) {
    console.log('❌ ProtectedRoute: No autenticado, redirigiendo a login', {
      hasUserInState,
      hasUserInStorage,
      hasSession,
    });
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario en storage pero no en estado, intentar cargarlo
  if (!hasUserInState && hasUserInStorage && hasSession) {
    try {
      const savedUser = JSON.parse(localStorage.getItem('portfolio_user') || 'null');
      if (savedUser) {
        console.log('⚠️ ProtectedRoute: Usuario en storage pero no en estado, recargando...');
        // El AuthContext debería cargarlo, pero por seguridad mostramos loading
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Verificando sesión...</p>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error al parsear usuario de storage:', error);
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirigir al dashboard apropiado según el rol
    if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/student/portfolios" replace />;
    }
  }

  return <>{children}</>;
};
