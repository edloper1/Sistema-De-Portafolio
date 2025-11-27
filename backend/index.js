import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { getUserUuidById, getStudentSubjects, getTeacherSubjects } from './supabase-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto (un nivel arriba de backend/)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.error('   Por favor, configura SUPABASE_SERVICE_ROLE_KEY en tus variables de entorno');
  process.exit(1);
}

// Cliente de Supabase con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Middleware
// CORS configurado para aceptar todos los orígenes (incluyendo Vercel)
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origen (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier origen de Vercel
    if (origin.includes('.vercel.app') || origin.includes('.vercel-dev.app')) {
      return callback(null, true);
    }
    
    // Permitir localhost para desarrollo
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // En producción, permitir todos los orígenes
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error) throw error;
    res.json({ status: 'ok', database: 'connected', supabase: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Login - Ahora se maneja desde Supabase Auth en el frontend
// Este endpoint queda para compatibilidad, pero se recomienda usar Supabase Auth directamente
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // Usar Supabase Auth para autenticar
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .eq('role', role)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ success: false, message: 'Perfil no encontrado o rol incorrecto' });
    }

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      studentId: profile.student_id || undefined,
      teacherId: profile.teacher_id || undefined,
    };

    res.json({ success: true, user, session: authData.session });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Registrar usuario - Usa Supabase Admin API para crear usuarios
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: name, email, password, role',
      });
    }

    // Verificar si el email ya existe en profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya está registrado',
      });
    }

    let userId;
    
    // Intentar obtener el usuario de Auth primero (por si el frontend ya lo creó)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingAuthUser) {
      // El usuario ya existe en Auth (probablemente creado por el frontend)
      console.log('📝 Usuario ya existe en Auth, usando usuario existente');
      userId = existingAuthUser.id;
    } else {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: true, // Confirmar email automáticamente
      });

      if (authError) {
        console.error('Error al crear usuario en Auth:', authError);
        return res.status(400).json({
          success: false,
          message: authError.message || 'Error al crear usuario',
        });
      }

      userId = authData.user.id;
      console.log('✅ Usuario creado en Auth:', userId);
    }

    // Generar ID según el rol
    const timestamp = Date.now();
    const studentId = role === 'student' ? `A${String(timestamp).slice(-6)}` : null;
    const teacherId = role === 'teacher' ? `T${String(timestamp).slice(-6)}` : null;

    // Crear perfil
    console.log('📝 Creando perfil para usuario:', userId);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name,
        email: email.toLowerCase(),
        role,
        student_id: studentId,
        teacher_id: teacherId,
      });

    if (profileError) {
      console.error('❌ Error al crear perfil:', profileError);
      console.error('   Detalles:', JSON.stringify(profileError, null, 2));
      
      // Solo intentar eliminar el usuario de auth si nosotros lo creamos
      if (!existingAuthUser) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (deleteError) {
          console.error('Error al eliminar usuario de Auth:', deleteError);
        }
      }
      
      return res.status(500).json({
        success: false,
        message: profileError.message || 'Error al crear perfil de usuario',
        details: profileError,
      });
    }

    console.log('✅ Perfil creado exitosamente');

    const user = {
      id: userId,
      name,
      email: email.toLowerCase(),
      role,
      studentId: studentId || undefined,
      teacherId: teacherId || undefined,
    };

    res.json({
      success: true,
      message: 'Registro exitoso. Ya puedes iniciar sesión.',
      user,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener usuario actual (por ID)
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      studentId: profile.student_id || undefined,
      teacherId: profile.teacher_id || undefined,
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener todos los estudiantes
app.get('/api/auth/students', async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const students = (profiles || []).map((profile) => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      studentId: profile.student_id || undefined,
      teacherId: profile.teacher_id || undefined,
    }));

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RUTAS DE MATERIAS
// ============================================

// Obtener materias de un estudiante (basándose en los grupos a los que pertenece)
app.get('/api/subjects/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Convertir studentId corto a UUID si es necesario
    const studentUuid = await getUserUuidById(supabaseAdmin, studentId);
    
    if (!studentUuid) {
      return res.json({ success: true, subjects: [] });
    }

    // Obtener materias usando helper
    const subjects = await getStudentSubjects(supabaseAdmin, studentUuid);

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Error al obtener materias del estudiante:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener materias de un maestro
app.get('/api/subjects/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Convertir teacherId corto a UUID si es necesario
    const teacherUuid = await getUserUuidById(supabaseAdmin, teacherId);
    
    if (!teacherUuid) {
      return res.json({ success: true, subjects: [] });
    }

    // Obtener materias usando helper
    const subjects = await getTeacherSubjects(supabaseAdmin, teacherUuid);

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear materia
app.post('/api/subjects', async (req, res) => {
  try {
    const { name, code, semester, career, teacherId, schoolYear } = req.body;

    const { data: subject, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        name,
        code,
        semester,
        career,
        teacher_id: teacherId,
        school_year: schoolYear,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const result = {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      career: subject.career,
      teacherId: subject.teacher_id,
      schoolYear: subject.school_year,
      groups: [],
      createdAt: subject.created_at,
    };

    res.json({ success: true, subject: result });
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Actualizar materia
app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, semester, career, schoolYear } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (code) updates.code = code;
    if (semester) updates.semester = semester;
    if (career) updates.career = career;
    if (schoolYear) updates.school_year = schoolYear;

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, message: 'No hay cambios para actualizar' });
    }

    const { error } = await supabaseAdmin
      .from('subjects')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Materia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar materia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar materia
app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Materia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Agregar grupo a materia
app.post('/api/subjects/:subjectId/groups', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, schedule } = req.body;

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .insert({
        subject_id: subjectId,
        name,
        schedule,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const result = {
      id: group.id,
      name: group.name,
      schedule: group.schedule,
      students: [],
    };

    res.json({ success: true, group: result });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar grupo
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Grupo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Agregar estudiante a grupo
app.post('/api/groups/:groupId/students', async (req, res) => {
  try {
    const { groupId } = req.params;
    let { studentId } = req.body; // Puede ser UUID o student_id corto

    // Convertir studentId corto a UUID si es necesario
    const studentUuid = await getUserUuidById(supabaseAdmin, studentId);
    
    if (!studentUuid) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    // Verificar que el estudiante no esté ya en el grupo
    const { data: existing } = await supabaseAdmin
      .from('group_students')
      .select('*')
      .eq('group_id', groupId)
      .eq('student_id', studentUuid)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'El estudiante ya está en el grupo' });
    }

    // Agregar estudiante al grupo
    const { error } = await supabaseAdmin
      .from('group_students')
      .insert({
        group_id: groupId,
        student_id: studentUuid,
      });

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Estudiante agregado al grupo correctamente' });
  } catch (error) {
    console.error('Error al agregar estudiante al grupo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar estudiante de grupo
app.delete('/api/groups/:groupId/students/:studentId', async (req, res) => {
  try {
    const { groupId, studentId } = req.params;
    
    // Convertir studentId corto a UUID si es necesario
    const studentUuid = await getUserUuidById(supabaseAdmin, studentId);
    
    if (!studentUuid) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const { error } = await supabaseAdmin
      .from('group_students')
      .delete()
      .eq('group_id', groupId)
      .eq('student_id', studentUuid);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Estudiante eliminado del grupo correctamente' });
  } catch (error) {
    console.error('Error al eliminar estudiante del grupo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RUTAS DE PORTAFOLIOS
// ============================================

// Función helper para obtener evaluación de un portafolio
async function getPortfolioEvaluation(portfolioId) {
  const { data: evalData, error: evalError } = await supabaseAdmin
    .from('portfolio_evaluations')
    .select('id, total_score, max_total_score, percentage')
    .eq('portfolio_id', portfolioId)
    .single();

  if (evalError || !evalData) {
    return null;
  }

  const { data: scoresData, error: scoresError } = await supabaseAdmin
    .from('evaluation_scores')
    .select('criterion_name, criterion_max_score, score, order_index')
    .eq('evaluation_id', evalData.id)
    .order('order_index', { ascending: true });

  if (scoresError) {
    console.error('Error al obtener scores:', scoresError);
    return null;
  }

  return {
    totalScore: parseFloat(evalData.total_score),
    maxTotalScore: parseFloat(evalData.max_total_score),
    percentage: parseFloat(evalData.percentage),
    criteria: (scoresData || []).map((score) => ({
      id: score.order_index.toString(),
      name: score.criterion_name,
      maxScore: score.criterion_max_score,
      score: parseFloat(score.score),
    })),
  };
}

// Helper para generar URL de archivo en Supabase Storage
function getFileUrl(portfolioId, filePath) {
  if (!filePath) return undefined;
  
  // Si ya es una URL completa, retornarla
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Si es una ruta de Supabase Storage, usar la ruta del API que genera URLs firmadas
  // Esto es necesario porque el bucket es privado y requiere URLs firmadas
  if (filePath.startsWith('portfolio-files/')) {
    // Usar la ruta del API que genera URLs firmadas (signed URLs)
    // El frontend debe llamar a /api/files/:portfolioId para obtener la URL firmada
    return `http://localhost:3001/api/files/${portfolioId}`;
  }
  
  // Fallback a ruta del API para archivos antiguos
  return `http://localhost:3001/api/files/${portfolioId}`;
}

// Obtener todos los portafolios
app.get('/api/portfolios', async (req, res) => {
  try {
    const { data: portfolios, error } = await supabaseAdmin
      .from('portfolios')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    const portfoliosWithEvaluation = await Promise.all(
      (portfolios || []).map(async (row) => {
        const evaluation = await getPortfolioEvaluation(row.id);
        return {
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          subjectId: row.subject_id,
          subject: row.subject_name,
          groupId: row.group_id,
          semester: row.semester,
          career: row.career,
          classSchedule: row.class_schedule,
          fileName: row.file_name,
          fileSize: row.file_size,
          filePath: row.file_path,
          fileUrl: getFileUrl(row.id, row.file_path),
          submittedAt: row.submitted_at,
          status: row.status,
          teacherComment: row.teacher_comment || undefined,
          evaluation: evaluation || undefined,
        };
      })
    );

    res.json({ success: true, portfolios: portfoliosWithEvaluation });
  } catch (error) {
    console.error('Error al obtener portafolios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener portafolios de un estudiante
app.get('/api/portfolios/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Convertir studentId corto a UUID si es necesario
    const studentUuid = await getUserUuidById(supabaseAdmin, studentId);
    
    if (!studentUuid) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const { data: portfolios, error } = await supabaseAdmin
      .from('portfolios')
      .select('*')
      .eq('student_id', studentUuid)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    const portfoliosWithEvaluation = await Promise.all(
      (portfolios || []).map(async (row) => {
        const evaluation = await getPortfolioEvaluation(row.id);
        return {
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          subjectId: row.subject_id,
          subject: row.subject_name,
          groupId: row.group_id,
          semester: row.semester,
          career: row.career,
          classSchedule: row.class_schedule,
          fileName: row.file_name,
          fileSize: row.file_size,
          filePath: row.file_path,
          fileUrl: getFileUrl(row.id, row.file_path),
          submittedAt: row.submitted_at,
          status: row.status,
          teacherComment: row.teacher_comment || undefined,
          evaluation: evaluation || undefined,
        };
      })
    );

    res.json({ success: true, portfolios: portfoliosWithEvaluation });
  } catch (error) {
    console.error('Error al obtener portafolios del estudiante:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear portafolio (con archivo)
// Configurar multer para archivos temporales (se subirán a Supabase Storage)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

app.post('/api/portfolios', upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    tempFilePath = req.file.path;

    let {
      studentId,
      studentName,
      subjectId,
      subject,
      groupId,
      semester,
      career,
      classSchedule,
    } = req.body;

    // Convertir studentId corto a UUID si es necesario
    const studentUuid = await getUserUuidById(supabaseAdmin, studentId);
    
    if (!studentUuid) {
      // Eliminar archivo temporal si no se encuentra el estudiante
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    // Leer el archivo para subirlo a Supabase Storage
    const fileBuffer = fs.readFileSync(tempFilePath);
    const portfolioId = randomUUID();
    // El path relativo dentro del bucket (sin el nombre del bucket)
    const relativePath = `${portfolioId}/${req.file.originalname}`;
    // El path completo para guardar en la BD (con el nombre del bucket)
    const storagePath = `portfolio-files/${relativePath}`;

    console.log('📤 Subiendo archivo a Storage...');
    console.log('   - Portfolio ID:', portfolioId);
    console.log('   - Path relativo:', relativePath);
    console.log('   - Path completo:', storagePath);

    // Subir archivo a Supabase Storage (usando path relativo)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('portfolio-files')
      .upload(relativePath, fileBuffer, {
        contentType: req.file.mimetype || 'application/pdf',
        upsert: false,
      });

    if (uploadData) {
      console.log('✅ Archivo subido exitosamente:', uploadData.path);
    }

    // Eliminar archivo temporal después de subir
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    if (uploadError) {
      console.error('Error al subir archivo a Storage:', uploadError);
      throw new Error('Error al subir el archivo: ' + uploadError.message);
    }

    // No generar URL pública porque el bucket es privado
    // El frontend debe usar /api/files/:portfolioId para obtener URLs firmadas

    // Crear registro en la base de datos
    const { data: portfolio, error: dbError } = await supabaseAdmin
      .from('portfolios')
      .insert({
        id: portfolioId,
        student_id: studentUuid,
        student_name: studentName,
        subject_id: subjectId,
        subject_name: subject,
        group_id: groupId,
        semester,
        career,
        class_schedule: classSchedule,
        file_name: req.file.originalname,
        file_size: req.file.size,
        file_path: storagePath, // Guardar la ruta de Storage
      })
      .select()
      .single();

    if (dbError) {
      // Si falla la BD, intentar eliminar el archivo de Storage
      // Remover 'portfolio-files/' del inicio ya que remove lo necesita sin el prefijo del bucket
      const relativePath = storagePath.replace(/^portfolio-files\//, '');
      await supabaseAdmin.storage.from('portfolio-files').remove([relativePath]);
      throw dbError;
    }

    const result = {
      id: portfolio.id,
      studentId: portfolio.student_id,
      studentName: portfolio.student_name,
      subjectId: portfolio.subject_id,
      subject: portfolio.subject_name,
      groupId: portfolio.group_id,
      semester: portfolio.semester,
      career: portfolio.career,
      classSchedule: portfolio.class_schedule,
      fileName: portfolio.file_name,
      fileSize: portfolio.file_size,
      filePath: portfolio.file_path,
      fileUrl: getFileUrl(portfolio.id, portfolio.file_path),
      submittedAt: portfolio.submitted_at,
      status: portfolio.status,
    };

    res.json({ success: true, portfolio: result });
  } catch (error) {
    console.error('Error al crear portafolio:', error);
    
    // Limpiar archivo temporal si existe
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// Servir archivos - Generar URL firmada de Supabase Storage o servir archivo local si es antiguo
app.get('/api/files/:portfolioId', async (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    const { data: portfolio, error } = await supabaseAdmin
      .from('portfolios')
      .select('file_path')
      .eq('id', portfolioId)
      .single();

    if (error || !portfolio || !portfolio.file_path) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const filePath = portfolio.file_path;

    // Si es una ruta de Supabase Storage, generar URL firmada
    if (filePath.startsWith('portfolio-files/')) {
      // Remover 'portfolio-files/' del inicio ya que createSignedUrl lo necesita sin el prefijo del bucket
      const relativePath = filePath.replace(/^portfolio-files\//, '');
      
      console.log('🔐 Generando URL firmada para:', relativePath);
      console.log('   - Portfolio ID:', portfolioId);
      console.log('   - Path completo en BD:', filePath);
      console.log('   - Path relativo:', relativePath);
      
      // Verificar si el archivo existe primero
      const { data: fileExists, error: listError } = await supabaseAdmin.storage
        .from('portfolio-files')
        .list(relativePath.split('/')[0], { limit: 100 });
      
      if (listError) {
        console.error('❌ Error al listar archivos:', listError);
      }
      
      const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
        .from('portfolio-files')
        .createSignedUrl(relativePath, 3600); // URL válida por 1 hora

      if (urlError) {
        console.error('❌ Error al generar URL firmada:', urlError);
        console.error('   - El archivo no existe en Storage');
        console.error('   - Esto puede ocurrir si el archivo fue subido antes de la migración');
        return res.status(404).json({ 
          message: 'El archivo no se encuentra en Storage. Por favor, elimina este portafolio y vuelve a subirlo.',
          error: 'FILE_NOT_FOUND_IN_STORAGE',
          portfolioId: portfolioId
        });
      }

      console.log('✅ URL firmada generada exitosamente');
      // Redirigir a la URL firmada
      return res.redirect(signedUrlData.signedUrl);
    }

    // Compatibilidad con archivos antiguos (ruta local)
    const localFilePath = path.join(__dirname, filePath);
    if (fs.existsSync(localFilePath)) {
      return res.sendFile(localFilePath);
    }

    return res.status(404).json({ message: 'Archivo no existe en el servidor' });
  } catch (error) {
    console.error('Error al servir archivo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar estado de portafolio
app.put('/api/portfolios/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, evaluation } = req.body;

    // Actualizar estado y comentario del portafolio
    const { error: updateError } = await supabaseAdmin
      .from('portfolios')
      .update({
        status,
        teacher_comment: comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Guardar evaluación si existe
    if (evaluation && evaluation.criteria && evaluation.criteria.length > 0) {
      // Verificar si ya existe una evaluación
      const { data: existingEval } = await supabaseAdmin
        .from('portfolio_evaluations')
        .select('id')
        .eq('portfolio_id', id)
        .single();

      const evaluationData = {
        total_score: evaluation.totalScore || 0,
        max_total_score: evaluation.maxTotalScore || 0,
        percentage: evaluation.percentage || 0,
      };

      let evaluationId;
      if (existingEval) {
        // Actualizar evaluación existente
        evaluationId = existingEval.id;
        const { error: updateEvalError } = await supabaseAdmin
          .from('portfolio_evaluations')
          .update({
            ...evaluationData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', evaluationId);

        if (updateEvalError) {
          throw updateEvalError;
        }

        // Eliminar scores antiguos
        const { error: deleteScoresError } = await supabaseAdmin
          .from('evaluation_scores')
          .delete()
          .eq('evaluation_id', evaluationId);

        if (deleteScoresError) {
          throw deleteScoresError;
        }
      } else {
        // Crear nueva evaluación
        const { data: newEval, error: createEvalError } = await supabaseAdmin
          .from('portfolio_evaluations')
          .insert({
            portfolio_id: id,
            ...evaluationData,
          })
          .select('id')
          .single();

        if (createEvalError) {
          throw createEvalError;
        }

        evaluationId = newEval.id;
      }

      // Guardar scores por criterio
      const scoresToInsert = evaluation.criteria.map((criterion, i) => ({
        evaluation_id: evaluationId,
        criterion_name: criterion.name || '',
        criterion_max_score: criterion.maxScore || 0,
        score: criterion.score || 0,
        order_index: i,
      }));

      const { error: insertScoresError } = await supabaseAdmin
        .from('evaluation_scores')
        .insert(scoresToInsert);

      if (insertScoresError) {
        throw insertScoresError;
      }
    }

    res.json({ success: true, message: 'Portafolio actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar portafolio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar portafolio
app.delete('/api/portfolios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener ruta del archivo
    const { data: portfolio, error: fetchError } = await supabaseAdmin
      .from('portfolios')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Eliminar archivo de Storage o del sistema local
    if (portfolio?.file_path) {
      if (portfolio.file_path.startsWith('portfolio-files/')) {
        // Eliminar de Supabase Storage
        // Remover 'portfolio-files/' del inicio ya que remove lo necesita sin el prefijo del bucket
        const relativePath = portfolio.file_path.replace(/^portfolio-files\//, '');
        const { error: storageError } = await supabaseAdmin.storage
          .from('portfolio-files')
          .remove([relativePath]);

        if (storageError) {
          console.error('Error al eliminar archivo de Storage:', storageError);
          // Continuar aunque falle la eliminación del archivo
        }
      } else {
        // Eliminar archivo local (compatibilidad con sistema antiguo)
        const filePath = path.join(__dirname, portfolio.file_path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Error al eliminar archivo local:', unlinkError);
          }
        }
      }
    }

    // Eliminar de la base de datos (las foreign keys se encargan de eliminar evaluaciones)
    const { error: deleteError } = await supabaseAdmin
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ success: true, message: 'Portafolio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar portafolio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor API corriendo en puerto ${PORT}`);
  console.log(`📊 Supabase: ${supabaseUrl}`);
  console.log(`✅ Backend listo y conectado a Supabase`);
});

