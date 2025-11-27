import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { Portfolio } from '../types';
import { Calendar, User, BookOpen, Clock, FileText, CheckCircle, XCircle, Clock3, MessageSquare, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onUpdateStatus?: (id: string, status: Portfolio['status']) => void;
  onDelete?: (id: string) => void;
  showDetails?: boolean; // Nueva prop para mostrar detalles expandidos
}

export const PortfolioCard = ({ portfolio, onUpdateStatus, onDelete, showDetails = true }: PortfolioCardProps) => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    approved: 'text-green-600 bg-green-50 border-green-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
  };

  const statusIcons = {
    pending: <Clock3 className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };

  const statusLabels = {
    pending: 'Pendiente de revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  const hasEvaluation = portfolio.evaluation && portfolio.status !== 'pending';
  const hasComment = portfolio.teacherComment && portfolio.status !== 'pending';

  return (
    <Card className="glass-effect shadow-university hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-bold text-slate-800">{portfolio.studentName}</span>
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 ${statusColors[portfolio.status]} shadow-sm`}>
            {statusIcons[portfolio.status]}
            {statusLabels[portfolio.status]}
          </span>
        </CardTitle>
        <CardDescription className="text-base font-medium text-slate-600 mt-2">
          {portfolio.career} - {portfolio.semester}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 block">Materia</span>
              <span className="text-sm font-medium text-slate-800 truncate">{portfolio.subject}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 block">Horario</span>
              <span className="text-sm font-medium text-slate-800">{portfolio.classSchedule}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 block">Archivo</span>
              <span className="text-sm font-medium text-slate-800 truncate">{portfolio.fileName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 block">Fecha de entrega</span>
              <span className="text-sm font-medium text-slate-800">
                {format(new Date(portfolio.submittedAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {/* Calificación general */}
        {hasEvaluation && showDetails && (
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-800">Calificación:</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${
                    (portfolio.evaluation?.percentage || 0) >= 70 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolio.evaluation?.percentage || 0}%
                  </span>
                  <span className="text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded-lg">
                    {portfolio.evaluation?.totalScore || 0}/{portfolio.evaluation?.maxTotalScore || 0} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Botón para ver detalles */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEvaluation(!showEvaluation)}
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              {showEvaluation ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Ocultar detalles de evaluación
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Ver detalles de evaluación
                </>
              )}
            </Button>

            {/* Detalles expandibles de evaluación */}
            {showEvaluation && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                <p className="text-sm font-bold text-slate-700 mb-3">Evaluación por criterio:</p>
                {portfolio.evaluation?.criteria?.map((criterion, index) => {
                  const score = criterion.score || 0;
                  const percentage = criterion.maxScore > 0 ? (score / criterion.maxScore) * 100 : 0;
                  
                  return (
                    <div key={criterion.id} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              {index + 1}.
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {criterion.name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 ml-6 mt-1">
                            {criterion.description}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <span className={`text-xl font-bold ${
                            percentage >= 70 ? 'text-green-600' : 'text-slate-600'
                          }`}>
                            {score}
                          </span>
                          <span className="text-sm text-slate-500">/{criterion.maxScore}</span>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-600 text-right mt-1">
                          {Math.round(percentage)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Comentario del maestro */}
        {hasComment && showDetails && (
          <div className={`mt-4 p-4 rounded-xl border-l-4 shadow-sm ${
            portfolio.status === 'approved' 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                portfolio.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <MessageSquare className={`h-4 w-4 ${
                  portfolio.status === 'approved' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold mb-2 ${
                  portfolio.status === 'approved' ? 'text-green-900' : 'text-red-900'
                }`}>
                  Comentario del maestro:
                </p>
                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                  portfolio.status === 'approved' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {portfolio.teacherComment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje para portafolios pendientes */}
        {portfolio.status === 'pending' && showDetails && (
          <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock3 className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-xs font-medium text-yellow-800 leading-relaxed">
                Tu portafolio está en espera de revisión. Te notificaremos cuando tu maestro lo evalúe.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {(onUpdateStatus || onDelete) && (
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
          {onUpdateStatus && portfolio.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(portfolio.id, 'approved')}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdateStatus(portfolio.id, 'rejected')}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(portfolio.id)}
              className="flex-1 border-slate-300 hover:bg-slate-50"
            >
              Eliminar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
