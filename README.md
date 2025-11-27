# 📚 Sistema de Gestión de Portafolios

Sistema web para la gestión y evaluación de portafolios estudiantiles con autenticación por roles (Profesor/Estudiante).

## 🚀 Características

- ✅ Autenticación con Supabase Auth
- ✅ Gestión de materias y grupos
- ✅ Subida de portafolios en formato PDF
- ✅ Visor PDF integrado
- ✅ Sistema de evaluación con rúbricas personalizables
- ✅ Estadísticas y reportes para profesores
- ✅ Almacenamiento en Supabase Storage

## 🏗️ Arquitectura

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + Supabase Admin API
- **Base de datos:** PostgreSQL (Supabase Cloud)
- **Storage:** Supabase Storage
- **Autenticación:** Supabase Auth

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Git

## ⚙️ Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Sistema-De-Portafolio-main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings > API** y copia:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Backend
PORT=3001

# Frontend (crear frontend/.env)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 5. Configurar base de datos

Ejecuta las migraciones SQL en Supabase Studio (SQL Editor):

1. **001_supabase_schema.sql** - Esquema completo de la base de datos
2. **003_setup_storage.sql** - Configuración de Storage
3. **004_fix_rls_policies.sql** - Políticas de seguridad (RLS)

### 6. Crear bucket de Storage

En Supabase Studio, ve a **Storage** y crea un bucket llamado `portfolio-files`:
- Público: **No** (privado)
- File size limit: **52428800** (50 MB)
- Allowed MIME types: **application/pdf**

### 7. Migrar usuarios (opcional)

Si tienes usuarios existentes, ejecuta:

```bash
npm run migrate:users
```

## 🚀 Ejecución

### Desarrollo

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run dev
```

**Ambos simultáneamente:**
```bash
npm run dev:all
```

### Producción

**Compilar frontend:**
```bash
npm run build
```

Los archivos compilados estarán en `frontend/dist/`

## 📖 Funcionalidades

### Para Profesores

- ✅ Gestión de materias y grupos
- ✅ Agregar estudiantes a grupos
- ✅ Revisar portafolios con visor PDF integrado
- ✅ Evaluar portafolios con rúbricas personalizables
- ✅ Ver estadísticas y reportes de evaluación
- ✅ Comentar y aprobar/rechazar portafolios

### Para Estudiantes

- ✅ Subir portafolios en formato PDF
- ✅ Ver estado de sus portafolios (pendiente/aprobado/rechazado)
- ✅ Ver evaluaciones y comentarios del profesor
- ✅ Ver calificaciones por criterio

## 📁 Estructura del Proyecto

```
Sistema-De-Portafolio-main/
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Contextos de React (Auth, Portfolio)
│   │   ├── lib/
│   │   │   ├── api/      # Cliente API REST
│   │   │   └── services/ # Servicios de negocio
│   │   ├── pages/        # Páginas de la aplicación
│   │   └── types/        # Definiciones TypeScript
│   └── ...
├── backend/               # API Express.js
│   ├── index.js          # Servidor principal
│   └── supabase-helpers.js # Helpers de Supabase
├── database/
│   └── migrations/       # Migraciones SQL
├── scripts/              # Scripts de utilidad
│   ├── verify-supabase-config.js
│   └── migrate-users-to-supabase.js
└── package.json
```

## 🔧 Variables de Entorno

### Backend (.env)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
PORT=3001
```

### Frontend (frontend/.env)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 📊 Base de Datos

### Tablas principales

- `profiles` - Usuarios (profesores y estudiantes)
- `subjects` - Materias
- `groups` - Grupos de clase
- `group_students` - Relación estudiantes-grupos
- `portfolios` - Portafolios subidos
- `portfolio_evaluations` - Evaluaciones de portafolios
- `evaluation_scores` - Puntuaciones por criterio

### Migraciones

Ejecutar en este orden en Supabase Studio (SQL Editor):

1. `001_supabase_schema.sql` - Esquema completo
2. `003_setup_storage.sql` - Configuración de Storage
3. `004_fix_rls_policies.sql` - Políticas de seguridad

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Storage policies** para controlar acceso a archivos
- **Autenticación** mediante Supabase Auth
- **Tokens JWT** para sesiones seguras

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/students` - Obtener estudiantes

### Materias y Grupos
- `GET /api/subjects/teacher/:teacherId` - Materias del profesor
- `GET /api/subjects/student/:studentId` - Materias del estudiante
- `POST /api/subjects` - Crear materia
- `POST /api/subjects/:subjectId/groups` - Agregar grupo
- `POST /api/groups/:groupId/students/:studentId` - Agregar estudiante a grupo
- `DELETE /api/groups/:id` - Eliminar grupo

### Portafolios
- `GET /api/portfolios` - Todos los portafolios
- `GET /api/portfolios/student/:studentId` - Portafolios del estudiante
- `POST /api/portfolios` - Subir portafolio (multipart/form-data)
- `PUT /api/portfolios/:id/status` - Actualizar estado y evaluación
- `GET /api/files/:portfolioId` - Obtener URL del archivo PDF
- `DELETE /api/portfolios/:id` - Eliminar portafolio

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar frontend
npm run server           # Iniciar backend
npm run dev:all          # Iniciar ambos simultáneamente

# Producción
npm run build            # Compilar frontend

# Utilidades
npm run verify:supabase  # Verificar configuración de Supabase
npm run migrate:users    # Migrar usuarios a Supabase
```

## 🐛 Solución de Problemas

### El backend no inicia
- Verifica que las variables de entorno estén configuradas
- Revisa que `SUPABASE_SERVICE_ROLE_KEY` esté correcto
- Verifica que el puerto 3001 esté disponible

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:3001`
- Revisa la consola del navegador (F12)
- Verifica las variables de entorno del frontend

### Error al subir archivos
- Verifica que el bucket `portfolio-files` exista en Supabase Storage
- Revisa las políticas de Storage
- Verifica los permisos del Service Role Key

### Error de autenticación
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctos
- Limpia el localStorage del navegador
- Revisa las políticas RLS en Supabase

## 📝 Notas Importantes

- Los archivos PDF se almacenan en Supabase Storage (bucket privado)
- Las URLs firmadas tienen validez de 1 hora
- El bucket debe ser privado para seguridad
- Las políticas RLS controlan el acceso a los datos

## 📄 Licencia

Ver archivo `LICENSE` para más detalles.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar problemas o sugerencias, abre un issue en el repositorio.
