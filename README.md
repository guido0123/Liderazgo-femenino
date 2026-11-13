# Workbook de Liderazgo Femenino y Posicionamiento Ejecutivo

Aplicación web interactiva construida sobre el HTML base seleccionado. Conserva el diagnóstico de 24 afirmaciones, los ocho dominios, la persistencia local y el acompañamiento del Coach mediante Netlify Function. Incorpora casos prácticos guiados, tres prioridades simultáneas durante 90 días, bitácora de 12 semanas y evaluación comparativa al día 90.

## Abrir localmente

Para revisar la interfaz basta con abrir `index.html` en Chrome o Edge. Para probar el endpoint de IA y las funciones de Netlify, usa Node 18 o superior:

```bash
npm install
npx netlify dev
```

## Configurar IA en Netlify

1. Crea una clave en Google AI Studio.
2. En Netlify abre **Site configuration → Environment variables**.
3. Agrega `GEMINI_API_KEY` con tu clave privada.
4. Opcionalmente define `GEMINI_MODEL`, `GEMINI_THINKING_LEVEL` y `COACH_DEBUG` usando `.env.example` como referencia.
5. Despliega de nuevo. La clave vive exclusivamente en el backend `netlify/functions/coach.js`; nunca la pegues en el HTML ni en JavaScript del navegador.

La función mantiene la ruta `/.netlify/functions/coach` y el contrato usado por el frontend. Sin credenciales y despliegue de la función, la aplicación funciona en sus módulos locales y muestra un aviso cuando se solicita la IA.

## Datos y privacidad

Las respuestas, prioridades y evidencias se guardan en `localStorage` del navegador. No hay una base de datos remota ni sincronización entre dispositivos configurada. Para cambiar de equipo, exporta o conserva tus datos localmente antes de borrar los datos del navegador.

## PDF / impresión

Los botones de descarga abren una vista imprimible A4. Selecciona **Guardar como PDF** en Chrome o Edge. Se usan símbolos de casillas construidos con CSS (no fuentes de iconos), estilos `@page`, márgenes A4 y reglas `break-inside` para reducir cortes. Verifica la vista previa en el navegador de destino antes de distribuir el documento.

## Estructura

- `index.html`: aplicación original mejorada e integración de módulos.
- `assets/`: logotipos separados e ilustraciones de los casos.
- `css/enhancements.css`, `css/print.css`: estilos de pantalla e impresión.
- `js/plan90.js`: casos, selección de prioridades, bitácora, evaluación y generación imprimible.
- `netlify/functions/coach.js`: backend IA heredado, sin claves incluidas.
- `netlify/functions/base_de_conocimiento.txt`, `casos_spec.json`: recursos de contexto del Coach.
- `docs/`: metodología, prompts, configuración, pruebas y despliegue.

## Pruebas

```bash
npm test
```

La persistencia es local. No se declara autenticación segura, almacenamiento multiusuario, ni despliegue probado desde este paquete.
