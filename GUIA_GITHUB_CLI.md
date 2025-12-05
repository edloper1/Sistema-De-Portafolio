# 🚀 Crear Repositorio en GitHub desde la Terminal

Esta guía te muestra cómo crear el repositorio de GitHub directamente desde tu terminal, sin tener que ir al navegador.

## 📋 Opción 1: Usando GitHub CLI (Recomendado - Más fácil)

### Paso 1: Instalar GitHub CLI

**En Linux (Fedora):**
```bash
sudo dnf install gh
```

**En Ubuntu/Debian:**
```bash
sudo apt install gh
```

**O desde el sitio oficial:**
```bash
# Instalar desde el repositorio oficial
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Paso 2: Iniciar Sesión

```bash
gh auth login
```

Sigue las instrucciones:
1. Selecciona `GitHub.com`
2. Selecciona `HTTPS`
3. Selecciona cómo quieres autenticarte (navegador o token)
4. Autoriza la aplicación

### Paso 3: Verificar que funciona

```bash
gh auth status
```

### Paso 4: Crear el repositorio desde la terminal

```bash
cd /home/edloper/Documentos/Sistema-De-Portafolio-main

# Crear repositorio en GitHub y conectarlo
gh repo create Sistema-De-Portafolio --public --source=. --remote=origin --push
```

**O si quieres más control paso a paso:**

```bash
# 1. Inicializar Git (si no está inicializado)
git init

# 2. Agregar archivos
git add .

# 3. Primer commit
git commit -m "Proyecto inicial - Sistema de Portafolios"

# 4. Crear repositorio en GitHub y subir
gh repo create Sistema-De-Portafolio --public --source=. --remote=origin --push
```

**Opciones:**
- `--public` = Repositorio público
- `--private` = Repositorio privado
- `--source=.` = Usa el directorio actual
- `--remote=origin` = Nombre del remote
- `--push` = Sube el código automáticamente

---

## 📋 Opción 2: Usando curl (Sin instalar nada extra)

Si no quieres instalar GitHub CLI, puedes usar la API de GitHub directamente con `curl`.

### Paso 1: Crear un Personal Access Token

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre: "Crear repositorio"
4. Selecciona el scope: `repo` (marca la casilla completa)
5. Click en "Generate token"
6. **Copia el token** (solo lo verás una vez)

### Paso 2: Crear el repositorio con curl

```bash
cd /home/edloper/Documentos/Sistema-De-Portafolio-main

# Configurar variables (reemplaza con tus datos)
GITHUB_USER="tu-usuario"
GITHUB_TOKEN="tu-token-aqui"
REPO_NAME="Sistema-De-Portafolio"

# Crear repositorio en GitHub
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false}"

# Inicializar Git (si no está)
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

## 📋 Opción 3: Script Automático

Puedo crear un script que haga todo automáticamente. ¿Quieres que lo cree?

---

## ✅ Verificación

Después de cualquier opción, verifica:

```bash
# Ver el remote configurado
git remote -v

# Debería mostrar:
# origin  https://github.com/TU-USUARIO/Sistema-De-Portafolio.git (fetch)
# origin  https://github.com/TU-USUARIO/Sistema-De-Portafolio.git (push)
```

Y visita tu repositorio en:
```
https://github.com/TU-USUARIO/Sistema-De-Portafolio
```

---

## 🐛 Solución de Problemas

### Error: "gh: command not found"

**Solución:** Instala GitHub CLI (ver Opción 1, Paso 1)

### Error: "authentication failed"

**Solución:**
```bash
gh auth login
```

### Error: "repository already exists"

**Solución:** El repositorio ya existe. Puedes:
1. Usar otro nombre
2. Eliminar el repositorio desde GitHub
3. O simplemente conectarlo: `git remote add origin https://github.com/USUARIO/REPO.git`

---

## 💡 Recomendación

**Usa la Opción 1 (GitHub CLI)** - Es la más fácil y rápida una vez instalada.

¿Quieres que te ayude a instalar GitHub CLI y crear el repositorio?

