#!/bin/bash
# Script para REPARAR la aplicación (Instalar dependencias)

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🔧 Iniciando reparación de Club Vencedores..."
echo "📂 Borrando instalaciones corruptas..."
rm -rf node_modules package-lock.json

echo "⬇️  Descargando e instalando dependencias (Esto puede tardar unos minutos)..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ ¡Reparación completada con éxito!"
    echo "Ahora puedes intentar usar 'Iniciar Vencedores' de nuevo."
else
    echo "❌ Hubo un error durante la instalación."
fi

read -p "Presiona Enter para cerrar esta ventana..."
