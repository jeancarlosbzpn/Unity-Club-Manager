#!/bin/bash
# Script para iniciar Club Vencedores App (Modo Escritorio)

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js y npm no detectados."
    read -p "Enter para salir..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🚀 Iniciando App Escritorio..."
npm run electron:dev

echo "⚠️ La aplicación se ha cerrado."
read -p "Presiona Enter para cerrar esta ventana..."

