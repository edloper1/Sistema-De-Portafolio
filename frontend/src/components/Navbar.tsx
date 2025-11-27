import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, Upload, LogOut, BookOpen, HelpCircle, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { useState } from 'react';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // No mostrar navbar en la página de login
  if (location.pathname === '/login') {
    return null;
  }

  const studentLinks = [
    { to: '/student/portfolios', icon: FileText, label: 'Mis Portafolios' },
    { to: '/student/upload', icon: Upload, label: 'Subir Portafolio' },
    { to: '/student/help', icon: HelpCircle, label: 'Ayuda' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: BookOpen, label: 'Mis Materias' },
    { to: '/teacher/portfolios', icon: FileText, label: 'Revisar Portafolios' },
    { to: '/teacher/stats', icon: LayoutDashboard, label: 'Estadísticas' },
    { to: '/teacher/help', icon: HelpCircle, label: 'Ayuda' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/portfolios'} 
            className="flex items-center space-x-3 group"
          >
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
              <FileText className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <span className="text-lg md:text-xl font-bold hidden sm:block">Sistema de Portafolios</span>
            <span className="text-lg font-bold sm:hidden">SP</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <>
              <div className="hidden lg:flex items-center space-x-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(link.to)
                          ? 'bg-white/20 backdrop-blur-sm shadow-md'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Info & Logout - Desktop */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-white/20 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs opacity-90">
                      {user?.role === 'teacher' ? 'Maestro' : 'Alumno'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-white/20 text-white"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/20 animate-in slide-in-from-top">
            <div className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(link.to)
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs opacity-90">
                      {user?.role === 'teacher' ? 'Maestro' : 'Alumno'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-white hover:bg-white/20"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
