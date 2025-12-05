import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PortfoliosPage } from './pages/PortfoliosPage';
import { UploadPage } from './pages/UploadPage';
import { ReviewPortfoliosPage } from './pages/ReviewPortfoliosPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherStatsPage } from './pages/TeacherStatsPage';
import { HelpPage } from './pages/HelpPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rutas para Alumnos */}
              <Route
                path="/student/portfolios"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PortfoliosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/upload"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/help"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HelpPage />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para Maestros */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/portfolios"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ReviewPortfoliosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/stats"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherStatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/help"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <HelpPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
