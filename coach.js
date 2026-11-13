const { GoogleGenAI } = require("@google/genai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { modulo, actividad, userInput, userScores, pregunta, historial } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Falta configurar GEMINI_API_KEY en el entorno." })
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    let systemInstruction = `Eres una mentora ejecutiva sénior y coach experta en liderazgo femenino y posicionamiento ejecutivo, colaborando en el programa de Guido Cattaneo y Luisa Cárdenas. Tu tono es profesional, empático, directo y estratégico.`;

    let promptContext = `Contexto actual:\n- Módulo: ${modulo}\n- Actividad: ${actividad}\n- Respuestas: ${userInput}\n- Puntajes: ${JSON.stringify(userScores)}`;
    if (pregunta) promptContext += `\n\nPregunta de la usuaria: ${pregunta}`;

    const contents = [];
    if (historial && Array.isArray(historial)) {
      historial.forEach(h => {
        contents.push({ role: h.role === 'coach' ? 'model' : 'user', parts: [{ text: h.text }] });
      });
    }
    contents.push({ role: 'user', parts: [{ text: promptContext }] });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1000 }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta: response.text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Error interno con IA." })
    };
  }
};