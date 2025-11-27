import { usePortfolios } from '../context/PortfolioContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { GroupStats } from '../types';

export const DashboardPage = () => {
  const { portfolios } = usePortfolios();
  const [groupBy, setGroupBy] = useState<'subject' | 'semester' | 'career'>('subject');

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = portfolios.length;
    const pending = portfolios.filter((p) => p.status === 'pending').length;
    const approved = portfolios.filter((p) => p.status === 'approved').length;
    const rejected = portfolios.filter((p) => p.status === 'rejected').length;
    
    // Estadísticas de evaluaciones
    const evaluatedPortfolios = portfolios.filter((p) => p.evaluation);
    const averageScore = evaluatedPortfolios.length > 0
      ? evaluatedPortfolios.reduce((sum, p) => sum + (p.evaluation?.percentage || 0), 0) / evaluatedPortfolios.length
      : 0;

    return { total, pending, approved, rejected, evaluated: evaluatedPortfolios.length, averageScore };
  }, [portfolios]);

  // Agrupar portafolios por criterio seleccionado
  const groupedStats = useMemo(() => {
    const groups: { [key: string]: GroupStats } = {};

    portfolios.forEach((portfolio) => {
      const key = portfolio[groupBy];

      if (!groups[key]) {
        groups[key] = {
          groupName: key,
          total: 0,
          submitted: 0,
          pending: 0,
          percentage: 0,
        };
      }

      groups[key].total++;
      if (portfolio.status !== 'pending') {
        groups[key].submitted++;
      } else {
        groups[key].pending++;
      }
    });

    // Calcular porcentajes
    Object.values(groups).forEach((group) => {
      group.percentage = group.total > 0 ? Math.round((group.submitted / group.total) * 100) : 0;
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [portfolios, groupBy]);

  // Datos para gráfica de pastel
  const pieData = [
    { name: 'Aprobados', value: stats.approved, color: '#10b981' },
    { name: 'Pendientes', value: stats.pending, color: '#f59e0b' },
    { name: 'Rechazados', value: stats.rejected, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const groupByLabels = {
    subject: 'Materia',
    semester: 'Semestre',
    career: 'Carrera',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Estadísticas y análisis de los portafolios entregados
        </p>
      </div>

      {/* Tarjetas de estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Portafolios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registros totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
              <p className="text-muted-foreground">
                Sube algunos portafolios para ver las estadísticas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Gráfica de distribución de estados */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
              <CardDescription>
                Vista general del estado de los portafolios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfica de grupos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estadísticas por Grupo</CardTitle>
                  <CardDescription>
                    Análisis detallado de entregas por {groupByLabels[groupBy].toLowerCase()}
                  </CardDescription>
                </div>
                <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}>
                  <option value="subject">Por Materia</option>
                  <option value="semester">Por Semestre</option>
                  <option value="career">Por Carrera</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={groupedStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" fill="#10b981" name="Entregados" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabla de detalles */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Detalles por {groupByLabels[groupBy]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">{groupByLabels[groupBy]}</th>
                      <th className="text-right p-4">Total</th>
                      <th className="text-right p-4">Entregados</th>
                      <th className="text-right p-4">Pendientes</th>
                      <th className="text-right p-4">% Completado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedStats.map((group) => (
                      <tr key={group.groupName} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{group.groupName}</td>
                        <td className="text-right p-4">{group.total}</td>
                        <td className="text-right p-4 text-green-600">{group.submitted}</td>
                        <td className="text-right p-4 text-yellow-600">{group.pending}</td>
                        <td className="text-right p-4">
                          <span
                            className={`font-semibold ${
                              group.percentage >= 80
                                ? 'text-green-600'
                                : group.percentage >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {group.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
