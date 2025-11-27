import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Trash2, Save, FileText, GripVertical, AlertCircle } from 'lucide-react';
import type { EvaluationCriterion } from '../types';

interface CriteriaEditorProps {
  criteria: Omit<EvaluationCriterion, 'score'>[];
  onCriteriaChange: (criteria: Omit<EvaluationCriterion, 'score'>[]) => void;
}

export const CriteriaEditor: React.FC<CriteriaEditorProps> = ({
  criteria,
  onCriteriaChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCriterion = () => {
    const newCriterion: Omit<EvaluationCriterion, 'score'> = {
      id: Date.now().toString(),
      name: 'Nuevo Criterio',
      description: 'Descripción del criterio',
      maxScore: 10,
    };
    onCriteriaChange([...criteria, newCriterion]);
    setEditingId(newCriterion.id);
  };

  const updateCriterion = (id: string, updates: Partial<Omit<EvaluationCriterion, 'score'>>) => {
    const updated = criteria.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    onCriteriaChange(updated);
  };

  const deleteCriterion = (id: string) => {
    if (criteria.length <= 1) {
      return;
    }
    onCriteriaChange(criteria.filter((c) => c.id !== id));
  };

  const moveCriterion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === criteria.length - 1)
    ) {
      return;
    }

    const newCriteria = [...criteria];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCriteria[index], newCriteria[newIndex]] = [newCriteria[newIndex], newCriteria[index]];
    onCriteriaChange(newCriteria);
  };

  const totalMaxScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Personaliza tus Criterios de Evaluación
              </p>
              <p className="text-xs text-blue-700">
                Agrega, edita o elimina criterios según las necesidades de tu materia. 
                Puedes guardar esta configuración como plantilla para usarla en futuras evaluaciones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Criterios de Evaluación</h3>
          <p className="text-sm text-gray-600">
            Total: {totalMaxScore} puntos
          </p>
        </div>
        <Button onClick={addCriterion} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Criterio
        </Button>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion, index) => (
          <Card key={criterion.id} className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                {/* Drag handle y número */}
                <div className="flex flex-col items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded text-sm">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCriterion(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover arriba"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveCriterion(index, 'down')}
                      disabled={index === criteria.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover abajo"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Contenido del criterio */}
                <div className="flex-1 space-y-3">
                  {editingId === criterion.id ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del criterio
                        </label>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                          placeholder="Ej: Completitud, Organización..."
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={criterion.description}
                          onChange={(e) =>
                            updateCriterion(criterion.id, { description: e.target.value })
                          }
                          placeholder="Describe qué se evalúa en este criterio..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Puntos máximos:
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={criterion.maxScore}
                          onChange={(e) =>
                            updateCriterion(criterion.id, { maxScore: Number(e.target.value) })
                          }
                          className="w-24"
                        />
                      </div>

                      <Button
                        onClick={() => setEditingId(null)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">Puntos máx.</p>
                          <span className="text-2xl font-bold text-blue-600">
                            {criterion.maxScore}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingId(criterion.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => deleteCriterion(criterion.id)}
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {criteria.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">No hay criterios de evaluación</p>
              <Button onClick={addCriterion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer criterio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {totalMaxScore !== 100 && criteria.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                El total de puntos es {totalMaxScore}. Se recomienda que sea 100 para facilitar el cálculo de porcentajes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};




