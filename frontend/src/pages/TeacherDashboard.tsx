import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubjectService } from '../lib/services/subject.service';
import { apiClient } from '../lib/api/client';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { UserPlus, Users, X, Plus, Trash2 } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { 
    user, 
    addSubject, 
    deleteSubject, 
    getSubjectsByTeacher,
    addStudent,
    deleteStudent,
    getAllStudents,
  } = useAuth();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState<string | null>(null);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddStudentToGroup, setShowAddStudentToGroup] = useState<{subjectId: string, groupId: string} | null>(null);

  // Formulario para nueva materia
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    semester: '',
    career: '',
    schoolYear: '',
  });

  // Formulario para nuevo grupo
  const [newGroup, setNewGroup] = useState({
    name: '',
    schedule: '',
  });

  // Formulario para nuevo alumno
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
  });

  // Estado para días y horario seleccionados
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('');

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeRanges = [
    '8:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
  };

  // Actualizar schedule cuando cambien los días o el horario
  React.useEffect(() => {
    if (selectedDays.length > 0 && selectedTimeRange) {
      const daysStr = selectedDays.join(', ');
      setNewGroup((prev) => ({
        ...prev,
        schedule: `${daysStr} ${selectedTimeRange}`,
      }));
    } else {
      setNewGroup((prev) => ({
        ...prev,
        schedule: '',
      }));
    }
  }, [selectedDays, selectedTimeRange]);

  const teacherSubjects = user?.id && user?.role === 'teacher'
    ? getSubjectsByTeacher(user.id)
    : [];

  const handleAddSubject = async () => {
    if (!user?.id || !newSubject.name || !newSubject.code || !newSubject.semester || !newSubject.career || !newSubject.schoolYear) {
      return;
    }

    try {
      await addSubject({
        ...newSubject,
        teacherId: user.id,
        groups: [],
      });

      setNewSubject({
        name: '',
        code: '',
        semester: '',
        career: '',
        schoolYear: '',
      });
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error al guardar materia:', error);
    }
  };

  const handleAddGroup = async (subjectId: string) => {
    if (!newGroup.name || !newGroup.schedule || selectedDays.length === 0 || !selectedTimeRange) {
      return;
    }

    const subject = teacherSubjects.find((s) => s.id === subjectId);
    if (!subject) return;

    try {
      const result = await SubjectService.addGroup(subjectId, {
        name: newGroup.name,
        schedule: newGroup.schedule,
      });

      if (result.success) {
        setNewGroup({ name: '', schedule: '' });
        setSelectedDays([]);
        setSelectedTimeRange('');
        setShowAddGroup(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al agregar grupo:', error);
    }
  };

  const handleDeleteGroup = async (subjectId: string, groupId: string) => {
    const subject = teacherSubjects.find((s) => s.id === subjectId);
    if (!subject) return;

    try {
      const { SubjectService } = await import('../lib/services/subject.service');
      const result = await SubjectService.deleteGroup(groupId);

      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
    }
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email) {
      return;
    }

    // Verificar que el email no esté ya registrado
    if (getAllStudents().some(s => s.email.toLowerCase() === newStudent.email.toLowerCase())) {
      return;
    }

    addStudent({
      name: newStudent.name,
      email: newStudent.email,
      role: 'student',
    });

    setNewStudent({ name: '', email: '' });
    setShowAddStudent(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
  };

  const handleAddStudentToGroup = async (subjectId: string, groupId: string, studentId: string) => {
    const subject = teacherSubjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const group = subject.groups.find((g) => g.id === groupId);
    if (!group) return;

    // Verificar que el estudiante no esté ya en el grupo
    if (group.students.includes(studentId)) {
      return;
    }

    try {
      const result = await apiClient.addStudentToGroup(groupId, studentId);

      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al agregar estudiante al grupo:', error);
    }
  };

  const handleRemoveStudentFromGroup = async (subjectId: string, groupId: string, studentId: string) => {
    const subject = teacherSubjects.find((s) => s.id === subjectId);
    if (!subject) return;

    try {
      const result = await apiClient.removeStudentFromGroup(groupId, studentId);

      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al eliminar estudiante del grupo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Panel de Maestro
              </h1>
              <p className="text-slate-600 text-lg">
                Bienvenido, <span className="font-semibold text-slate-800">{user?.name}</span>
              </p>
            </div>
            <Button 
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {showAddSubject ? '✕ Cancelar' : '+ Agregar Materia'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Materias Activas</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {teacherSubjects.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <span className="text-4xl">📚</span>
              </div>
            </div>
          </Card>

          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Grupos Totales</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {teacherSubjects.reduce((acc, s) => acc + s.groups.length, 0)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <span className="text-4xl">👥</span>
              </div>
            </div>
          </Card>

          <Card className="glass-effect shadow-university p-6 hover:shadow-xl transition-shadow border-l-4 border-l-purple-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Año Escolar</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <span className="text-4xl">📅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Botón para gestionar alumnos */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowManageStudents(!showManageStudents)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Users className="h-5 w-5 mr-2" />
            {showManageStudents ? 'Ocultar Gestión de Alumnos' : 'Gestionar Alumnos'}
          </Button>
        </div>

        {/* Panel de Gestión de Alumnos */}
        {showManageStudents && (
          <Card className="glass-effect shadow-university p-6 md:p-8 mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Gestión de Alumnos</h3>
              </div>
              <Button
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {showAddStudent ? 'Cancelar' : 'Agregar Alumno'}
              </Button>
            </div>

            {/* Formulario para agregar alumno */}
            {showAddStudent && (
              <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border-2 border-purple-200">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Nuevo Alumno</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nombre Completo
                    </label>
                    <Input
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      className="h-11 rounded-lg border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Correo Electrónico
                    </label>
                    <Input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="Ej: juan.perez@estudiante.edu"
                      className="h-11 rounded-lg border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleAddStudent}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar Alumno
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddStudent(false);
                      setNewStudent({ name: '', email: '' });
                    }}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de alumnos */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-slate-800 mb-4">
                Alumnos Registrados ({getAllStudents().length})
              </h4>
              {getAllStudents().length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600">No hay alumnos registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllStudents().map((student) => (
                    <div
                      key={student.id}
                      className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-sm text-slate-600">{student.email}</p>
                          <p className="text-xs text-slate-500 mt-1">ID: {student.studentId}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.studentId!)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Eliminar alumno"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add Subject Form */}
        {showAddSubject && (
          <Card className="glass-effect shadow-university p-6 md:p-8 mb-6 border-2 border-blue-200 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Nueva Materia</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de la Materia
                </label>
                <Input
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                  placeholder="Ej: Arquitectura de Software"
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Código
                </label>
                <Input
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, code: e.target.value })
                  }
                  placeholder="Ej: ARQ-101"
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Semestre
                </label>
                <Select
                  value={newSubject.semester}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, semester: e.target.value })
                  }
                  required
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="">Selecciona un semestre</option>
                  <option value="1er Semestre">1er Semestre</option>
                  <option value="2do Semestre">2do Semestre</option>
                  <option value="3er Semestre">3er Semestre</option>
                  <option value="4to Semestre">4to Semestre</option>
                  <option value="5to Semestre">5to Semestre</option>
                  <option value="6to Semestre">6to Semestre</option>
                  <option value="7mo Semestre">7mo Semestre</option>
                  <option value="8vo Semestre">8vo Semestre</option>
                  <option value="9no Semestre">9no Semestre</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Carrera
                </label>
                <Select
                  value={newSubject.career}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, career: e.target.value })
                  }
                  required
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="">Selecciona una carrera</option>
                  <option value="Ingeniería en Sistemas Computacionales">
                    Ingeniería en Sistemas Computacionales
                  </option>
                  <option value="Ingeniería en Informática Administrativa">
                    Ingeniería en Informática Administrativa
                  </option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Año Escolar
                </label>
                <Input
                  value={newSubject.schoolYear}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, schoolYear: e.target.value })
                  }
                  placeholder="Ej: 2024-2025"
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAddSubject}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Guardar Materia
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddSubject(false)}
                className="flex-1 border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Subjects List */}
        <div className="space-y-6">
          {teacherSubjects.length === 0 ? (
            <Card className="glass-effect shadow-university p-12 md:p-16 text-center">
              <div className="text-7xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No hay materias registradas
              </h3>
              <p className="text-slate-600 text-lg mb-6">
                Comienza agregando tu primera materia
              </p>
              <Button 
                onClick={() => setShowAddSubject(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                + Agregar Primera Materia
              </Button>
            </Card>
          ) : (
            teacherSubjects.map((subject) => (
              <Card key={subject.id} className="glass-effect shadow-university p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {subject.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-200">
                        {subject.code}
                      </span>
                      <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-green-200">
                        {subject.semester}
                      </span>
                      <span className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-purple-200">
                        {subject.career}
                      </span>
                      <span className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                        {subject.schoolYear}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      deleteSubject(subject.id);
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    🗑️ Eliminar
                  </Button>
                </div>

                {/* Groups Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h4 className="text-lg font-bold text-slate-800">
                      Grupos <span className="text-blue-600">({subject.groups.length})</span>
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (showAddGroup === subject.id) {
                          setShowAddGroup(null);
                          setSelectedDays([]);
                          setSelectedTimeRange('');
                          setNewGroup({ name: '', schedule: '' });
                        } else {
                          setShowAddGroup(subject.id);
                        }
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {showAddGroup === subject.id ? '✕ Cancelar' : '+ Agregar Grupo'}
                    </Button>
                  </div>

                  {showAddGroup === subject.id && (
                    <div className="mb-4 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-blue-200 animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nombre del Grupo
                          </label>
                          <Input
                            value={newGroup.name}
                            onChange={(e) =>
                              setNewGroup({ ...newGroup, name: e.target.value })
                            }
                            placeholder="Ej: Grupo A"
                            className="h-10 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Días de la Semana
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {days.map((day) => (
                              <label
                                key={day}
                                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedDays.includes(day)
                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                    : 'bg-white border-slate-300 hover:border-blue-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDays.includes(day)}
                                  onChange={() => handleDayToggle(day)}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Rango de Horas
                          </label>
                          <Select
                            value={selectedTimeRange}
                            onChange={(e) => handleTimeRangeChange(e.target.value)}
                            required
                            className="h-10 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          >
                            <option value="">Selecciona un horario</option>
                            {timeRanges.map((range) => (
                              <option key={range} value={range}>
                                {range}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {newGroup.schedule && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-700 mb-1">
                              Horario seleccionado:
                            </p>
                            <p className="text-sm font-medium text-blue-900">
                              {newGroup.schedule}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleAddGroup(subject.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          Guardar Grupo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddGroup(null);
                            setSelectedDays([]);
                            setSelectedTimeRange('');
                            setNewGroup({ name: '', schedule: '' });
                          }}
                          className="flex-1 border-slate-300 hover:bg-slate-50"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subject.groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 mb-1">{group.name}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <span>🕐</span>
                              {group.schedule}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteGroup(subject.id, group.id)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Eliminar grupo"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {/* Lista de alumnos en el grupo */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-500">
                              👥 {group.students.length} estudiante{group.students.length !== 1 ? 's' : ''}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setShowAddStudentToGroup(
                                showAddStudentToGroup?.groupId === group.id 
                                  ? null 
                                  : { subjectId: subject.id, groupId: group.id }
                              )}
                              className="h-7 px-2 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Agregar
                            </Button>
                          </div>

                          {/* Formulario para agregar alumno al grupo */}
                          {showAddStudentToGroup?.groupId === group.id && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-2">
                              <Select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddStudentToGroup(subject.id, group.id, e.target.value);
                                    setShowAddStudentToGroup(null);
                                  }
                                }}
                                className="h-9 text-sm rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                              >
                                <option value="">Selecciona un alumno</option>
                                {getAllStudents()
                                  .filter(s => !group.students.includes(s.studentId!))
                                  .map((student) => (
                                    <option key={student.id} value={student.studentId}>
                                      {student.name} ({student.email})
                                    </option>
                                  ))}
                              </Select>
                              {group.students.length === getAllStudents().length && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Todos los alumnos ya están en este grupo
                                </p>
                              )}
                            </div>
                          )}

                          {/* Lista de alumnos del grupo */}
                          {group.students.length > 0 ? (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {group.students.map((studentId) => {
                                const student = getAllStudents().find(s => s.studentId === studentId);
                                if (!student) return null;
                                return (
                                  <div
                                    key={studentId}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                                  >
                                    <span className="text-slate-700">{student.name}</span>
                                    <button
                                      onClick={() => handleRemoveStudentFromGroup(subject.id, group.id, studentId)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                      title="Eliminar del grupo"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-2">
                              No hay alumnos en este grupo
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {subject.groups.length === 0 && !showAddGroup && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">
                        No hay grupos registrados. Agrega tu primer grupo.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
