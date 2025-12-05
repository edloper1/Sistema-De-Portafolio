import { supabase } from '../supabase';
import { apiClient } from '../api/client';
import type { User } from '../../types';

/**
 * Servicio para autenticación y gestión de usuarios
 * Usa Supabase Auth directamente para login/registro
 */
export class AuthService {
  /**
   * Iniciar sesión con email y contraseña usando Supabase Auth
   */
  static async login(
    email: string,
    password: string,
    role: 'teacher' | 'student'
  ): Promise<{ user: User | null; error: Error | null }> {
    try {
      console.log('🔐 Iniciando login:', { email, role });
      console.log('🔐 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔐 Supabase Anon Key presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Verificar que supabase esté inicializado
      if (!supabase) {
        console.error('❌ Cliente de Supabase no inicializado');
        return {
          user: null,
          error: new Error('Error de configuración. Recarga la página.'),
        };
      }
      
      // Autenticar con Supabase Auth usando API REST directamente como workaround
      console.log('🔐 Llamando a signInWithPassword...');
      
      let authData, authError;
      try {
        // Intentar primero con el método normal
        const loginPromise = supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });
        
        // Agregar timeout de 5 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        try {
          const result = await Promise.race([loginPromise, timeoutPromise]) as any;
          authData = result?.data;
          authError = result?.error;
          console.log('🔐 Resultado recibido (método normal):', {
            hasData: !!authData,
            hasUser: !!authData?.user,
            hasError: !!authError,
          });
        } catch (timeoutError: any) {
          console.warn('⚠️ Timeout con método normal, intentando API REST directa...');
          
          try {
            // Workaround: usar fetch directamente
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
            console.log('🔐 Llamando a API REST:', apiUrl);
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              },
              body: JSON.stringify({
                email: email.toLowerCase(),
                password: password,
              }),
            });
            
