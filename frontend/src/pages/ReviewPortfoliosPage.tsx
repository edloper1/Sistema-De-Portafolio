import React, { useState } from 'react';
import { usePortfolios } from '../context/PortfolioContext';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { PDFViewer } from '../components/PDFViewer';
import { EvaluationRubric } from '../components/EvaluationRubric';
import { CriteriaEditor } from '../components/CriteriaEditor';
import { TemplateManager } from '../components/TemplateManager';
import { 
  Search, 
  Calendar, 
  User, 
  BookOpen, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock3,
  MessageSquare,
  Filter,
  Eye,
  X,
  Award,
  Settings,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Portfolio, PortfolioEvaluation, EvaluationCriterion } from '../types';

// Criterios predeterminados iniciales
const DEFAULT_CRITERIA: Omit<EvaluationCriterion, 'score'>[] = [
  {
    id: '1',
    name: 'Completitud',
    description: 'El portafolio incluye todas las evidencias y documentos requeridos',
    maxScore: 20,
  },
  {
    id: '2',
    name: 'Organización',
    description: 'El contenido está bien estructurado, ordenado y es fácil de navegar',
    maxScore: 15,
  },
  {
    id: '3',
    name: 'Calidad de las Evidencias',
    description: 'Las evidencias demuestran claramente el aprendizaje y competencias adquiridas',
    maxScore: 25,
  },
  {
    id: '4',
    name: 'Presentación',
    description: 'El formato es profesional, legible y visualmente apropiado',
    maxScore: 10,
  },
  {
    id: '5',
    name: 'Reflexión y Análisis',
    description: 'Incluye reflexiones sobre el proceso de aprendizaje y autoevaluación',
    maxScore: 15,
  },
  {
    id: '6',
    name: 'Cumplimiento de Objetivos',
    description: 'Demuestra el logro de los objetivos de aprendizaje de la materia',
    maxScore: 15,
  },
];

