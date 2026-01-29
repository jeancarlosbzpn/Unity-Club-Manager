#!/bin/bash
# Script para iniciar en MODO DESARROLLO (Hot Reload)
# Este script inicia la aplicación conectada al código fuente en vivo.
# Cualquier cambio que guardes en el editor se verá reflejado automáticamente.

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js y npm no detectados."
    read -p "Enter para salir..."
    exit 1
fi

echo "🚀 Iniciando MODO DESARROLLO..."
echo "⚠️  Espera a que abra la ventana de la aplicación."
echo "📝 Los cambios que guardes en el código se verán automáticamente."
echo ""

npm run electron:dev

echo "⚠️ La aplicación se ha cerrado."
read -p "Presiona Enter para cerrar esta ventana..."
