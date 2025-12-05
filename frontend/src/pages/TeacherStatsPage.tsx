import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolios } from '../context/PortfolioContext';
import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const TeacherStatsPage: React.FC = () => {
  const { user, subjects } = useAuth();
  const { portfolios } = usePortfolios();

  // Usar todas las materias del usuario (que ya están filtradas por el contexto)
  const teacherSubjects = user?.role === 'teacher' ? subjects : [];

  // Filtrar portafolios de las materias del maestro
  const teacherPortfolios = portfolios.filter((p) =>
    teacherSubjects.some((s) => s.id === p.subjectId)
  );

  // Estadísticas por estado
  const pendingCount = teacherPortfolios.filter((p) => p.status === 'pending').length;
  const approvedCount = teacherPortfolios.filter((p) => p.status === 'approved').length;
  const rejectedCount = teacherPortfolios.filter((p) => p.status === 'rejected').length;

  // Estadísticas de evaluaciones
  const evaluatedPortfolios = teacherPortfolios.filter((p) => p.evaluation);
  const averageScore = evaluatedPortfolios.length > 0
    ? evaluatedPortfolios.reduce((sum, p) => sum + (p.evaluation?.percentage || 0), 0) / evaluatedPortfolios.length
    : 0;
  
  // Distribución de calificaciones
  const excellentCount = evaluatedPortfolios.filter((p) => (p.evaluation?.percentage || 0) >= 90).length;
  const goodCount = evaluatedPortfolios.filter((p) => {
    const perc = p.evaluation?.percentage || 0;
    return perc >= 70 && perc < 90;
  }).length;
  const needsImprovementCount = evaluatedPortfolios.filter((p) => {
    const perc = p.evaluation?.percentage || 0;
    return perc > 0 && perc < 70;
  }).length;


  // Datos para gráfica de estados
  const statusData = [
    { name: 'Pendientes', value: pendingCount, color: '#f59e0b' },
    { name: 'Aprobados', value: approvedCount, color: '#10b981' },
    { name: 'Rechazados', value: rejectedCount, color: '#ef4444' },
  ];

  // Datos para gráfica de calificaciones
  const scoreData = evaluatedPortfolios.length > 0 ? [
    { name: 'Excelente (90-100%)', value: excellentCount, color: '#10b981' },
    { name: 'Bueno (70-89%)', value: goodCount, color: '#3b82f6' },
    { name: 'Necesita Mejora (<70%)', value: needsImprovementCount, color: '#f59e0b' },
  ].filter((item) => item.value > 0) : [];

  // Datos por materia
  const subjectStats = teacherSubjects.map((subject) => {
    const subjectPortfolios = teacherPortfolios.filter((p) => p.subjectId === subject.id);
    const subjectEvaluated = subjectPortfolios.filter((p) => p.evaluation);
    const subjectAverage = subjectEvaluated.length > 0
      ? subjectEvaluated.reduce((sum, p) => sum + (p.evaluation?.percentage || 0), 0) / subjectEvaluated.length
      : 0;
    
    return {
      name: subject.name,
      total: subjectPortfolios.length,
      pending: subjectPortfolios.filter((p) => p.status === 'pending').length,
      approved: subjectPortfolios.filter((p) => p.status === 'approved').length,
      rejected: subjectPortfolios.filter((p) => p.status === 'rejected').length,
      evaluated: subjectEvaluated.length,
      averageScore: Math.round(subjectAverage),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Estadísticas y Reportes
          </h1>
          <p className="text-slate-600 text-lg">
            Análisis detallado de los portafolios de tus materias
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Total Portafolios</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {teacherPortfolios.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <span className="text-4xl">📚</span>
              </div>
            </div>
          </Card>

          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Pendientes</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {pendingCount}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                <span className="text-4xl">⏳</span>
              </div>
            </div>
          </Card>

          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Aprobados</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {approvedCount}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <span className="text-4xl">✅</span>
              </div>
            </div>
          </Card>

          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Rechazados</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {rejectedCount}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl">
                <span className="text-4xl">❌</span>
              </div>
            </div>
          </Card>

          {evaluatedPortfolios.length > 0 && (
            <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Promedio General</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {Math.round(averageScore)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{evaluatedPortfolios.length} evaluados</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                  <span className="text-4xl">📊</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card className="glass-effect shadow-university p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Distribución por Estado
              </h3>
            </div>
            {teacherPortfolios.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                <span className="text-5xl mb-4">📊</span>
                <p className="text-lg font-medium">No hay datos para mostrar</p>
              </div>
            )}
          </Card>

          {/* Gráfica de Calificaciones */}
          {scoreData.length > 0 && (
            <Card className="glass-effect shadow-university p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <span className="text-xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Distribución de Calificaciones
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-score-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Bar Chart */}
          <Card className="glass-effect shadow-university p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Portafolios por Materia
              </h3>
            </div>
            {subjectStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="pending" name="Pendientes" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="approved" name="Aprobados" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="rejected" name="Rechazados" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  {subjectStats.some((s) => s.averageScore > 0) && (
                    <Bar
                      dataKey="averageScore"
                      name="Promedio (%)"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                <span className="text-5xl mb-4">📈</span>
                <p className="text-lg font-medium">No hay materias registradas</p>
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Stats Table */}
        <Card className="glass-effect shadow-university p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Detalle por Materia
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-blue-50">
                  <th className="px-4 py-4 text-left text-sm font-bold text-slate-700 rounded-tl-lg">
                    Materia
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Total
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Pendientes
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Aprobados
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Rechazados
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    % Aprobación
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700 rounded-tr-lg">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectStats.map((stat) => (
                  <tr key={stat.name} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                      {stat.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-center font-medium text-slate-700">
                      {stat.total}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-lg font-semibold border border-orange-200">
                        {stat.pending}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg font-semibold border border-green-200">
                        {stat.approved}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-lg font-semibold border border-red-200">
                        {stat.rejected}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className={`px-3 py-1.5 rounded-lg font-bold ${
                        stat.total > 0 && (stat.approved / stat.total) * 100 >= 70
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                          : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {stat.total > 0
                          ? `${((stat.approved / stat.total) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      {stat.evaluated > 0 ? (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg font-semibold border border-purple-200">
                          {stat.averageScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subjectStats.length === 0 && (
              <div className="py-12 text-center">
                <span className="text-5xl mb-4 block">📋</span>
                <p className="text-lg font-medium text-slate-500">No hay datos para mostrar</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
