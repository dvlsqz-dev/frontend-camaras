import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EZUIKit from "ezuikit-js";
import proyectos from "../proyectos";
import { API_URL } from "../config";

export default function ViewCamera() {
  const { serial } = useParams();
  const [proyecto, setProyecto] = useState(
    proyectos[serial] || { titulo: "", descripcion: "" }
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchProyecto() {
      try {
        const r = await fetch(`${API_URL}/proyectos`);
        const data = await r.json();
        if (!cancelled && data && data[serial]) {
          setProyecto(data[serial]);
        }
      } catch (err) {
        console.error("Error cargando datos del proyecto:", err);
      }
    }

    fetchProyecto();
    return () => {
      cancelled = true;
    };
  }, [serial]);

  useEffect(() => {
    async function start() {
      try {
        const r = await fetch(`${API_URL}/token`);
        const data = await r.json();
        const token = data.data.accessToken;

        const url = `ezopen://open.ezviz.com/${serial}/1.hd.live`;

        new EZUIKit.EZUIKitPlayer({
          id: "player-view",
          accessToken: token,
          url,
          template: "pcLive",
          audio: 1,
          language: "en",
          env: { domain: "https://iusopen.ezvizlife.com" },
        });
      } catch (err) {
        console.error("Error cargando cámara:", err);
      }
    }

    start();
  }, [serial]);

  return (
    <div style={{ paddingTop: 5, paddingLeft: 20, paddingRight: 20 }}>
      <h1 style={{ color: "white", fontSize: "22px", marginBottom: "5px", marginTop: "-10px" }}>
        {proyecto.titulo || "Cámara sin nombre"}
      </h1>

      {proyecto.descripcion && (
        <p style={{ color: "white", opacity: 0.7, marginBottom: "5px" }}>
          {proyecto.descripcion}
        </p>
      )}

      <div
        id="player-view"
        style={{ width: "100%", height: 550, background: "black" }}
      ></div>
    </div>
  );
}