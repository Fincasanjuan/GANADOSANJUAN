import { Component, useState } from "react";
import "./App.css";

import Panel from "./pages/Panel";
import Inicio from "./pages/Inicio";
import Animales from "./pages/Animales";

import Respaldos from "./pages/Respaldos";
class Guard extends Component {
 state={error:null};
 static getDerivedStateFromError(error){return {error};}
 render(){return this.state.error ? <div className="contenedor mensaje" role="alert">{this.state.error.message}</div> : this.props.children;}
}
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

      <nav className="menu"><button onClick={()=>cambiarPagina("respaldos")}>Respaldos y recuperación</button></nav>
      <main><Guard key={pagina}>
        {pagina === "panel" && (
          <Panel irA={cambiarPagina} />
        )}

        {pagina === "inicio" && <Inicio />}

        {pagina === "animales" && <Animales />}
      {pagina === "respaldos" && <Respaldos />}
      </Guard></main>
    </div>
  );
}

export default App;