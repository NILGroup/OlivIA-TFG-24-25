/**
 * InterfazPrincipal.jsx
 *
 * Este componente es el centro de la experiencia conversacional con OlivIA.
 * Administra la lógica y estados globales: chat, historial, configuración,
 * generación de preguntas y respuestas, interacción con la IA, y personalización
 * basada en el cuestionario inicial (`summary`).
 *
 * Contiene la lógica para:
 * - Mostrar preguntas predefinidas o personalizadas
 * - Procesar y mostrar respuestas generadas por IA
 * - Controlar botones de ayuda, resumen, ejemplos, sinónimos y simplificación
 * - Gestionar historial de conversaciones y configuración del perfil del usuario
 */

import { useState } from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

import usePromptFunctions from "./Prompts";
import ConfigPanel from "./ConfigPanel";
import ChatHistory from "./ChatHistory";

import Chat from "./Chat";
import BotonesInteraccion from "./BotonesInteraccion";

export default function InterfazPrincipal({ summary }) {


    /** ===============================
    *    ESTADOS PRINCIPALES Y DE CHAT
    *  ================================
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


    /** ============================================
     *  ESTADOS DE PREGUNTAS PARA HACER DISPONIBLES
     *  ============================================
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


    /** =====================================
    *   ESTADOS PARA BOTONES DE RESPUESTA IA
    *  ======================================
    */

    // Método para limpiar las opciones cuando se genere una nueva pregunta
    const resetHelpOptions = () => {
        setShowHelpOptions(false);
        setShowSimplificationOptions(false);
        setShowTextInput(false);
    };

    //=== ESTADOS PARA BOTON DE RESUMEN Y EJEMPLO  ===
    const [requestingSummary, setRequestingSummary] = useState(false);
    const [requestingExample, setRequestingExample] = useState(false);


    /** =========================================
    *   ESTADOS Y LÓGICA PARA BOTON DE REFORMULAR
    *  ==========================================
    */

    // Estado para controlar la visibilidad de las opciones adicionales
    const [showSimplificationOptions, setShowSimplificationOptions] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [unknownWords, setUnknownWords] = useState("");

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
    // Método para cerrar todas las opciones adicionales
    const closeRedButtonOptions = () => {
        setShowSimplificationOptions(false); // Ocultar opciones adicionales
        setShowTextInput(false);             // Ocultar el cuadro de sinónimos
    };


    /** ====================================
     *  ESTADOS PARA BOTÓN DE "NO, GRACIAS"
     *  ====================================
     */
    const [showHelpOptions, setShowHelpOptions] = useState(false); // Muestra botones de ayuda tras la respuesta
    const [showUsefulQuestion, setShowUsefulQuestion] = useState(false); // Pregunta si la respuesta fue útil
    //const [showInitialOptions, setShowInitialOptions] = useState(false); // Muestra las opciones iniciales después de responder
    const [showConfirmationButton, setShowConfirmationButton] = useState(false);


    /** ========================================
     *  ESTADOS Y LÓGICA PARA ESCUCHAR RESPUESTA
     *  ========================================
    */

    // Estado para cambiar el icono de reproducir respuesta
    const [speechState, setSpeechState] = useState("idle"); // idle | playing | paused
    const [activeSpeechId, setActiveSpeechId] = useState(null); // ID del mensaje que se está leyendo


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


    /** ================================
    *  ESTADOS PARA CARGAR A LOS PROMPTS
    *  ================================
    */

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

    /** ===================================
     *  ESTADOS Y LÓGICA PARA EL HISTORIAL
     *  ===================================
     */

    // Estado para almacenar el historial de chats
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false); // Mostrar/ocultar historial
    const [activeChat, setActiveChat] = useState(null); // Almacena el chat activo
    const [isSavingChat, setIsSavingChat] = useState(false);

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
            //setShowInitialOptions(false);
            setShowChat(false);
            setChatFlow([]);
            setShowHistory(true);
        }

        setShowHelpOptions(true);
        setIsSavingChat(false);
    };


    /** ================================
    *  ESTADOS PARA CONFIGURACIÓN
    *  ================================
    */

    const [showConfig, setShowConfig] = useState(false);
    // guardado de configuracion brillate
    const [savedEffect, setSavedEffect] = useState(false);

    // === PARA EDITAR LO QUE YA ESTABA SELECCIONADO ANTERIORMENTE EN EL CUESIONARIO ===
    const [editingField, setEditingField] = useState(null);
    const [tempSummary, setTempSummary] = useState({ ...summary });

    const [otraOpciones, setOtraOpciones] = useState({
        discapacidad: { activa: false, valor: "", guardado: false },
        retos: { activa: false, valor: "", guardado: false }
    });

    /** ================================
     *     RETORNO DE LA INTERFAZ 
     *  ================================
     */

    return (

        <div className="app-wrapper">
            <div className="header-bar">
                OlivIA

                <button
                    className={`history-btn ${showHistory ? "open" : "closed"}`}
                    onClick={toggleHistory}
                >
                    {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
                </button>

                <button
                    className={`config-btn ${showConfig ? "open" : "closed"}`}
                    onClick={() => setShowConfig(!showConfig)}
                >
                    {showConfig ? "⚙️ Cerrar Configuración" : "⚙️  Configuración"}
                </button>

                {/*LÓGICA HISTORIAL*/}
                <ChatHistory
                    showHistory={showHistory}
                    chatHistory={chatHistory}
                    activeChat={activeChat}
                    chatFlow={chatFlow}
                    setActiveChat={setActiveChat}
                    setChatFlow={setChatFlow}
                    setShowChat={setShowChat}
                    setShowHelpOptions={setShowHelpOptions}
                    setChatHistory={setChatHistory}
                />

            </div>
            {/*LÓGICA CONFIGURACIÓN*/}
            {showConfig && (
                <ConfigPanel
                    summary={summary}
                    tempSummary={tempSummary}
                    setTempSummary={setTempSummary}
                    otraOpciones={otraOpciones}
                    setOtraOpciones={setOtraOpciones}
                    savedEffect={savedEffect}
                    setSavedEffect={setSavedEffect}
                    setEditingField={setEditingField}
                />
            )}
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

            {/*GENERADOR/SELECCIONADOR DE PREGUNTA*/}
            {!showChat ? (
                <>
                    {/* Logo y saludo inicial personalizado */}
                    <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                    <h1 className="title">
                        {summary?.nombre
                            ? `Hola ${summary.nombre}, ¿Qué vamos a aprender hoy?`
                            : "Hola ¿Qué vamos a aprender hoy?"}
                    </h1>

                    {/* Opciones de preguntas predefinidas */}
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

                        {/* Botón para escribir una pregunta personalizada */}
                        <button className="custom-btn" onClick={handleResetQuestion}>
                            Formular una pregunta desde cero
                        </button>
                    </div>

                    {/* Input para la pregunta */}
                    <div className={`question-container ${selectedOption ? selectedOption.color : ""}`}>
                        <h3 className="question-title">
                            {selectedOption ? selectedOption.text : "Formula una pregunta"}
                        </h3>

                        <input
                            type="text"
                            className="question-input"
                            placeholder="Escribe aquí..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />

                        <button
                            className="discover-btn"
                            onClick={() => sendPrompt(prompt, selectedOption)}
                        >
                            🔍 ¡Descubrir Respuesta!
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/*LÓGICA GENERADOR DE RESPUESTA Y MANEJO CHAT*/}
                    <Chat
                        chatFlow={chatFlow}
                        expandedResponses={expandedResponses}
                        toggleExpanded={toggleExpanded}
                        toggleSpeech={toggleSpeech}
                        activeSpeechId={activeSpeechId}
                        speechState={speechState}
                    />

                    {/*LÓGICA BOTONES INTERACCIÓN CON RESPUESTA*/}
                    <BotonesInteraccion
                        prompt={prompt}
                        setPrompt={setPrompt}
                        showHelpOptions={showHelpOptions}
                        showSimplificationOptions={showSimplificationOptions}
                        showTextInput={showTextInput}
                        requestingSummary={requestingSummary}
                        requestingExample={requestingExample}
                        unknownWords={unknownWords}
                        setUnknownWords={setUnknownWords}
                        requestExample={requestExample}
                        requestSummary={requestSummary}
                        requestSimplifiedResponse={requestSimplifiedResponse}
                        requestSynonyms={requestSynonyms}
                        toggleSynonymInput={toggleSynonymInput}
                        handleSimplification={handleSimplification}
                        closeRedButtonOptions={closeRedButtonOptions}
                        setShowHelpOptions={setShowHelpOptions}
                        setShowUsefulQuestion={setShowUsefulQuestion}
                        showUsefulQuestion={showUsefulQuestion}
                        showConfirmationButton={showConfirmationButton}
                        setShowConfirmationButton={setShowConfirmationButton}
                        saveChatToHistory={saveChatToHistory}
                        sendCustomPrompt={sendCustomPrompt}
                    />
                </>
            )}


        </div>
    );
}