# Configuración de la API

El navegador llama a `POST /.netlify/functions/coach`. El backend conserva el contrato `modulo`, `actividad`, `userInput`, `userScores`, `pregunta` e `historial`.

Configura en Netlify las variables `GEMINI_API_KEY` (obligatoria), `GEMINI_MODEL` (opcional), `GEMINI_THINKING_LEVEL` (opcional) y `COACH_DEBUG` (opcional; false en producción). No incluyas secretos en HTML, JS, repositorio ni capturas. Si la API no está configurada, el usuario recibe un mensaje y puede seguir trabajando localmente.
