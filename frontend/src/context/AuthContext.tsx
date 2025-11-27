import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Subject, EvaluationTemplate } from '../types';
import { AuthService } from '../lib/services/auth.service';
import { SubjectService } from '../lib/services/subject.service';

interface AuthContextType {
  user: User | null;
  subjects: Subject[];
  evaluationTemplates: EvaluationTemplate[];
  students: User[];
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubjectsByTeacher: (teacherId: string) => Subject[];
  addEvaluationTemplate: (template: Omit<EvaluationTemplate, 'id' | 'createdAt'>) => void;
  updateEvaluationTemplate: (id: string, template: Partial<EvaluationTemplate>) => void;
  deleteEvaluationTemplate: (id: string) => void;
  getTemplatesByTeacher: (teacherId: string) => EvaluationTemplate[];
  addStudent: (student: Omit<User, 'id' | 'role'> & { role?: 'student' }) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  getAllStudents: () => User[];
  getStudentById: (studentId: string) => User | undefined;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Cargar usuario inicial desde localStorage si existe
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('portfolio_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          console.log('✅ Usuario cargado desde localStorage al iniciar:', parsed.id);
          return parsed;
        }
      } catch (error) {
        console.warn('⚠️ Error al cargar usuario de localStorage:', error);
      }
    }
    return null;
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluationTemplates, setEvaluationTemplates] = useState<EvaluationTemplate[]>(() => {
    const saved = localStorage.getItem('evaluationTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // Iniciar como true para cargar sesión inicial
  
  // Guardar usuario en localStorage cada vez que cambie
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('portfolio_user', JSON.stringify(user));
        console.log('✅ Usuario guardado en localStorage:', user.id);
      } catch (error) {
        console.error('❌ Error al guardar usuario en localStorage:', error);
      }
    } else {
      // Solo limpiar si realmente no hay usuario (no en cada render)
      const saved = localStorage.getItem('portfolio_user');
      if (saved) {
        console.log('⚠️ Usuario eliminado del estado, pero manteniendo en localStorage por seguridad');
      }
    }
  }, [user]);

  // Cargar usuario desde Supabase al iniciar
  useEffect(() => {
    loadInitialUser();

    // NO escuchar cambios en la sesión de Supabase porque los métodos se cuelgan
    // En su lugar, guardar el usuario en localStorage y leerlo de ahí
    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange(async (event, session) => {
    //   if (event === 'SIGNED_IN' && session?.user) {
    //     const currentUser = await AuthService.getCurrentUser();
    //     setUser(currentUser);
    //   } else if (event === 'SIGNED_OUT') {
    //     setUser(null);
    //     setSubjects([]);
    //   } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    //     const currentUser = await AuthService.getCurrentUser();
    //     setUser(currentUser);
    //   }
    // });

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  // Cargar materias cuando el usuario cambia
  useEffect(() => {
    if (user?.id && user?.role === 'teacher') {
      loadSubjects();
    } else if (user?.id && user?.role === 'student') {
      loadStudentSubjects();
    }
    if (user) {
      loadStudents();
    }
  }, [user]);

  const loadInitialUser = async () => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Cargando usuario inicial...');
      
      // Si ya hay usuario en el estado (cargado desde localStorage), verificar que la sesión aún existe
      if (user) {
        console.log('✅ Usuario ya en estado, verificando sesión...');
        const hasSession = typeof window !== 'undefined' && (() => {
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'supabase';
            const storageKey = `sb-${projectRef}-auth-token`;
            return !!localStorage.getItem(storageKey);
          } catch {
            return false;
          }
        })();
        
        if (hasSession) {
          console.log('✅ Sesión válida, manteniendo usuario');
          setLoading(false);
          return;
        } else {
          console.log('⚠️ No hay sesión, limpiando usuario');
          setUser(null);
          localStorage.removeItem('portfolio_user');
        }
      }
      
      // Intentar cargar usuario
      const currentUser = await AuthService.getCurrentUser();
      console.log('🔐 AuthContext: Usuario cargado:', currentUser ? 'Sí' : 'No');
      if (currentUser) {
        setUser(currentUser);
        console.log('✅ AuthContext: Usuario establecido en estado');
      } else {
        // Si no hay usuario, limpiar estado
        setUser(null);
        localStorage.removeItem('portfolio_user');
        console.log('⚠️ AuthContext: No hay usuario, limpiando estado');
      }
    } catch (error) {
      console.error('❌ Error al cargar usuario inicial:', error);
      // NO limpiar el usuario si hay error - mantener el que está en localStorage
      if (!user) {
        setUser(null);
        localStorage.removeItem('portfolio_user');
      }
    } finally {
      setLoading(false);
      console.log('✅ AuthContext: Carga inicial completada');
    }
  };

  // Guardar plantillas en localStorage
  useEffect(() => {
    localStorage.setItem('evaluationTemplates', JSON.stringify(evaluationTemplates));
  }, [evaluationTemplates]);

  const loadSubjects = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Usar el UUID del usuario (id) en lugar del teacherId corto
      const teacherSubjects = await SubjectService.getSubjectsByTeacher(user.id);
      setSubjects(teacherSubjects);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentSubjects = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Obtener materias del estudiante basándose en los grupos a los que pertenece
      const studentSubjects = await SubjectService.getSubjectsByStudent(user.id);
      setSubjects(studentSubjects);
    } catch (error) {
      console.error('Error al cargar materias del estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const allStudents = await AuthService.getAllStudents();
      setStudents(allStudents);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const login = async (
    email: string,
    password: string,
    role: 'teacher' | 'student'
  ): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext: Iniciando login');
      setLoading(true);
      const { user: loggedUser, error } = await AuthService.login(email, password, role);

      if (error || !loggedUser) {
        console.error('❌ AuthContext: Error en login:', error?.message);
        return false;
      }

      console.log('✅ AuthContext: Usuario logueado:', loggedUser);
      setUser(loggedUser);
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Excepción en login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const result = await AuthService.register(name, email, password, 'student');

      if (result.success && result.user) {
        setStudents((prev) => [...prev, result.user!]);
      }

      return result;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al registrar usuario',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      // Limpiar usuario de localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('portfolio_user');
      }
      setUser(null);
      setSubjects([]);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar de todas formas
      if (typeof window !== 'undefined') {
        localStorage.removeItem('portfolio_user');
      }
      setUser(null);
      setSubjects([]);
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const result = await SubjectService.createSubject(subject);

      if (result.success && result.subject) {
        // Recargar desde la BD para asegurar que tenemos los datos más recientes
        if (user?.id) {
          const reloadedSubjects = await SubjectService.getSubjectsByTeacher(user.id);
          setSubjects(reloadedSubjects);
        } else {
          setSubjects((prev) => [...prev, result.subject!]);
        }
      } else {
        throw new Error(result.message || 'Error al crear materia');
      }
    } catch (error) {
      console.error('Error al agregar materia:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id: string, updatedData: Partial<Subject>) => {
    try {
      setLoading(true);
      await SubjectService.updateSubject(id, updatedData);
      
      // Actualizar estado local
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      // Fallback
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      setLoading(true);
      await SubjectService.deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsByTeacher = (teacherId: string) => {
    return subjects.filter((s) => s.teacherId === teacherId);
  };

  const addEvaluationTemplate = (template: Omit<EvaluationTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: EvaluationTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setEvaluationTemplates((prev) => [...prev, newTemplate]);
  };

  const updateEvaluationTemplate = (id: string, updatedData: Partial<EvaluationTemplate>) => {
    setEvaluationTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteEvaluationTemplate = (id: string) => {
    setEvaluationTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const getTemplatesByTeacher = (teacherId: string) => {
    return evaluationTemplates.filter((t) => t.teacherId === teacherId);
  };

  const addStudent = async (studentData: Omit<User, 'id' | 'role'> & { role?: 'student' }) => {
    try {
      setLoading(true);
      const result = await AuthService.addStudent(
        studentData.name,
        studentData.email,
        'password123' // En producción, esto debería venir del formulario
      );

      if (result.success && result.student) {
        setStudents((prev) => [...prev, result.student!]);
      }
    } catch (error) {
      console.error('Error al agregar estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId: string): Promise<void> => {
    try {
      await AuthService.deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
      
      setSubjects((prev) =>
        prev.map((subject) => ({
          ...subject,
          groups: subject.groups.map((group) => ({
            ...group,
            students: group.students.filter((id) => id !== studentId),
          })),
        }))
      );
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
    }
  };

  const getAllStudents = () => {
    return students;
  };

  const getStudentById = (studentId: string) => {
    return students.find((s) => s.studentId === studentId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subjects,
        evaluationTemplates,
        students,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        addSubject,
        updateSubject,
        deleteSubject,
        getSubjectsByTeacher,
        addEvaluationTemplate,
        updateEvaluationTemplate,
        deleteEvaluationTemplate,
        getTemplatesByTeacher,
        addStudent,
        deleteStudent,
        getAllStudents,
        getStudentById,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
