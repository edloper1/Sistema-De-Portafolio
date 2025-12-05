# 🚀 Desarrollo Local del Frontend

Esta guía te ayudará a ejecutar el frontend localmente conectado a tu backend en Render y Supabase.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn instalado
- URLs de tus servicios desplegados:
  - URL del backend en Render
  - URL de Supabase
  - Anon Key de Supabase

## ⚙️ Paso 1: Configurar Variables de Entorno

1. **Crea un archivo `.env` en la carpeta `frontend/`** con el siguiente contenido:

```env
# URL de Supabase (obtener desde Supabase Dashboard > Settings > API)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co

# Anon Key de Supabase (obtener desde Supabase Dashboard > Settings > API)
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# URL del backend desplegado en Render
VITE_API_URL=https://tu-backend.onrender.com
```

2. **Reemplaza los valores** con tus URLs reales:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase (ej: `https://dxgjsfpmezryamskhlyk.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase
   - `VITE_API_URL`: La URL de tu backend en Render (ej: `https://portfolio-backend.onrender.com`)

## 🔍 Cómo Obtener las URLs

### Supabase:
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings > API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Render (Backend):
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio de backend
3. Copia la URL que aparece en la parte superior (ej: `https://portfolio-backend.onrender.com`)
4. Esta URL va en `VITE_API_URL`

## 🚀 Paso 2: Instalar Dependencias

Desde la raíz del proyecto:

```bash
cd frontend
npm install
```

O desde la raíz del proyecto:

```bash
npm install
```

## ▶️ Paso 3: Ejecutar el Frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

O desde la carpeta frontend:

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## ✅ Verificar la Conexión

1. **Abre el navegador** en `http://localhost:5173`
2. **Abre la consola del navegador** (F12)
3. Deberías ver un mensaje como:
   ```
   🔧 Supabase Config: { url: '...', hasAnonKey: true, ... }
   ```
4. **Intenta hacer login** para verificar que la conexión al backend funciona

## 🐛 Solución de Problemas

### Error: "Failed to fetch" al hacer peticiones al backend

**Causa:** CORS o URL incorrecta del backend

**Solución:**
1. Verifica que `VITE_API_URL` esté correctamente configurada
2. Verifica que el backend en Render esté corriendo (visita `/health`)
3. Verifica que el backend tenga CORS configurado para aceptar `localhost:5173`

### Error: "Supabase connection failed"

**Causa:** Variables de Supabase incorrectas

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
2. Asegúrate de que no haya espacios extra en los valores
3. Reinicia el servidor de desarrollo después de cambiar las variables

### Las variables de entorno no se cargan

**Causa:** Vite necesita reiniciarse después de cambiar `.env`

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Vuelve a ejecutar `npm run dev`
3. Las variables que empiezan con `VITE_` se cargan automáticamente

## 📝 Notas Importantes

- ⚠️ **Nunca subas el archivo `.env` a Git** (ya está en `.gitignore`)
- 🔄 **Reinicia el servidor** después de cambiar variables de entorno
- 🌐 **El frontend local se conecta directamente** a tus servicios en producción
- 🔐 **Las credenciales de Supabase** son públicas (anon key), pero mantén el `.env` privado

## 🎯 Próximos Pasos

Una vez que el frontend esté corriendo localmente:

1. Puedes modificar cualquier componente en `src/`
2. Los cambios se reflejan automáticamente (hot reload)
3. Puedes depurar usando las herramientas del navegador
4. Cuando termines, haz commit de tus cambios y despliega a Vercel

