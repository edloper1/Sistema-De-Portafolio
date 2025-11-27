import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  FileText, 
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { EvaluationCriterion, EvaluationTemplate } from '../types';

interface TemplateManagerProps {
  currentCriteria: Omit<EvaluationCriterion, 'score'>[];
  onLoadTemplate: (criteria: Omit<EvaluationCriterion, 'score'>[]) => void;
}

// Plantillas predeterminadas
const DEFAULT_TEMPLATES = [
  {
    id: 'default-1',
    name: 'Evaluación Estándar',
    description: 'Criterios generales para portafolios académicos',
    criteria: [
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
    ],
  },
  {
    id: 'default-2',
    name: 'Evaluación Simplificada',
    description: 'Criterios básicos para evaluación rápida',
    criteria: [
      {
        id: '1',
        name: 'Contenido',
        description: 'Incluye todo el material requerido con calidad adecuada',
        maxScore: 40,
      },
      {
        id: '2',
        name: 'Organización y Presentación',
        description: 'Bien estructurado y con formato profesional',
        maxScore: 30,
      },
      {
        id: '3',
        name: 'Análisis y Reflexión',
        description: 'Demuestra pensamiento crítico y autoevaluación',
        maxScore: 30,
      },
    ],
  },
  {
    id: 'default-3',
    name: 'Evaluación Detallada',
    description: 'Evaluación exhaustiva con múltiples criterios',
    criteria: [
      {
        id: '1',
        name: 'Completitud de Evidencias',
        description: 'Todas las evidencias requeridas están presentes',
        maxScore: 15,
      },
      {
        id: '2',
        name: 'Calidad del Contenido',
        description: 'El contenido es relevante, preciso y de alta calidad',
        maxScore: 20,
      },
      {
        id: '3',
        name: 'Organización',
        description: 'Estructura lógica y fácil navegación',
        maxScore: 10,
      },
      {
        id: '4',
        name: 'Formato y Presentación',
        description: 'Aspecto profesional y pulido',
        maxScore: 10,
      },
      {
        id: '5',
        name: 'Reflexión Personal',
        description: 'Análisis profundo del aprendizaje',
        maxScore: 15,
      },
      {
        id: '6',
        name: 'Conexión con Objetivos',
        description: 'Clara relación con los objetivos del curso',
        maxScore: 10,
      },
      {
        id: '7',
        name: 'Creatividad e Innovación',
        description: 'Presenta ideas originales o enfoques creativos',
        maxScore: 10,
      },
      {
        id: '8',
        name: 'Referencias y Fuentes',
        description: 'Uso apropiado de citas y referencias',
        maxScore: 10,
      },
    ],
  },
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  currentCriteria,
  onLoadTemplate,
}) => {
  const { user, addEvaluationTemplate, deleteEvaluationTemplate, getTemplatesByTeacher } =
    useAuth();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const userTemplates = user?.teacherId ? getTemplatesByTeacher(user.teacherId) : [];

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !user?.teacherId) {
      return;
    }

    const template: Omit<EvaluationTemplate, 'id' | 'createdAt'> = {
      name: templateName,
      description: templateDescription,
      criteria: currentCriteria,
      teacherId: user.teacherId,
    };

    addEvaluationTemplate(template);
    setTemplateName('');
    setTemplateDescription('');
    setShowSaveDialog(false);
  };

  const handleLoadTemplate = (template: EvaluationTemplate | typeof DEFAULT_TEMPLATES[0]) => {
    // Crear nuevos IDs para evitar conflictos
    const criteriaWithNewIds = template.criteria.map((c) => ({
      ...c,
      id: `${Date.now()}-${Math.random()}`,
    }));
    onLoadTemplate(criteriaWithNewIds);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    deleteEvaluationTemplate(id);
  };

  const toggleExpanded = (id: string) => {
    setExpandedTemplate(expandedTemplate === id ? null : id);
  };

  const TemplateCard = ({ template, isDefault = false }: { template: any; isDefault?: boolean }) => {
    const isExpanded = expandedTemplate === template.id;
    const totalPoints = template.criteria.reduce((sum: number, c: any) => sum + c.maxScore, 0);

    return (
      <Card className={`${isDefault ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isDefault && <Star className="h-4 w-4 text-blue-600" />}
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {template.criteria.length} criterios • {totalPoints} puntos
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleExpanded(template.id)}
              className="ml-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2 border-t pt-3">
              {template.criteria.map((criterion: any, index: number) => (
                <div key={criterion.id} className="bg-white p-2 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-blue-600 mr-2">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium">{criterion.name}</span>
                      <p className="text-xs text-gray-600 ml-5">{criterion.description}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 ml-2">
                      {criterion.maxScore}pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleLoadTemplate(template)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Cargar
            </Button>
            {!isDefault && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTemplate(template.id, template.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Guardar plantilla actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Save className="h-5 w-5" />
            Guardar Configuración Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showSaveDialog ? (
            <Button onClick={() => setShowSaveDialog(true)} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar como nueva plantilla
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la plantilla *
                </label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ej: Evaluación de Programación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe cuándo usar esta plantilla..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setTemplateName('');
                    setTemplateDescription('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plantillas del usuario */}
      {userTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Mis Plantillas ({userTemplates.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {userTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Plantillas predeterminadas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-blue-600" />
          Plantillas Predeterminadas
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {DEFAULT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} isDefault />
          ))}
        </div>
      </div>

      {userTemplates.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">No tienes plantillas guardadas</p>
              <p className="text-sm text-gray-500">
                Personaliza los criterios y guarda tu configuración para reutilizarla
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};







