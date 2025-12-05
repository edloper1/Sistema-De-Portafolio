#!/bin/bash

# Script para configurar el entorno local del frontend
# Uso: ./setup-local.sh

echo "🚀 Configurando entorno local del frontend..."
echo ""

# Verificar si existe .env
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Solicitar valores
echo "📝 Por favor, ingresa los siguientes valores:"
echo ""

read -p "URL de Supabase (ej: https://dxgjsfpmezryamskhlyk.supabase.co): " SUPABASE_URL
read -p "Anon Key de Supabase: " SUPABASE_ANON_KEY
read -p "URL del backend en Render (ej: https://portfolio-backend.onrender.com): " API_URL

# Crear archivo .env
cat > .env << EOF
# Configuración para desarrollo local
# Generado automáticamente el $(date)

# URL de Supabase
VITE_SUPABASE_URL=${SUPABASE_URL}

# Anon Key de Supabase
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# URL del backend desplegado en Render
VITE_API_URL=${API_URL}
EOF

echo ""
echo "✅ Archivo .env creado exitosamente!"
echo ""
echo "📋 Resumen de configuración:"
echo "   - Supabase URL: ${SUPABASE_URL}"
echo "   - Backend URL: ${API_URL}"
echo ""
echo "🚀 Ahora puedes ejecutar: npm run dev"
echo ""

