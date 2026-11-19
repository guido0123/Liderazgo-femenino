# Workbook de Liderazgo Femenino v2 (Guido Cattaneo) · despliegue en Netlify

Sitio estático (`public/`) + una Netlify Function (`netlify/functions/coach.js`) que llama a Gemini sin exponer la clave.

## Estructura
- `public/index.html`: panel de bienvenida de Guido (foto, bio y datos originales) y botón **«Comenzar mi experiencia de aprendizaje»**.
- `public/app.js`: etapas 0 a 5 (contexto, diagnósticos A y B, 6 actividades, Plan SMART dual, seguimiento, evaluación y PDF).
- `public/data.js`: reactivos de los diagnósticos, referentes, escenarios y enfoques. **Revísalos con Guido**: son borradores redactados a partir de la propuesta y del libro.
- `public/casos.js`: casos originales (Lagarde, Nooyi, Gates) extraídos del HTML anterior sin cambios.
- `public/styles.css`: CSS original (terracota, café, crema, Plus Jakarta Sans) + estilos nuevos.
- `netlify/functions/coach.js`: endpoint `/.netlify/functions/coach` (la misma ruta que usaba el HTML anterior; `/api/coach` no hace falta).

## Publicar en Netlify
1. Sube esta carpeta a tu repositorio de GitHub (reemplaza los archivos del proyecto anterior).
2. En Netlify: *Add new site > Import from Git*. `netlify.toml` ya define `publish = public` y `functions = netlify/functions`; no hay paso de build.
3. En *Site configuration > Environment variables* crea `GEMINI_API_KEY` (clave de Google AI Studio). Opcional: `GEMINI_MODEL` (por defecto `gemini-2.5-flash`).
4. Vuelve a desplegar. Sin la clave, el sitio funciona igual: las partes con IA usan preguntas y borradores locales.
5. Para probar en tu computadora: `npx netlify dev` (usa un `.env` local con la clave; `.gitignore` ya lo excluye).

## Decisiones de diseño (documentadas)
- **Ruta de diagnóstico**: «Desarrollar mi propio liderazgo» y «Desarrollar y promover» usan la Ruta A; «Promover» usa B; «Comprender» usa C. La Ruta C usa la misma escala de frecuencia, con reactivos de comprensión y aplicación conceptual.
- **Cálculo**: promedio por dimensión; «no aplica» se excluye; con menos de 2 respuestas válidas la dimensión muestra «Sin datos suficientes». Fortaleza = promedio ≥ 4; prioridad / barrera = las dos dimensiones más bajas bajo 3,5 (A) o 3 (B).
- **Privacidad**: la identidad (pregunta opcional) se guarda localmente y **no se envía a Gemini**.
- **Módulos**: A1 → módulos 1 a 3; A2 → 2; A3 → 4; A4 → 3; A5 → 5; A6 → 6, según el documento de cápsulas. PESTEL se presenta como herramienta complementaria.
- **Referentes**: Merkel y Ardern provienen del libro; Lagarde, Nooyi y Gates, del HTML original.
- **Guardado**: `localStorage` por perfil (`lf_v2:<perfil>`). No hay cuenta ni autenticación; la pantalla lo explica. La versión anterior (`liderazgo_femenino_v1`) nunca se borra; se copia como referencia. Importar un respaldo JSON crea un perfil nuevo, no sobrescribe.
- **Plan SMART**: 4 semanas, 4 acciones máximo, borrador editable; cada aprobación guarda una versión (v1, v2…) y registra cambios en el historial. El seguimiento no llama a la IA.
- **PDF**: se genera en el navegador con jsPDF (cdnjs) y crece en páginas según el contenido. Si jsPDF no carga, se abre la impresión del navegador.
- **Seguridad de la función**: valida método, tamaño (24 KB), modo, sanea el payload y verifica la forma del JSON de Gemini antes de responder.

## Límites a tener en cuenta
- No se incluyó el inventario unificado de recursos audiovisuales (no estaba adjunto); no se afirma nada sobre el contenido exacto de los videos.
- Las funciones de Netlify tienen un tiempo máximo por plan (10 s en el plan gratuito, salvo configuración). Si Gemini tarda más, la app continúa con el respaldo local.
- Se probaron la lógica de puntuación, el renderizado de todas las pantallas (DOM simulado) y la función con respuestas simuladas de Gemini. Falta una prueba manual en navegador y celular con tu clave real.
