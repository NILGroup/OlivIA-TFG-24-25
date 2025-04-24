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

    const API_KEY = import.meta.env.VITE_GROQ_LLAMA_API_KEY;

    /*==================================
    *    FUNCIONES GENERADORAS DE PROMPT
    * ==================================*/

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

    const getLastAIResponse = useCallback(() => {
        const lastAIMessage = chatFlow
            .slice()
            .reverse()
            .find((entry) => entry.type === "ai");
        return lastAIMessage ? lastAIMessage.content : "";
    }, [chatFlow]);

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

        const messages = chatFlow
            .filter((entry) => entry.type === "user" || entry.type === "ai")
            .map((entry) => ({
                role: entry.type === "user" ? "user" : "assistant",
                content: entry.content,
            }));

        messages.push({ role: "user", content: apiPrompt });

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    messages,
                    temperature: 0.7,
                }),
            });

            const data = await res.json();

            setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: data.choices?.[0]?.message?.content || "Sin respuesta :(" },
            ]);

            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo respuesta:", error);
            setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: "Error al obtener la respuesta." },
            ]);
        }

        setLoading(false);
        setPrompt("");
    }, [chatFlow, buildPrompt]);

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

        setChatFlow((prev) => [...prev, { type: "user", content: displayPrompt }]);
        setChatFlow((prev) => [...prev, { type: "loading", content: "⌛ Cargando..." }]);

        const messages = chatFlow
            .filter((entry) => entry.type === "user" || entry.type === "ai")
            .map((entry) => ({
                role: entry.type === "user" ? "user" : "assistant",
                content: entry.content,
            }));

        messages.push({ role: "user", content: apiPrompt });

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    messages,
                    temperature: 0.7,
                }),
            });

            const data = await res.json();
            setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: data.choices?.[0]?.message?.content || "Sin respuesta :(" },
            ]);
            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo respuesta:", error);
            setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: "Error al obtener la respuesta." },
            ]);
        }

        setLoading(false);
    }, [chatFlow, buildPrompt]);

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

    const generateTitleFromChat = useCallback(async () => {
        const conversation = chatFlow
            .filter(entry => entry.type === "user" || entry.type === "ai")
            .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
            .join("\n");

        const prompt = `Lee esta conversación y dime un título corto (máximo 7 palabras) que represente de qué se trata. No uses comillas, ni hagas una frase larga:\n\n${conversation}`;

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                }),
            });

            const data = await res.json();
            const aiTitle = data.choices?.[0]?.message?.content?.trim();

            return aiTitle || "Conversación guardada";
        } catch (error) {
            console.error("Error generando título:", error);
            return "Conversación guardada";
        }
    }, [chatFlow]);

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
