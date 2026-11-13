# Publicar manualmente en GitHub y Netlify

## GitHub
1. Crea un repositorio nuevo en GitHub.
2. Descomprime el ZIP y sube el contenido de la carpeta (no la carpeta contenedora) al repositorio.
3. Confirma que `index.html`, `assets/`, `css/`, `js/`, `netlify/` y `netlify.toml` estén en la raíz.
4. No subas `.env` ni claves. `.env.example` sí es seguro.

## Netlify
1. En Netlify elige **Add new site → Import an existing project**.
2. Conecta el repositorio de GitHub.
3. Deja el directorio de publicación como `.` y las funciones como `netlify/functions` (definido en `netlify.toml`).
4. Agrega `GEMINI_API_KEY` en Site configuration → Environment variables.
5. Despliega y prueba `/.netlify/functions/coach` desde la aplicación.
6. Comprueba en DevTools que no haya claves privadas en los recursos descargados.

Para pruebas locales: Node 18+, `npm install` y `npx netlify dev`.
