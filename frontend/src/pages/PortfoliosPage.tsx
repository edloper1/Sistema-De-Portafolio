import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolios } from '../context/PortfolioContext';
import { PortfolioCard } from '../components/PortfolioCard';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, Filter, FileText, Upload, Info } from 'lucide-react';
import type { SortOption } from '../types';

export const PortfoliosPage = () => {
  const { user } = useAuth();
  const {
    portfolios: allPortfolios,
    filterOptions,
    setFilterOptions,
    sortOption,
    setSortOption,
    getFilteredAndSortedPortfolios,
    updatePortfolioStatus,
    deletePortfolio,
  } = usePortfolios();

  const [showFilters, setShowFilters] = useState(false);

  // Si es estudiante, mostrar solo sus portafolios filtrados
  const portfolios = user?.role === 'student' && user.id
    ? allPortfolios.filter((p) => p.studentId === user.id)
    : getFilteredAndSortedPortfolios();

  // Obtener opciones únicas para los filtros
  const allPortfoliosData = allPortfolios;
  const uniqueSubjects = [...new Set(allPortfoliosData.map((p) => p.subject))];
  const uniqueSemesters = [...new Set(allPortfoliosData.map((p) => p.semester))].sort();
  const uniqueCareers = [...new Set(allPortfoliosData.map((p) => p.career))];
  const uniqueSchedules = [...new Set(allPortfoliosData.map((p) => p.classSchedule))];

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  const clearFilters = () => {
    setFilterOptions({
      subject: '',
      semester: '',
      career: '',
      classSchedule: '',
      searchTerm: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {user?.role === 'student' ? 'Mis Portafolios' : 'Portafolios de Evidencia'}
          </h1>
          <p className="text-slate-600 text-lg">
            {user?.role === 'student' 
              ? 'Revisa el estado de tus portafolios entregados'
              : 'Explora y gestiona todos los portafolios entregados'}
          </p>
        </div>

      {/* Barra de búsqueda y controles */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, materia o carrera..."
              className="pl-11 h-12 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={filterOptions.searchTerm}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, searchTerm: e.target.value })
              }
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-12 border-slate-300 hover:bg-slate-50 bg-white"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          <Select 
            value={sortOption} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-12 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
          >
            <option value="date">Fecha de entrega</option>
            <option value="alphabetical">Orden alfabético</option>
            <option value="semester">Semestre</option>
          </Select>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <Card className="glass-effect shadow-university p-5 md:p-6 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </h3>
              <Button variant="outline" onClick={clearFilters} size="sm" className="border-slate-300">
                Limpiar filtros
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Materia</label>
                <Select
                  value={filterOptions.subject}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, subject: e.target.value })
                  }
                  className="h-10 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                >
                  <option value="">Todas las materias</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Semestre</label>
                <Select
                  value={filterOptions.semester}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, semester: e.target.value })
                  }
                  className="h-10 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                >
                  <option value="">Todos los semestres</option>
                  {uniqueSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Carrera</label>
                <Select
                  value={filterOptions.career}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, career: e.target.value })
                  }
                  className="h-10 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                >
                  <option value="">Todas las carreras</option>
                  {uniqueCareers.map((career) => (
                    <option key={career} value={career}>
                      {career}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Horario</label>
                <Select
                  value={filterOptions.classSchedule}
                  onChange={(e) =>
                    setFilterOptions({ ...filterOptions, classSchedule: e.target.value })
                  }
                  className="h-10 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                >
                  <option value="">Todos los horarios</option>
                  {uniqueSchedules.map((schedule) => (
                    <option key={schedule} value={schedule}>
                      {schedule}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Tarjeta informativa para alumnos sin portafolios */}
        {user?.role === 'student' && portfolios.length === 0 && allPortfoliosData.length === 0 && !showFilters && (
          <Card className="glass-effect shadow-university p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 mb-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2 text-lg">
                  ¡Bienvenido al sistema de portafolios!
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Aquí podrás ver todos tus portafolios entregados y su estado de revisión. 
                  Para comenzar, sube tu primer portafolio haciendo clic en el botón de abajo.
                </p>
                <Button 
                  onClick={() => window.location.href = '/student/upload'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir mi primer portafolio
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Resultados */}
      {portfolios.length > 0 && (
        <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700">
            Mostrando <span className="font-bold text-blue-600">{portfolios.length}</span> de <span className="font-bold text-slate-800">{allPortfoliosData.length}</span> portafolios
          </p>
        </div>
      )}

      {portfolios.length === 0 ? (
        <Card className="glass-effect shadow-university p-12 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No se encontraron portafolios</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            {user?.role === 'student' && allPortfoliosData.length === 0
              ? 'Aún no has subido ningún portafolio. ¡Comienza subiendo tu primer portafolio!'
              : user?.role === 'student'
              ? 'No tienes portafolios que coincidan con estos filtros'
              : allPortfoliosData.length === 0
              ? 'Aún no hay portafolios registrados en el sistema'
              : 'Intenta ajustar los filtros de búsqueda'}
          </p>
          {user?.role === 'student' && allPortfoliosData.length === 0 && (
            <Button 
              onClick={() => window.location.href = '/student/upload'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Subir mi primer portafolio
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onUpdateStatus={user?.role === 'teacher' ? updatePortfolioStatus : undefined}
              onDelete={user?.role === 'teacher' ? deletePortfolio : undefined}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
