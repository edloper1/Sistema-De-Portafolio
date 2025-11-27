# 🚀 Guía de Despliegue a Vercel

Esta guía te ayudará a desplegar tu aplicación en Vercel paso a paso.

## 📋 Consideraciones Importantes

**Tu proyecto tiene 2 componentes:**
1. **Frontend** (React + Vite) → Se despliega en Vercel ✅
2. **Backend** (Express.js) → Necesita otro servicio (Railway, Render, etc.) ⚠️

> ⚠️ **Importante:** Vercel es ideal para frontends y serverless functions. Para un servidor Express tradicional, necesitas otro servicio como Railway o Render.

---

## 📦 Parte 1: Desplegar el Frontend en Vercel

### Paso 1.1: Preparar el proyecto

1. **Asegúrate de que tu código esté en GitHub:**
```bash
git init
git add .
git commit -m "Preparado para despliegue en Vercel"
git remote add origin <tu-repositorio-github>
git push -u origin main
```

### Paso 1.2: Desplegar usando la CLI de Vercel (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Iniciar sesión:**
```bash
vercel login
```

3. **Desplegar desde la raíz del proyecto:**
```bash
cd Sistema-De-Portafolio-main
vercel
```

4. **Sigue las instrucciones:**
   - ¿Quieres modificar la configuración? → **No**
   - El archivo `vercel.json` ya está configurado ✅

### Paso 1.3: Desplegar usando GitHub (Alternativa)

