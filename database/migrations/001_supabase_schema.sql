-- ============================================
-- Sistema de Gestión de Portafolios
-- Migración completa para Supabase PostgreSQL
-- ============================================

-- Extensión para UUIDs (ya incluida en Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Ya está habilitada en Supabase

-- ============================================
-- FUNCIÓN: Actualización automática de updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLA: profiles (Perfiles de usuario)
-- Extiende auth.users de Supabase
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('teacher', 'student')) NOT NULL,
  student_id VARCHAR(50),
  teacher_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_teacher_id ON public.profiles(teacher_id);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Crear perfil automáticamente al registrar usuario
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id VARCHAR(50);
  v_teacher_id VARCHAR(50);
BEGIN
  -- Este trigger se ejecutará cuando se cree un usuario en auth.users
  -- El perfil se creará manualmente o mediante función administrativa
  -- ya que necesitamos el nombre y rol que no están en auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLA: subjects (Materias)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  career VARCHAR(255) NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, code, school_year)
);

-- Índices para subjects
CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON public.subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);

-- Trigger para updated_at
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: groups (Grupos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  schedule VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para groups
CREATE INDEX IF NOT EXISTS idx_groups_subject ON public.groups(subject_id);

-- Trigger para updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: group_students (Estudiantes en grupos)
-- Relación muchos a muchos
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_students (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, student_id)
);

-- Índices para group_students
CREATE INDEX IF NOT EXISTS idx_group_students_group ON public.group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_group_students_student ON public.group_students(student_id);

-- ============================================
-- TABLA: portfolios (Portafolios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  semester VARCHAR(50) NOT NULL,
  career VARCHAR(255) NOT NULL,
  class_schedule VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT, -- Ruta en Storage: portfolio-files/{id}.pdf
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  teacher_comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para portfolios
CREATE INDEX IF NOT EXISTS idx_portfolios_student ON public.portfolios(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_subject ON public.portfolios(subject_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_group ON public.portfolios(group_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON public.portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_submitted_at ON public.portfolios(submitted_at);

-- Trigger para updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: evaluation_templates (Plantillas de evaluación)
-- ============================================
CREATE TABLE IF NOT EXISTS public.evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluation_templates
CREATE INDEX IF NOT EXISTS idx_evaluation_templates_teacher ON public.evaluation_templates(teacher_id);

-- Trigger para updated_at
CREATE TRIGGER update_evaluation_templates_updated_at BEFORE UPDATE ON public.evaluation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: evaluation_criteria (Criterios de evaluación)
-- ============================================
CREATE TABLE IF NOT EXISTS public.evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.evaluation_templates(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_score INTEGER NOT NULL CHECK (max_score > 0),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluation_criteria
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_template ON public.evaluation_criteria(template_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_order ON public.evaluation_criteria(template_id, order_index);

-- ============================================
-- TABLA: portfolio_evaluations (Evaluaciones de portafolios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portfolio_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_score DECIMAL(10,2) NOT NULL,
  max_total_score DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para portfolio_evaluations
CREATE INDEX IF NOT EXISTS idx_portfolio_evaluations_portfolio ON public.portfolio_evaluations(portfolio_id);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_evaluations_updated_at BEFORE UPDATE ON public.portfolio_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: evaluation_scores (Puntuaciones por criterio)
-- ============================================
CREATE TABLE IF NOT EXISTS public.evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.portfolio_evaluations(id) ON DELETE CASCADE NOT NULL,
  criterion_id UUID REFERENCES public.evaluation_criteria(id) ON DELETE SET NULL,
  criterion_name VARCHAR(255) NOT NULL, -- Snapshot para mantener histórico
  criterion_max_score INTEGER NOT NULL,
  score DECIMAL(10,2) NOT NULL CHECK (score >= 0),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluation_scores
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_evaluation ON public.evaluation_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_order ON public.evaluation_scores(evaluation_id, order_index);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Políticas para subjects
CREATE POLICY "Teachers can view their own subjects"
  ON public.subjects FOR SELECT
  USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.group_students gs ON g.id = gs.group_id
      WHERE g.subject_id = subjects.id AND gs.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create their own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = teacher_id);

-- Políticas para groups
CREATE POLICY "Users can view groups of their subjects"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = groups.subject_id AND s.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.group_students gs
      WHERE gs.group_id = groups.id AND gs.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage groups of their subjects"
  ON public.groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = groups.subject_id AND s.teacher_id = auth.uid()
    )
  );

-- Políticas para group_students
CREATE POLICY "Users can view group_students of their subjects"
  ON public.group_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.subjects s ON s.id = g.subject_id
      WHERE g.id = group_students.group_id AND (s.teacher_id = auth.uid() OR group_students.student_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage group_students of their subjects"
  ON public.group_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.subjects s ON s.id = g.subject_id
      WHERE g.id = group_students.group_id AND s.teacher_id = auth.uid()
    )
  );

-- Políticas para portfolios
CREATE POLICY "Students can view their own portfolios"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view portfolios of their subjects"
  ON public.portfolios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = portfolios.subject_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can create their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can update portfolios of their subjects"
  ON public.portfolios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = portfolios.subject_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = student_id);

-- Políticas para evaluation_templates
CREATE POLICY "Teachers can manage their own templates"
  ON public.evaluation_templates FOR ALL
  USING (auth.uid() = teacher_id);

-- Políticas para evaluation_criteria
CREATE POLICY "Teachers can manage criteria of their templates"
  ON public.evaluation_criteria FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluation_templates et
      WHERE et.id = evaluation_criteria.template_id AND et.teacher_id = auth.uid()
    )
  );

-- Políticas para portfolio_evaluations
CREATE POLICY "Teachers can manage evaluations of their subjects"
  ON public.portfolio_evaluations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      JOIN public.subjects s ON s.id = p.subject_id
      WHERE p.id = portfolio_evaluations.portfolio_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view evaluations of their portfolios"
  ON public.portfolio_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_evaluations.portfolio_id AND p.student_id = auth.uid()
    )
  );

-- Políticas para evaluation_scores
CREATE POLICY "Users can view scores of accessible evaluations"
  ON public.evaluation_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_evaluations pe
      JOIN public.portfolios p ON p.id = pe.portfolio_id
      WHERE pe.id = evaluation_scores.evaluation_id
        AND (
          p.student_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.subjects s
            WHERE s.id = p.subject_id AND s.teacher_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Teachers can manage scores of their evaluations"
  ON public.evaluation_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_evaluations pe
      JOIN public.portfolios p ON p.id = pe.portfolio_id
      JOIN public.subjects s ON s.id = p.subject_id
      WHERE pe.id = evaluation_scores.evaluation_id AND s.teacher_id = auth.uid()
    )
  );

-- ============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario que extienden auth.users de Supabase';
COMMENT ON TABLE public.subjects IS 'Materias asignadas a profesores';
COMMENT ON TABLE public.groups IS 'Grupos de clase para cada materia';
COMMENT ON TABLE public.group_students IS 'Relación muchos a muchos entre grupos y estudiantes';
COMMENT ON TABLE public.portfolios IS 'Portafolios de evidencias subidos por estudiantes';
COMMENT ON TABLE public.evaluation_templates IS 'Plantillas de evaluación creadas por profesores';
COMMENT ON TABLE public.evaluation_criteria IS 'Criterios de evaluación dentro de cada plantilla';
COMMENT ON TABLE public.portfolio_evaluations IS 'Evaluaciones realizadas sobre portafolios';
COMMENT ON TABLE public.evaluation_scores IS 'Puntuaciones individuales por criterio de evaluación';

