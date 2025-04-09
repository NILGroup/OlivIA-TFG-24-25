import { useState } from "react";
import ReactMarkdown from "react-markdown";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function InterfazPrincipal({ summary }) {

    const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

    /** ================================
    *    RESULTADO QUESTIONARIO
    *  =================================
    */

    // Función para generar el prompt con la info del cuestionario
    const buildPrompt = (promptText) => {
        if (!summary) return promptText;

        const personalInfo = `
        Pero ten en cuenta estas instrucciones al responder:
        - Mi Discapacidad: ${summary.camino.join(", ") || "Ninguna"}
        - NO uses: ${summary.retos.join(", ") || "Ninguna"}
        - Quiero que me generes la repsuesta usando: ${summary.herramientas.join(", ") || "Ninguna"}
        `;

        return {
            displayPrompt: promptText,       // Lo que se mostrará en pantalla
            apiPrompt: `Hola, respondeme a esta pregunta: ${promptText}\n${personalInfo}` // Lo que se enviará a la API
        };
    };


    /** ================================
    *             ESTADOS
    *  =================================
    */

    // Controla la opción seleccionada del menú de preguntas
    const [selectedOption, setSelectedOption] = useState(null);
    // Controla el input de la pregunta del usuario
    const [prompt, setPrompt] = useState(""); // Separa el input del prompt final
    // Guarda la respuesta generada por la IA
    const [response, setResponse] = useState("");
    // Indica si la IA está procesando la respuesta
    const [loading, setLoading] = useState(false);
    // Controla si se está mostrando el chat (evita mostrar la pantalla inicial)
    const [showChat, setShowChat] = useState(false);
    // Para lo de escuchar el texto
    const [chatFlow, setChatFlow] = useState([]);


    /** ================================
    *   ESTADOS PARA BOTON DE REFORMULAR
    *  =================================
    */
    // Método para manejar el toggle del cuadro de texto de sinónimos
    const toggleSynonymInput = () => {
        setShowTextInput(!showTextInput);
        setUnknownWords("");
    };

    // Método para manejar la opción de "Responder en lenguaje más sencillo"
    const handleSimplification = () => {
        // Si ya está abierto, lo cerramos
        if (showSimplificationOptions) {
            setShowSimplificationOptions(false);  // Ocultar opciones adicionales
            setShowTextInput(false);              // Ocultar el cuadro de sinónimos si está abierto
        } else {
            // Si no estaba abierto, se muestra
            setShowSimplificationOptions(true);
        }
    };

    // Método para limpiar las opciones cuando se genere una nueva pregunta
    const resetHelpOptions = () => {
        setShowHelpOptions(false);
        setShowSimplificationOptions(false);
        setShowTextInput(false);
    };
    // Método para cerrar todas las opciones adicionales
    const closeRedButtonOptions = () => {
        setShowSimplificationOptions(false); // Ocultar opciones adicionales
        setShowTextInput(false);             // Ocultar el cuadro de sinónimos
    };

    // Función para obtener la última respuesta generada en el flujo del chat
    const getLastAIResponse = () => {
        const lastAIMessage = chatFlow
            .slice()
            .reverse()
            .find(entry => entry.type === "ai");

        return lastAIMessage ? lastAIMessage.content : "";
    };


    // Estado para controlar la visibilidad de las opciones adicionales
    const [showSimplificationOptions, setShowSimplificationOptions] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [unknownWords, setUnknownWords] = useState("");

    // Método para reformular toda la respuesta
    const requestSimplifiedResponse = () => {
        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;

        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible", "Reformular toda la respuesta");

        setShowSimplificationOptions(false);
    };

    // Método para solicitar sinónimos 
    const requestSynonyms = (words) => {
        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`);
            setShowTextInput(false);  // Ocultar el cuadro de texto
        } else {
            alert("Por favor, escribe algunas palabras para buscar sinónimos.");
        }
    };


    /** ================================
     *  ESTADOS PARA OPCIONES DE AYUDA
     *  ================================
     */
    const [showHelpOptions, setShowHelpOptions] = useState(false); // Muestra botones de ayuda tras la respuesta
    const [showUsefulQuestion, setShowUsefulQuestion] = useState(false); // Pregunta si la respuesta fue útil
    const [showInitialOptions, setShowInitialOptions] = useState(false); // Muestra las opciones iniciales después de responder
    const [showConfirmationButton, setShowConfirmationButton] = useState(false);

    // Estados para manejar botones de resumen y ejemplo
    const [requestingSummary, setRequestingSummary] = useState(false);
    const [requestingExample, setRequestingExample] = useState(false);

    // Estado para almacenar el historial de chats
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false); // Mostrar/ocultar historial
    const [activeChat, setActiveChat] = useState(null); // Almacena el chat activo
    const [isSavingChat, setIsSavingChat] = useState(false);

    // Estado para cambiar el icono de reproducir respuesta
    const [speechState, setSpeechState] = useState("idle"); // idle | playing | paused
    const [activeSpeechId, setActiveSpeechId] = useState(null); // ID del mensaje que se está leyendo


    /** =================================
     *  OPCIONES DE PREGUNTAS DISPONIBLES
     *  =================================
     */
    const options = [
        { id: 1, text: "Dame un ejemplo de", color: "yellow" },
        { id: 2, text: "Explícame con un ejemplo", color: "blue" },
        { id: 3, text: "Resume en pocas palabras", color: "green" },
        { id: 4, text: "¿Qué significa", color: "red", needsQuestionMark: true },
        { id: 5, text: "Dame sinónimos de", color: "purple" },
        { id: 6, text: "¿Cómo se hace", color: "orange", needsQuestionMark: true }
    ];

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setPrompt(""); // Vacía el input al cambiar de opción
    };

    const handleResetQuestion = () => {
        setSelectedOption(null);
        setPrompt("");
    };

    // Función para leer texto en voz alta
    const speakText = (text, id) => {
        if (!text.trim()) {
            alert("No hay texto para reproducir.");
            return;
        }

        if (!window.speechSynthesis) {
            alert("Tu navegador no soporta la síntesis de voz.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setActiveSpeechId(id);
            setSpeechState("playing");
        };
        utterance.onend = () => {
            setSpeechState("idle");
            setActiveSpeechId(null);
        };
        utterance.onerror = () => {
            setSpeechState("idle");
            setActiveSpeechId(null);
        };

        window.speechSynthesis.speak(utterance);
    };


    const toggleSpeech = (text, id) => {
        if (activeSpeechId !== id) {
            speakText(text, id);
        } else if (speechState === "playing") {
            window.speechSynthesis.pause();
            setSpeechState("paused");
        } else if (speechState === "paused") {
            window.speechSynthesis.resume();
            setSpeechState("playing");
        }
    };
    const [expandedResponses, setExpandedResponses] = useState({});

    const toggleExpanded = (index) => {
        setExpandedResponses((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Para el primer prompt
    const sendPrompt = async () => {
        if (!prompt.trim()) return;

        resetHelpOptions(); // Se asegura que se limpien las opciones adicionales

        setShowUsefulQuestion(false);
        setShowConfirmationButton(false);
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
            { type: "loading", content: "⌛ Cargando..." }
        ]);

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: apiPrompt }],
                }),
            });

            const data = await res.json();
            //     Eliminar el mensaje de "⌛ Cargando..."
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));

            // Añadir la respuesta al flujo del chat
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: data.choices?.[0]?.message?.content || "Sin respuesta :(" }
            ]);

            setShowHelpOptions(true);
            // await saveChatToHistory(false);

        } catch (error) {
            console.error("Error obteniendo respuesta:", error);

            // Eliminar el mensaje de "⌛ Cargando..." en caso de error
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));

            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: "Error al obtener la respuesta" }
            ]);

        }
        setLoading(false);
    };

    const sendCustomPrompt = async (customPrompt, context = "", displayOverride = null) => {
        if (!customPrompt.trim()) return;

        resetHelpOptions();
        setLoading(true);
        setShowChat(true);

        const { apiPrompt } = buildPrompt(
            context ? `${context} ${customPrompt}` : customPrompt
        );

        const displayPrompt = displayOverride || customPrompt;

        setChatFlow((prev) => [...prev, { type: "user", content: displayPrompt }]);
        setChatFlow((prev) => [...prev, { type: "loading", content: "⌛ Cargando..." }]);

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: apiPrompt }],
                }),
            });

            const data = await res.json();
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: data.choices?.[0]?.message?.content || "Sin respuesta :(" }
            ]);
            setShowHelpOptions(true);
            // await saveChatToHistory(false);
        } catch (error) {
            console.error("Error obteniendo respuesta:", error);
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: "Error al obtener la respuesta." }
            ]);
        }

        setLoading(false);
    };



    const requestSummary = async () => {
        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;

        await sendCustomPrompt(lastResponse, "Resumir el siguiente texto:", "Dame un resumen");
    };

    const requestExample = async () => {
        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;

        await sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:", "Explícame con un ejemplo");
    };


    // BOTON PREGUNTA POST GENERAR RESPUESTA - Guardar chat en historial y empezar de nuevo
    const toggleHistory = () => setShowHistory(!showHistory);


    const generateTitleFromChat = async () => {
        const conversation = chatFlow
            .filter(entry => entry.type === "user" || entry.type === "ai")
            .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
            .join("\n");

        const prompt = `Lee esta conversación y dime un título corto (máximo 7 palabras) que represente de qué se trata. No uses comillas, ni hagas una frase larga:\n\n${conversation}`;

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free", // o el modelo que uses
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            const data = await res.json();
            const aiTitle = data.choices?.[0]?.message?.content?.trim();

            return aiTitle || "Conversación guardada";
        } catch (error) {
            console.error("Error generando título:", error);
            return "Conversación guardada";
        }
    };


    const saveChatToHistory = async (clearAfter = true) => {
        if (chatFlow.length === 0) return;

        setIsSavingChat(true);

        const aiGeneratedTitle = await generateTitleFromChat();

        if (activeChat) {
            // Actualiza el historial activo
            const updated = chatHistory.map(entry =>
                entry === activeChat
                    ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                    : { ...entry, isNew: false }
            );
            setChatHistory(updated);
        } else {
            // Solo si no hay historial activo, se crea uno nuevo
            const chatEntry = {
                title: aiGeneratedTitle,
                flow: [...chatFlow],
                timestamp: new Date().toLocaleString(),
                isNew: true
            };
            setChatHistory([
                ...chatHistory.map(entry => ({ ...entry, isNew: false })),
                chatEntry
            ]);
        }

        if (clearAfter) {
            setShowUsefulQuestion(false);
            setSelectedOption(null);
            setPrompt("");
            setShowInitialOptions(false);
            setShowChat(false);
            setChatFlow([]);
            setShowHistory(true);
        }

        setShowHelpOptions(true);
        setIsSavingChat(false);
    };



    /** ================================
     *     RETORNO DE LA INTERFAZ 
     *  ================================
     */

    return (

        <div className="app-wrapper">
            <div className="header-bar">
                <button
                    className={`history-btn ${showHistory ? "open" : "closed"}`}
                    onClick={toggleHistory}
                >
                    {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
                </button>
                OlivIA



                {/* Menú lateral del historial */}
                <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
                    {chatHistory.length === 0 ? (
                        <p>Aún no hay chats guardados.</p>
                    ) : (
                        <ul>
                            {chatHistory.map((entry, index) => (
                                <li
                                    key={index}
                                    className={`chat-bubble ${entry.isNew ? "new-entry" : ""}`}
                                >
                                    <div className="chat-preview">
                                        {entry.title || "Chat sin título"}
                                    </div>

                                    <div className="chat-timestamp">
                                        <small>{entry.timestamp}</small>
                                    </div>
                                    {/* Botón para abrir o cerrar el chat */}
                                    {activeChat === entry ? (
                                        <button
                                            className="help-btn blue"
                                            onClick={async () => {
                                                if (activeChat) {
                                                    // Guarda los cambios antes de cerrar
                                                    const updated = chatHistory.map(entry =>
                                                        entry === activeChat
                                                            ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                                                            : entry
                                                    );
                                                    setChatHistory(updated);
                                                }

                                                setActiveChat(null);
                                                setChatFlow([]);
                                                setShowChat(false);
                                            }}
                                        >
                                            📁 Cerrar chat
                                        </button>

                                    ) : (
                                        <button
                                            className="help-btn blue"
                                            onClick={() => {
                                                setActiveChat(entry);
                                                setChatFlow([...entry.flow]); // Restaura el flujo completo del chat
                                                setShowChat(true);
                                                setShowHelpOptions(true);
                                            }}
                                        >
                                            📂 Abrir chat
                                        </button>

                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {activeChat && (
                <div className="chat-wrapper">
                    <div className="chat-container">
                        <div className="chat-message user-message">
                            {activeChat.prompt}
                        </div>
                        <div className="chat-message ai-message">
                            {activeChat.response}
                        </div>
                    </div>
                </div>
            )}

            {!showChat ? (
                <>
                    <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                    <h1 className="title">
                        {summary?.nombre ? `Hola ${summary.nombre}, ¿Qué vamos a aprender hoy?` : "Hola ¿Qué vamos a aprender hoy?"}
                    </h1>

                    {/* OPCIONES DE PREGUNTAS */}
                    <div className="box-container">
                        <div className="grid">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    className={`btn ${option.color}`}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option.text} ___{option.needsQuestionMark ? " ?" : ""}
                                </button>
                            ))}
                        </div>
                        <button className="custom-btn" onClick={handleResetQuestion}>
                            Formular una pregunta desde cero
                        </button>
                    </div>

                    <div className={`question-container ${selectedOption ? selectedOption.color : ""}`}>
                        <h3 className="question-title">{selectedOption ? selectedOption.text : "Formula una pregunta"}</h3>
                        <input
                            type="text"
                            className="question-input"
                            placeholder="Escribe aquí..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <button className="discover-btn" onClick={sendPrompt}>
                            🔍 ¡Descubrir Respuesta!
                        </button>
                    </div>
                </>
            ) : (
                <div className="chat-wrapper">

                    {requestingSummary && (
                        <div className="chat-container user-container">
                            <div className="chat-message user-message">Dame un resumen</div>
                        </div>
                    )}

                    {requestingExample && (
                        <div className="chat-container user-container">
                            <div className="chat-message user-message">Explícame con un ejemplo</div>
                        </div>
                    )}


                    <div className="chat-wrapper">
                        {chatFlow.map((entry, index) => (
                            <div
                                key={index}
                                className={`chat-container ${entry.type === "user" ? "user-container" : "ai-container"}`}
                            >
                                <div className={`chat-message ${entry.type === "user" ? "user-message" : "ai-message"}`}>
                                    <ReactMarkdown>
                                        {expandedResponses[index] || entry.content.length <= 1000
                                            ? entry.content
                                            : entry.content.slice(0, 1000) + "…"}
                                    </ReactMarkdown>

                                    {entry.type === "ai" && (
                                        <div className="ai-bottom-row">
                                            {entry.content.length > 1000 && (
                                                <button
                                                    className="see-more-btn"
                                                    onClick={() => toggleExpanded(index)}
                                                >
                                                    {expandedResponses[index] ? "Ver menos" : "Ver más"}
                                                </button>
                                            )}

                                            <button
                                                className="audio-btn"
                                                onClick={() => toggleSpeech(entry.content, index)}
                                                aria-label={
                                                    activeSpeechId !== index || speechState === "idle"
                                                        ? "Reproducir en voz alta"
                                                        : speechState === "playing"
                                                            ? "Pausar reproducción"
                                                            : "Reanudar reproducción"
                                                }
                                                title={
                                                    activeSpeechId !== index || speechState === "idle"
                                                        ? "🔊 Reproducir"
                                                        : speechState === "playing"
                                                            ? "⏸️ Pausar"
                                                            : "▶️ Reanudar"
                                                }
                                            >
                                                {activeSpeechId !== index || speechState === "idle"
                                                    ? "🔊"
                                                    : speechState === "playing"
                                                        ? "⏸️"
                                                        : "▶️"}
                                            </button>
                                        </div>
                                    )
                                    }

                                </div>
                            </div>
                        ))}
                    </div>


                    {showHelpOptions && !requestingSummary && (
                        <>
                            {/* Asegura que los botones aparecen en un nuevo contenedor debajo */}
                            <div className="chat-container">
                                <div className="robot-bubble">
                                    <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                                    <p>¿Quieres que te ayude a entenderlo mejor?</p>
                                </div>
                            </div>
                            <div className="chat-container">
                                <div className="help-buttons">
                                    <button
                                        className="help-btn blue"
                                        onClick={() => {
                                            closeRedButtonOptions();     // Ocultar opciones adicionales
                                            requestExample();      // Lógica del botón azul
                                        }}
                                    >
                                        Explícame con un ejemplo
                                    </button>

                                    <button
                                        className="help-btn green"
                                        onClick={() => {
                                            closeRedButtonOptions();     // Ocultar opciones adicionales
                                            requestSummary();      // Lógica del botón verde
                                        }}
                                    >
                                        Dame un resumen
                                    </button>

                                    <button
                                        className="help-btn red"
                                        onClick={handleSimplification}
                                    >
                                        Responder en lenguaje más sencillo
                                    </button>

                                    <button
                                        className="help-btn gray"
                                        onClick={() => {
                                            closeRedButtonOptions();     // Ocultar opciones adicionales
                                            setShowUsefulQuestion(true);
                                            setShowHelpOptions(false);
                                        }}
                                    >
                                        No, gracias
                                    </button>
                                </div>
                            </div>
                            {!showSimplificationOptions && (
                                <div className="chat-container">
                                    <div className="custom-followup-box">
                                        <h4 className="custom-followup-title"><strong>¿Prefieres formular la pregunta desde cero?</strong></h4>
                                        <textarea
                                            className="custom-followup-textarea"
                                            placeholder="Escribe aquí tu pregunta..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                        ></textarea>
                                        <button
                                            className="custom-followup-btn"
                                            onClick={async () => {
                                                await sendPrompt();
                                                setPrompt(""); // Limpia el campo tras enviar
                                            }}
                                        >
                                            🔍 ¡Descubrir Respuesta!                                        </button>
                                    </div>
                                </div>
                            )}


                        </>

                    )}
                    {showSimplificationOptions && (
                        <>
                            <div className="chat-container">
                                <div className="robot-bubble">
                                    <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                                    <p>¿Cómo quieres que te ayude?</p>
                                </div>
                            </div>

                            <div className="chat-container">
                                <div className="help-buttons">
                                    <button
                                        className="help-btn blue"
                                        onClick={requestSimplifiedResponse}  // Método para reformular toda la respuesta
                                    >
                                        📝 Reformular toda la respuesta
                                    </button>

                                    <button
                                        className="help-btn yellow"
                                        onClick={toggleSynonymInput}  // Método para alternar el cuadro de sinónimos
                                    >
                                        ✏️ Escribir palabras que no comprendo
                                    </button>
                                </div>
                            </div>

                            {/* Cuadro de texto para sinónimos SOLO si showTextInput está activo */}
                            {showTextInput && (
                                <div className="chat-container">
                                    <textarea
                                        className="textarea-synonyms"
                                        placeholder="Escribe aquí las palabras que no comprendas..."
                                        value={unknownWords}
                                        onChange={(e) => setUnknownWords(e.target.value)}
                                    ></textarea>

                                    <button
                                        className="synonyms-btn"
                                        onClick={() => requestSynonyms(unknownWords)}
                                    >
                                        🔍 Buscar sinónimos
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {isSavingChat && (
                        <div className="chat-container ai-container">
                            <div className="chat-message ai-message saving-msg">
                                💾 Guardando conversación...
                            </div>
                        </div>
                    )}

                    {showUsefulQuestion && !isSavingChat && !activeChat && (
                        <>
                            <div className="chat-container ai-container">
                                <div className="robot-bubble">
                                    <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                                    <p>¿Te ha quedado todo claro?</p>
                                </div>
                            </div>
                            <div className="chat-container ai-container">
                                <div className="help-buttons">
                                    <button
                                        className="help-btn gray"
                                        onClick={() => {
                                            setShowUsefulQuestion(false);   // Oculta la pregunta "¿Ha sido útil?"
                                            setShowHelpOptions(true);       // Muestra opciones de ayuda
                                            setShowConfirmationButton(true); // Activa el botón "Sí, todo claro"
                                        }}
                                    >
                                        🤔 No, tengo todavía dudas
                                    </button>
                                    <button
                                        className="help-btn green"
                                        onClick={async () => await saveChatToHistory()}
                                    >
                                        😊 Sí, todo claro
                                    </button>

                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}