import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  LayoutDashboard,
  Search,
  GraduationCap,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">{icon}</div>
          <h3 className="text-xl font-semibold text-left">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 space-y-4 border-t">
          {children}
        </div>
      )}
    </Card>
  );
};

export const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(
    user?.role === 'teacher' ? 'teacher' : 'student'
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          📚 Centro de Ayuda
        </h1>
        <p className="text-lg text-gray-600">
          Guía completa sobre cómo usar el Sistema de Gestión de Portafolios
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <Button
            variant={activeTab === 'student' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('student')}
            className="px-6"
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Para Alumnos
          </Button>
          <Button
            variant={activeTab === 'teacher' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('teacher')}
            className="px-6"
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Para Maestros
          </Button>
        </div>
      </div>

      {/* Contenido para Alumnos */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          <AccordionSection
            title="¿Qué es este sistema?"
            icon={<BookOpen className="h-6 w-6" />}
            defaultOpen={true}
          >
            <div className="pt-4 space-y-3 text-gray-700">
              <p>
                El <strong>Sistema de Gestión de Portafolios</strong> es una plataforma donde puedes:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Subir tus trabajos y portafolios de evidencia</li>
                <li>Ver el estado de revisión de cada portafolio</li>
                <li>Recibir retroalimentación de tus maestros</li>
                <li>Llevar un registro organizado de tus entregas</li>
              </ul>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Cómo subir un portafolio"
            icon={<Upload className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                  Accede a "Subir Portafolio"
                </h4>
                <p className="text-blue-800 ml-8">
                  Haz clic en el botón "Subir Portafolio" en la barra de navegación superior.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                  Completa el formulario
                </h4>
                <ul className="text-blue-800 ml-8 space-y-1">
                  <li>• <strong>Nombre del estudiante:</strong> Tu nombre completo</li>
                  <li>• <strong>Semestre:</strong> Selecciona tu semestre actual</li>
                  <li>• <strong>Carrera:</strong> Elige tu programa académico</li>
                  <li>• <strong>Materia:</strong> Selecciona la materia del catálogo</li>
                  <li>• <strong>Horario:</strong> Elige el grupo al que perteneces</li>
                  <li>• <strong>Archivo:</strong> Sube tu portafolio (PDF, DOC, DOCX, ZIP, RAR)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                  Envía tu portafolio
                </h4>
                <p className="text-blue-800 ml-8">
                  Haz clic en "Subir Portafolio". Recibirás una confirmación visual de que se subió correctamente.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-amber-900">
                  <strong>⚠️ Importante:</strong> Todos los campos son obligatorios. Asegúrate de seleccionar 
                  la materia y el grupo correctos antes de subir.
                </p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Ver mis portafolios"
            icon={<FileText className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4 text-gray-700">
              <p>
                En la sección <strong>"Mis Portafolios"</strong> puedes ver todos los trabajos que has entregado.
              </p>
              
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-gray-900">Información que verás:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">📋 Detalles del portafolio</p>
                    <p className="text-sm text-gray-600">Materia, semestre, carrera y horario</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">📅 Fecha de entrega</p>
                    <p className="text-sm text-gray-600">Cuándo subiste el portafolio</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">✅ Estado actual</p>
                    <p className="text-sm text-gray-600">Pendiente, Aprobado o Rechazado</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">💬 Comentarios</p>
                    <p className="text-sm text-gray-600">Retroalimentación de tu maestro</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Búsqueda y filtros
                </h4>
                <p className="text-gray-700">
                  Usa la barra de búsqueda para encontrar portafolios específicos por nombre, materia o carrera.
                </p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Estados de los portafolios"
            icon={<Clock className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4">
              <p className="text-gray-700">
                Cada portafolio tiene un estado que indica su situación actual:
              </p>

              <div className="space-y-3">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-900">Pendiente</h4>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    Tu portafolio ha sido recibido y está esperando revisión del maestro. 
                    Ten paciencia mientras es evaluado.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Aprobado</h4>
                  </div>
                  <p className="text-green-800 text-sm">
                    ¡Felicidades! Tu portafolio cumplió con los requisitos y ha sido aprobado. 
                    Revisa los comentarios del maestro para ver la retroalimentación.
                  </p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-center mb-2">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-900">Rechazado</h4>
                  </div>
                  <p className="text-red-800 text-sm">
                    Tu portafolio necesita correcciones. Lee cuidadosamente los comentarios del maestro 
                    para entender qué debes mejorar y vuelve a subirlo.
                  </p>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Consejos y mejores prácticas"
            icon={<MessageSquare className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-3 text-gray-700">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Organiza tus archivos:</strong> Asegúrate de que tu portafolio esté completo antes de subirlo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Nombra bien tus archivos:</strong> Usa nombres descriptivos como "Portafolio_Matematicas_Semestre3.pdf"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Verifica antes de enviar:</strong> Confirma que seleccionaste la materia y grupo correctos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Revisa los comentarios:</strong> Si tu portafolio es rechazado, lee con atención la retroalimentación</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Sube a tiempo:</strong> No esperes hasta el último momento para entregar tus portafolios</span>
                </li>
              </ul>
            </div>
          </AccordionSection>
        </div>
      )}

      {/* Contenido para Maestros */}
      {activeTab === 'teacher' && (
        <div className="space-y-6">
          <AccordionSection
            title="Gestión de Materias y Grupos"
            icon={<BookOpen className="h-6 w-6" />}
            defaultOpen={true}
          >
            <div className="pt-4 space-y-4">
              <p className="text-gray-700">
                En la sección <strong>"Mis Materias"</strong> puedes administrar todas tus materias y sus grupos.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Crear una Nueva Materia</h4>
                <ol className="text-blue-800 ml-6 space-y-2 list-decimal">
                  <li>Haz clic en el botón "+ Nueva Materia"</li>
                  <li>Completa la información:
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>• Código de la materia (ej: MAT-101)</li>
                      <li>• Nombre de la materia</li>
                      <li>• Semestre</li>
                      <li>• Carrera</li>
                      <li>• Año escolar</li>
                    </ul>
                  </li>
                  <li>Guarda la materia</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Agregar Grupos a una Materia</h4>
                <ol className="text-green-800 ml-6 space-y-2 list-decimal">
                  <li>En la tarjeta de la materia, haz clic en "Editar"</li>
                  <li>En la sección de grupos, haz clic en "+ Agregar Grupo"</li>
                  <li>Ingresa el horario del grupo (ej: "Lunes y Miércoles 7:00-9:00")</li>
                  <li>Puedes agregar múltiples grupos para la misma materia</li>
                  <li>Guarda los cambios</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Editar o Eliminar</h4>
                <p className="text-purple-800">
                  Puedes editar la información de cualquier materia o eliminarla si ya no la impartes. 
                  Los cambios se reflejarán en el sistema de inmediato.
                </p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Cómo Revisar Portafolios"
            icon={<FileText className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4">
              <p className="text-gray-700 font-medium">
                La sección <strong>"Revisar Portafolios"</strong> es donde evalúas los trabajos de tus estudiantes.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                <h4 className="font-bold text-blue-900 mb-3 text-lg">
                  📋 Proceso de Revisión Paso a Paso
                </h4>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">1</span>
                      Accede a "Revisar Portafolios"
                    </h5>
                    <p className="text-gray-700 ml-10">
                      Haz clic en "Revisar Portafolios" en la barra de navegación. Verás todos los portafolios 
                      de tus materias organizados en tarjetas.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">2</span>
                      Usa los filtros
                    </h5>
                    <p className="text-gray-700 ml-10 mb-2">
                      Filtra los portafolios para encontrar los que necesitas revisar:
                    </p>
                    <ul className="text-gray-600 ml-10 space-y-1 text-sm">
                      <li>• <strong>Barra de búsqueda:</strong> Busca por nombre de estudiante o materia</li>
                      <li>• <strong>Filtro por materia:</strong> Ver solo portafolios de una materia específica</li>
                      <li>• <strong>Filtro por estado:</strong> Ver solo pendientes, aprobados o rechazados</li>
                      <li>• <strong>Filtro por horario:</strong> Filtrar por grupo específico</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">3</span>
                      Revisa la información
                    </h5>
                    <p className="text-gray-700 ml-10 mb-2">
                      Cada tarjeta de portafolio muestra:
                    </p>
                    <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">✓ Nombre del estudiante</div>
                      <div className="bg-gray-50 p-2 rounded">✓ Materia y grupo</div>
                      <div className="bg-gray-50 p-2 rounded">✓ Semestre y carrera</div>
                      <div className="bg-gray-50 p-2 rounded">✓ Fecha de entrega</div>
                      <div className="bg-gray-50 p-2 rounded">✓ Estado actual</div>
                      <div className="bg-gray-50 p-2 rounded">✓ Archivo adjunto</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-green-300">
                    <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                      <span className="bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">4</span>
                      Aprobar un Portafolio
                    </h5>
                    <p className="text-gray-700 ml-10 mb-2">
                      Si el trabajo cumple con los requisitos:
                    </p>
                    <ol className="text-gray-700 ml-10 space-y-2 list-decimal">
                      <li>Haz clic en el botón <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">✓ Aprobar</span></li>
                      <li>(Opcional) Escribe un comentario positivo o retroalimentación constructiva</li>
                      <li>Confirma la aprobación</li>
                      <li>El estado cambiará a <span className="text-green-600 font-semibold">APROBADO</span></li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-red-300">
                    <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                      <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">5</span>
                      Rechazar un Portafolio
                    </h5>
                    <p className="text-gray-700 ml-10 mb-2">
                      Si el trabajo necesita correcciones:
                    </p>
                    <ol className="text-gray-700 ml-10 space-y-2 list-decimal">
                      <li>Haz clic en el botón <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">✗ Rechazar</span></li>
                      <li><strong>IMPORTANTE:</strong> Escribe un comentario claro explicando qué debe corregirse</li>
                      <li>Sé específico sobre los errores o faltantes</li>
                      <li>Confirma el rechazo</li>
                      <li>El estado cambiará a <span className="text-red-600 font-semibold">RECHAZADO</span></li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm">6</span>
                      Revisa el siguiente
                    </h5>
                    <p className="text-gray-700 ml-10">
                      Continúa con el siguiente portafolio. Los cambios se guardan automáticamente 
                      y el estudiante verá la actualización de inmediato.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-amber-900 mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Importancia de los Comentarios
                </h5>
                <p className="text-amber-800 text-sm">
                  <strong>Siempre proporciona retroalimentación clara y constructiva,</strong> especialmente 
                  cuando rechaces un portafolio. Los comentarios ayudan a los estudiantes a mejorar y 
                  entender qué esperamos de su trabajo.
                </p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Estadísticas y Reportes"
            icon={<LayoutDashboard className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4 text-gray-700">
              <p>
                La sección de <strong>"Estadísticas"</strong> te proporciona un análisis completo 
                del progreso de tus estudiantes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📊 Gráficas de Pastel</h4>
                  <p className="text-blue-800 text-sm">
                    Visualiza la distribución de portafolios por estado (Pendientes, Aprobados, Rechazados).
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">📈 Gráficas de Barras</h4>
                  <p className="text-green-800 text-sm">
                    Analiza el rendimiento por materia, semestre o carrera según tu preferencia.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">📋 Tabla Detallada</h4>
                  <p className="text-purple-800 text-sm">
                    Consulta estadísticas específicas con porcentajes de completitud por categoría.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">🎯 Tarjetas Resumen</h4>
                  <p className="text-indigo-800 text-sm">
                    Ve de un vistazo el total de portafolios, aprobados, pendientes y rechazados.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Agrupación Personalizada</h4>
                <p className="text-gray-700 text-sm">
                  Puedes cambiar la agrupación de los datos entre Materia, Semestre o Carrera 
                  para obtener diferentes perspectivas del rendimiento estudiantil.
                </p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Mejores Prácticas para Maestros"
            icon={<UserCheck className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-3 text-gray-700">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Revisa regularmente:</strong> Establece un horario para revisar portafolios y evita acumulaciones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Retroalimentación específica:</strong> No solo digas "incompleto", explica qué falta o qué está mal</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Sé consistente:</strong> Aplica los mismos criterios de evaluación para todos los estudiantes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Usa los filtros:</strong> Aprovecha las herramientas de búsqueda y filtrado para ser más eficiente</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Revisa las estadísticas:</strong> Usa el dashboard para identificar materias o grupos que necesiten más atención</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Mantén actualizado el catálogo:</strong> Asegúrate de que tus materias y grupos estén al día</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 text-xl">✓</span>
                  <span><strong>Retroalimentación positiva:</strong> Cuando apruebes, también menciona qué hicieron bien los estudiantes</span>
                </li>
              </ul>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Criterios de Evaluación Sugeridos"
            icon={<CheckCircle className="h-6 w-6" />}
          >
            <div className="pt-4 space-y-4 text-gray-700">
              <p>Considera estos aspectos al revisar un portafolio:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Completitud</h5>
                  <p className="text-sm">¿Incluye todas las evidencias requeridas?</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Organización</h5>
                  <p className="text-sm">¿Está bien estructurado y es fácil de navegar?</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Calidad</h5>
                  <p className="text-sm">¿Las evidencias demuestran el aprendizaje esperado?</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Presentación</h5>
                  <p className="text-sm">¿Es profesional y legible?</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Reflexión</h5>
                  <p className="text-sm">¿Incluye análisis sobre el proceso de aprendizaje?</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">✓ Evidencias</h5>
                  <p className="text-sm">¿Son relevantes y demuestran competencia?</p>
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      )}

      {/* Footer */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Necesitas más ayuda?
          </h3>
          <p className="text-gray-600 mb-4">
            Si tienes dudas adicionales o encuentras algún problema técnico, 
            contacta al administrador del sistema.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>📧 soporte@escuela.edu</span>
            <span>•</span>
            <span>📞 Ext. 1234</span>
          </div>
        </div>
      </Card>
    </div>
  );
};




