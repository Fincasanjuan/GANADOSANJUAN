import { useEffect, useState } from "react";

const STORAGE_KEY = "animalesSanJuan";

function leerAnimales() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error leyendo animales:", error);
    return [];
  }
}

function convertirNumero(valor) {
  const numero = Number(
    String(valor ?? "").replace(",", ".")
  );

  return Number.isFinite(numero) ? numero : 0;
}

function Panel({ irA }) {
  const [resumen, setResumen] = useState({
    total: 0,
    vacas: 0,
    toros: 0,
    novillas: 0,
    novillos: 0,
    terneras: 0,
    terneros: 0,
    tratamientos: 0,
    reproduccion: 0,
    partos: 0,
    leche: 0,
    salidos: 0,
  });

  function cargarResumen() {
    try {
      const animales = leerAnimales();

      const activos = animales.filter(
        (animal) =>
          (animal.estado || "Activo") === "Activo"
      );

      function contarTipo(tipo) {
        return activos.filter(
          (animal) =>
            String(animal.tipo || "")
              .trim()
              .toLowerCase() === tipo.toLowerCase()
        ).length;
      }

      let tratamientos = 0;
      let reproduccion = 0;
      let partos = 0;
      let leche = 0;

      animales.forEach((animal) => {
        if (Array.isArray(animal.salud)) {
          tratamientos += animal.salud.length;
        }

        if (Array.isArray(animal.reproduccion)) {
          reproduccion += animal.reproduccion.length;
        }

        if (Array.isArray(animal.partos)) {
          partos += animal.partos.length;
        }

        if (Array.isArray(animal.leche)) {
          animal.leche.forEach((registro) => {
            leche += convertirNumero(
              registro.litros ??
                registro.cantidad ??
                registro.leche ??
                registro.produccion ??
                registro.valor ??
                0
            );
          });
        }
      });

      setResumen({
        total: activos.length,
        vacas: contarTipo("Vaca"),
        toros: contarTipo("Toro"),
        novillas: contarTipo("Novilla"),
        novillos: contarTipo("Novillo"),
        terneras: contarTipo("Ternera"),
        terneros: contarTipo("Ternero"),
        tratamientos,
        reproduccion,
        partos,
        leche,
        salidos: animales.length - activos.length,
      });
    } catch (error) {
      console.error(
        "Error cargando el panel:",
        error
      );
    }
  }

  useEffect(() => {
    cargarResumen();
  }, []);

  const tarjetas = [
  {
  icono: "🐄",
  titulo: "Total animales",
  valor: resumen.total,
  accion: () => irA("animales"),
},
{
  icono: "🐮",
  titulo: "Vacas",
  valor: resumen.vacas,
  accion: () => irA("animales"),
},
{
  icono: "🐂",
  titulo: "Toros",
  valor: resumen.toros,
  accion: () => irA("animales"),
},
   
    {
  icono: "🐄",
  titulo: "Novillas",
  valor: resumen.novillas,
  accion: () => irA("animales"),
},
{
  icono: "🐂",
  titulo: "Novillos",
  valor: resumen.novillos,
  accion: () => irA("animales"),
},
{
  icono: "🐮",
  titulo: "Terneras",
  valor: resumen.terneras,
  accion: () => irA("animales"),
},
{
  icono: "🐮",
  titulo: "Terneros",
  valor: resumen.terneros,
  accion: () => irA("animales"),
},
{
  icono: "💉",
  titulo: "Tratamientos",
  valor: resumen.tratamientos,
},
    {
      icono: "❤️",
      titulo: "Reproducción",
      valor: resumen.reproduccion,
    },
    {
      icono: "🐮",
      titulo: "Partos",
      valor: resumen.partos,
    },
    {
      icono: "🥛",
      titulo: "Leche registrada",
      valor: `${resumen.leche.toLocaleString(
        "es-CO"
      )} L`,
    },
    {
      icono: "🚚",
      titulo: "Vendidos / salidos",
      valor: resumen.salidos,
    },
  ];

  return (
    <div className="contenedor">
      <div className="titulo-centro">
        <h2>📊 Panel principal</h2>

        <p>
          Resumen general de los animales y registros
          de Finca San Juan.
        </p>

        <button
          type="button"
          onClick={cargarResumen}
        >
          🔄 Actualizar información
        </button>
      </div>

      <div className="grid-panel">
        {tarjetas.map((tarjeta) => (
          <div
  className="tarjeta-panel"
  key={tarjeta.titulo}
  onClick={tarjeta.accion}
  style={{ cursor: tarjeta.accion ? "pointer" : "default" }}
>
            <div>
              {tarjeta.icono} {tarjeta.titulo}
            </div>

            <strong>{tarjeta.valor}</strong>
          </div>
        ))}
      </div>

      <div className="acciones-centro">
        <button
          type="button"
          onClick={() => irA("inicio")}
        >
          ➕ Registrar nuevo animal
        </button>

        <button
          type="button"
          onClick={() => irA("animales")}
        >
          📋 Ver todos los animales
        </button>
      </div>
    </div>
  );
}

export default Panel;
