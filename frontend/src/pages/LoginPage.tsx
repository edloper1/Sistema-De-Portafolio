import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Logo } from '../components/Logo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await login(email, password, role);
    
    if (success) {
      // Redirigir según el rol
      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/portfolios');
      }
    } else {
      setError('Credenciales inválidas o rol incorrecto');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Logo size="xlarge" showText={false} />
          </div>
          <p className="text-slate-600 text-base md:text-lg">Plataforma Académica de Evidencias</p>
        </div>

        <Card className="glass-effect shadow-university p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    role === 'student'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="font-semibold text-sm">Alumno</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    role === 'teacher'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">👨‍🏫</div>
                  <div className="font-semibold text-sm">Maestro</div>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full h-12 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top-2">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Link to Register */}
          {role === 'student' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 mb-3">¿No tienes cuenta?</p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Registrarse como Alumno
              </Link>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
};
