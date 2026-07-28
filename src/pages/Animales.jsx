import { useMemo, useState } from "react";

const STORAGE_KEY = "animalesSanJuan";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

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

function normalizarAnimal(animal) {
  return {
    ...animal,

    estado: animal.estado || "Activo",

    pesos: Array.isArray(animal.pesos)
      ? animal.pesos
      : [],

    salud: Array.isArray(animal.salud)
      ? animal.salud
      : [],

    reproduccion: Array.isArray(
      animal.reproduccion
    )
      ? animal.reproduccion
      : [],

    partos: Array.isArray(animal.partos)
      ? animal.partos
      : [],

    leche: Array.isArray(animal.leche)
      ? animal.leche
      : [],
  };
}

function leerAnimales() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.map(normalizarAnimal);
  } catch (error) {
    console.error(
      "Error leyendo animales:",
      error
    );

    return [];
  }
}

function Animales() {
  const [animales, setAnimales] =
    useState(leerAnimales);

  const [animalSeleccionado, setAnimalSeleccionado] =
    useState(null);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtro, setFiltro] =
    useState("Todos");

  const [formularioActivo, setFormularioActivo] =
    useState(null);

  const [edicion, setEdicion] =
    useState(null);

  const animal = animales.find(
    (item) =>
      String(item.id) ===
      String(animalSeleccionado)
  );

  function guardarLista(lista) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lista)
      );

      setAnimales(lista);

      return true;
    } catch (error) {
      console.error(
        "Error guardando animales:",
        error
      );

      alert(
        "No se pudieron guardar los cambios."
      );

      return false;
    }
  }

  function actualizarAnimal(transformar) {
    if (!animal) {
      return false;
    }

    const listaActualizada = animales.map(
      (item) => {
        if (
          String(item.id) ===
          String(animal.id)
        ) {
          return normalizarAnimal(
            transformar(
              normalizarAnimal(item)
            )
          );
        }

        return item;
      }
    );

    return guardarLista(listaActualizada);
  }

  const animalesFiltrados =
    useMemo(() => {
      const texto =
        busqueda.trim().toLowerCase();

      return animales.filter((item) => {
        let coincideFiltro = false;

        if (filtro === "Todos") {
          coincideFiltro = true;
        } else if (filtro === "Activos") {
          coincideFiltro =
            item.estado === "Activo";
        } else if (filtro === "Salidos") {
          coincideFiltro =
            item.estado !== "Activo";
        } else {
          coincideFiltro =
            item.tipo === filtro;
        }

        const campos = [
          item.chapeta,
          item.nombre,
          item.tipo,
          item.colorChapeta,
          item.raza,
        ];

        const coincideBusqueda =
          !texto ||
          campos.some((valor) =>
            String(valor || "")
              .toLowerCase()
              .includes(texto)
          );

        return (
          coincideFiltro &&
          coincideBusqueda
        );
      });
    }, [animales, busqueda, filtro]);

  function abrirNuevoFormulario(campo) {
    setFormularioActivo(campo);
    setEdicion(null);
  }

  function cancelarFormulario() {
    setFormularioActivo(null);
    setEdicion(null);
  }

  function guardarRegistro(
    campo,
    datos
  ) {
    const guardado =
      actualizarAnimal(
        (animalActual) => {
          const registros = [
            ...animalActual[campo],
          ];

          if (
            edicion &&
            edicion.campo === campo
          ) {
            const indice =
              registros.findIndex(
                (registro) =>
                  String(registro.id) ===
                  String(edicion.id)
              );

            if (indice >= 0) {
              registros[indice] = {
                ...registros[indice],
                ...datos,
                id: registros[indice].id,
              };
            }
          } else {
            registros.unshift({
              ...datos,
              id: crearId(),
            });
          }

          return {
            ...animalActual,
            [campo]: registros,
          };
        }
      );

    if (guardado) {
      cancelarFormulario();
    }
  }

  function editarRegistro(
    campo,
    registro
  ) {
    setFormularioActivo(campo);

    setEdicion({
      campo,
      id: registro.id,
      datos: registro,
    });
  }

  function eliminarRegistro(
    campo,
    id
  ) {
    const confirmar =
      window.confirm(
        "¿Está seguro de eliminar este registro?"
      );

    if (!confirmar) {
      return;
    }

    actualizarAnimal(
      (animalActual) => ({
        ...animalActual,

        [campo]:
          animalActual[campo].filter(
            (registro) =>
              String(registro.id) !==
              String(id)
          ),
      })
    );
  }

  function cambiarEstadoAnimal() {
    if (!animal) {
      return;
    }

    if (animal.estado === "Activo") {
      const motivo =
        window.prompt(
          "Escriba el motivo de salida.\nEjemplo: vendido, muerto, traslado."
        );

      if (motivo === null) {
        return;
      }

      const motivoLimpio =
        motivo.trim() ||
        "Salida registrada";

      actualizarAnimal(
        (animalActual) => ({
          ...animalActual,

          estado: "Vendido / Salido",

          fechaSalida: hoy(),

          motivoSalida:
            motivoLimpio,
        })
      );
    } else {
      const confirmar =
        window.confirm(
          "¿Desea reactivar este animal?"
        );

      if (!confirmar) {
        return;
      }

      actualizarAnimal(
        (animalActual) => ({
          ...animalActual,

          estado: "Activo",
          fechaSalida: "",
          motivoSalida: "",
        })
      );
    }
  }

  if (!animal) {
    return (
      <div className="contenedor">
        <h2>📋 Animales registrados</h2>

        <div className="barra-filtros">
          <input
            type="text"
            placeholder="Buscar por chapeta, nombre, tipo, color o raza..."
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value
              )
            }
          />

          <select
            value={filtro}
            onChange={(event) =>
              setFiltro(
                event.target.value
              )
            }
          >
            <option value="Todos">
              Todos
            </option>

            <option value="Activos">
              Activos
            </option>

            <option value="Salidos">
              Vendidos / salidos
            </option>

            <option value="Vaca">
              Vacas
            </option>

            <option value="Toro">
              Toros
            </option>

            <option value="Novilla">
              Novillas
            </option>

            <option value="Novillo">
              Novillos
            </option>

            <option value="Ternera">
              Terneras
            </option>

            <option value="Ternero">
              Terneros
            </option>
          </select>
        </div>

        <p>
          Animales mostrados:{" "}
          <strong>
            {animalesFiltrados.length}
          </strong>
        </p>

        {animalesFiltrados.length ===
        0 ? (
          <div className="seccion">
            <p>
              No se encontraron animales
              con estos criterios.
            </p>
          </div>
        ) : (
          <div className="lista-animales">
            {animalesFiltrados.map(
              (item) => (
                <article
                  className="tarjeta-animal"
                  key={item.id}
                >
                  {item.foto && (
                    <img
                      className="foto-animal"
                      src={item.foto}
                      alt={
                        item.nombre ||
                        `Chapeta ${item.chapeta}`
                      }
                    />
                  )}

                  <h3>
                    {item.nombre ||
                      `Chapeta ${item.chapeta}`}
                  </h3>

                  <p>
                    <strong>
                      Chapeta:
                    </strong>{" "}
                    {item.chapeta}
                  </p>

                  <p>
                    <strong>
                      Color:
                    </strong>{" "}
                    {item.colorChapeta ||
                      "No registrado"}
                  </p>

                  <p>
                    <strong>
                      Tipo:
                    </strong>{" "}
                    {item.tipo ||
                      "No registrado"}
                  </p>

                  <p>
                    <strong>
                      Raza:
                    </strong>{" "}
                    {item.raza ||
                      "No registrada"}
                  </p>

                  <p>
                    <strong>
                      Estado:
                    </strong>{" "}
                    {item.estado}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setAnimalSeleccionado(
                        item.id
                      )
                    }
                  >
                    📋 Ver ficha completa
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="contenedor">
      <div className="acciones-centro">
        <button
          type="button"
          onClick={() => {
            setAnimalSeleccionado(null);
            cancelarFormulario();
          }}
        >
          ← Volver a animales
        </button>

        <button
          type="button"
          className="boton-secundario"
          onClick={
            cambiarEstadoAnimal
          }
        >
          {animal.estado === "Activo"
            ? "🚚 Marcar vendido / salido"
            : "↩️ Reactivar animal"}
        </button>
      </div>

      {animal.foto && (
        <img
          className="foto-animal foto-grande"
          src={animal.foto}
          alt={
            animal.nombre ||
            animal.chapeta
          }
        />
      )}

      <h2>
        {animal.nombre || "Animal"} —
        Chapeta {animal.chapeta}
      </h2>

      <p>
        <strong>Estado:</strong>{" "}
        {animal.estado}
      </p>

      {animal.estado !== "Activo" && (
        <>
          <p>
            <strong>
              Fecha de salida:
            </strong>{" "}
            {animal.fechaSalida ||
              "No registrada"}
          </p>

          <p>
            <strong>
              Motivo:
            </strong>{" "}
            {animal.motivoSalida ||
              "No registrado"}
          </p>
        </>
      )}

      <section className="seccion">
        <h3>📋 Ficha del animal</h3>

        <p>
          <strong>Chapeta:</strong>{" "}
          {animal.chapeta}
        </p>

        <p>
          <strong>
            Color de chapeta:
          </strong>{" "}
          {animal.colorChapeta ||
            "No registrado"}
        </p>

        <p>
          <strong>Tipo:</strong>{" "}
          {animal.tipo ||
            "No registrado"}
        </p>

        <p>
          <strong>Sexo:</strong>{" "}
          {animal.sexo ||
            "No registrado"}
        </p>

        <p>
          <strong>Raza:</strong>{" "}
          {animal.raza ||
            "No registrada"}
        </p>

        <p>
          <strong>
            Fecha de nacimiento:
          </strong>{" "}
          {animal.fechaNacimiento ||
            "No registrada"}
        </p>

        <p>
          <strong>Madre:</strong>{" "}
          {animal.madre ||
            "No registrada"}
        </p>

        <p>
          <strong>
            Padre / Toro:
          </strong>{" "}
          {animal.padre ||
            "No registrado"}
        </p>

        <p>
          <strong>
            Procedencia:
          </strong>{" "}
          {animal.procedencia ||
            "No registrada"}
        </p>

        <p>
          <strong>
            Observaciones:
          </strong>{" "}
          {animal.observaciones ||
            "Sin observaciones"}
        </p>

        <button
          type="button"
          onClick={() => {
            setFormularioActivo(
              "animal"
            );

            setEdicion({
              campo: "animal",
              datos: animal,
            });
          }}
        >
          ✏️ Editar datos del animal
        </button>

        {formularioActivo ===
          "animal" && (
          <FormularioAnimal
            datos={animal}
            cancelar={
              cancelarFormulario
            }
            guardar={(datos) => {
              const guardado =
                actualizarAnimal(
                  (animalActual) => ({
                    ...animalActual,
                    ...datos,
                  })
                );

              if (guardado) {
                cancelarFormulario();
              }
            }}
          />
        )}
      </section>

      <Historial
        titulo="⚖️ Historial de pesos"
        textoBoton="➕ Agregar peso"
        abrir={() =>
          abrirNuevoFormulario(
            "pesos"
          )
        }
        mostrarFormulario={
          formularioActivo === "pesos"
        }
        formulario={
          <FormularioPeso
            datos={
              edicion?.campo ===
              "pesos"
                ? edicion.datos
                : null
            }
            guardar={(datos) =>
              guardarRegistro(
                "pesos",
                datos
              )
            }
            cancelar={
              cancelarFormulario
            }
          />
        }
        registros={animal.pesos}
        renderizar={(registro) =>
          `${registro.fecha || ""} — ${
            registro.peso || 0
          } kg — ${
            registro.observacion || ""
          }`
        }
        editar={(registro) =>
          editarRegistro(
            "pesos",
            registro
          )
        }
        eliminar={(id) =>
          eliminarRegistro(
            "pesos",
            id
          )
        }
      />

      <Historial
        titulo="💉 Salud y tratamientos"
        textoBoton="➕ Agregar tratamiento"
        abrir={() =>
          abrirNuevoFormulario(
            "salud"
          )
        }
        mostrarFormulario={
          formularioActivo === "salud"
        }
        formulario={
          <FormularioSalud
            datos={
              edicion?.campo ===
              "salud"
                ? edicion.datos
                : null
            }
            guardar={(datos) =>
              guardarRegistro(
                "salud",
                datos
              )
            }
            cancelar={
              cancelarFormulario
            }
          />
        }
        registros={animal.salud}
        renderizar={(registro) =>
          `${registro.fecha || ""} — ${
            registro.tratamiento ||
            registro.tipo ||
            ""
          } — ${
            registro.producto || ""
          } ${
            registro.dosis || ""
          } — ${
            registro.observacion || ""
          }`
        }
        editar={(registro) =>
          editarRegistro(
            "salud",
            registro
          )
        }
        eliminar={(id) =>
          eliminarRegistro(
            "salud",
            id
          )
        }
      />

      <Historial
        titulo="❤️ Reproducción"
        textoBoton="➕ Agregar reproducción"
        abrir={() =>
          abrirNuevoFormulario(
            "reproduccion"
          )
        }
        mostrarFormulario={
          formularioActivo ===
          "reproduccion"
        }
        formulario={
          <FormularioReproduccion
            datos={
              edicion?.campo ===
              "reproduccion"
                ? edicion.datos
                : null
            }
            guardar={(datos) =>
              guardarRegistro(
                "reproduccion",
                datos
              )
            }
            cancelar={
              cancelarFormulario
            }
          />
        }
        registros={
          animal.reproduccion
        }
        renderizar={(registro) =>
          `${registro.fecha || ""} — ${
            registro.tipo || ""
          } — ${
            registro.toro ||
            registro.reproductor ||
            ""
          } — ${
            registro.observacion || ""
          }`
        }
        editar={(registro) =>
          editarRegistro(
            "reproduccion",
            registro
          )
        }
        eliminar={(id) =>
          eliminarRegistro(
            "reproduccion",
            id
          )
        }
      />

      <Historial
        titulo="🐮 Partos y crías"
        textoBoton="➕ Registrar parto"
        abrir={() =>
          abrirNuevoFormulario(
            "partos"
          )
        }
        mostrarFormulario={
          formularioActivo === "partos"
        }
        formulario={
          <FormularioParto
            datos={
              edicion?.campo ===
              "partos"
                ? edicion.datos
                : null
            }
            guardar={(datos) =>
              guardarRegistro(
                "partos",
                datos
              )
            }
            cancelar={
              cancelarFormulario
            }
          />
        }
        registros={animal.partos}
        renderizar={(registro) =>
          `${registro.fecha || ""} — Cría ${
            registro.cria ||
            registro.chapetaCria ||
            ""
          } — ${
            registro.sexo || ""
          } — ${
            registro.observacion || ""
          }`
        }
        editar={(registro) =>
          editarRegistro(
            "partos",
            registro
          )
        }
        eliminar={(id) =>
          eliminarRegistro(
            "partos",
            id
          )
        }
      />

      <Historial
        titulo="🥛 Producción de leche"
        textoBoton="➕ Registrar leche"
        abrir={() =>
          abrirNuevoFormulario(
            "leche"
          )
        }
        mostrarFormulario={
          formularioActivo === "leche"
        }
        formulario={
          <FormularioLeche
            datos={
              edicion?.campo ===
              "leche"
                ? edicion.datos
                : null
            }
            guardar={(datos) =>
              guardarRegistro(
                "leche",
                datos
              )
            }
            cancelar={
              cancelarFormulario
            }
          />
        }
        registros={animal.leche}
        renderizar={(registro) =>
          `${registro.fecha || ""} — ${
            registro.litros || 0
          } litros — ${
            registro.observacion || ""
          }`
        }
        editar={(registro) =>
          editarRegistro(
            "leche",
            registro
          )
        }
        eliminar={(id) =>
          eliminarRegistro(
            "leche",
            id
          )
        }
      />
    </div>
  );
}

function Historial({
  titulo,
  textoBoton,
  abrir,
  mostrarFormulario,
  formulario,
  registros,
  renderizar,
  editar,
  eliminar,
}) {
  return (
    <section className="seccion">
      <h3>{titulo}</h3>

      <button
        type="button"
        onClick={abrir}
      >
        {textoBoton}
      </button>

      {mostrarFormulario &&
        formulario}

      {registros.length === 0 ? (
        <p>No hay registros.</p>
      ) : (
        registros.map((registro) => (
          <div
            className="registro"
            key={registro.id}
          >
            <p>
              {renderizar(registro)}
            </p>

            <div className="acciones-centro">
              <button
                type="button"
                onClick={() =>
                  editar(registro)
                }
              >
                ✏️ Editar
              </button>

              <button
                type="button"
                className="boton-peligro"
                onClick={() =>
                  eliminar(registro.id)
                }
              >
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function FormularioBase({
  titulo,
  children,
  enviar,
  cancelar,
}) {
  return (
    <form
      className="formulario formulario-interno"
      onSubmit={enviar}
    >
      <h4>{titulo}</h4>

      {children}

      <div className="acciones-centro">
        <button type="submit">
          💾 Guardar
        </button>

        <button
          type="button"
          className="boton-secundario"
          onClick={cancelar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FormularioPeso({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      fecha: datos?.fecha || hoy(),
      peso: datos?.peso || "",
      observacion:
        datos?.observacion || "",
    });

  function enviar(event) {
    event.preventDefault();

    const peso = Number(
      formulario.peso
    );

    if (
      !Number.isFinite(peso) ||
      peso <= 0
    ) {
      alert(
        "Escriba un peso válido."
      );
      return;
    }

    guardar({
      ...formulario,
      peso: String(peso),
    });
  }

  return (
    <FormularioBase
      titulo="Registro de peso"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Fecha
        <input
          type="date"
          value={formulario.fecha}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              fecha:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Peso (kg)
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={formulario.peso}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              peso:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Observación
        <textarea
          rows="3"
          value={
            formulario.observacion
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              observacion:
                event.target.value,
            })
          }
        />
      </label>
    </FormularioBase>
  );
}

function FormularioSalud({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      fecha: datos?.fecha || hoy(),

      tratamiento:
        datos?.tratamiento ||
        datos?.tipo ||
        "",

      producto:
        datos?.producto || "",

      dosis: datos?.dosis || "",

      observacion:
        datos?.observacion || "",
    });

  function enviar(event) {
    event.preventDefault();

    if (
      !formulario.tratamiento.trim()
    ) {
      alert(
        "Escriba el tratamiento."
      );
      return;
    }

    guardar(formulario);
  }

  return (
    <FormularioBase
      titulo="Salud / tratamiento"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Fecha
        <input
          type="date"
          value={formulario.fecha}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              fecha:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Tratamiento
        <input
          type="text"
          placeholder="Ejemplo: vacuna, mastitis, desparasitación..."
          value={
            formulario.tratamiento
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              tratamiento:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Producto / medicamento
        <input
          type="text"
          value={formulario.producto}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              producto:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Dosis
        <input
          type="text"
          value={formulario.dosis}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              dosis:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Observación
        <textarea
          rows="3"
          value={
            formulario.observacion
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              observacion:
                event.target.value,
            })
          }
        />
      </label>
    </FormularioBase>
  );
}

function FormularioReproduccion({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      fecha: datos?.fecha || hoy(),

      tipo:
        datos?.tipo || "Monta",

      toro:
        datos?.toro ||
        datos?.reproductor ||
        "",

      observacion:
        datos?.observacion || "",
    });

  function enviar(event) {
    event.preventDefault();

    guardar(formulario);
  }

  return (
    <FormularioBase
      titulo="Registro de reproducción"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Fecha
        <input
          type="date"
          value={formulario.fecha}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              fecha:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Tipo de registro
        <select
          value={formulario.tipo}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              tipo:
                event.target.value,
            })
          }
        >
          <option value="Celo">
            Celo
          </option>

          <option value="Monta">
            Monta
          </option>

          <option value="Inseminación">
            Inseminación
          </option>

          <option value="Diagnóstico de preñez">
            Diagnóstico de preñez
          </option>

          <option value="Secado">
            Secado
          </option>

          <option value="Otro">
            Otro
          </option>
        </select>
      </label>

      <label>
        Toro / semen
        <input
          type="text"
          value={formulario.toro}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              toro:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Observación
        <textarea
          rows="3"
          value={
            formulario.observacion
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              observacion:
                event.target.value,
            })
          }
        />
      </label>
    </FormularioBase>
  );
}

