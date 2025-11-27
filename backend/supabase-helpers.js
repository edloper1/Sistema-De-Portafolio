/**
 * Helpers para operaciones comunes con Supabase
 */

/**
 * Obtener UUID de un usuario por student_id o teacher_id
 */
export async function getUserUuidById(supabaseAdmin, shortId) {
  // Si ya es un UUID, retornarlo
  if (shortId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return shortId;
  }

  // Buscar por student_id
  const { data: studentProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('student_id', shortId)
    .single();

  if (studentProfile) {
    return studentProfile.id;
  }

  // Buscar por teacher_id
  const { data: teacherProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('teacher_id', shortId)
    .single();

  if (teacherProfile) {
    return teacherProfile.id;
  }

  return null;
}

/**
 * Obtener materias de un estudiante con sus grupos
 */
export async function getStudentSubjects(supabaseAdmin, studentUuid) {
  // Obtener materias a través de los grupos del estudiante
  const { data: groupStudents, error: gsError } = await supabaseAdmin
    .from('group_students')
    .select('group_id, groups!inner(subject_id, subjects!inner(*))')
    .eq('student_id', studentUuid);

  if (gsError) throw gsError;

  // Extraer materias únicas
  const subjectMap = new Map();
  for (const gs of groupStudents || []) {
    const subject = gs.groups?.subjects;
    if (subject && !subjectMap.has(subject.id)) {
      subjectMap.set(subject.id, {
        ...subject,
        groups: [],
      });
    }
  }

  // Para cada materia, obtener sus grupos donde el estudiante está inscrito
  for (const [subjectId, subject] of subjectMap.entries()) {
    const { data: groups } = await supabaseAdmin
      .from('groups')
      .select(`
        id,
        name,
        schedule,
        group_students!inner(student_id)
      `)
      .eq('subject_id', subjectId)
      .eq('group_students.student_id', studentUuid);

    subject.groups = (groups || []).map(g => ({
      id: g.id,
      name: g.name,
      schedule: g.schedule,
      students: g.group_students?.map(gs => gs.student_id) || [],
    }));
  }

  return Array.from(subjectMap.values()).map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    semester: s.semester,
    career: s.career,
    teacherId: s.teacher_id,
    schoolYear: s.school_year,
    groups: s.groups,
    createdAt: s.created_at,
  }));
}

/**
 * Obtener materias de un profesor con sus grupos
 */
export async function getTeacherSubjects(supabaseAdmin, teacherUuid) {
  // Obtener materias del profesor
  const { data: subjects, error: subjectsError } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .eq('teacher_id', teacherUuid)
    .order('created_at', { ascending: false });

  if (subjectsError) throw subjectsError;

  // Para cada materia, obtener sus grupos con estudiantes
  const subjectsWithGroups = await Promise.all(
    (subjects || []).map(async (subject) => {
      const { data: groups } = await supabaseAdmin
        .from('groups')
        .select(`
          id,
          name,
          schedule,
          group_students(student_id)
        `)
        .eq('subject_id', subject.id);

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
        career: subject.career,
        teacherId: subject.teacher_id,
        schoolYear: subject.school_year,
        groups: (groups || []).map(g => ({
          id: g.id,
          name: g.name,
          schedule: g.schedule,
          students: g.group_students?.map(gs => gs.student_id) || [],
        })),
        createdAt: subject.created_at,
      };
    })
  );

  return subjectsWithGroups;
}

