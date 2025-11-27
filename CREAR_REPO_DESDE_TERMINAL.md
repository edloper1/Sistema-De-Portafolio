# 🚀 Crear Repositorio en GitHub desde la Terminal

Esta guía te muestra cómo crear el repositorio directamente desde tu terminal, sin ir al navegador.

## 📦 Método 1: Instalar GitHub CLI y crear el repo

### Paso 1: Instalar GitHub CLI (si no está instalado)

**Para Fedora (tu sistema):**
```bash
sudo dnf install gh
```

**Para Ubuntu/Debian:**
```bash
sudo apt install gh
```

### Paso 2: Autenticarte con GitHub

```bash
gh auth login
```

Sigue las instrucciones:
1. Selecciona `GitHub.com`
2. Selecciona `HTTPS`
3. Selecciona `Login with a web browser`
4. Copia el código que te muestra
5. Se abrirá el navegador, pega el código y autoriza

### Paso 3: Crear el repositorio y subir código (TODO EN UNO)

```bash
cd /home/edloper/Documentos/Sistema-De-Portafolio-main

# Inicializar Git (si no está inicializado)
git init

# Agregar archivos
git add .

# Hacer commit
git commit -m "Proyecto inicial - Sistema de Portafolios"

# Crear repositorio en GitHub y subir (TODO EN UNO)
gh repo create Sistema-De-Portafolio --public --source=. --remote=origin --push
```

**¡Eso es todo!** El comando `gh repo create` con las opciones:
- `--public` = Repositorio público (usa `--private` si quieres privado)
- `--source=.` = Usa el directorio actual
- `--remote=origin` = Crea el remote llamado "origin"
- `--push` = Sube el código automáticamente

---

## 📦 Método 2: Usar la API de GitHub directamente (sin instalar nada)

Si no quieres instalar GitHub CLI, puedes usar `curl` directamente.

### Paso 1: Crear un Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Dale un nombre: "Crear repos"
4. Selecciona el scope: **`repo`** (marca toda la casilla)
5. Click "Generate token"
6. **Copia el token** (solo lo verás una vez)

### Paso 2: Crear el repositorio con curl

Crea este script (o ejecuta los comandos uno por uno):

```bash
cd /home/edloper/Documentos/Sistema-De-Portafolio-main

# Configurar tus datos (CAMBIA ESTOS VALORES)
export GITHUB_USER="tu-usuario-de-github"
export GITHUB_TOKEN="tu-token-aqui"
export REPO_NAME="Sistema-De-Portafolio"

# Crear repositorio en GitHub
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false}"

# Inicializar Git
git init

# Agregar remote
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git

# Agregar archivos
git add .

# Commit
git commit -m "Proyecto inicial - Sistema de Portafolios"

# Subir
git branch -M main
git push -u origin main
```

---

## ✅ Verificación

Después de cualquiera de los métodos:

```bash
# Verificar que el remote está configurado
git remote -v

# Debería mostrar algo como:
# origin  https://github.com/TU-USUARIO/Sistema-De-Portafolio.git (fetch)
# origin  https://github.com/TU-USUARIO/Sistema-De-Portafolio.git (push)
```

Visita tu repositorio:
```
https://github.com/TU-USUARIO/Sistema-De-Portafolio
```

---

## 💡 Recomendación

**Usa el Método 1 (GitHub CLI)** - Es más fácil y una vez instalado, puedes crear repositorios con un solo comando.

¿Quieres que te ayude a instalar GitHub CLI ahora?

