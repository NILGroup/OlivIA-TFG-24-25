/**
 * App.jsx
 *
 * Punto de entrada de la aplicación OlivIA, es decir, arranca todo lo visual
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * - Usa un estado `completed` para saber si el cuestionario ya se completó.
 * - Recoge y guarda el resumen del usuario (`summary`) para personalizar la experiencia.
 * - Muestra el cuestionario al inicio y, tras completarlo, la interfaz principal.
 */

import { useState } from "react";
import Questionario from "./components/Questionario";
import InterfazPrincipal from "./components/InterfazPrincipal";
import "./App.css";

export default function App() {
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState(null); // Guardar el resumen aquí

  // Función que se llamará cuando el cuestionario termine
  const handleQuestionnaireComplete = (data) => {
    setSummary(data);   // Guardar el resumen
    setCompleted(true); // Mostrar la interfaz principal
  };

  return (
    <div className="app-wrapper">
      <div className="header-bar">OlivIA</div>
      {!completed ? (
        <Questionario onComplete={handleQuestionnaireComplete} />
      ) : (
        <InterfazPrincipal summary={summary} />
      )}
    </div>
  );
}
