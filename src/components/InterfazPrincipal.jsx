import { useState } from "react";
import ReactMarkdown from "react-markdown";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function InterfazPrincipal({ summary }) {

    const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

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
        const lastResponse = getLastAIResponse();  //   Obtener la última respuesta del flujo del chat
        if (!lastResponse.trim()) return;

        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible");

        setShowSimplificationOptions(false); // Ocultar opciones tras la acción
    };


    // Método para solicitar sinónimos 
    const requestSynonyms = (words) => {
        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de");
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
    const speakText = () => {
        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) {
            alert("No hay texto para reproducir.");
            return;
        }

        if (!window.speechSynthesis) {
            alert("Tu navegador no soporta la síntesis de voz.");
            return;
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(lastResponse);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    };
    const pauseSpeech = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    };

    // Función para reanudar la lectura
    const resumeSpeech = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
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

    const sendCustomPrompt = async (customPrompt, context = "") => {
        if (!customPrompt.trim()) return;

        resetHelpOptions();
        setLoading(true);
        setShowChat(true);

        const { displayPrompt, apiPrompt } = buildPrompt(
            context ? `${context} ${customPrompt}` : customPrompt
        );

        setChatFlow((prev) => [...prev, { type: "user", content: displayPrompt }]);

        //  Mostrar mensaje temporal de "⌛ Cargando..."
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

            //     Eliminar el mensaje de "⌛ Cargando..."
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));

            //  Añadir la respuesta generada al flujo del chat
            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: data.choices?.[0]?.message?.content || "Sin respuesta :(" }
            ]);

            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo respuesta:", error);

            //     Eliminar el mensaje de "⌛ Cargando..." en caso de error
            setChatFlow((prev) => prev.filter(entry => entry.type !== "loading"));

            setChatFlow((prev) => [
                ...prev,
                { type: "ai", content: "Error al obtener la respuesta." }
            ]);
        }

        setLoading(false);
    };


    // Solicitar un resumen usando sendCustomPrompt
    const requestSummary = async () => {
        const lastResponse = getLastAIResponse();  //   Obtener la última respuesta del flujo del chat
        if (!lastResponse.trim()) return;

        await sendCustomPrompt(lastResponse, "Resumir el siguiente texto:");
    };

    // Solicitar un ejemplo usando sendCustomPrompt
    const requestExample = async () => {
        const lastResponse = getLastAIResponse();  //   Obtener la última respuesta del flujo del chat
        if (!lastResponse.trim()) return;

        await sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:");
    };

    // BOTON PREGUNTA POST GENERAR RESPUESTA - Guardar chat en historial y empezar de nuevo
    const toggleHistory = () => setShowHistory(!showHistory);

    const saveChatToHistory = () => {
        if (chatFlow.length === 0) return;

        const chatEntry = {
            title: chatFlow[0]?.content || "Chat sin título",  // Primer mensaje como título
            flow: [...chatFlow],  // Guarda todo el flujo del chat
            timestamp: new Date().toLocaleString(),
            isNew: true
        };

        setChatHistory([...chatHistory.map(entry => ({ ...entry, isNew: false })), chatEntry]);
        setShowUsefulQuestion(false);
        setSelectedOption(null);  // Reinicia la opción seleccionada
        setPrompt("");            // Borra el texto del prompt

        setShowInitialOptions(false);
        setShowChat(false);
        setShowHistory(true);
        setChatFlow([]);
    };



    /** ================================
     *     RETORNO DE LA INTERFAZ 
     *  ================================
     */

    return (

        <div className="app-wrapper">
            <div className="header-bar">OlivIA</div>

            {/* Botón para abrir/cerrar el historial */}
            <button
                className={`history-btn ${showHistory ? "open" : "closed"}`}
                onClick={toggleHistory}
            >
                {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
            </button>

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
                                        onClick={() => {
                                            setActiveChat(null);  // Limpiar el chat activo
                                            setChatFlow([]);       // Vaciar el flujo de mensajes
                                            setShowChat(false);    // Ocultar el chat
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
                                    <ReactMarkdown>{entry.content}</ReactMarkdown>

                                    {entry.type === "ai" && (
                                        <div className="icon-container">
                                            <button
                                                className="audio-btn"
                                                onClick={() => speakText(entry.content)}
                                                aria-label="Reproducir en voz alta"
                                                title="Reproducir en voz alta"
                                            >
                                                🔊
                                            </button>

                                            <button
                                                className="pause-btn"
                                                onClick={pauseSpeech}
                                                aria-label="Pausar reproducción"
                                                title="Pausar reproducción"
                                            >
                                                ⏸️
                                            </button>

                                            <button
                                                className="resume-btn"
                                                onClick={resumeSpeech}
                                                aria-label="Reanudar reproducción"
                                                title="Reanudar reproducción"
                                            >
                                                ▶️
                                            </button>
                                        </div>

                                    )}
                                </div>
                            </div>
                        ))}
                    </div>


                    {showHelpOptions && !activeChat && !requestingSummary && (
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


                    {showUsefulQuestion && (
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
                                        onClick={saveChatToHistory}
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