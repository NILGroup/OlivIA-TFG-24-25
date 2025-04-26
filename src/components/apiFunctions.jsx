// apiFunctions.jsx
/**
 * Este módulo contiene funciones de conexión con diferentes APIs de lenguaje,
 * como Groq, OpenAI, u otras que se quieran añadir.
 */

const fetchIA = async ({
    url,
    model,
    apiKey,
    messages,
    temperature = 0.7,
    headers = {},
}) => {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                ...headers
            },
            body: JSON.stringify({
                model,
                messages,
                temperature
            }),
        });

        const data = await res.json();

        if (data.error) {
            console.error("Error de la API:", data.error.message);  // La API contestó, pero con un error.
            return `Error de servidor: ${data.error.message}`;
        }

        return data.choices?.[0]?.message?.content?.trim() || "Sin respuesta :/";

    } catch (error) {
        console.error("Error al obtener respuesta IA:", error);
        return "Error de conexión";
    }
};

// === FETCH DE GROQ ===
export const fetchFromGroq = (messages) => {
    return fetchIA({
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        apiKey: import.meta.env.VITE_GROQ_LLAMA_API_KEY1,
        messages
    });
};

// === AQUÍ PUEDES IR AÑADIENDO MÁS ===
// LUEGO EN LOS PROMPT, DEPENDIENDO DE CUAL QUEREMOS USAR, LLAMAMOS A UN FETCH O A OTRO
/*POR EJEMPLO:
    const fetchFromOpenAI = (messages) => {
    return fetchIA({
      url: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4",
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      messages
    });
  };
*/
