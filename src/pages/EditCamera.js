import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaUndo } from "react-icons/fa";
import proyectos from "../proyectos";
import { API_URL } from "../config";
import "./EditCamera.css";

export default function EditCamera() {
  const navigate = useNavigate();

  const [cameras, setCameras] = useState([]);
  const [proyectosData, setProyectosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [serial, setSerial] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [status, setStatus] = useState(""); // "" | "saving" | "saved" | "error"
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [camRes, proyRes] = await Promise.all([
          fetch(`${API_URL}/cameras`),
          fetch(`${API_URL}/proyectos`),
        ]);

        if (!camRes.ok || !proyRes.ok) {
          throw new Error(
            `Error del servidor (código ${camRes.status || proyRes.status})`
          );
        }

        const cams = await camRes.json();
        const proys = await proyRes.json();

        setCameras(Array.isArray(cams) ? cams : []);
        setProyectosData(proys || {});

        if (Array.isArray(cams) && cams.length) {
          setSerial(cams[0].serial);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setLoadError(
          "No se pudo conectar con el servidor. Intenta de nuevo en unos segundos."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function getProyecto(camSerial) {
    if (proyectosData[camSerial]) return proyectosData[camSerial];
    if (proyectos[camSerial]) return proyectos[camSerial];
    return null;
  }

  function handleSelect(camSerial) {
    setSerial(camSerial);
    const info = getProyecto(camSerial);
    const cam = cameras.find((c) => c.serial === camSerial);
    setTitulo(info?.titulo || cam?.name || "");
    setDescripcion(info?.descripcion || "");
  }

  async function guardar() {
    if (!serial) return;

    setStatus("saving");
    setStatusMsg("Guardando...");

    try {
      const res = await fetch(`${API_URL}/proyectos/${serial}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          throw new Error(
            "El servidor está dormido (modo gratuito). Espera unos 30 segundos y vuelve a intentar."
          );
        }
        throw new Error("Error del servidor al guardar.");
      }

      setProyectosData((prev) => ({
        ...prev,
        [serial]: { titulo, descripcion },
      }));

      setStatus("saved");
      setStatusMsg("Guardado correctamente.");
    } catch (err) {
      console.error("Error guardando:", err);
      setStatus("error");
      setStatusMsg(err.message || "No se pudo guardar.");
    }
  }

  function reiniciar() {
    setTitulo("");
    setDescripcion("");
    setStatus("");
    setStatusMsg("");
  }

  if (loading)
    return <p style={{ color: "white" }}>Cargando cámaras...</p>;

  if (loadError || !cameras.length)
    return (
      <div className="edit-container">
        <button className="edit-back" onClick={() => navigate("/")}>
          <FaArrowLeft size={14} style={{ marginRight: 6 }} />
          Volver
        </button>
        <p style={{ color: "white", marginTop: 30 }}>
          {loadError || "No hay cámaras disponibles"}
        </p>
      </div>
    );

  const info = getProyecto(serial);

  return (
    <div className="edit-container">
      <button className="edit-back" onClick={() => navigate("/")}>
        <FaArrowLeft size={14} style={{ marginRight: 6 }} />
        Volver
      </button>

      <h1 className="edit-title">Editar nombre y descripción</h1>
      <p className="edit-subtitle">
        Selecciona una cámara y actualiza su información. Los cambios aplican
        para todos los enlaces compartidos.
      </p>

      <div className="edit-card">
        <label className="edit-label" htmlFor="cam-select">
          Cámara
        </label>
        <select
          id="cam-select"
          className="edit-select"
          value={serial}
          onChange={(e) => handleSelect(e.target.value)}
        >
          {cameras.map((c) => (
            <option key={c.serial} value={c.serial}>
              {c.serial} — {getProyecto(c.serial)?.titulo || c.name || "Sin nombre"}
            </option>
          ))}
        </select>

        <label className="edit-label" htmlFor="edit-titulo">
          Nombre / Título
        </label>
        <input
          id="edit-titulo"
          className="edit-input"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nombre de la cámara"
        />

        <label className="edit-label" htmlFor="edit-desc">
          Descripción
        </label>
        <textarea
          id="edit-desc"
          className="edit-textarea"
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del proyecto"
        />

        {info && (
          <p className="edit-original">
            Valor original: {info.titulo}
          </p>
        )}

        <div className="edit-actions">
          <button
            className="edit-save"
            onClick={guardar}
            disabled={status === "saving"}
          >
            <FaSave style={{ marginRight: 6 }} />
            {status === "saving" ? "Guardando..." : "Guardar"}
          </button>

          <button className="edit-reset" onClick={reiniciar}>
            <FaUndo style={{ marginRight: 6 }} />
            Limpiar
          </button>
        </div>

        {status && (
          <p
            className={
              status === "saved"
                ? "edit-msg edit-ok"
                : status === "error"
                ? "edit-msg edit-error"
                : "edit-msg"
            }
          >
            {statusMsg}
          </p>
        )}

        {status === "error" && (
          <button className="edit-retry" onClick={guardar}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}