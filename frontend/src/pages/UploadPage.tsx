import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolios } from '../context/PortfolioContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Upload, CheckCircle } from 'lucide-react';

export const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPortfolio } = usePortfolios();
  const { subjects } = useAuth();

  const [formData, setFormData] = useState({
    semester: '',
    career: '',
    subjectId: '',
    groupId: '',
    classSchedule: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  // Obtener materia seleccionada
  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file || !user || !user.studentId) {
      return;
    }

    const subject = subjects.find((s) => s.id === formData.subjectId);
    if (!subject) {
      return;
    }

    try {
      await addPortfolio({
        studentId: user.id || user.studentId, // Usar UUID (id) en lugar de studentId corto
        studentName: user.name,
        subjectId: formData.subjectId,
        subject: subject.name,
        groupId: formData.groupId,
        semester: formData.semester,
        career: formData.career,
        classSchedule: formData.classSchedule,
        file,
        fileName: file.name,
        fileSize: file.size,
      });

      setSuccess(true);

      // Resetear formulario
      setTimeout(() => {
        setFormData({
          semester: '',
          career: '',
          subjectId: '',
          groupId: '',
          classSchedule: '',
        });
        setFile(null);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error al subir portafolio:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="glass-effect shadow-university max-w-2xl w-full mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ¡Portafolio enviado con éxito!
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                Tu portafolio ha sido registrado correctamente
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setSuccess(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Subir otro portafolio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student/portfolios')}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  Ver mis portafolios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Subir Portafolio
          </h1>
          <p className="text-slate-600 text-lg">
            Completa el formulario para registrar tu portafolio de evidencia
          </p>
        </div>

        <Card className="glass-effect shadow-university max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">Información del Portafolio</CardTitle>
            </div>
            <CardDescription className="text-base">
              Todos los campos son obligatorios
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del estudiante (auto) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Estudiante
              </label>
              <Input
                type="text"
                value={user?.name || ''}
                disabled
                className="bg-slate-100 border-slate-300 h-11 rounded-lg"
              />
            </div>

            {/* Semestre */}
            <div>
              <label htmlFor="semester" className="block text-sm font-semibold text-slate-700 mb-2">
                Semestre
              </label>
              <Select
                id="semester"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                required
                className="h-11 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
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

            {/* Carrera */}
            <div>
              <label htmlFor="career" className="block text-sm font-semibold text-slate-700 mb-2">
                Carrera
              </label>
              <Select
                id="career"
                value={formData.career}
                onChange={(e) =>
                  setFormData({ ...formData, career: e.target.value })
                }
                required
                className="h-11 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
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

            {/* Materia */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                Materia
              </label>
              <Select
                id="subject"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value, groupId: '' })
                }
                required
                className="h-11 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
              >
                <option value="">Selecciona una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* Grupo */}
            {selectedSubject && selectedSubject.groups && selectedSubject.groups.length > 0 && (
              <div>
                <label htmlFor="group" className="block text-sm font-semibold text-slate-700 mb-2">
                  Grupo
                </label>
                <Select
                  id="group"
                  value={formData.groupId}
                  onChange={(e) => {
                    const group = selectedSubject.groups.find(g => g.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      groupId: e.target.value,
                      classSchedule: group?.schedule || ''
                    });
                  }}
                  required
                  className="h-11 rounded-lg border-slate-300 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecciona un grupo</option>
                  {selectedSubject.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - {group.schedule}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {selectedSubject && (!selectedSubject.groups || selectedSubject.groups.length === 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No estás inscrito en ningún grupo de esta materia. Contacta a tu maestro.
                </p>
              </div>
            )}

            {/* Archivo */}
            <div>
              <label htmlFor="file" className="block text-sm font-semibold text-slate-700 mb-2">
                Archivo del portafolio
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-slate-50">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  required
                  className="h-auto p-2 border-0 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              {file && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Archivo seleccionado: <span className="font-semibold">{file.name}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Subir Portafolio
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
