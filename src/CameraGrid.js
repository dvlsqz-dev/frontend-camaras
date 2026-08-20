import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CameraGrid.css";
import { FaCamera, FaCog } from "react-icons/fa";
import ShareModal from "./components/ShareModal";
import proyectos from "./proyectos";
import { API_URL } from "./config";

export default function CameraGrid({ onSelectCamera }) {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [proyectosData, setProyectosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Modal para compartir
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  /* ============================================================
      Cargar cámaras + información guardada en el backend
     ============================================================ */
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setLoadError("");
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

      const camData = await camRes.json();
      const proyData = await proyRes.json();

      const cams = Array.isArray(camData) ? camData : [];
      const proys = proyData || {};

      setProyectosData(proys);
      setCameras(cams);
    } catch (err) {
      console.error(" Error cargando cámaras:", err);
      setCameras([]);
      setLoadError(
        err.message ||
          "No se pudo conectar con el servidor. Intenta de nuevo en unos segundos."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
      Mostrar loading
     ============================================================ */
  if (loading)
    return <p style={{ color: "white" }}>Cargando cámaras...</p>;

  if (loadError)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: 30 }}>
        <p>{loadError}</p>
        <p style={{ opacity: 0.8, fontSize: 14 }}>
          Si el servidor estuvo dormido (plan gratuito), espera unos segundos y
          vuelve a intentar.
        </p>
        <button
          className="camera-button"
          style={{ background: "#2563eb", marginTop: 10 }}
          onClick={load}
        >
          Reintentar
        </button>
      </div>
    );

  if (!cameras.length)
    return <p style={{ color: "white" }}>No hay cámaras disponibles</p>;

  const getInfo = (cam) => {
    const info = proyectosData[cam.serial] || proyectos[cam.serial];
    return {
      name: info?.titulo || info?.name || cam.name || "Sin nombre",
      desc: info?.descripcion || info?.desc || cam.desc || "",
    };
  };

  /* ============================================================
      Render
     ============================================================ */
  return (
    <>
      <h1>Proyectos Municipales</h1>
      <p>Seleccione una cámara para ver su transmisión en vivo.</p>

      <button
        className="camera-edit"
        style={{ maxWidth: 320, margin: "0 auto 10px", display: "block" }}
        onClick={() => navigate("/editar")}
      >
        <FaCog style={{ marginRight: "6px" }} />
        Editar nombres y descripciones
      </button>

      <div className="camera-grid">
        {cameras.map((cam) => {
          const { name, desc } = getInfo(cam);
          return (
            <div className="camera-card" key={cam.serial}>
              <h3 className="camera-title">{name}</h3>

              {desc && (
                <p style={{ opacity: 0.7, marginTop: "-10px" }}>{desc}</p>
              )}

              <p>
                Estado de la cámara:{" "}
                <span
                  className={cam.online ? "status-online" : "status-offline"}
                >
                  {cam.online ? "Online" : "Offline"}
                </span>
              </p>

              <p className="camera-serial">Serial de la cámara: {cam.serial}</p>

              <button
                className="camera-button"
                onClick={() =>
                  onSelectCamera({
                    serial: cam.serial,
                    name,
                    desc,
                  })
                }
              >
                <FaCamera style={{ marginRight: "6px" }} />
                Ver camara con descripción única
              </button>

              {/* BOTÓN PARA ABRIR MODAL */}
              <button
                className="camera-button"
                style={{ background: "#2563eb", marginTop: "10px" }}
                onClick={() => {
                  const url = `${window.location.origin}/view/${cam.serial}`;
                  setShareUrl(url);
                  setShowShare(true);
                }}
              >
                🔗 Generar URL para compartir
              </button>
            </div>
          );
        })}
      </div>

      {showShare && (
        <ShareModal open={showShare} url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}