            console.log('🔐 Respuesta de API REST:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
            });
            
            const responseData = await response.json();
            console.log('🔐 Datos de respuesta:', {
              hasAccessToken: !!responseData.access_token,
              hasRefreshToken: !!responseData.refresh_token,
              hasUser: !!responseData.user,
              error: responseData.error,
            });
            
            if (!response.ok) {
              authError = { message: responseData.error_description || responseData.error || 'Error de autenticación' };
              console.error('❌ Error en API REST:', authError);
            } else {
              // Usar el usuario directamente de la respuesta API sin setSession
              console.log('🔐 Usando usuario de la respuesta API directamente...');
              console.log('🔐 Tokens recibidos:', {
                accessTokenLength: responseData.access_token?.length || 0,
                refreshTokenLength: responseData.refresh_token?.length || 0,
                hasUser: !!responseData.user,
                userId: responseData.user?.id,
              });
              
              if (responseData.user) {
                console.log('✅ Usuario encontrado en respuesta API:', responseData.user.id);
                
                // Guardar tokens en localStorage manualmente para que Supabase los use
                if (typeof window !== 'undefined' && responseData.access_token && responseData.refresh_token) {
                  try {
                    // Supabase usa este formato para almacenar sesiones
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
                    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'supabase';
                    const storageKey = `sb-${projectRef}-auth-token`;
                    
                    const sessionData = {
                      access_token: responseData.access_token,
                      refresh_token: responseData.refresh_token,
                      expires_at: responseData.expires_in ? Math.floor(Date.now() / 1000) + responseData.expires_in : Math.floor(Date.now() / 1000) + 3600,
                      expires_in: responseData.expires_in || 3600,
                      token_type: responseData.token_type || 'bearer',
                      user: responseData.user,
                    };
                    
                    localStorage.setItem(storageKey, JSON.stringify(sessionData));
                    console.log('✅ Tokens guardados en localStorage con key:', storageKey);
                  } catch (storageError) {
                    console.warn('⚠️ Error al guardar en localStorage:', storageError);
                  }
                }
                
                // Usar el usuario directamente
                authData = { 
                  user: responseData.user, 
                  session: responseData 
                };
                console.log('✅ Autenticación exitosa con API REST, user ID:', responseData.user.id);
              } else {
                console.error('❌ No hay usuario en la respuesta API');
                authError = { message: 'No se recibió información del usuario' };
              }
            }
          } catch (fetchError: any) {
            console.error('❌ Error en fetch directo:', fetchError);
            authError = { message: fetchError?.message || 'Error al conectar con el servidor' };
          }
        }
      } catch (error: any) {
        console.error('❌ Excepción en signInWithPassword:', error);
        console.error('❌ Stack:', error?.stack);
        return {
          user: null,
          error: new Error(error?.message || 'Error al autenticar. Verifica tu conexión.'),
        };
      }

      console.log('🔐 Respuesta de signInWithPassword:', { 
        hasData: !!authData, 
        hasUser: !!authData?.user,
        hasError: !!authError,
        errorMessage: authError?.message 
      });

      if (authError || !authData.user) {
        console.error('❌ Error de autenticación:', authError);
        console.error('❌ Detalles del error:', {
          message: authError?.message,
          status: authError?.status,
          name: authError?.name
        });
        return {
          user: null,
          error: new Error(authError?.message || 'Credenciales inválidas'),
        };
      }

      console.log('✅ Autenticación exitosa, user ID:', authData.user.id);

      // Esperar un momento para asegurar que la sesión esté establecida
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que la sesión esté activa (con timeout)
      console.log('🔐 Verificando sesión...');
      let session = null;
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en getSession')), 3000)
        );
        
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        session = result?.data?.session;
        console.log('🔐 Sesión activa:', session ? 'Sí' : 'No');
      } catch (sessionError: any) {
        console.warn('⚠️ Error o timeout al verificar sesión, continuando de todas formas...', sessionError?.message);
        // Continuar de todas formas ya que tenemos el usuario de la API REST
        session = { user: authData.user };
      }
      
      if (!session && !authData.user) {
        console.error('❌ No hay sesión ni usuario después del login');
        return {
          user: null,
          error: new Error('Error al establecer sesión. Intenta de nuevo.'),
        };
      }

      // Obtener perfil del usuario (sin filtrar por rol primero para ver qué hay)
      console.log('📋 Obteniendo perfil del usuario...');
      
      // Usar el access token directamente en los headers si está disponible
      const accessToken = authData.session?.access_token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sb-dxgjsfpmezryamskhlyk-auth-token') || '{}')?.access_token : null);
      
      let profileAll, profileAllError;
      try {
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en consulta de perfil')), 5000)
        );
        
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        profileAll = result?.data;
        profileAllError = result?.error;
      } catch (profileTimeoutError: any) {
        console.warn('⚠️ Timeout en consulta de perfil, intentando con fetch directo...', profileTimeoutError?.message);
        
        // Workaround: usar fetch directamente para obtener el perfil
        try {
          const profileResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.user.id}&select=*`, {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          
          const profileData = await profileResponse.json();
          if (profileResponse.ok && profileData && profileData.length > 0) {
            profileAll = profileData[0];
            profileAllError = null;
            console.log('✅ Perfil obtenido con fetch directo');
          } else {
            profileAll = null;
            profileAllError = { message: 'Perfil no encontrado' };
          }
        } catch (fetchError) {
          console.error('❌ Error en fetch directo de perfil:', fetchError);
          profileAll = null;
          profileAllError = { message: 'Error al obtener perfil' };
        }
      }

      console.log('📋 Perfil encontrado (sin filtro de rol):', profileAll);
      console.log('📋 Error al buscar perfil:', profileAllError);

      if (profileAllError || !profileAll) {
        console.error('❌ Perfil no encontrado para user ID:', authData.user.id);
        await supabase.auth.signOut();
        return {
          user: null,
          error: new Error('Perfil no encontrado. Contacta al administrador.'),
        };
      }

      // Verificar que el rol coincida
      if (profileAll.role !== role) {
        console.error('❌ Rol incorrecto. Esperado:', role, 'Encontrado:', profileAll.role);
        await supabase.auth.signOut();
        return {
          user: null,
          error: new Error(`Rol incorrecto. Seleccionaste "${role}" pero tu cuenta es "${profileAll.role}".`),
        };
      }

      const user: User = {
        id: profileAll.id,
        name: profileAll.name,
        email: profileAll.email,
        role: profileAll.role as 'teacher' | 'student',
        studentId: profileAll.student_id || undefined,
        teacherId: profileAll.teacher_id || undefined,
      };

      // Guardar usuario en localStorage para persistencia
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('portfolio_user', JSON.stringify(user));
          console.log('✅ Usuario guardado en localStorage');
        } catch (storageError) {
          console.warn('⚠️ Error al guardar usuario en localStorage:', storageError);
        }
      }

      console.log('✅ Login exitoso, usuario:', user);
      return { user, error: null };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Registrar nuevo usuario usando Supabase Auth
   */
  static async register(
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student'
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });

      if (authError || !authData.user) {
        return {
          success: false,
          message: authError?.message || 'Error al registrar usuario',
        };
      }

      // El perfil debe crearse mediante un trigger o función en Supabase
      // Por ahora, usamos la API del backend para crear el perfil
      const result = await apiClient.register(name, email, password, role);

      if (!result.success) {
        // Si falla la creación del perfil, el usuario ya está en auth.users
        // pero no en profiles. Esto se puede manejar mejor con triggers.
        return {
          success: false,
          message: result.message || 'Usuario creado pero error al crear perfil',
        };
      }

      return {
        success: true,
        message: result.data?.message || 'Registro exitoso',
        user: result.data?.user,
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al registrar usuario',
      };
    }
  }

  /**
   * Cerrar sesión usando Supabase Auth
   */
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Obtener usuario actual desde Supabase (con workaround para métodos que se cuelgan)
   */
  static async getCurrentUser(userId?: string): Promise<User | null> {
    try {
      // PRIMERO: Intentar leer usuario guardado directamente en localStorage
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('portfolio_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log('✅ Usuario encontrado en localStorage:', user.id);
            // Verificar que la sesión de Supabase aún existe
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'supabase';
            const storageKey = `sb-${projectRef}-auth-token`;
            const storedSession = localStorage.getItem(storageKey);
            
            if (storedSession) {
              // Si hay sesión, retornar el usuario guardado directamente
              return user;
            } else {
              // Si no hay sesión, limpiar usuario guardado
              localStorage.removeItem('portfolio_user');
              return null;
            }
          } catch (parseError) {
            console.warn('⚠️ Error al parsear usuario de localStorage:', parseError);
            localStorage.removeItem('portfolio_user');
          }
        }
      }
      
      // SEGUNDO: Si no hay usuario guardado, intentar leer de la sesión de Supabase
      if (typeof window !== 'undefined') {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'supabase';
        const storageKey = `sb-${projectRef}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            if (sessionData?.user) {
              const targetUserId = userId || sessionData.user.id;
              
              // Obtener perfil usando fetch directo (más confiable)
              try {
                const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUserId}&select=*`, {
                  method: 'GET',
                  headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                    'Authorization': `Bearer ${sessionData.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                const profileData = await profileResponse.json();
                if (profileResponse.ok && profileData && profileData.length > 0) {
                  const profile = profileData[0];
                  const user = {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    role: profile.role as 'teacher' | 'student',
                    studentId: profile.student_id || undefined,
                    teacherId: profile.teacher_id || undefined,
                  };
                  
                  // Guardar usuario en localStorage para futuras consultas
                  localStorage.setItem('portfolio_user', JSON.stringify(user));
                  return user;
                }
              } catch (fetchError) {
                console.warn('⚠️ Error al obtener perfil con fetch, intentando método normal...', fetchError);
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Error al parsear sesión de localStorage:', parseError);
          }
        }
      }
      
      // Fallback: intentar con métodos de Supabase (con timeout)
      try {
        const getUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en getUser')), 3000)
        );
        
        const result = await Promise.race([getUserPromise, timeoutPromise]) as any;
        const authUser = result?.data?.user;
        
        if (!authUser) {
          return null;
        }

        const targetUserId = userId || authUser.id;

        // Obtener perfil con timeout
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();
        
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en consulta de perfil')), 3000)
        );
        
        const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]) as any;
        const profile = profileResult?.data;
        const error = profileResult?.error;

        if (error || !profile) {
          return null;
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'teacher' | 'student',
          studentId: profile.student_id || undefined,
          teacherId: profile.teacher_id || undefined,
        };
      } catch (timeoutError) {
        console.warn('⚠️ Timeout en métodos de Supabase, retornando null');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Obtener sesión actual
   */
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  /**
   * Obtener todos los estudiantes
   */
  static async getAllStudents(): Promise<User[]> {
    try {
      const result = await apiClient.getAllStudents();

      if (!result.success || !result.data?.students) {
        return [];
      }

      return result.data.students;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      return [];
    }
  }

  /**
   * Obtener estudiante por ID
   */
  static async getStudentById(studentId: string): Promise<User | null> {
    try {
      const students = await this.getAllStudents();
      return students.find((s) => s.studentId === studentId) || null;
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      return null;
    }
  }

  /**
   * Agregar estudiante (solo para maestros)
   */
  static async addStudent(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; student?: User }> {
    return this.register(name, email, password, 'student');
  }

  /**
   * Eliminar estudiante
   */
  static async deleteStudent(_studentId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Funcionalidad no implementada aún',
    };
  }
}
