# 📸 Logo del Sistema

## 📁 Ubicación del Logo

Coloca tu archivo de logo en esta carpeta con el nombre: **`logo.png`**

## ✅ Formatos Soportados

- **PNG** (recomendado) - `logo.png`
- **SVG** - `logo.svg` (si prefieres, puedes cambiar el código para usar SVG)

## 📐 Tamaños Recomendados

- **Para Login**: 200x200px o más grande (se ajustará automáticamente)
- **Para Navbar**: 32x32px mínimo (se ajustará automáticamente)

## 🔄 Cómo Agregar tu Logo

1. **Prepara tu logo:**
   - Formato PNG con fondo transparente (recomendado)
   - O PNG con fondo sólido
   - Tamaño mínimo: 200x200px para mejor calidad

2. **Nombra el archivo:**
   - Debe llamarse exactamente: `logo.png`
   - Colócalo en esta carpeta: `frontend/public/logo/logo.png`

3. **Verifica:**
   - El logo aparecerá automáticamente en:
     - ✅ Página de Login
     - ✅ Barra de Navegación (Navbar)
   - Si el logo no se carga, se mostrará un icono placeholder automáticamente

## 🎨 Ejemplo de Estructura

```
frontend/
└── public/
    └── logo/
        └── logo.png  ← Tu logo aquí
```

## 💡 Notas

- El sistema detectará automáticamente si el logo existe
- Si no hay logo, se mostrará un icono placeholder con el diseño del sistema
- El logo se ajusta automáticamente a diferentes tamaños de pantalla
- Para cambiar el formato (ej: usar SVG), edita los componentes:
  - `src/components/Logo.tsx`
  - Cambia `/logo/logo.png` por `/logo/logo.svg`