export const ReviewPortfoliosPage: React.FC = () => {
  const { portfolios, updatePortfolioStatus, updatePortfolio, deletePortfolio, getPortfolioFileUrl } = usePortfolios();
  const [fileUrlMap, setFileUrlMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Portfolio['status']>('all');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [commentText, setCommentText] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState<PortfolioEvaluation | undefined>(undefined);
  const [customCriteria, setCustomCriteria] = useState<Omit<EvaluationCriterion, 'score'>[]>(DEFAULT_CRITERIA);
  const [showCriteriaEditor, setShowCriteriaEditor] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Obtener lista única de materias
  const subjects = Array.from(new Set(portfolios.map(p => p.subject))).sort();

  // Filtrar portafolios
  const filteredPortfolios = portfolios.filter((portfolio) => {
    const matchesSearch = 
      portfolio.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.career.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || portfolio.status === filterStatus;
    const matchesSubject = !filterSubject || portfolio.subject === filterSubject;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Agrupar por estado
  const pendingPortfolios = filteredPortfolios.filter(p => p.status === 'pending');

  const handleSelectPortfolio = async (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setCommentText(portfolio.teacherComment || '');
    
    // Cargar el archivo desde IndexedDB si no está en el mapa
    if (!fileUrlMap[portfolio.id] && !portfolio.fileUrl) {
      const url = await getPortfolioFileUrl(portfolio.id);
      if (url) {
        setFileUrlMap(prev => ({ ...prev, [portfolio.id]: url }));
      }
    }
    
    // Si el portafolio ya tiene una evaluación, usar esos criterios
    // Si no, usar los criterios personalizados actuales pero sin puntuaciones
    if (portfolio.evaluation) {
      setCurrentEvaluation(portfolio.evaluation);
    } else {
      // Crear evaluación inicial con los criterios personalizados
      const initialEvaluation: PortfolioEvaluation = {
        criteria: customCriteria.map(c => ({ ...c, score: undefined })),
        totalScore: 0,
        maxTotalScore: customCriteria.reduce((sum, c) => sum + c.maxScore, 0),
        percentage: 0,
      };
      setCurrentEvaluation(initialEvaluation);
    }
  };

  const handleCloseReview = () => {
    setSelectedPortfolio(null);
    setCommentText('');
    setCurrentEvaluation(undefined);
    setShowCriteriaEditor(false);
    setShowTemplateManager(false);
  };

  const handleLoadTemplate = (criteria: Omit<EvaluationCriterion, 'score'>[]) => {
    setCustomCriteria(criteria);
    setShowTemplateManager(false);
    
    // Si hay un portafolio seleccionado, actualizar su evaluación con los nuevos criterios
    if (selectedPortfolio && selectedPortfolio.status === 'pending') {
      const newEvaluation: PortfolioEvaluation = {
        criteria: criteria.map(c => ({ ...c, score: undefined })),
        totalScore: 0,
        maxTotalScore: criteria.reduce((sum, c) => sum + c.maxScore, 0),
        percentage: 0,
      };
      setCurrentEvaluation(newEvaluation);
    }
  };

  const handleApprove = () => {
    if (!selectedPortfolio) return;
    
    updatePortfolioStatus(
      selectedPortfolio.id,
      'approved',
      commentText || 'Portafolio aprobado',
      currentEvaluation
    );
    
    handleCloseReview();
  };

  const handleReject = () => {
    if (!selectedPortfolio) return;
    
    updatePortfolioStatus(
      selectedPortfolio.id,
      'rejected',
      commentText || 'Portafolio rechazado',
      currentEvaluation
    );
    
    handleCloseReview();
  };

  const handleSaveDraft = () => {
    if (!selectedPortfolio) return;
    
    updatePortfolio(selectedPortfolio.id, {
      teacherComment: commentText,
      evaluation: currentEvaluation,
    });
  };

  const handleDelete = async () => {
    if (!selectedPortfolio) return;
    
    // Limpiar la URL del objeto si existe
    if (fileUrlMap[selectedPortfolio.id]) {
      URL.revokeObjectURL(fileUrlMap[selectedPortfolio.id]);
      setFileUrlMap(prev => {
        const newMap = { ...prev };
        delete newMap[selectedPortfolio.id];
        return newMap;
      });
    }
    await deletePortfolio(selectedPortfolio.id);
    handleCloseReview();
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusIcons = {
    pending: <Clock3 className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };

  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  // Vista modal de revisión detallada
  if (selectedPortfolio) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen p-4">
          <div className="container mx-auto max-w-7xl">
            <Card className="my-8">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      Revisión Detallada del Portafolio
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-semibold">{selectedPortfolio.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{selectedPortfolio.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(selectedPortfolio.submittedAt), "d 'de' MMM, yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseReview}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel izquierdo: Visor de PDF */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Documento del Portafolio
                    </div>
                    
                    <PDFViewer
                      fileUrl={fileUrlMap[selectedPortfolio.id] || apiClient.getFileUrl(selectedPortfolio.id)}
                      fileName={selectedPortfolio.fileName}
                    />

                    {/* Información adicional */}
                    <Card className="bg-gray-50">
                      <CardContent className="pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carrera:</span>
                          <span className="font-medium">{selectedPortfolio.career}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Semestre:</span>
                          <span className="font-medium">{selectedPortfolio.semester}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Horario:</span>
                          <span className="font-medium">{selectedPortfolio.classSchedule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tamaño del archivo:</span>
                          <span className="font-medium">
                            {(selectedPortfolio.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Panel derecho: Evaluación y comentarios */}
                  <div className="space-y-6">
                    {/* Rúbrica de evaluación */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <Award className="h-5 w-5 text-blue-600" />
                          Evaluación con Rúbrica
                        </div>
                        {selectedPortfolio.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowTemplateManager(!showTemplateManager);
                                setShowCriteriaEditor(false);
                              }}
                            >
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Plantillas
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowCriteriaEditor(!showCriteriaEditor);
                                setShowTemplateManager(false);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Criterios
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Editor de criterios */}
                      {showCriteriaEditor && selectedPortfolio.status === 'pending' && (
                        <div className="mb-4">
                          <CriteriaEditor
                            criteria={customCriteria}
                            onCriteriaChange={(newCriteria) => {
                              setCustomCriteria(newCriteria);
                              // Actualizar evaluación actual con nuevos criterios
                              const newEvaluation: PortfolioEvaluation = {
                                criteria: newCriteria.map(c => ({ ...c, score: undefined })),
                                totalScore: 0,
                                maxTotalScore: newCriteria.reduce((sum, c) => sum + c.maxScore, 0),
                                percentage: 0,
                              };
                              setCurrentEvaluation(newEvaluation);
                            }}
                          />
                        </div>
                      )}

                      {/* Gestor de plantillas */}
                      {showTemplateManager && selectedPortfolio.status === 'pending' && (
                        <div className="mb-4">
                          <TemplateManager
                            currentCriteria={customCriteria}
                            onLoadTemplate={handleLoadTemplate}
                          />
                        </div>
                      )}

                      {/* Rúbrica de evaluación */}
                      {!showCriteriaEditor && !showTemplateManager && (
                        <EvaluationRubric
                          currentEvaluation={currentEvaluation}
                          onEvaluationChange={setCurrentEvaluation}
                          readonly={selectedPortfolio.status !== 'pending'}
                        />
                      )}
                    </div>

                    {/* Área de comentarios */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MessageSquare className="h-5 w-5" />
                          Retroalimentación para el Estudiante
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPortfolio.status === 'pending' ? (
                          <>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Escribe aquí tus comentarios, sugerencias y retroalimentación para el estudiante..."
                              className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              disabled={selectedPortfolio.status !== 'pending'}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              * Obligatorio para rechazar el portafolio. Opcional para aprobar.
                            </p>
                          </>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {selectedPortfolio.teacherComment || 'Sin comentarios'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    {selectedPortfolio.status === 'pending' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={handleApprove}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Aprobar Portafolio
                          </Button>
                          <Button
                            onClick={handleReject}
                            variant="destructive"
                            className="w-full"
                            size="lg"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Rechazar Portafolio
                          </Button>
                        </div>
                        <Button
                          onClick={handleSaveDraft}
                          variant="outline"
                          className="w-full"
                        >
                          Guardar como borrador
                        </Button>
                        <Button
                          onClick={handleDelete}
                          variant="destructive"
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Eliminar Portafolio
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Card className={`border-2 ${statusColors[selectedPortfolio.status]}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-center gap-3">
                              {statusIcons[selectedPortfolio.status]}
                              <span className="text-lg font-semibold">
                                Este portafolio ya ha sido {statusLabels[selectedPortfolio.status].toLowerCase()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        <Button
                          onClick={handleDelete}
                          variant="destructive"
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Eliminar Portafolio
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista de portafolios
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Revisar Portafolios</h1>
        <p className="text-muted-foreground">
          Selecciona un portafolio para revisarlo con el visor de PDF integrado y sistema de evaluación
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por estudiante, materia o carrera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </Select>
            <Select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full"
            >
              <option value="">Todas las materias</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingPortfolios.length}</p>
              </div>
              <Clock3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-3xl font-bold text-green-600">
                  {portfolios.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazados</p>
                <p className="text-3xl font-bold text-red-600">
                  {portfolios.filter(p => p.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de portafolios */}
      {filteredPortfolios.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron portafolios</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' || filterSubject
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Aún no hay portafolios para revisar'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
              onClick={() => handleSelectPortfolio(portfolio)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {portfolio.studentName}
                  </CardTitle>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[portfolio.status]}`}>
                    {statusIcons[portfolio.status]}
                    {statusLabels[portfolio.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {portfolio.career} - {portfolio.semester}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium truncate">{portfolio.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="truncate">{portfolio.classSchedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(portfolio.submittedAt), "d 'de' MMM", { locale: es })}
                  </span>
                </div>

                {portfolio.evaluation && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Calificación:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {portfolio.evaluation.percentage}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPortfolio(portfolio);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {portfolio.status === 'pending' ? 'Revisar y Evaluar' : 'Ver Detalles'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async (e) => {
                      e.stopPropagation();
                      // Limpiar la URL del objeto si existe
                      if (fileUrlMap[portfolio.id]) {
                        URL.revokeObjectURL(fileUrlMap[portfolio.id]);
                        setFileUrlMap(prev => {
                          const newMap = { ...prev };
                          delete newMap[portfolio.id];
                          return newMap;
                        });
                      }
                      await deletePortfolio(portfolio.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
