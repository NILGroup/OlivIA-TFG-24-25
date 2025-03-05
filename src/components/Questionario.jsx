import { useState } from "react";
import "../App.css";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import robotLogoCuerpo from "../assets/AventurIA_robotCuerposinfondo.png";

/** ================================
 *  MAPA DE PROGRESO DE QUESTIONARIO
 *  ================================
 */

const treasureMap = [

    "❌ - - - 🏆",
    "- ❌ - - 🏆",
    "- - ❌ - 🏆",
    "- - - ❌ 🏆",
    "- - - - 🏆!"
];

export default function Questionario({ onComplete }) {

    /** ================================
     *  ESTADOS DEL CUESTIONARIO (useState)
     *  ================================
     */

    // Control de la página actual del cuestionario
    const [page, setPage] = useState(1);

    // Selección del usuario en la pregunta 2
    const [userSelection, setUserSelection] = useState("");

    // Múltiples selecciones del usuario en preguntas tipo checkbox
    const [userSelections, setUserSelections] = useState([]);

    // Estado para el campo "Otra opción"
    const [otraSeleccionada, setOtraSeleccionada] = useState(false);
    const [otraRespuesta, setOtraRespuesta] = useState("");


    /** ================================
     *  FUNCIONES DE SELECCIÓN
     *  ================================
     */

    // Selección de opciones múltiples (checkbox)
    const toggleSelection = (id) => {
        setUserSelections(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Manejar el campo "Otra opción"
    const toggleOtra = () => {
        setOtraSeleccionada(!otraSeleccionada);
        if (otraSeleccionada) setOtraRespuesta("");
    };

    /** ================================
     *  HERRAMIENTAS (Drag & Drop)
     *  ================================
     */

    // Lista de herramientas disponibles
    const tools = [
        { id: "ejemplo", label: "🖋️ Usar ejemplos", color: "green" },
        { id: "resumenes", label: "📒 Respuestas en bullets", color: "purple" },
        { id: "leer", label: "🔊 Leer en voz alta", color: "blue" },
        { id: "imagenes", label: "📷 Insertar Imágenes", color: "blue" },
        { id: "frasescortas", label: "✂️ Frases cortas", color: "yellow" },
    ];

    // Estado de herramientas seleccionadas
    const [selectedTools, setSelectedTools] = useState([]);

    // Función para iniciar el arrastre
    const handleDragStart = (e, tool) => {
        e.dataTransfer.setData("toolId", tool.id);
    };

    // Función para soltar herramienta en la "mochila"
    const handleDrop = (e) => {
        e.preventDefault();
        const toolId = e.dataTransfer.getData("toolId");
        if (!selectedTools.includes(toolId)) {
            setSelectedTools([...selectedTools, toolId]);
        }
    };

    // Remover una herramienta de la mochila
    const handleRemoveTool = (toolId) => {
        setSelectedTools(selectedTools.filter((id) => id !== toolId));
    };

    /** ================================
    *  OPCIONES DE AYUDA (Drag & Drop)
    *  ================================
    */

    const helpOptions = [
        { id: "definir", label: "📖 Definir palabras", color: "green" },
        { id: "explicar", label: "💡 Explicar con ejemplos", color: "blue" },
        { id: "resumen", label: "📑 Resumen corto", color: "purple" },
    ];

    // Estado de opciones de ayuda seleccionadas
    const [selectedHelp, setSelectedHelp] = useState([]);

    // Función para iniciar el arrastre de opciones de ayuda
    const handleDragStartHelp = (e, option) => {
        e.dataTransfer.setData("helpId", option.id);
    };

    // Función para soltar opción de ayuda en la "mochila"
    const handleDropHelp = (e) => {
        e.preventDefault();
        const helpId = e.dataTransfer.getData("helpId");
        if (!selectedHelp.includes(helpId)) {
            setSelectedHelp([...selectedHelp, helpId]);
        }
    };

    // Remover una opción de ayuda de la selección
    const handleRemoveHelp = (helpId) => {
        setSelectedHelp(selectedHelp.filter((id) => id !== helpId));
    };

    /** ================================
    *  OPCIONES DE VELOCIDAD DE HABLA
    *  ================================
    */


    const [selectedToggles, setSelectedToggles] = useState({});
    const [pauseEnabled, setPauseEnabled] = useState(false);

    const [speechRate, setSpeechRate] = useState(1); // Velocidad por defecto (normal)

    // Función para probar la voz con la velocidad seleccionada
    const speakTest = (rate) => {
        const msg = new SpeechSynthesisUtterance();
        msg.text = "Hola! esta es la velocidad a la que leería";
        msg.lang = "es-ES";
        msg.rate = rate;
        window.speechSynthesis.speak(msg);
    };


    /** ================================
     *  NAVEGACIÓN ENTRE PÁGINAS
     *  ================================
     */

    // Función para avanzar a la siguiente página
    const nextPage = () => {
        if (page < 5) {
            setPage(page + 1);
        } else {
            onComplete(); // Termina el cuestionario y vuelve a la interfaz principal
        }
    };

    // Función para retroceder a la página anterior
    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    /** ================================
   *  CONTENIDO DE CADA PÁGINAS
   *  ================================
   */

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="question-page">
                        <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                        <h2>Personaliza tu compañero digital de Inteligencia Artificial</h2>
                        <p>¡Bienvenido a OlivIA! Para hacer esta aventura única, primero queremos conocerte.</p>
                        <h3>¿Cómo te llamas?</h3>
                        <input type="text" placeholder="Escribe tu nombre aquí..." className="custom-input" />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page">
                        <h2>Elige tu camino 🧭</h2>
                        <p>Cada explorador tiene su propia historia.</p>
                        <h3>¿Qué camino te representa más?</h3>

                        <div className="options-container-3col">
                            {[
                                { id: "TEA", label: "🧩 TEA", color: "yellow" },
                                { id: "Dislexia", label: "🔠 Dislexia", color: "blue" },
                                { id: "TDAH", label: "⚡TDAH", color: "orange" },
                                { id: "Memoria", label: "🧠 Memoria", color: "red" },
                                { id: "Otra", label: "❓Otra", color: "purple" },
                                { id: "NoSe", label: "❌ No responder", color: "gray" }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    className={`option-btn ${option.color} ${userSelection === option.id ? "selected" : ""}`}
                                    onClick={() => setUserSelection(option.id)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Mostrar el campo de texto si "Otra" está seleccionada */}
                        {userSelection === "Otra" && (
                            <div className="other-input-container">
                                <textarea
                                    className="custom-textarea"
                                    placeholder="Escribe aquí..."
                                    value={otraRespuesta}
                                    onChange={(e) => setOtraRespuesta(e.target.value)}
                                    style={{ color: "black" }} // Texto en negro
                                ></textarea>

                                {/* Mostrar botón "Guardar" solo si hay texto */}
                                {otraRespuesta.trim() && (
                                    <button
                                        className="accept-btn"
                                        onClick={() => alert(`Guardado: ${otraRespuesta}`)}
                                    >
                                        ✅ Guardar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="question-page">
                        <h2>Retos en el viaje 🔥</h2>
                        <p>Durante el camino, te enfrentas a diferentes tipos de información.</p>
                        <h3>¿Cuáles de estos te resultan más difíciles de entender?</h3>

                        <div className="options-container-2col">
                            {[
                                { id: "TextosLargos", label: "Textos largos", color: "yellow", icon: "📖" },
                                { id: "PalabrasDificiles", label: "Palabras difíciles", color: "green", icon: "🧩" },
                                { id: "OrganizarIdeas", label: "Organizar ideas", color: "blue", icon: "📝" },
                                { id: "MantenerAtencion", label: "Mantener la atención", color: "orange", icon: "🎯" },
                                { id: "RecordarUsarCerebro", label: "Recordar", color: "purple", icon: "🧠" },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    className={`option-btn ${option.color} ${userSelections.includes(option.id) ? "selected" : ""}`}
                                    onClick={() => toggleSelection(option.id)}
                                >
                                    {option.icon} {option.label}
                                </button>
                            ))}
                            {/* Botón "Otra" con funcionalidad especial */}
                            <button
                                className={`option-btn gray ${otraSeleccionada ? "selected" : ""}`}
                                onClick={toggleOtra}
                            >
                                ➕ Otra
                            </button>
                        </div>
                        {
                            otraSeleccionada && (
                                <div className="other-input-container">
                                    <textarea
                                        className="custom-textarea"
                                        placeholder="Escribe aquí..."
                                        value={otraRespuesta}
                                        onChange={(e) => setOtraRespuesta(e.target.value)}
                                        style={{ color: "black" }} // Texto en negro
                                    ></textarea>
                                    {/* Mostrar botón solo si hay texto */}
                                    {otraRespuesta.trim() && (
                                        <button
                                            className="accept-btn"
                                            onClick={() => alert(`Guardado: ${otraRespuesta}`)}
                                        >
                                            ✅ Guardar
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    </div>
                );
            case 4:
                return (
                    <div className="question-page">
                        <h2>Elección de herramientas 🎒</h2>
                        <p>Para luchar contra los retos seleccionados anteriormente</p>
                        <h3>¿Qué herramientas crees que te pueden ayudar?</h3>

                        <div className="tools-container">
                            {tools.map((tool) => (
                                <div
                                    key={tool.id}
                                    className={`tool-item ${tool.color}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, tool)}
                                >
                                    {tool.label}
                                </div>
                            ))}
                        </div>

                        {/* Mochila para soltar herramientas */}
                        <div
                            className="drop-zone"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <h3>Arrastra aquí las herramientas elegidas</h3>
                            <div className="selected-tools">
                                {selectedTools.length > 0 ? (
                                    selectedTools.map((toolId) => {
                                        const tool = tools.find((t) => t.id === toolId);
                                        return (

                                            <div
                                                key={toolId}
                                                className={`selected-tool ${tool.color}`}
                                                onClick={() => handleRemoveTool(toolId)}
                                            >
                                                {tool.label} ❌
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No has seleccionado ninguna herramienta aún.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="question-page">
                        {/* Contenido totalmente centrado */}
                        <div className="final-content">
                            <h2 className="final-title">
                                ¡Has completado tu preparación para la aventura! 🎉
                            </h2>
                            <p className="final-text">
                                Tu experiencia ha sido configurada a medida y has creado un compañero virtual único, listo para asistirte en tu viaje.
                            </p>

                            {/* Contenedor para centrar el robot */}
                            <div className="robot-container">
                                <img src={robotLogoCuerpo} alt="Compañero Virtual" className="robot-img" />
                            </div>

                            <h3 className="final-question">¿Quieres comenzar la aventura?</h3>

                            <div className="button-group">

                                <button className="final-btn gray" onClick={() => setPage(2)}>
                                    🔄 Revisar opciones
                                </button>
                                <button className="final-btn green" onClick={onComplete}>
                                    ✔️ Sí, estoy listo
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <></>;
        }
    };

    /** ================================
     *  RETORNO DE LA INTERFAZ (UI)
     *  ================================
     */

    return (
        <div className="container">
            {renderPage()}
            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente →</button>}
            </div>

            <div className="treasure-map">{treasureMap[page - 1]}</div>

        </div>

    );
}

