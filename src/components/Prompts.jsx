import { useCallback } from "react";

const usePromptFunctions = ({
    summary,
    chatFlow,
    setChatFlow,
    setPrompt,
    setLoading,
    setShowChat,
    setShowHelpOptions,
    setShowSimplificationOptions,
    setShowTextInput,
    resetHelpOptions,
    setActiveSpeechId,
    setSpeechState,
}) => {

    /*=========================
    *   FUNCIONES FETCH DE API
    * =========================*/

    // funcion generica del prompt
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
            return data.choices?.[0]?.message?.content?.trim() || "Sin respuesta :(";
        } catch (error) {
            console.error("Error al obtener respuesta IA:", error);
            return "Error al obtener la respuesta.";
        }
    };


    /* === FETCH DE GROQ - IA DE META LLAMA 4 === */
    const fetchFromGroq = (messages) => {
        return fetchIA({
            url: "https://api.groq.com/openai/v1/chat/completions",
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            apiKey: import.meta.env.VITE_GROQ_LLAMA_API_KEY,
            messages
        });
    };

    // AQUI SE AÑADARÍAN OTROS FETCH DE OTRAS API 
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

    /*====================================
    *    FUNCIONES GENERADORAS DE PROMPT
    * ====================================*/

    // PERSONALIZACIÓN DE RESPUESTA DE LA IA
    const buildPrompt = useCallback((promptText) => {
        if (!summary) return promptText;

        const personalInfo = `
        Pero ten en cuenta estas instrucciones al responder:
        - Mi Discapacidad: ${summary.discapacidad.join(", ") || "Ninguna"}
        - NO uses: ${summary.retos.join(", ") || "Ninguna"}
        - Quiero que me generes la respuesta usando: ${summary.herramientas.join(", ") || "Ninguna"}
        `;

        return {
            displayPrompt: promptText,
            apiPrompt: `Hola, respondeme a esta pregunta: ${promptText}\n${personalInfo}`,
        };
    }, [summary]);


    /* PRIMER PROMPT QUE SE LANZA */
    const sendPrompt = useCallback(async (prompt, selectedOption) => {
        if (!prompt.trim()) return;

        window.speechSynthesis.cancel();
        setActiveSpeechId(null);
        setSpeechState("idle");
        resetHelpOptions();

        setLoading(true);
        setShowChat(true);
        setShowHelpOptions(false);

        const { displayPrompt, apiPrompt } = buildPrompt(
            selectedOption?.id && selectedOption.id <= 6
                ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
                : prompt
        );

        setChatFlow((prev) => [
            ...prev,
            { type: "user", content: displayPrompt },
            { type: "loading", content: "⌛ Cargando..." },
        ]);

        const messages = [
            ...chatFlow
                .filter(entry => entry.type === "user" || entry.type === "ai")
                .map(entry => ({
                    role: entry.type === "user" ? "user" : "assistant",
                    content: entry.content,
                })),
            { role: "user", content: apiPrompt }
        ];

        const response = await fetchFromGroq(messages);

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);

        setShowHelpOptions(true);
        setLoading(false);
        setPrompt("");

    }, [chatFlow, buildPrompt]);

    /* PROMPT QUE SE LLAMA UNA VEZ DENTRO DEL CHAT */
    const sendCustomPrompt = useCallback(async (customPrompt, context = "", displayOverride = null) => {
        if (!customPrompt.trim()) return;

        window.speechSynthesis.cancel();
        setActiveSpeechId(null);
        setSpeechState("idle");

        resetHelpOptions();
        setLoading(true);
        setShowChat(true);

        const { apiPrompt } = buildPrompt(context ? `${context} ${customPrompt}` : customPrompt);
        const displayPrompt = displayOverride || customPrompt;

        setChatFlow((prev) => [
            ...prev,
            { type: "user", content: displayPrompt },
            { type: "loading", content: "⌛ Cargando..." }
        ]);

        const messages = [
            ...chatFlow
                .filter(entry => entry.type === "user" || entry.type === "ai")
                .map(entry => ({
                    role: entry.type === "user" ? "user" : "assistant",
                    content: entry.content,
                })),
            { role: "user", content: apiPrompt }
        ];

        const response = await fetchFromGroq(messages);

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);

        setShowHelpOptions(true);
        setLoading(false);
    }, [chatFlow, buildPrompt]);

    /* PROMPT QUE SE GENERA TITULO */
    const generateTitleFromChat = useCallback(async () => {

        const conversation = chatFlow
            .filter(entry => entry.type === "user" || entry.type === "ai")
            .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
            .join("\n");


        const titlePrompt = `Lee esta conversación y dime un título corto (máximo 7 palabras) que represente de qué se trata. No uses comillas, ni hagas una frase larga:\n\n${conversation}`;

        const messages = [{ role: "user", content: titlePrompt }];
        const response = await fetchFromGroq(messages);

        return response || "Conversación guardada";

    }, [chatFlow]);

    /*===================================================
    *    FUNCIONES PARA RESPONDER ANTE EL ÚLTIMO MENSAJE
    * ===================================================*/

    const getLastAIResponse = useCallback(() => {

        const lastAIMessage = chatFlow
            .slice()
            .reverse()
            .find((entry) => entry.type === "ai");

        return lastAIMessage ? lastAIMessage.content : "";

    }, [chatFlow]);


    const requestSummary = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Resumir el siguiente texto:", "Dame un resumen");

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestExample = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:", "Explícame con un ejemplo");

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestSimplifiedResponse = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible", "Reformular toda la respuesta");
        setShowSimplificationOptions(false);

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestSynonyms = useCallback((words) => {

        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`);
            setShowTextInput(false);
        } else {
            alert("Por favor, escribe algunas palabras para buscar sinónimos.");
        }

    }, [sendCustomPrompt]);

    return {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat,
    };
};

export default usePromptFunctions;
