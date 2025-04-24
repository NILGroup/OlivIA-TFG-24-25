import React from "react";

const ConfigPanel = ({
    summary,
    tempSummary,
    setTempSummary,
    otraOpciones,
    setOtraOpciones,
    savedEffect,
    setSavedEffect,
    setEditingField,
}) => {
    const getOptionsForField = (key) => {
        const options = {
            nombre: [],
            discapacidad: ["TEA", "Dislexia", "TDAH", "Memoria", "Prefiero no responder", "Otra"],
            retos: ["Textos Largos", "Palabras Dificiles", "Organizar Ideas", "Mantener Atencion", "Memoria", "Otra"],
            herramientas: ["ejemplo", "bullet", "textocorto", "frasescortas"]
        };
        return options[key] || [];
    };

    const getLabelForOption = (option) => {
        const labels = {
            "TEA": "TEA", "Dislexia": "Dislexia", "TDAH": "TDAH", "Memoria": "Memoria",
            "Prefiero no responder": "Prefiero no responder", "Textos Largos": "Textos largos",
            "Palabras Dificiles": "Palabras difíciles", "Organizar Ideas": "Organizar ideas",
            "Mantener Atencion": "Mantener la atención", "ejemplo": "Usar ejemplos",
            "bullet": "Respuestas en bullets", "textocorto": "Texto corto", "frasescortas": "Frases cortas"
        };
        return labels[option] || option;
    };

    const getEmojiForOption = (option) => {
        const emojis = {
            "TEA": "🧩", "Dislexia": "🔠", "TDAH": "⚡", "Memoria": "🧠",
            "Prefiero no responder": "❌", "Textos Largos": "📖", "Palabras Dificiles": "🧩",
            "Organizar Ideas": "📝", "Mantener Atencion": "🎯", "ejemplo": "🖋️",
            "bullet": "📒", "textocorto": "📃", "frasescortas": "✂️"
        };
        return emojis[option] || "🔧";
    };

    const toggleOption = (key, option) => {
        const current = tempSummary[key] || [];
        const exists = current.includes(option);

        let updated;

        if (option === "Otra") {
            updated = exists
                ? current.filter(o => !o.startsWith("Otra -") && o !== "Otra")
                : [...current, option];

            setOtraOpciones(prev => ({
                ...prev,
                [key]: { activa: !exists, valor: "", guardado: false }
            }));
        } else {
            updated = exists
                ? current.filter(o => o !== option)
                : [...current, option];
        }

        setTempSummary({ ...tempSummary, [key]: updated });
    };

    return (
        <div className="config-panel">
            <h2>🔧 Configuración del cuestionario</h2>
            {Object.entries(summary)
                .filter(([key]) => ["nombre", "discapacidad", "retos", "herramientas"].includes(key))
                .map(([key]) => (
                    <div className="config-section" key={key}>
                        <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <div className="edit-options">
                            {key === "nombre" ? (
                                <input
                                    type="text"
                                    className="nombre-input"
                                    value={tempSummary.nombre}
                                    onChange={(e) => setTempSummary({ ...tempSummary, nombre: e.target.value })}
                                />
                            ) : (
                                <>
                                    {getOptionsForField(key).map(option => (
                                        <label key={option} className="config-toggle-option">
                                            <span>{getEmojiForOption(option)} {getLabelForOption(option)}</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={tempSummary[key]?.includes(option)}
                                                    onChange={() => toggleOption(key, option)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </label>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            <div className="edit-buttons-global">
                <button className="cancel-btn" onClick={() => {
                    setTempSummary({ ...summary });
                    setEditingField(null);
                }}>❌ Descartar cambios</button>
                <button className={`save-btn ${savedEffect ? "saved-effect" : ""}`}
                    onClick={() => {
                        Object.keys(summary).forEach(key => {
                            if (["nombre", "discapacidad", "retos", "herramientas"].includes(key)) {
                                summary[key] = tempSummary[key];
                            }
                        });
                        setSavedEffect(true);
                        setTimeout(() => setSavedEffect(false), 2000);
                    }}>
                    {savedEffect ? "✅ Cambios guardados" : "✅ Guardar cambios"}
                </button>
            </div>
        </div>
    );
};

export default ConfigPanel;