1. **Ve a [vercel.com](https://vercel.com)** y crea una cuenta
2. **Clic en "Add New Project"**
3. **Conecta tu repositorio de GitHub**
4. **Configuración del proyecto:**
   - **Framework Preset:** Vite (se detecta automáticamente)
   - **Root Directory:** `frontend` (IMPORTANTE: cambia esto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Configura Variables de Entorno** (más abajo)

### Paso 1.4: Configurar Variables de Entorno en Vercel

Ve a **Settings > Environment Variables** en tu proyecto de Vercel y agrega:

```
VITE_SUPABASE_URL=https://dxgjsfpmezryamskhlyk.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_API_URL=https://tu-backend.railway.app
```

> ⚠️ **Nota:** `VITE_API_URL` será la URL de tu backend desplegado (ver Parte 2).

---

## 🖥️ Parte 2: Desplegar el Backend

El backend necesita un servicio que soporte Node.js con Express.

> 💰 **Información sobre planes gratuitos:**
> - **Railway:** $5 créditos/mes gratis, luego pagas por uso (~$5-10/mes para proyectos pequeños)
> - **Render:** Gratis pero el servicio "duerme" después de 15 min de inactividad (primera petición tarda ~30-50 seg)
> - **Fly.io:** Plan gratuito generoso con 3 apps compartidas y 160 GB de tráfico/mes

### Opción A: Railway (Recomendado - Más fácil)

**💰 Plan Gratuito:**
- ✅ $5 en créditos mensuales gratis (sin tarjeta de crédito requerida)
- ✅ ~500 horas/mes de uso
- ✅ Perfecto para proyectos pequeños/medianos
- ⚠️ Después de los $5, pagas por uso (~$0.01-0.02/hora)
- 💡 Para un backend típico: ~$5-10/mes después del crédito gratuito

1. **Ve a [railway.app](https://railway.app)** y crea una cuenta (puedes usar GitHub)

2. **Crea un nuevo proyecto:**
   - Clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Railway detectará automáticamente Node.js**

4. **Configura el servicio:**
   - Railway intentará detectar automáticamente, pero si no:
   - **Root Directory:** `backend`
   - **Start Command:** `node index.js`
   - **Build Command:** `npm install` (o déjalo vacío)

5. **Configura Variables de Entorno:**
   ```
   SUPABASE_URL=https://dxgjsfpmezryamskhlyk.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   PORT=3001
   NODE_ENV=production
   ```

6. **Railway generará una URL automáticamente:**
   - Ejemplo: `https://tu-backend-production.up.railway.app`
   - Copia esta URL, la necesitarás para el frontend

### Opción B: Render (100% Gratis - Con limitaciones)

**💰 Plan Gratuito:**
- ✅ 100% gratis, sin necesidad de tarjeta de crédito
- ✅ 750 horas/mes (suficiente para 24/7)
- ✅ 512 MB RAM, 100 GB tráfico/mes
- ⚠️ **IMPORTANTE:** El servicio "duerme" después de 15 minutos de inactividad
- ⚠️ La primera petición después de dormir tarda ~30-50 segundos en responder
- ⚠️ Puede ser molesto si no hay tráfico constante

1. **Ve a [render.com](https://render.com)** y crea una cuenta

2. **Crea un nuevo Web Service:**
   - Conecta tu repositorio de GitHub
   - Selecciona tu repositorio

3. **Configuración:**
   - **Name:** `portfolio-backend`
   - **Environment:** `Node`
   - **Plan:** `Free` (gratis)
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node index.js`
   - **Root Directory:** `backend`

4. **Variables de entorno:**
   ```
   SUPABASE_URL=https://dxgjsfpmezryamskhlyk.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   PORT=3001
   NODE_ENV=production
   ```

5. **Copia la URL que Render te proporcione**

> ⚠️ **Nota sobre el "sleep":** Para evitar que el servicio se duerma, puedes usar servicios como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 10 minutos (gratis).

### Opción C: Fly.io (Recomendado para proyectos 100% gratis)

**💰 Plan Gratuito:**
- ✅ 3 apps compartidas gratis
- ✅ 160 GB de tráfico saliente/mes
- ✅ No se duerme como Render
- ✅ Buena opción si quieres algo completamente gratis sin limitaciones de "sleep"

1. **Ve a [fly.io](https://fly.io)** y crea una cuenta

2. **Instala Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

3. **Desde el directorio `backend/`:**
   ```bash
   cd backend
   fly launch
   ```

4. **Sigue las instrucciones:**
   - Selecciona región cercana
   - No crees base de datos (usas Supabase)
   - Configura las variables de entorno

5. **Configura Variables de Entorno:**
   ```bash
   fly secrets set SUPABASE_URL=https://dxgjsfpmezryamskhlyk.supabase.co
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   fly secrets set PORT=3001
   fly secrets set NODE_ENV=production
   ```

---

## 🔄 Parte 3: Conectar Frontend y Backend

1. **Obtén la URL de tu backend desplegado:**
   - Railway: `https://tu-backend-production.up.railway.app`
   - Render: `https://portfolio-backend.onrender.com`

2. **Actualiza `VITE_API_URL` en Vercel:**
   - Ve a tu proyecto en Vercel
   - **Settings > Environment Variables**
   - Edita `VITE_API_URL` con la URL de tu backend
   - O agrega una nueva variable con ese nombre

3. **Redeploy el frontend:**
   - En Vercel, ve a **Deployments**
   - Clic en los 3 puntos del último deployment
   - Selecciona "Redeploy"

---

## ✅ Parte 4: Verificar el Despliegue

### Verificar Frontend:
1. Visita tu URL de Vercel (ej: `https://tu-proyecto.vercel.app`)
2. Verifica que la página carga correctamente

### Verificar Backend:
1. Visita `https://tu-backend-url.com/health`
2. Deberías ver: `{"status":"ok","database":"connected","supabase":"connected"}`

### Verificar Conexión:
1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Verifica en la pestaña "Network" que las peticiones al backend funcionan

---

## 🐛 Solución de Problemas

### ❌ Error: "Module not found" en el build de Vercel

**Solución:** Verifica que el Root Directory esté configurado como `frontend` en Vercel.

### ❌ Error: "Failed to fetch" al intentar usar la API

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada correctamente en Vercel
2. Verifica que el backend esté corriendo (visita `/health`)
3. Verifica CORS en el backend (ya está configurado para aceptar todos los orígenes)

### ❌ El backend no inicia en Railway/Render

**Solución:**
1. Verifica que las variables de entorno estén configuradas:
   - `SUPABASE_SERVICE_ROLE_KEY` (MUY IMPORTANTE)
   - `SUPABASE_URL`
2. Verifica los logs en Railway/Render para ver el error específico
3. Verifica que el Root Directory sea `backend`

### ❌ Variables de entorno no funcionan en producción

**Solución:**
1. Asegúrate de que las variables empiecen con `VITE_` para el frontend
2. Después de agregar variables, haz un nuevo deploy
3. Verifica que no haya espacios extra en los valores

---

## 💰 Comparativa de Planes Gratuitos

| Plataforma | Plan Gratuito | Limitaciones | Mejor para |
|------------|---------------|--------------|------------|
| **Railway** | $5 créditos/mes | Después pagas ~$5-10/mes | Proyectos con presupuesto pequeño |
| **Render** | 750 horas/mes | Se duerme después de 15 min | Proyectos de prueba/demo |
| **Fly.io** | 3 apps, 160GB/mes | Límite de apps compartidas | Proyectos 100% gratis |

**Recomendación:**
- 🥇 **Render** si necesitas algo 100% gratis (acepta el "sleep")
- 🥈 **Fly.io** si quieres 100% gratis sin "sleep"
- 🥉 **Railway** si tienes presupuesto pequeño ($5-10/mes después del crédito)

## 📝 Checklist Completo

- [ ] Código subido a GitHub
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno del frontend configuradas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL` (después de desplegar el backend)
- [ ] Backend desplegado en Railway/Render/Fly.io
- [ ] Variables de entorno del backend configuradas:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PORT=3001`
- [ ] `VITE_API_URL` actualizada con la URL del backend
- [ ] Frontend redeployed con la nueva variable
- [ ] Todo funciona correctamente

---

## 🔗 URLs Finales

Después del despliegue tendrás:

- **Frontend:** `https://tu-proyecto.vercel.app`
- **Backend:** `https://tu-backend.railway.app` (o similar)
- **Supabase:** Ya está en la nube

---

## 📚 Recursos Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de Render](https://render.com/docs)

¡Listo para desplegar! 🚀
