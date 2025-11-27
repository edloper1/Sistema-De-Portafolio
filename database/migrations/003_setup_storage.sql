-- ============================================
-- Configuración de Supabase Storage
-- Para archivos PDF de portafolios
-- ============================================

-- Crear bucket si no existe (esto debe hacerse manualmente desde Supabase Studio o con la API)
-- Por ahora, solo configuramos las políticas

-- ============================================
-- POLÍTICAS DE STORAGE
-- ============================================

-- Habilitar RLS en storage.objects
-- Esto ya está habilitado por defecto en Supabase

-- Política: Estudiantes pueden subir sus propios portafolios
CREATE POLICY "Students can upload portfolios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-files' AND
  -- Verificar que el usuario es estudiante
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'student'
  ) AND
  -- El archivo debe estar en una carpeta con su ID de estudiante
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Estudiantes pueden leer sus propios portafolios
CREATE POLICY "Students can read own portfolios"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio-files' AND
  (
    -- Pueden leer archivos en su carpeta
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- O pueden leer archivos relacionados con sus portafolios
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.student_id = auth.uid() AND p.file_path = name
    )
  )
);

-- Política: Profesores pueden leer todos los portafolios
CREATE POLICY "Teachers can read all portfolios"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Política: Profesores pueden eliminar portafolios (para administración)
CREATE POLICY "Teachers can delete portfolios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Política: Estudiantes pueden eliminar sus propios portafolios
CREATE POLICY "Students can delete own portfolios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- NOTAS
-- ============================================
-- 1. El bucket 'portfolio-files' debe crearse manualmente desde Supabase Studio
--    o usando la API de Storage
-- 2. Las políticas anteriores asumen que los archivos están organizados como:
--    portfolio-files/{portfolio_id}/{filename.pdf}
-- 3. El backend usa Supabase Admin API, por lo que puede subir archivos sin
--    estas restricciones, pero las políticas protegen el acceso desde el cliente

