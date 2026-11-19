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
- **Ruta de diagnóstico**: «Desarrollar mi propio liderazgo» y «Desarrollar y promover» usan la Ruta A; «Promover» usa B; «Comprender» usa C. La Ruta C usa una escala de dominio percibido (no frecuencia) y las actividades contrastan la comprensión declarada con evidencias aplicadas.
- **Cálculo**: promedio por dimensión; «no aplica» se excluye; con menos de 2 respuestas válidas la dimensión muestra «Sin datos suficientes». Fortaleza = promedio ≥ 4; prioridad / barrera = las dos dimensiones más bajas bajo 3,5 (A) o 3 (B).
- **Privacidad**: la identidad (pregunta opcional) se guarda localmente y **no se envía a Gemini**.
- **Módulos**: A1 → módulos 1 a 3; A2 → 2; A3 → 4; A4 → 3; A5 → 5; A6 → 6, según el documento de cápsulas. PESTEL se presenta como herramienta complementaria.
- **Referentes**: Merkel y Ardern provienen del libro; Lagarde, Nooyi y Gates, del HTML original.
- **Guardado**: `localStorage` por perfil (`lf_v2:<perfil>`). No hay cuenta ni autenticación; la pantalla lo explica. La versión anterior (`liderazgo_femenino_v1`) nunca se borra; se copia como referencia. Importar un respaldo JSON crea un perfil nuevo, no sobrescribe.
- **Plan SMART**: 4 semanas, 4 acciones máximo, borrador editable; se requiere evidencia de las seis actividades y campos SMART completos para aprobar; cada aprobación guarda una versión (v1, v2…). Si cambia una acción, su seguimiento anterior queda archivado y la nueva empieza pendiente, conservando el seguimiento de acciones idénticas. El seguimiento no llama a la IA.
- **PDF**: se genera en el navegador con jsPDF (cdnjs) y crece en páginas según el contenido. Si jsPDF no carga, se abre la impresión del navegador. jsPDF con fuente estándar conserva acentos en español, pero otros caracteres Unicode especiales se sustituyen para evitar pérdidas invisibles. Comprueba visualmente el PDF antes de distribuirlo.
- **Seguridad de la función**: valida método, tamaño (24 KB), modo, sanea el payload y verifica la forma del JSON de Gemini antes de responder.

## Límites a tener en cuenta
- No se incluyó el inventario unificado de recursos audiovisuales (no estaba adjunto); no se afirma nada sobre el contenido exacto de los videos.
- Las funciones de Netlify tienen un tiempo máximo por plan (10 s en el plan gratuito, salvo configuración). Si Gemini tarda más, la app continúa con el respaldo local.
- Se probaron la lógica de puntuación, el renderizado de todas las pantallas (DOM simulado) y la función con respuestas simuladas de Gemini. Falta una prueba manual en navegador y celular con tu clave real.

## Correcciones de esta versión (revisión de Netlify)
- Guardado local reforzado: escritura inmediata al cambiar perfiles, descargar respaldo, generar PDF y ocultar/cerrar la pestaña.
- Importación JSON con comprobación de versión y estructura, límite de 2 MB y protección básica contra claves peligrosas en la mezcla de datos. Importa siempre como perfil nuevo.
- Completitud de actividades: comprobación de campos esenciales de las seis actividades antes de generar y aprobar el plan. Las etapas siguen siendo navegables para consultar información.
- Escala de dominio percibido para la Ruta C. El cambio de propósito reinicia las respuestas del Diagnóstico A tras confirmación, evitando cruzar reactivos entre rutas.
- Las dos metas necesitan formulación, justificación, indicador, criterio de éxito, recursos y plazo; las cuatro acciones semanales necesitan texto y meta asignada. Aun así, la revisión humana es indispensable: una comprobación de campos no garantiza que el contenido sea realmente SMART.
- Aprobaciones posteriores archivan el seguimiento antiguo si cambian las acciones y reinician solo las nuevas.
- PDF con reemplazo explícito de signos incompatibles con la fuente estándar y marca de fecha de actualización.

## Comprobaciones realizadas y pendientes
- Ejecutadas: `node --check` de los scripts; pruebas de la función Netlify con solicitudes erróneas y una respuesta de Gemini simulada.
- Pendientes: prueba integral visual en navegador y móvil, PDF con textos extensos y caracteres especiales, llamada real a Gemini con clave válida y despliegue en Netlify. El entorno de pruebas bloqueó abrir la web en un navegador automatizado; no se declara esa prueba como superada.
- **Seguridad de uso comercial:** el endpoint público no implementa autenticación ni una limitación de solicitudes resistente entre instancias. Antes de abrir a usuarios reales, incorpora control de acceso/rate limiting en una capa persistente y define cuotas y alertas de gasto de Gemini. El tamaño máximo de petición y el saneamiento del payload no equivalen a protección contra abuso.

## Actualizar por GitHub (sin modificar GitHub desde esta entrega)
1. Descomprime el ZIP: en su **raíz** deben quedar `netlify.toml`, `public/`, `netlify/`, `README.md` y `.env.example`.
2. Sube esos archivos y carpetas a la raíz de tu repositorio, no una carpeta contenedora.
3. Conecta el repositorio desde Netlify o selecciona **Deploys > Trigger deploy** si ya está conectado.
4. Verifica en Netlify que el directorio de publicación sea `public` y el de funciones `netlify/functions` (definidos en `netlify.toml`). No hace falta comando de build.
5. En **Project configuration / Environment variables**, establece `GEMINI_API_KEY` con la clave de Google AI Studio. No subas la clave a GitHub. Despliega de nuevo.
6. Comprueba `/.netlify/functions/coach`: una visita GET debería mostrar un error de método 405 (es normal); prueba la generación desde la web para validar un POST real.
7. Prueba el recorrido completo y descarga un respaldo JSON antes de cambiar proyectos.
