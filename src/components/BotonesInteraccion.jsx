/**
 *  BotonesInteraccion.jsx
 *
 *  Este componente representa la parte interactiva después de que se ha generado una respuesta por la IA.
 *  Muestra botones de ayuda como: "Explícame con un ejemplo", "Dame un resumen", o reformular en 
 *  lenguaje sencillo. También gestiona los inputs personalizados para dudas y sinónimos,
 *  y permite al usuario indicar si la explicación fue útil.
 * */

import React from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function BotonesInteraccion({
    prompt,                    // Contenido actual del input de texto del usuario
    setPrompt,                 // Función para actualizar el input de texto
    showHelpOptions,          // Muestra los botones de ayuda tras la respuesta
    showSimplificationOptions, // Muestra las opciones para simplificar la respuesta
    showTextInput,            // Muestra el textarea para escribir palabras desconocidas
    requestingSummary,        // Indica si se está pidiendo un resumen
    requestingExample,        // Indica si se está pidiendo un ejemplo
    unknownWords,             // Palabras que el usuario no entiende y quiere sinónimos
    setUnknownWords,          // Función para actualizar las palabras desconocidas
    requestExample,           // Función para pedir un ejemplo
    requestSummary,           // Función para pedir un resumen
    requestSimplifiedResponse,// Función para pedir una reformulación más sencilla
    requestSynonyms,          // Función para buscar sinónimos de palabras
    toggleSynonymInput,       // Alterna el input de palabras desconocidas
    handleSimplification,     // Alterna la visibilidad de opciones de simplificación
    closeRedButtonOptions,    // Oculta las opciones del boton de simplificación
    setShowHelpOptions,       // Muestra/oculta los botones de ayuda
    setShowUsefulQuestion,    // Muestra/oculta la pregunta "¿todo claro?"
    showUsefulQuestion,       // Booleano que indica si mostrar "¿todo claro?"
    showConfirmationButton,   // Controla si se muestra el botón de confirmación final
    setShowConfirmationButton,// Activa/desactiva el botón "Sí, todo claro"
    saveChatToHistory,         // Guarda la conversación en el historial
    sendCustomPrompt

}) {
    return (
        <>
            {/*MUESTRA VISUALMENTE RESUMEN*/}
            {requestingSummary && (
                <div className="chat-container user-container">
                    <div className="chat-message user-message">Dame un resumen</div>
                </div>
            )}
            {/*MUESTRA VISUALMENTE EJEMPLO*/}
            {requestingExample && (
                <div className="chat-container user-container">
                    <div className="chat-message user-message">Explícame con un ejemplo</div>
                </div>
            )}

            {/*BOTONES A ELEGIR*/}
            {showHelpOptions && !requestingSummary && (
                <>
                    <div className="chat-container">
                        <div className="robot-bubble">
                            <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                            <p>¿Quieres que te ayude a entenderlo mejor?</p>
                        </div>
                    </div>

                    <div className="chat-container">
                        <div className="help-buttons">

                            {/*OPCIÓN DE DAR EJEMPLO*/}
                            <button className="help-btn blue" onClick={() => {
                                closeRedButtonOptions();
                                requestExample();   //LLAMAR PROMPT
                            }}>
                                Explícame con un ejemplo
                            </button>

                            {/*OPCIÓN DE DAR RESUMEN*/}
                            <button className="help-btn green" onClick={() => {
                                closeRedButtonOptions();
                                requestSummary();   //LLAMAR PROMPT
                            }}>
                                Dame un resumen
                            </button>

                            {/*OPCIÓN DE RESPONDER MAS SENCILLO*/}
                            <button className="help-btn red" onClick={handleSimplification}>
                                Responder en lenguaje más sencillo
                            </button>

                            {/*OPCIÓN DE NO NECESITAR MÁS AYUDA*/}
                            <button className="help-btn gray" onClick={() => {
                                closeRedButtonOptions();
                                setShowHelpOptions(false);
                                setShowUsefulQuestion(true);
                                setShowConfirmationButton(false);
                            }}>
                                No, gracias
                            </button>
                        </div>
                    </div>

                    {/*OPCIÓN DE ESCRIBIR TU PROPIA PREGUNTA*/}
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
                                    onClick={() => {
                                        if (prompt.trim()) {
                                            sendCustomPrompt(prompt);
                                            setPrompt("");
                                        }
                                    }}
                                >
                                    🔍 ¡Descubrir Respuesta!
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/*LÓGICA BOTÓN DE SIMPLIFICACIÓN*/}
            {showSimplificationOptions && (
                <>
                    +                    <div className="chat-container">
                        <div className="robot-bubble">
                            <img src={robotLogo} alt="AventurIA" className="robot-icon" />
                            <p>¿Cómo quieres que te ayude?</p>
                        </div>
                    </div>

                    {/*OPCIÓN DE REFORMULAR TODO TEXTO*/}
                    <div className="chat-container">
                        <div className="help-buttons">
                            <button className="help-btn blue" onClick={requestSimplifiedResponse}>
                                📝 Reformular toda la respuesta
                            </button>

                            <button className="help-btn yellow" onClick={toggleSynonymInput}>
                                ✏️ Escribir palabras que no comprendo
                            </button>
                        </div>
                    </div>
                    {/*OPCIÓN DE ELEGIR SINONIMOS*/}
                    {showTextInput && (
                        <div className="chat-container">
                            <textarea
                                className="textarea-synonyms"
                                placeholder="Escribe aquí las palabras que no comprendas..."
                                value={unknownWords}
                                onChange={(e) => setUnknownWords(e.target.value)}
                            ></textarea>

                            <button className="synonyms-btn" onClick={() => requestSynonyms(unknownWords)}>
                                🔍 Buscar sinónimos
                            </button>
                        </div>
                    )}
                </>
            )}
            {/* LÓGICA BOTÓN DE NO GRACIAS*/}
            {showUsefulQuestion && !showConfirmationButton && (
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
                                    setShowUsefulQuestion(false);
                                    setShowHelpOptions(true);
                                    setShowConfirmationButton(false);
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
        </>
    );
}
