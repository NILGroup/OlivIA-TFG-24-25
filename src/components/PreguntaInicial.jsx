/**
 * PreguntaInicial.jsx
 *
 * Este componente representa la interfaz inicial donde el usuario escoge una
 * pregunta predefinida o la escribe desde cero. Su función principal es servir 
 * de punto de partida para la generación de prompts hacia la IA.
 */

import React from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function PreguntaInicial({
    summary,              // Contiene los datos recogidos del cuestionario, como el nombre del usuario
    options,              // Lista de tipos de preguntas disponibles (con colores)
    selectedOption,       // Opción actualmente seleccionada por el usuario
    prompt,               // Texto escrito por el usuario en el input
    handleOptionClick,    // Función para seleccionar una opción de pregunta
    handleResetQuestion,  // Función para reiniciar la selección y escribir una pregunta desde cero
    setPrompt,            // Función para actualizar el texto del prompt
    sendPrompt            // Función que envía el prompt a la IA
}) {
    return (
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
    );
}
