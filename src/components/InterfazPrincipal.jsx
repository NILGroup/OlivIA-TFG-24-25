import { useState } from "react";
import ReactMarkdown from "react-markdown";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function InterfazPrincipal() {

    /** ================================
    *  ESTADOS
    *  ================================
    */

    // Controla la opción seleccionada del menú de preguntas
    const [selectedOption, setSelectedOption] = useState(null);

    // Controla el input de la pregunta del usuario
    const [prompt, setPrompt] = useState("");

    // Guarda la respuesta generada por la IA
    const [response, setResponse] = useState("");

    // Indica si la IA está procesando la respuesta
    const [loading, setLoading] = useState(false);

    // Controla si se está mostrando el chat (evita mostrar la pantalla inicial)
    const [showChat, setShowChat] = useState(false);

    /** ================================
     *  ESTADOS PARA OPCIONES DE AYUDA
     *  ================================
     */
    const [showHelpOptions, setShowHelpOptions] = useState(false); // Muestra botones de ayuda tras la respuesta
    const [showUsefulQuestion, setShowUsefulQuestion] = useState(false); // Pregunta si la respuesta fue útil
    const [showInitialOptions, setShowInitialOptions] = useState(false); // Muestra las opciones iniciales después de responder

    // Estados para manejar botones de resumen y ejemplo
    const [requestingSummary, setRequestingSummary] = useState(false);
    const [requestingExample, setRequestingExample] = useState(false);

    /** ================================
     *  OPCIONES DE PREGUNTAS DISPONIBLES
     *  ================================
     */
    const options = [
        { id: 1, text: "Dame un ejemplo de", color: "yellow" },
        { id: 2, text: "Explícame con un ejemplo", color: "blue" },
        { id: 3, text: "Resume en pocas palabras", color: "green" },
        { id: 4, text: "¿Qué significa", color: "red", needsQuestionMark: true },
        { id: 5, text: "Dame sinónimos de", color: "purple" },
        { id: 6, text: "¿Cómo se hace", color: "orange", needsQuestionMark: true }
    ];


    /** ================================
     *  FUNCIONES PARA SOLICITAR RESPUESTAS
     *  ================================
     */


    // Enviar una pregunta al modelo de IA
    const sendPrompt = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setShowChat(true);
        setResponse("");
        setShowHelpOptions(false);

        const selectedText = selectedOption?.id && selectedOption.id <= 6
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
                    messages: [{ role: "user", content: selectedText }],
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

    /** ================================
     *  RETORNO DE LA INTERFAZ 
     *  ================================
     */

    return (
        <div className="app-wrapper">
            <div className="header-bar">OlivIA</div>
            {!showChat ? (
                <>
                    <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />

                    <h1 className="title">¿Qué exploramos hoy?</h1>
                    {selectedOption && (
                        <div className="back-container">
                            <button className="back-btn" onClick={() => {
                                setSelectedOption(null);
                                setPrompt("");
                            }}>
                                Volver
                            </button>
                        </div>
                    )}
                    {!selectedOption ? (
                        <div className="box-container">
                            <div className="grid">
                                {options.map((option) => (
                                    <button
                                        key={option.id}
                                        className={`btn ${option.color}`}
                                        onClick={() => setSelectedOption(option)}
                                    >
                                        {option.text} ___{option.needsQuestionMark ? " ?" : ""}
                                    </button>
                                ))}
                            </div>
                            <div className="custom-question-container">
                                <button
                                    className="btn custom-btn"
                                    onClick={() => setSelectedOption({ id: "custom", text: "", color: "gray" })}
                                >
                                    Formular una pregunta desde cero
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={`expanded-container ${selectedOption.color}`}>
                                <h1 className="title">
                                    <span className="question-wrapper">
                                        {selectedOption.text}
                                        <input
                                            type="text"
                                            className="input-box centered-input"
                                            placeholder="Escribe aquí..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                        />
                                        {selectedOption.needsQuestionMark ? " ?" : ""}
                                    </span>
                                </h1>
                            </div>
                            <div className="discover-container">
                                <button className="discover-btn" onClick={sendPrompt}>
                                    🔍 ¡Descubrir Respuesta!
                                </button>
                            </div>
                        </>
                    )}
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
                                    <button className="help-btn blue" onClick={requestExample}>Explícame con un ejemplo</button>
                                    <button className="help-btn green" onClick={requestSummary}>Dame un resumen</button>
                                    <button className="help-btn red">Responder en lenguaje más sencillo</button>
                                    <button className="help-btn gray" onClick={() => {
                                        setShowHelpOptions(false);
                                        setShowUsefulQuestion(true);
                                    }}>No, gracias</button>
                                </div>
                            </div>
                        </>
                    )}

                    {showUsefulQuestion && (
                        <>
                            <div className="chat-container ai-container">
                                <div className="robot-bubble">
                                    <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                                    <p>¿Esta respuesta ha sido útil?</p>
                                </div>
                            </div>
                            <div className="chat-container ai-container">
                                <div className="help-buttons">
                                    <button className="help-btn green" onClick={() => setShowInitialOptions(true)}>Sí, todo claro</button>
                                    <button className="help-btn gray" onClick={() => {
                                        setShowUsefulQuestion(false);
                                        setShowHelpOptions(true);
                                    }}>No, tengo dudas</button>
                                </div>
                            </div>
                        </>
                    )}

                    {showInitialOptions && (
                        <>
                            <div className="chat-container ai-container">
                                <div className="robot-bubble">
                                    <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                                    <p>Las mejores aventuras empiezan con una pregunta, ¿quieres hacer otra?</p>
                                </div>
                            </div>
                            <div className="chat-container ai-container">
                                <div className="grid">
                                    {options.map((option) => (
                                        <button
                                            key={option.id}
                                            className={`btn ${option.color}`}
                                            onClick={() => {
                                                setSelectedOption(option); // Selecciona la nueva opción
                                                setResponse(""); // Borra la respuesta anterior
                                                setPrompt(""); // Limpia el input de la pregunta
                                                setShowChat(false); // Vuelve al expanded-container
                                                setLoading(false); // Reinicia el estado de carga
                                                setShowHelpOptions(false);  // Esconde opciones de ayuda anteriores
                                                setShowUsefulQuestion(false); // Oculta la pregunta de "¿Te fue útil?"
                                                setShowInitialOptions(false); // Oculta los botones de hacer otra pregunta
                                            }}
                                        >
                                            {option.text} {option.needsQuestionMark ? " ?" : ""}
                                        </button>

                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}