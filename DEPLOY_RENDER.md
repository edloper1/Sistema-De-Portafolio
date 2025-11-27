# 🚀 Guía de Despliegue del Backend en Render

Esta guía te ayudará a desplegar el backend de tu aplicación en Render paso a paso.

## 📋 Requisitos Previos

- ✅ **Código subido a GitHub** (TODO el proyecto: frontend, backend, etc.)
- ✅ Cuenta en [Render.com](https://render.com) (gratis)
- ✅ Variables de entorno de Supabase listas

> 💡 **Importante:** Sube TODO el proyecto a GitHub en un solo repositorio. Render solo usará la carpeta `backend/` gracias a la configuración "Root Directory". El frontend también estará ahí para cuando lo despliegues en Vercel.

## ❓ FAQ: ¿Debo subir todo o solo el backend?

**Respuesta:** Sube TODO el proyecto a un solo repositorio de GitHub. 

**Estructura recomendada en GitHub:**
```
Sistema-De-Portafolio-main/
├── frontend/          ← Para Vercel
├── backend/           ← Para Render (usaremos Root Directory)
├── database/
├── scripts/
└── ...
```

**¿Por qué?**
- ✅ Mantiene todo el código en un lugar
- ✅ Render puede usar solo la carpeta `backend/` con "Root Directory"
- ✅ Vercel puede usar solo la carpeta `frontend/`
- ✅ Más fácil de mantener y versionar

---

## 📦 Paso 1: Subir Todo el Proyecto a GitHub

Si aún no has subido tu código:

```bash
cd Sistema-De-Portafolio-main

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Proyecto completo listo para despliegue"

# Agregar el remoto (reemplaza con tu repositorio)
git remote add origin https://github.com/tu-usuario/tu-repositorio.git

# Subir todo
git push -u origin main
```

> ⚠️ **Nota:** Asegúrate de que `.env` esté en `.gitignore` (no subas tus credenciales a GitHub)

---

## 🔧 Paso 2: Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Elige **"Sign Up with GitHub"** (recomendado)
4. Autoriza la conexión con GitHub

---

## 🚀 Paso 3: Crear un Nuevo Web Service

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Si es la primera vez, autoriza Render para acceder a tus repositorios
   - Selecciona tu repositorio: `Sistema-De-Portafolio-main` (o el nombre que le hayas dado)
   - ⚠️ **No te preocupes**, aunque el repositorio tenga frontend y backend, Render solo usará la carpeta que configures

---

## ⚙️ Paso 4: Configurar el Servicio

Completa el formulario con la siguiente información:

### Información Básica:
- **Name:** `portfolio-backend` (o el nombre que prefieras)
- **Region:** Selecciona la región más cercana a ti (ej: `Oregon (US West)`)

### Configuración de Build:
- **Environment:** `Node`
- **Branch:** `main` (o tu rama principal)
- **Root Directory:** `backend` ⚠️ **IMPORTANTE** - Esto le dice a Render que solo use esta carpeta
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Plan:
- **Plan:** `Free` (para empezar gratis)

> 💡 **¿Qué hace Root Directory?** 
> Le dice a Render: "Aunque el repositorio tenga muchas carpetas, solo usa la carpeta `backend/` como si fuera la raíz del proyecto"

---

## 🔐 Paso 5: Configurar Variables de Entorno

En la sección **"Environment Variables"**, haz clic en **"Add Environment Variable"** y agrega:

### Variables Requeridas:

```
SUPABASE_URL=https://dxgjsfpmezryamskhlyk.supabase.co
```

```
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

```
PORT=10000
```

> ⚠️ **Nota sobre PORT:** Render asigna automáticamente el puerto a través de la variable de entorno `PORT`. El código ya está configurado para usar `process.env.PORT || 3001`, así que solo necesitas agregar `PORT` en Render.

### Variables Opcionales (pero recomendadas):

```
NODE_ENV=production
```

> 💡 **Consejo:** Puedes obtener tus credenciales de Supabase desde:
> - Supabase Dashboard → Settings → API
> - `SUPABASE_URL` → Project URL
> - `SUPABASE_SERVICE_ROLE_KEY` → service_role key (⚠️ manténla secreta)

---

## 🚀 Paso 6: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir tu aplicación:
   - Esto puede tardar 2-5 minutos la primera vez
   - Verás los logs del proceso de build en tiempo real
   - Render ejecutará `npm install` dentro de la carpeta `backend/`

3. Una vez completado, Render te dará una URL:
   - Ejemplo: `https://portfolio-backend.onrender.com`
   - ⚠️ **Copia esta URL**, la necesitarás para configurar el frontend

---

## ✅ Paso 7: Verificar el Despliegue

1. **Prueba el health check:**
   - Visita: `https://tu-backend.onrender.com/health`
   - Deberías ver: `{"status":"ok","database":"connected","supabase":"connected"}`

2. **Verifica los logs:**
   - En Render, ve a la pestaña **"Logs"**
   - Deberías ver: `🚀 Servidor API corriendo en puerto 10000`

---

## 🔄 Paso 8: Configurar el Frontend en Vercel

Ahora que tienes la URL del backend, actualiza el frontend:

1. Ve a tu proyecto en Vercel
2. **Settings > Environment Variables**
3. Agrega o actualiza:
   ```
   VITE_API_URL=https://tu-backend.onrender.com
   ```
4. **Redeploy** el frontend

---

## ⚠️ Importante: Sobre el "Sleep" de Render

Render Free hace que tu servicio "duerma" después de 15 minutos de inactividad:

- ✅ **Ventaja:** Completamente gratis
- ⚠️ **Desventaja:** La primera petición después de dormir tarda **30-50 segundos**

### Solución: Mantener el Servicio Despierto

Puedes usar **UptimeRobot** (gratis) para evitar que se duerma:

1. **Crea una cuenta en [UptimeRobot](https://uptimerobot.com)** (gratis)
2. **Agrega un nuevo monitor:**
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Portfolio Backend`
   - **URL:** `https://tu-backend.onrender.com/health`
   - **Monitoring Interval:** `5 minutes` (el mínimo gratuito)
3. UptimeRobot hará ping cada 5 minutos, manteniendo el servicio despierto

> 💡 **Alternativa:** Si no quieres usar UptimeRobot, el servicio funcionará igual, solo que la primera petición después de dormir tardará más.

---

## 🐛 Solución de Problemas

### ❌ Error: "Build failed"

**Posibles causas:**
1. **Dependencias faltantes:**
   - Verifica que `backend/package.json` exista
   - Asegúrate de que todas las dependencias estén listadas

2. **Root Directory incorrecto:**
   - Debe ser exactamente: `backend` (sin barra al final)
   - Sin mayúsculas ni espacios

**Solución:**
- Verifica los logs de build en Render
- Asegúrate de que `backend/package.json` existe y está en GitHub

### ❌ Error: "Application failed to respond"

**Posibles causas:**
1. **Puerto incorrecto:**
   - Verifica que la variable `PORT` esté configurada
   - Render usa el puerto que asigna, el código ya lo maneja

2. **Variables de entorno faltantes:**
   - Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada

**Solución:**
- Revisa los logs en Render
- Verifica que todas las variables de entorno estén configuradas

### ❌ Error: "SUPABASE_SERVICE_ROLE_KEY no está configurada"

**Solución:**
1. Ve a **Environment Variables** en Render
2. Agrega `SUPABASE_SERVICE_ROLE_KEY` con tu service role key de Supabase
3. Haz un **Manual Deploy** desde el dashboard

### ❌ Error: "Cannot find module" o dependencias faltantes

**Solución:**
1. Verifica que `backend/package.json` esté en GitHub
2. Verifica que todas las dependencias estén listadas en `package.json`
3. Revisa los logs de build para ver qué módulo falta

---

## 📝 Checklist de Despliegue en Render

- [ ] **TODO el proyecto subido a GitHub** (frontend + backend)
- [ ] Cuenta creada en Render.com
- [ ] Repositorio conectado desde GitHub
- [ ] Web Service creado con configuración correcta:
  - [ ] Root Directory: `backend` (IMPORTANTE)
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: `Free`
- [ ] Variables de entorno configuradas:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PORT=10000`
  - [ ] `NODE_ENV=production` (opcional)
- [ ] Servicio desplegado exitosamente
- [ ] Health check funciona: `/health`
- [ ] URL copiada para configurar el frontend
- [ ] Frontend actualizado con `VITE_API_URL`
- [ ] UptimeRobot configurado (opcional, pero recomendado)

---

## 🔗 URLs Finales

Después del despliegue tendrás:

- **Backend:** `https://tu-backend.onrender.com`
- **Frontend:** `https://tu-proyecto.vercel.app` (configurado anteriormente)
- **Supabase:** Ya está en la nube

---

## 📚 Recursos Útiles

- [Documentación de Render](https://render.com/docs)
- [Render Free Tier Info](https://render.com/docs/free)
- [UptimeRobot](https://uptimerobot.com) - Para mantener el servicio despierto

¡Listo para desplegar! 🚀

---

## 💡 Tips Adicionales

1. **Logs en tiempo real:**
   - Puedes ver los logs en vivo desde el dashboard de Render
   - Útil para depurar problemas

2. **Redeploy manual:**
   - Si cambias algo en el código, Render detectará los cambios automáticamente
   - O puedes hacer redeploy manual desde el dashboard

3. **Configurar dominio personalizado:**
   - En el plan Free no puedes usar dominio personalizado
   - Pero la URL `.onrender.com` es suficiente para empezar

4. **Monitoreo:**
   - Render proporciona métricas básicas en el dashboard
   - Para monitoreo avanzado, considera herramientas externas
