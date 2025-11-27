# 📚 Guía: Subir Proyecto a GitHub

Esta guía te explica paso a paso cómo crear un repositorio en GitHub y subir tu proyecto.

## 🎯 Orden Correcto:

1. ✅ **PRIMERO:** Crear el repositorio en GitHub (vacío)
2. ✅ **DESPUÉS:** Conectarlo con `git remote add origin`
3. ✅ **FINALMENTE:** Subir el código con `git push`

---

## 📦 Paso 1: Crear el Repositorio en GitHub

### Opción A: Desde el navegador (Recomendado para principiantes)

1. **Ve a [github.com](https://github.com)** e inicia sesión

2. **Haz clic en el botón verde "+"** (arriba a la derecha)
   - O ve directamente a: `https://github.com/new`

3. **Completa el formulario:**
   - **Repository name:** `Sistema-De-Portafolio` (o el nombre que prefieras)
   - **Description:** (Opcional) "Sistema de gestión de portafolios estudiantiles"
   - **Visibility:**
     - ✅ **Public** (visible para todos) - Recomendado para proyectos personales
     - ⚪ **Private** (solo tú) - Si quieres mantenerlo privado
   - ⚠️ **NO marques:**
     - ❌ "Add a README file"
     - ❌ "Add .gitignore"
     - ❌ "Choose a license"
   - (Déjalos sin marcar porque ya tienes estos archivos en tu proyecto)

4. **Haz clic en "Create repository"**

5. **GitHub te mostrará una página con instrucciones**
   - ⚠️ **NO sigas esas instrucciones aún**, primero necesitas preparar tu proyecto local

---

## 💻 Paso 2: Preparar el Proyecto Local

Abre tu terminal en el directorio del proyecto:

```bash
cd /home/edloper/Documentos/Sistema-De-Portafolio-main
```

### Verificar si Git está inicializado:

```bash
git status
```

**Si ves un error** como "fatal: not a git repository":
- Necesitas inicializar Git primero (ve al siguiente paso)

**Si ves información sobre archivos:**
- Git ya está inicializado, puedes saltar la inicialización

### Inicializar Git (si es necesario):

```bash
git init
```

---

## 📝 Paso 3: Verificar .gitignore

Asegúrate de que tu archivo `.gitignore` esté en la raíz del proyecto:

```bash
cat .gitignore
```

Este archivo evita que subas archivos sensibles como:
- `.env` (tus credenciales)
- `node_modules/` (dependencias)
- `dist/` (archivos compilados)

✅ Tu proyecto ya tiene un `.gitignore` configurado.

---

## 🔗 Paso 4: Conectar con GitHub

Ahora conecta tu proyecto local con el repositorio de GitHub que creaste:

```bash
# Reemplaza con TU usuario y TU repositorio
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
```

**Ejemplo:**
```bash
git remote add origin https://github.com/edloper/Sistema-De-Portafolio.git
```

> 💡 **¿Cómo saber tu usuario de GitHub?**
> - Tu usuario aparece en la URL: `https://github.com/TU-USUARIO`
> - O en la parte superior derecha de GitHub cuando inicias sesión

### Verificar que se conectó correctamente:

```bash
git remote -v
```

Deberías ver algo como:
```
origin  https://github.com/TU-USUARIO/TU-REPOSITORIO.git (fetch)
origin  https://github.com/TU-USUARIO/TU-REPOSITORIO.git (push)
```

---

## 📤 Paso 5: Agregar Archivos y Subir

### 5.1 Agregar todos los archivos:

```bash
git add .
```

Esto agrega todos los archivos que NO estén en `.gitignore`

### 5.2 Crear el primer commit:

```bash
git commit -m "Proyecto inicial - Sistema de Portafolios"
```

### 5.3 Subir a GitHub:

```bash
git branch -M main
git push -u origin main
```

Si GitHub te pide autenticación:
- **Opción 1:** Usar tu usuario y contraseña (si tienes 2FA activado, usa un Personal Access Token)
- **Opción 2:** Usar GitHub CLI o configuración SSH

---

## ✅ Paso 6: Verificar

Ve a tu repositorio en GitHub:
```
https://github.com/TU-USUARIO/TU-REPOSITORIO
```

Deberías ver todos tus archivos ahí.

---

## 🐛 Solución de Problemas

### ❌ Error: "remote origin already exists"

**Significa que ya configuraste el remote anteriormente.**

**Solución 1:** Ver qué remote tienes configurado:
```bash
git remote -v
```

**Solución 2:** Si quieres cambiarlo:
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
```

### ❌ Error: "fatal: authentication failed"

**Solución:**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de `repo`
3. Úsalo como contraseña cuando hagas `git push`

O usa GitHub CLI:
```bash
gh auth login
```

### ❌ Error: "Permission denied (publickey)"

**Solución:**
Necesitas configurar SSH o usar HTTPS. Si usas HTTPS, asegúrate de que la URL sea:
```
https://github.com/TU-USUARIO/TU-REPOSITORIO.git
```

### ❌ Error: "Updates were rejected because the remote contains work"

**Significa que el repositorio de GitHub tiene archivos que no están en tu proyecto local.**

**Solución:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📋 Checklist Completo

- [ ] Cuenta creada en GitHub
- [ ] Repositorio creado en GitHub (vacío, sin README)
- [ ] Proyecto local con Git inicializado (`git init`)
- [ ] `.gitignore` verificado (no sube archivos sensibles)
- [ ] Remote agregado (`git remote add origin ...`)
- [ ] Archivos agregados (`git add .`)
- [ ] Primer commit creado (`git commit -m "..."`)
- [ ] Código subido (`git push -u origin main`)
- [ ] Verificado en GitHub (archivos visibles)

---

## 🔄 Comandos Rápidos (Resumen)

```bash
# 1. Ir al proyecto
cd /home/edloper/Documentos/Sistema-De-Portafolio-main

# 2. Inicializar Git (si es necesario)
git init

# 3. Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# 4. Agregar archivos
git add .

# 5. Hacer commit
git commit -m "Proyecto inicial"

# 6. Subir a GitHub
git branch -M main
git push -u origin main
```

---

## 💡 Tips Adicionales

1. **Nombre del repositorio:**
   - Puede ser diferente al nombre de la carpeta local
   - Ejemplo: carpeta local `Sistema-De-Portafolio-main`, repo `Sistema-De-Portafolio`

2. **Actualizaciones futuras:**
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```

3. **Ver estado antes de commitear:**
   ```bash
   git status
   ```

4. **Ver qué archivos se van a subir:**
   ```bash
   git status
   ```

¡Listo! Ahora tu proyecto está en GitHub y listo para desplegar en Render y Vercel. 🚀

