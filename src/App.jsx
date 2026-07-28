import { useState } from "react";
import "./App.css";

import Panel from "./pages/Panel";
import Inicio from "./pages/Inicio";
import Animales from "./pages/Animales";

function App() {
  const [pagina, setPagina] = useState("panel");

  function cambiarPagina(nuevaPagina) {
    setPagina(nuevaPagina);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="app">
      <header className="encabezado">
        <h1>🐄 Finca San Juan</h1>
        <p>Sistema de control y registro de ganado</p>
      </header>

      <nav className="menu">
        <button
          type="button"
          onClick={() => cambiarPagina("panel")}
        >
          📊 Panel principal
        </button>

        <button
          type="button"
          onClick={() => cambiarPagina("inicio")}
        >
          🐄 Registrar animal
        </button>

        <button
          type="button"
          onClick={() => cambiarPagina("animales")}
        >
          📋 Ver animales
        </button>
      </nav>

      <main>
        {pagina === "panel" && (
          <Panel irA={cambiarPagina} />
        )}

        {pagina === "inicio" && <Inicio />}

        {pagina === "animales" && <Animales />}
      </main>
    </div>
  );
}

export default App;