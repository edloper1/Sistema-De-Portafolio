-- ============================================
-- Corregir políticas RLS con recursión infinita
-- ============================================

-- ============================================
-- Eliminar TODAS las políticas problemáticas
-- ============================================

-- Políticas de subjects
DROP POLICY IF EXISTS "Teachers can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Students can view subjects in their groups" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can create their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can delete their own subjects" ON public.subjects;

-- Políticas de groups
DROP POLICY IF EXISTS "Users can view groups of their subjects" ON public.groups;
DROP POLICY IF EXISTS "Teachers can view groups of their subjects" ON public.groups;
DROP POLICY IF EXISTS "Students can view groups they belong to" ON public.groups;
DROP POLICY IF EXISTS "Teachers can manage groups of their subjects" ON public.groups;

-- Políticas de group_students
DROP POLICY IF EXISTS "Users can view group_students of their subjects" ON public.group_students;
DROP POLICY IF EXISTS "Teachers can view group_students of their subjects" ON public.group_students;
DROP POLICY IF EXISTS "Students can view their own group_students" ON public.group_students;
DROP POLICY IF EXISTS "Teachers can manage group_students of their subjects" ON public.group_students;

-- Políticas de portfolios
DROP POLICY IF EXISTS "Students can view their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Teachers can view portfolios of their subjects" ON public.portfolios;
DROP POLICY IF EXISTS "Students can create their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Teachers can update portfolios of their subjects" ON public.portfolios;
DROP POLICY IF EXISTS "Students can delete their own portfolios" ON public.portfolios;

-- ============================================
-- Recrear políticas de subjects sin recursión
-- ============================================
CREATE POLICY "Teachers can view their own subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create their own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = teacher_id);

-- Política para estudiantes: pueden ver subjects si están en un grupo de esa materia
-- Usamos función SECURITY DEFINER para evitar recursión
CREATE OR REPLACE FUNCTION public.is_student_in_subject(subject_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups g
    INNER JOIN public.group_students gs ON g.id = gs.group_id
    WHERE g.subject_id = subject_uuid 
      AND gs.student_id = student_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Students can view subjects in their groups"
  ON public.subjects FOR SELECT
  USING (public.is_student_in_subject(subjects.id, auth.uid()));

-- Función helper para verificar si un usuario es profesor de una materia
CREATE OR REPLACE FUNCTION public.is_teacher_of_subject(subject_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subjects s
    WHERE s.id = subject_uuid 
      AND s.teacher_id = teacher_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para verificar si un estudiante está en un grupo
CREATE OR REPLACE FUNCTION public.is_student_in_group(group_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_students gs
    WHERE gs.group_id = group_uuid 
      AND gs.student_id = student_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para groups (usando funciones para evitar recursión)
CREATE POLICY "Teachers can view groups of their subjects"
  ON public.groups FOR SELECT
  USING (public.is_teacher_of_subject(groups.subject_id, auth.uid()));

CREATE POLICY "Students can view groups they belong to"
  ON public.groups FOR SELECT
  USING (public.is_student_in_group(groups.id, auth.uid()));

-- Política separada para INSERT/UPDATE/DELETE (no SELECT para evitar conflicto)
CREATE POLICY "Teachers can insert groups of their subjects"
  ON public.groups FOR INSERT
  WITH CHECK (public.is_teacher_of_subject(groups.subject_id, auth.uid()));

CREATE POLICY "Teachers can update groups of their subjects"
  ON public.groups FOR UPDATE
  USING (public.is_teacher_of_subject(groups.subject_id, auth.uid()));

CREATE POLICY "Teachers can delete groups of their subjects"
  ON public.groups FOR DELETE
  USING (public.is_teacher_of_subject(groups.subject_id, auth.uid()));

-- Políticas para group_students (usando función para evitar recursión)
CREATE POLICY "Teachers can view group_students of their subjects"
  ON public.group_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_students.group_id 
        AND public.is_teacher_of_subject(g.subject_id, auth.uid())
    )
  );

CREATE POLICY "Students can view their own group_students"
  ON public.group_students FOR SELECT
  USING (group_students.student_id = auth.uid());

CREATE POLICY "Teachers can manage group_students of their subjects"
  ON public.group_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_students.group_id 
        AND public.is_teacher_of_subject(g.subject_id, auth.uid())
    )
  );

-- ============================================
-- Políticas para portfolios (usando función para evitar recursión)
-- ============================================
CREATE POLICY "Students can view their own portfolios"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view portfolios of their subjects"
  ON public.portfolios FOR SELECT
  USING (public.is_teacher_of_subject(portfolios.subject_id, auth.uid()));

CREATE POLICY "Students can create their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can update portfolios of their subjects"
  ON public.portfolios FOR UPDATE
  USING (public.is_teacher_of_subject(portfolios.subject_id, auth.uid()));

CREATE POLICY "Students can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = student_id);

