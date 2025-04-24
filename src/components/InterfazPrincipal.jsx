import { useState } from "react";
import usePromptFunctions from "./Prompts";
import ReactMarkdown from "react-markdown";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function InterfazPrincipal({ summary }) {


    /** ================================
    *             ESTADOS
    *  =================================
    */

    // Controla la opción seleccionada del menú de preguntas
    const [selectedOption, setSelectedOption] = useState(null);
    // Controla el input de la pregunta del usuario
    const [prompt, setPrompt] = useState(""); // Separa el input del prompt final
    // Indica si la IA está procesando la respuesta
    const [loading, setLoading] = useState(false);
    // Controla si se está mostrando el chat (evita mostrar la pantalla inicial)
    const [showChat, setShowChat] = useState(false);
    // el historial y conversacion que se mantiene con la IA
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


    const {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat
    } = usePromptFunctions({
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
        prompt,
        selectedOption
    });


    /** ================================
       *  ESTADOS PARA CONFIGURACIÓN
       *  ================================
       */

    const [showConfig, setShowConfig] = useState(false);
    // guardado de configuracion brillate
    const [savedEffect, setSavedEffect] = useState(false);

    // Lógica de edición
    const [editingField, setEditingField] = useState(null);
    const [tempSummary, setTempSummary] = useState({ ...summary });
    const [otraOpciones, setOtraOpciones] = useState({
        discapacidad: { activa: false, valor: "", guardado: false },
        retos: { activa: false, valor: "", guardado: false }
    });

    const getOptionsForField = (key) => {
        const options = {
            nombre: [], // No necesitas opciones para nombre, ya es campo libre

            discapacidad: [
                "TEA",
                "Dislexia",
                "TDAH",
                "Memoria",
                "Prefiero no responder",
                "Otra" // se puede agregar dinámicamente cuando se escribe en el textarea
            ],

            retos: [
                "Textos Largos",
                "Palabras Dificiles",
                "Organizar Ideas",
                "Mantener Atencion",
                "Memoria",
                "Otra"
            ],

            herramientas: [
                "ejemplo",       // 🖋️ Usar ejemplos
                "bullet",        // 📒 Respuestas en bullets
                "textocorto",    // 📃 Texto corto
                "frasescortas"   // ✂️ Frases cortas
            ]
        };

        return options[key] || [];
    };

    const getLabelForOption = (option) => {
        const labels = {
            "TEA": "TEA",
            "Dislexia": "Dislexia",
            "TDAH": "TDAH",
            "Memoria": "Memoria",
            "Prefiero no responder": "Prefiero no responder",
            "Textos Largos": "Textos largos",
            "Palabras Dificiles": "Palabras difíciles",
            "Organizar Ideas": "Organizar ideas",
            "Mantener Atencion": "Mantener la atención",
            "ejemplo": "Usar ejemplos",
            "bullet": "Respuestas en bullets",
            "textocorto": "Texto corto",
            "frasescortas": "Frases cortas"
        };
        return labels[option] || option;
    };

    const getEmojiForOption = (option) => {
        const emojis = {
            "TEA": "🧩",
            "Dislexia": "🔠",
            "TDAH": "⚡",
            "Memoria": "🧠",
            "Prefiero no responder": "❌",
            "Textos Largos": "📖",
            "Palabras Dificiles": "🧩",
            "Organizar Ideas": "📝",
            "Mantener Atencion": "🎯",
            "ejemplo": "🖋️",
            "bullet": "📒",
            "textocorto": "📃",
            "frasescortas": "✂️"
        };
        return emojis[option] || "🔧";
    };


    const toggleOption = (key, option) => {
        const current = tempSummary[key] || [];
        const exists = current.includes(option);

        let updated;

        if (option === "Otra") {
            if (exists) {
                // Se está apagando "Otra" -> quitamos cualquier opción "Otra - ..."
                updated = current.filter(o => !o.startsWith("Otra -") && o !== "Otra");

                setOtraOpciones(prev => ({
                    ...prev,
                    [key]: { activa: false, valor: "", guardado: false }
                }));
            } else {
                // Se está activando "Otra"
                updated = [...current, option];

                setOtraOpciones(prev => ({
                    ...prev,
                    [key]: { ...prev[key], activa: true }
                }));
            }
        } else {
            updated = exists
                ? current.filter(o => o !== option)
                : [...current, option];
        }

        setTempSummary({ ...tempSummary, [key]: updated });
    };


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

    // BOTON PREGUNTA POST GENERAR RESPUESTA - Guardar chat en historial y empezar de nuevo
    const toggleHistory = () => setShowHistory(!showHistory);

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

                <button
                    className={`config-btn ${showConfig ? "open" : "closed"}`}
                    onClick={() => setShowConfig(!showConfig)}
                >
                    {showConfig ? "⚙️ Cerrar Configuración" : "⚙️  Configuración"}
                </button>


                {/* Menú lateral del historial */}
                <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
                    {chatHistory.length === 0 ? (
                        <div className="no-chats-message">
                            <h3>Aún no hay chats guardados.</h3>
                        </div>) : (
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
            {showConfig && (
                <div className="config-panel">
                    <h2>🔧 Configuración del cuestionario</h2>

                    {Object.entries(summary)
                        .filter(([key]) => ["nombre", "discapacidad", "retos", "herramientas"].includes(key))
                        .map(([key]) => (
                            <div className="config-section" key={key}>
                                <div className="config-title-row">
                                    <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                                </div>

                                <div className="edit-options">
                                    {key === "nombre" ? (
                                        <input
                                            type="text"
                                            className="nombre-input"
                                            placeholder="Introduce tu nombre..."
                                            value={tempSummary.nombre}
                                            onChange={(e) =>
                                                setTempSummary({ ...tempSummary, nombre: e.target.value })
                                            }
                                        />
                                    ) : (
                                        <>
                                            {getOptionsForField(key).map(option => (
                                                <label key={option} className="config-toggle-option">
                                                    <span className="config-toggle-label">
                                                        {getEmojiForOption(option)} {getLabelForOption(option)}
                                                    </span>
                                                    <label className="switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={tempSummary[key]?.includes(option)}
                                                            onChange={() => {
                                                                toggleOption(key, option);
                                                                if (option === "Otra") {
                                                                    const isNowChecked = !tempSummary[key]?.includes("Otra");
                                                                    setOtraOpciones(prev => ({
                                                                        ...prev,
                                                                        [key]: {
                                                                            ...prev[key],
                                                                            activa: isNowChecked,
                                                                            guardado: false,
                                                                            valor: ""
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span className="slider"></span>
                                                    </label>
                                                </label>
                                            ))}

                                            {otraOpciones[key]?.activa && (
                                                <div className="other-input-container">
                                                    <textarea
                                                        className="custom-textarea"
                                                        placeholder={`Introduce tu ${key === "discapacidad" ? "discapacidad" : "reto"}...`}
                                                        value={otraOpciones[key].valor}
                                                        onChange={(e) =>
                                                            setOtraOpciones(prev => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], valor: e.target.value }
                                                            }))
                                                        }
                                                    ></textarea>

                                                    <button
                                                        className={`accept-btn ${otraOpciones[key].guardado ? "saved" : ""}`}
                                                        onClick={() => {
                                                            if (otraOpciones[key].valor.trim()) {
                                                                setTempSummary(prev => ({
                                                                    ...prev,
                                                                    [key]: [...prev[key], `Otra - ${otraOpciones[key].valor}`]
                                                                }));
                                                                setOtraOpciones(prev => ({
                                                                    ...prev,
                                                                    [key]: { ...prev[key], guardado: true }
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        {otraOpciones[key].guardado ? "✅ Guardado" : "✅ Guardar"}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}


                    <div className="edit-buttons-global">
                        <button className="cancel-btn" onClick={() => {
                            setTempSummary({ ...summary });
                            setEditingField(null);
                        }}>
                            ❌ Descartar cambios
                        </button>
                        <button
                            className={`save-btn ${savedEffect ? "saved-effect" : ""}`}
                            onClick={() => {
                                Object.keys(summary).forEach(key => {
                                    if (["nombre", "discapacidad", "retos", "herramientas"].includes(key)) {
                                        summary[key] = tempSummary[key];
                                    }
                                });

                                // Activa animación
                                setSavedEffect(true);

                                // Luego de 2 segundos, desactiva efecto y vuelve a texto original si quieres
                                setTimeout(() => {
                                    setSavedEffect(false);
                                }, 2000);
                            }}
                        >
                            {savedEffect ? "✅ Cambios guardados" : "✅  Guardar cambios"}
                        </button>
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
                        <button className="discover-btn" onClick={() => sendPrompt(prompt, selectedOption)}>
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
                                                await sendCustomPrompt(prompt);
                                                setPrompt(""); // Limpia el campo tras enviar
                                            }}
                                        >
                                            🔍 ¡Descubrir Respuesta!
                                        </button>

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