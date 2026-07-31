import { useState } from "react";
import "./App.css";
import Inicio from "./pages/Inicio";
import Animales from "./pages/Animales";

function App() {
  const [pagina, setPagina] = useState("inicio");

  return (
    <div>
      <nav className="menu">
        <button onClick={() => setPagina("inicio")}>
          🐄 Registrar animal
        </button>

        <button onClick={() => setPagina("animales")}>
          📋 Ver animales
        </button>
      </nav>

      {pagina === "inicio" && <Inicio />}
      {pagina === "animales" && <Animales />}
    </div>
  );
}

export default App;