function FormularioParto({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      fecha: datos?.fecha || hoy(),

      cria:
        datos?.cria ||
        datos?.chapetaCria ||
        "",

      sexo: datos?.sexo || "",

      observacion:
        datos?.observacion || "",
    });

  function enviar(event) {
    event.preventDefault();

    if (!formulario.cria.trim()) {
      alert(
        "Escriba la chapeta o identificación de la cría."
      );
      return;
    }

    guardar(formulario);
  }

  return (
    <FormularioBase
      titulo="Registro de parto"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Fecha del parto
        <input
          type="date"
          value={formulario.fecha}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              fecha:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Chapeta / identificación de la cría
        <input
          type="text"
          value={formulario.cria}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              cria:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Sexo de la cría
        <select
          value={formulario.sexo}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              sexo:
                event.target.value,
            })
          }
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
        Observación
        <textarea
          rows="3"
          value={
            formulario.observacion
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              observacion:
                event.target.value,
            })
          }
        />
      </label>
    </FormularioBase>
  );
}

function FormularioLeche({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      fecha: datos?.fecha || hoy(),

      litros:
        datos?.litros ||
        datos?.cantidad ||
        datos?.produccion ||
        "",

      observacion:
        datos?.observacion || "",
    });

  function enviar(event) {
    event.preventDefault();

    const litros = Number(
      formulario.litros
    );

    if (
      !Number.isFinite(litros) ||
      litros < 0 ||
      formulario.litros === ""
    ) {
      alert(
        "Escriba una cantidad válida de litros."
      );
      return;
    }

    guardar({
      ...formulario,
      litros: String(litros),
    });
  }

  return (
    <FormularioBase
      titulo="Producción de leche"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Fecha
        <input
          type="date"
          value={formulario.fecha}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              fecha:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Litros
        <input
          type="number"
          min="0"
          step="0.1"
          value={formulario.litros}
          onChange={(event) =>
            setFormulario({
              ...formulario,
              litros:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        Observación
        <textarea
          rows="3"
          value={
            formulario.observacion
          }
          onChange={(event) =>
            setFormulario({
              ...formulario,
              observacion:
                event.target.value,
            })
          }
        />
      </label>
    </FormularioBase>
  );
}

function FormularioAnimal({
  datos,
  guardar,
  cancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      nombre: datos.nombre || "",

      colorChapeta:
        datos.colorChapeta || "",

      tipo: datos.tipo || "",

      sexo: datos.sexo || "",

      raza: datos.raza || "",

      fechaNacimiento:
        datos.fechaNacimiento || "",

      madre: datos.madre || "",

      padre: datos.padre || "",

      procedencia:
        datos.procedencia || "",

      observaciones:
        datos.observaciones || "",
    });

  function cambiar(event) {
    const { name, value } =
      event.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  function enviar(event) {
    event.preventDefault();

    if (!formulario.tipo) {
      alert(
        "Seleccione el tipo de animal."
      );
      return;
    }

    if (!formulario.sexo) {
      alert(
        "Seleccione el sexo."
      );
      return;
    }

    guardar(formulario);
  }

  return (
    <FormularioBase
      titulo="Editar datos del animal"
      enviar={enviar}
      cancelar={cancelar}
    >
      <label>
        Nombre
        <input
          name="nombre"
          value={formulario.nombre}
          onChange={cambiar}
        />
      </label>

      <label>
        Color de chapeta
        <input
          name="colorChapeta"
          value={
            formulario.colorChapeta
          }
          onChange={cambiar}
        />
      </label>

      <label>
        Tipo
        <select
          name="tipo"
          value={formulario.tipo}
          onChange={cambiar}
        >
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
          onChange={cambiar}
        >
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
          name="raza"
          value={formulario.raza}
          onChange={cambiar}
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
          onChange={cambiar}
        />
      </label>

      <label>
        Madre
        <input
          name="madre"
          value={formulario.madre}
          onChange={cambiar}
        />
      </label>

      <label>
        Padre / Toro
        <input
          name="padre"
          value={formulario.padre}
          onChange={cambiar}
        />
      </label>

      <label>
        Procedencia
        <input
          name="procedencia"
          value={
            formulario.procedencia
          }
          onChange={cambiar}
        />
      </label>

      <label>
        Observaciones
        <textarea
          rows="4"
          name="observaciones"
          value={
            formulario.observaciones
          }
          onChange={cambiar}
        />
      </label>
    </FormularioBase>
  );
}

export default Animales;