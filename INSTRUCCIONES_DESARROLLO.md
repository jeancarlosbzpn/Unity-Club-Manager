# Guía de Desarrollo para Unity Club

Esta guía te explica paso a paso cómo ejecutar la aplicación en **Modo de Desarrollo**.
Esto te permite ver los cambios en tiempo real sin tener que crear el instalador (`.dmg`) cada vez.

## Requisitos Previos
Asegúrate de tener la Terminal abierta.

## Paso 1: Abrir la Terminal en la carpeta del proyecto
Necesitas estar ubicado en la carpeta donde está el código (`Vencedores`).

1. Abre la aplicación **Terminal**.
2. Escribe el siguiente comando y presiona `Enter`:

```bash
cd /Users/jeancarlosbaez/Desktop/Vencedores
```

## Paso 2: Ejecutar el Comando de Desarrollo
Una vez dentro de la carpeta, ejecuta este comando para iniciar el sistema:

```bash
npm run electron:dev
```

### ¿Qué sucederá?
1. Verás texto en la terminal indicando que **Vite** se está iniciando.
2. Unos segundos después, se abrirá una ventana de **Electron** con la aplicación "Unity Club".

## Paso 3: Probar Cambios
*   Con la aplicación abierta, puedes hacer cambios en el código.
*   Al guardar el archivo (`Ctrl + S` o `Cmd + S`), la aplicación se actualizará automáticamente (o puedes presionar `Cmd + R` en la ventana de la aplicación para recargar).

## Paso 4: Detener la Aplicación
Cuando termines:
1. Cierra la ventana de la aplicación.
2. En la terminal, presiona `Ctrl + C` para detener el proceso.
