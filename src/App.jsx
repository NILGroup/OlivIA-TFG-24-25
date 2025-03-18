import { useState } from "react";
import Questionario from "./components/Questionario";
import InterfazPrincipal from "./components/InterfazPrincipal";
import "./App.css";

export default function App() {
  // cambiar a false para que salte el cuestionario
  const [completed, setCompleted] = useState(true);

  return (
    <div className="app-wrapper">
      <div className="header-bar">OlivIA</div>
      {!completed ? <Questionario onComplete={() => setCompleted(true)} /> : <InterfazPrincipal />}
    </div>
  );
}
