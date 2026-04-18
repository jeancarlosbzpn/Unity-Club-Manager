#!/bin/bash
# Script para construir la aplicación de Mac (.app)

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "📦 Instalando dependencias (por si acaso)..."
npm install

echo "🛠️ Construyendo la aplicación..."
npm run package

echo "✅ ¡Construcción completa!"
echo "📂 Busca tu app en la carpeta: $DIR/dist"
echo ""
open "$DIR/dist"
read -p "Presiona Enter para cerrar..."


