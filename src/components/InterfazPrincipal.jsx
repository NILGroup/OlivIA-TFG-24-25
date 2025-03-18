import { useState } from "react";
import ReactMarkdown from "react-markdown";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";


export default function InterfazPrincipal() {

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



    // Estado para controlar la visibilidad de las opciones adicionales
    const [showSimplificationOptions, setShowSimplificationOptions] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [unknownWords, setUnknownWords] = useState("");

    // Método para reformular toda la respuesta
    const requestSimplifiedResponse = () => {
        const simplifiedPrompt = `"${response} de la manera más sencilla y corta posible"`;
        sendCustomPrompt(simplifiedPrompt);
        setShowSimplificationOptions(false); // Ocultar opciones tras la acción
    };

    // Método para solicitar sinónimos del Diccionario Fácil
    const requestSynonyms = (words) => {
        if (words.trim()) {
            const synonymPrompt = `Dame un sinónimo y una muy corta y sencilla explicación de ${words}`;
            sendCustomPrompt(synonymPrompt);
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
    const speakText = (text) => {
        if (!window.speechSynthesis) {
            alert("Tu navegador no soporta la síntesis de voz.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
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
        setResponse("");
        setLoading(true);
        setShowChat(true);
        setShowHelpOptions(false);

        // Generar el prompt final usando la opción seleccionada + lo que escribió el usuario
        const finalPrompt = selectedOption?.id && selectedOption.id <= 6

            ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
            : prompt;

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer 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`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: finalPrompt }],
                }),
            });

            const data = await res.json();

            setResponse(data.choices?.[0]?.message?.content || "Sin respuesta :(");

            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo respuesta:", error);
            setResponse("Error al obtener la respuesta");
        }
        setLoading(false);
    };

    // Función específica para prompts personalizados (como reformulación o sinónimos)
    const sendCustomPrompt = async (customPrompt) => {
        if (!customPrompt.trim()) return;

        resetHelpOptions(); // Se asegura que se limpien las opciones adicionales

        setResponse("");
        setLoading(true);
        setShowChat(true);

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer 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`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: customPrompt }],
                }),
            });

            const data = await res.json();
            setResponse(data.choices?.[0]?.message?.content || "Sin respuesta :(");
            setShowHelpOptions(true);

        } catch (error) {
            console.error("Error obteniendo respuesta:", error);
            setResponse("Error al obtener la respuesta");
        }
        setLoading(false);
    };


    // BOTON PREGUNTA POST GENERAR RESPUESTA - Pedir un resumen de la respuesta generada
    const requestSummary = async () => {
        if (!response.trim()) return;
        setRequestingSummary(true);
        setLoading(true);

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer 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`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: `Resumir el siguiente texto: ${response}` }],
                }),
            });

            const data = await res.json();
            setResponse(data.choices?.[0]?.message?.content || "No se pudo generar el resumen.");
            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo resumen:", error);
            setResponse("Error al obtener el resumen.");
        }

        setRequestingSummary(false);
        setLoading(false);
    };

    // BOTON PREGUNTA POST GENERAR RESPUESTA - Pedir un ejemplo basado en la respuesta generada
    const requestExample = async () => {
        if (!response.trim()) return;
        setRequestingExample(true);
        setShowHelpOptions(false);
        setLoading(true);


        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer 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`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: `Dame un ejemplo de ${response}` }],
                }),
            });

            const data = await res.json();
            setResponse(data.choices?.[0]?.message?.content || "No se pudo generar un ejemplo.");
            setShowHelpOptions(true);
        } catch (error) {
            console.error("Error obteniendo ejemplo:", error);
            setResponse("Error al obtener el ejemplo.");
        }

        setRequestingExample(false);
        setLoading(false);
    };

    // BOTON PREGUNTA POST GENERAR RESPUESTA - Guardar chat en historial y empezar de nuevo
    const toggleHistory = () => setShowHistory(!showHistory);

    const saveChatToHistory = () => {
        const chatEntry = {
            prompt: selectedOption?.id && selectedOption.id <= 6
                ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
                : prompt,
            response: response,
            timestamp: new Date().toLocaleString(),
            isNew: true // Marcar el mensaje como "nuevo"
        };

        setChatHistory([...chatHistory.map(entry => ({ ...entry, isNew: false })), chatEntry]);
        setShowInitialOptions(false); // Cerrar opciones de ayuda
        setShowChat(false); // Volver a la pantalla principal
        setShowHistory(true); // Abrir el historial automáticamente
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
                                onClick={() => alert(`Pregunta: ${entry.prompt}\n\nRespuesta: ${entry.response}`)}
                            >
                                <div className="chat-preview">
                                    {entry.prompt.substring(0, 40)}
                                </div>
                                <div className="chat-timestamp">
                                    <small>{entry.timestamp}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


            {!showChat ? (
                <>
                    <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                    <h1 className="title">¿Qué exploramos hoy?</h1>

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

                    {/* BLOQUE QUE SE ACTUALIZA DINÁMICAMENTE */}
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
                    <div className="chat-container user-container">
                        <div className="chat-message user-message">{selectedOption?.id && selectedOption.id <= 6 ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}` : prompt}</div>
                    </div>
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

                    <div className="chat-container ai-container">
                        <div className="chat-message ai-message">
                            {loading ? "Cargando respuesta..." : <ReactMarkdown>{response}</ReactMarkdown>}
                        </div>
                    </div>

                    {chatFlow.map((entry, index) => (
                        <div
                            key={index}
                            className={`chat-container ${entry.type === "user" ? "user-container" : "ai-container"}`}
                        >
                            <div className={`chat-message ${entry.type === "user" ? "user-message" : "ai-message"}`}>
                                <ReactMarkdown>{entry.content}</ReactMarkdown>

                                {/* Iconos de audio y pausa posicionados a la derecha */}
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


                    {showHelpOptions && !requestingSummary && (
                        <>
                            {/* Asegura que los botones aparecen en un nuevo contenedor debajo */}
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
                                        placeholder="Escribe aquí las palabras que no comprendas, separadas por comas..."
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