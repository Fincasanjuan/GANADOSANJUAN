import { useState } from "react";

const STORAGE_KEY = "animalesSanJuan";

function crearId() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

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

function Inicio() {
  const formularioInicial = {
    chapeta: "",
    colorChapeta: "",
    nombre: "",
    tipo: "",
    sexo: "",
    raza: "",
    fechaNacimiento: "",
    pesoInicial: "",
    madre: "",
    padre: "",
    procedencia: "",
    observaciones: "",
    foto: "",
  };

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [mensaje, setMensaje] = useState("");

  function cambiarCampo(event) {
    const { name, value } = event.target;

    const nuevoFormulario = {
      ...formulario,
      [name]: value,
    };

    if (name === "tipo") {
      if (
        ["Vaca", "Novilla", "Ternera"].includes(value)
      ) {
        nuevoFormulario.sexo = "Hembra";
      }

      if (
        ["Toro", "Novillo", "Ternero"].includes(value)
      ) {
        nuevoFormulario.sexo = "Macho";
      }
    }

    setFormulario(nuevoFormulario);
  }

  function seleccionarFoto(event) {
    const archivo = event.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setMensaje(
        "⚠️ El archivo seleccionado debe ser una imagen."
      );
      return;
    }

    const limite = 2 * 1024 * 1024;

    if (archivo.size > limite) {
      setMensaje(
        "⚠️ La fotografía debe pesar menos de 2 MB."
      );
      event.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      setFormulario((actual) => ({
        ...actual,
        foto: String(lector.result || ""),
      }));

      setMensaje("");
    };

    lector.onerror = () => {
      setMensaje(
        "⚠️ No fue posible leer la fotografía."
      );
    };

    lector.readAsDataURL(archivo);
  }

  function guardarAnimal(event) {
    event.preventDefault();

    setMensaje("");

    const chapeta = formulario.chapeta.trim();
    const colorChapeta =
      formulario.colorChapeta.trim();

    if (!chapeta) {
      setMensaje(
        "⚠️ Escriba el número de chapeta."
      );
      return;
    }

    if (!colorChapeta) {
      setMensaje(
        "⚠️ Escriba el color de la chapeta."
      );
      return;
    }

    if (!formulario.tipo) {
      setMensaje(
        "⚠️ Seleccione el tipo de animal."
      );
      return;
    }

    if (!formulario.sexo) {
      setMensaje(
        "⚠️ Seleccione el sexo del animal."
      );
      return;
    }

    const animales = leerAnimales();

    const chapetaRepetida = animales.some(
      (animal) =>
        String(animal.chapeta || "")
          .trim()
          .toLowerCase() ===
        chapeta.toLowerCase()
    );

    if (chapetaRepetida) {
      setMensaje(
        `⚠️ Ya existe un animal con la chapeta ${chapeta}.`
      );
      return;
    }

    let peso = null;

    if (formulario.pesoInicial !== "") {
      peso = Number(formulario.pesoInicial);

      if (
        !Number.isFinite(peso) ||
        peso <= 0
      ) {
        setMensaje(
          "⚠️ El peso debe ser un número mayor que cero."
        );
        return;
      }
    }

    const nuevoAnimal = {
      id: crearId(),

      chapeta,
      colorChapeta,

      nombre: formulario.nombre.trim(),
      tipo: formulario.tipo,
      sexo: formulario.sexo,
      raza: formulario.raza.trim(),

      fechaNacimiento:
        formulario.fechaNacimiento,

      madre: formulario.madre.trim(),
      padre: formulario.padre.trim(),

      procedencia:
        formulario.procedencia.trim(),

      observaciones:
        formulario.observaciones.trim(),

      foto: formulario.foto,

      estado: "Activo",
      motivoSalida: "",
      fechaSalida: "",

      pesos:
        peso !== null
          ? [
              {
                id: crearId(),
                fecha: new Date()
                  .toISOString()
                  .slice(0, 10),
                peso: String(peso),
                observacion:
                  "Peso registrado al crear la ficha",
              },
            ]
          : [],

      salud: [],
      reproduccion: [],
      partos: [],
      leche: [],

      fechaRegistro:
        new Date().toISOString(),
    };

    try {
      const actualizados = [
        ...animales,
        nuevoAnimal,
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(actualizados)
      );

      setFormulario(formularioInicial);

      const selectorFoto =
        document.getElementById(
          "fotoAnimal"
        );

      if (selectorFoto) {
        selectorFoto.value = "";
      }

      setMensaje(
        `✅ Animal guardado correctamente. Chapeta ${chapeta}.`
      );
    } catch (error) {
      console.error(
        "Error guardando animal:",
        error
      );

      setMensaje(
        "⚠️ No se pudo guardar el animal. Si seleccionó una fotografía, pruebe con una imagen más pequeña."
      );
    }
  }

  return (
    <div className="contenedor">
      <h2>🐄 Registro de animales</h2>

      <p>
        Complete la información que conozca.
        Los datos opcionales pueden quedar vacíos.
      </p>

      {mensaje && (
        <div className="mensaje">
          {mensaje}
        </div>
      )}

      <form
        className="formulario"
        onSubmit={guardarAnimal}
      >
        <h3>🏷️ Identificación</h3>

        <label>
          Número de chapeta
          <input
            type="text"
            name="chapeta"
            value={formulario.chapeta}
            onChange={cambiarCampo}
            placeholder="Ejemplo: 0012"
            required
          />
        </label>

        <label>
          Color de chapeta
          <input
            type="text"
            name="colorChapeta"
            value={
              formulario.colorChapeta
            }
            onChange={cambiarCampo}
            placeholder="Ejemplo: amarilla"
            required
          />
        </label>

        <label>
          Nombre del animal
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={cambiarCampo}
            placeholder="Opcional"
          />
        </label>

        <h3>🐮 Datos del animal</h3>

        <label>
          Tipo
          <select
            name="tipo"
            value={formulario.tipo}
            onChange={cambiarCampo}
            required
          >
            <option value="">
              Seleccione
            </option>

            <option value="Vaca">
              Vaca
            </option>

            <option value="Toro">
              Toro
            </option>

            <option value="Novilla">
              Novilla
            </option>

            <option value="Novillo">
              Novillo
            </option>

            <option value="Ternera">
              Ternera
            </option>

            <option value="Ternero">
              Ternero
            </option>
          </select>
        </label>

        <label>
          Sexo
          <select
            name="sexo"
            value={formulario.sexo}
            onChange={cambiarCampo}
            required
          >
            <option value="">
              Seleccione
            </option>

            <option value="Hembra">
              Hembra
            </option>

            <option value="Macho">
              Macho
            </option>
          </select>
        </label>

        <label>
          Raza
          <input
            type="text"
            name="raza"
            value={formulario.raza}
            onChange={cambiarCampo}
            placeholder="Ejemplo: Holstein, Jersey, cruce..."
          />
        </label>

        <label>
          Fecha de nacimiento
          <input
            type="date"
            name="fechaNacimiento"
            value={
              formulario.fechaNacimiento
            }
            onChange={cambiarCampo}
          />
        </label>

        <label>
          Peso inicial (kg)
          <input
            type="number"
            min="0.1"
            step="0.1"
            name="pesoInicial"
            value={
              formulario.pesoInicial
            }
            onChange={cambiarCampo}
            placeholder="Ejemplo: 520"
          />
        </label>

        <h3>🐄 Padres y procedencia</h3>

        <label>
          Madre
          <input
            type="text"
            name="madre"
            value={formulario.madre}
            onChange={cambiarCampo}
            placeholder="Nombre o chapeta"
          />
        </label>

        <label>
          Padre / Toro
          <input
            type="text"
            name="padre"
            value={formulario.padre}
            onChange={cambiarCampo}
            placeholder="Nombre, chapeta o identificación"
          />
        </label>

        <label>
          Procedencia
          <input
            type="text"
            name="procedencia"
            value={
              formulario.procedencia
            }
            onChange={cambiarCampo}
            placeholder="Ejemplo: nacido en la finca"
          />
        </label>

        <h3>📷 Fotografía</h3>

        <label>
          Foto del animal
          <input
            id="fotoAnimal"
            type="file"
            accept="image/*"
            onChange={seleccionarFoto}
          />
        </label>

        {formulario.foto && (
          <img
            className="foto-animal"
            src={formulario.foto}
            alt="Animal seleccionado"
          />
        )}

        <h3>📝 Observaciones</h3>

        <label>
          Información adicional
          <textarea
            name="observaciones"
            rows="5"
            value={
              formulario.observaciones
            }
            onChange={cambiarCampo}
            placeholder="Información importante del animal..."
          />
        </label>

        <button type="submit">
          💾 Guardar animal
        </button>
      </form>
    </div>
  );
}

export default Inicio;