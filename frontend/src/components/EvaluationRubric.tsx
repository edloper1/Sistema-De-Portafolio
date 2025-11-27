import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Award,
  Info
} from 'lucide-react';
import type { EvaluationCriterion, PortfolioEvaluation } from '../types';

interface EvaluationRubricProps {
  currentEvaluation?: PortfolioEvaluation;
  onEvaluationChange: (evaluation: PortfolioEvaluation) => void;
  readonly?: boolean;
}

// Criterios de evaluación predeterminados
const DEFAULT_CRITERIA: EvaluationCriterion[] = [
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

export const EvaluationRubric: React.FC<EvaluationRubricProps> = ({
  currentEvaluation,
  onEvaluationChange,
  readonly = false,
}) => {
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(
    currentEvaluation?.criteria || DEFAULT_CRITERIA
  );

  // Calcular totales
  const calculateTotals = (criteriaList: EvaluationCriterion[]): PortfolioEvaluation => {
    const maxTotalScore = criteriaList.reduce((sum, c) => sum + c.maxScore, 0);
    const totalScore = criteriaList.reduce((sum, c) => sum + (c.score || 0), 0);
    const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

    return {
      criteria: criteriaList,
      totalScore,
      maxTotalScore,
      percentage,
    };
  };

  // Actualizar criterio
  const updateCriterionScore = (id: string, score: number) => {
    const updatedCriteria = criteria.map((c) =>
      c.id === id ? { ...c, score: Math.min(Math.max(0, score), c.maxScore) } : c
    );
    setCriteria(updatedCriteria);
    onEvaluationChange(calculateTotals(updatedCriteria));
  };

  // Resetear evaluación
  const resetEvaluation = () => {
    const resetCriteria = criteria.map((c) => ({ ...c, score: undefined }));
    setCriteria(resetCriteria);
    onEvaluationChange(calculateTotals(resetCriteria));
  };

  const evaluation = calculateTotals(criteria);
  const allScored = criteria.every((c) => c.score !== undefined);

  // Determinar color según porcentaje
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getApprovalStatus = (percentage: number) => {
    if (percentage >= 70) {
      return {
        text: 'Aprobado',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        color: 'text-green-700',
      };
    }
    return {
      text: 'Reprobado',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: 'text-red-700',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Rúbrica de Evaluación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              Evalúa cada criterio asignando una puntuación. El puntaje mínimo aprobatorio es 70%.
              {!readonly && ' Ajusta los valores usando los controles o escribe directamente la puntuación.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Criterios de evaluación */}
      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <Card key={criterion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded text-sm">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">{criterion.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 mb-1">Puntos máximos</p>
                  <span className="text-lg font-bold text-blue-600">{criterion.maxScore}</span>
                </div>
              </div>

              {!readonly ? (
                <div className="flex items-center gap-4 ml-9">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Puntuación:</label>
                    <input
                      type="number"
                      min="0"
                      max={criterion.maxScore}
                      value={criterion.score ?? ''}
                      onChange={(e) => updateCriterionScore(criterion.id, Number(e.target.value))}
                      placeholder="0"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">/ {criterion.maxScore}</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="flex-1 max-w-xs">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{
                          width: `${criterion.score !== undefined ? (criterion.score / criterion.maxScore) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {criterion.score !== undefined && (
                    <span className="text-sm font-semibold text-blue-600">
                      {Math.round((criterion.score / criterion.maxScore) * 100)}%
                    </span>
                  )}
                </div>
              ) : (
                <div className="ml-9 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {criterion.score ?? 0}
                    </span>
                    <span className="text-gray-500">/ {criterion.maxScore}</span>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{
                          width: `${criterion.score !== undefined ? (criterion.score / criterion.maxScore) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {criterion.score !== undefined ? Math.round((criterion.score / criterion.maxScore) * 100) : 0}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de calificación */}
      <Card className={`border-2 ${getScoreBackground(evaluation.percentage)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Calificación Total</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${getScoreColor(evaluation.percentage)}`}>
                    {evaluation.totalScore}
                  </span>
                  <span className="text-2xl text-gray-500">/ {evaluation.maxTotalScore}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(evaluation.percentage)} mb-2`}>
                {evaluation.percentage}%
              </div>
              {allScored && (
                <div className={`flex items-center gap-2 justify-end font-semibold ${getApprovalStatus(evaluation.percentage).color}`}>
                  {getApprovalStatus(evaluation.percentage).icon}
                  {getApprovalStatus(evaluation.percentage).text}
                </div>
              )}
            </div>
          </div>

          {/* Barra de progreso total */}
          <div className="mt-4">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  evaluation.percentage >= 70
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${evaluation.percentage}%` }}
              />
            </div>
          </div>

          {!readonly && !allScored && (
            <p className="text-sm text-amber-700 mt-3 text-center">
              ⚠️ Completa todos los criterios para ver la calificación final
            </p>
          )}

          {!readonly && allScored && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetEvaluation}
              className="w-full mt-4"
            >
              Reiniciar Evaluación
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};




