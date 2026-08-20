import { useState } from "react";
import { API_URL } from "../config";
import "./RegisterModal.css";

export default function RegisterModal({ open, onClose, onSuccess }) {
  const [serial, setSerial] = useState("");
  const [validateCode, setValidateCode] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  if (!open) return null;

  async function registrar(e) {
    e.preventDefault();

    if (!serial.trim() || !validateCode.trim() || !pin.trim()) {
      setStatus("error");
      setStatusMsg("Completa los tres campos.");
      return;
    }

    setStatus("saving");
    setStatusMsg("Registrando cámara...");

    try {
      const res = await fetch(`${API_URL}/cameras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial: serial.trim(),
          validateCode: validateCode.trim(),
          pin: pin.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let msg = data?.error || "No se pudo registrar la cámara.";
        if (res.status === 401) msg = "PIN de administrador incorrecto.";
        setStatus("error");
        setStatusMsg(msg);
        return;
      }

      setStatus("saved");
      setStatusMsg("Cámara registrada correctamente.");
      onSuccess?.();
      setTimeout(() => onClose?.(), 1500);
    } catch (err) {
      console.error("Error registrando cámara:", err);
      setStatus("error");
      setStatusMsg("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Registrar nueva cámara</h2>

        <p className="modal-text">
          Ingresa el serial y el código de verificación de la etiqueta de la
          cámara, junto con el PIN de administrador.
        </p>

        <form onSubmit={registrar}>
          <label className="reg-label" htmlFor="reg-serial">
            Serial de la cámara
          </label>
          <input
            id="reg-serial"
            className="reg-input"
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Ej: BE3883762"
          />

          <label className="reg-label" htmlFor="reg-code">
            Código de verificación
          </label>
          <input
            id="reg-code"
            className="reg-input"
            type="text"
            value={validateCode}
            onChange={(e) => setValidateCode(e.target.value)}
            placeholder="Código de la etiqueta de la cámara"
          />

          <label className="reg-label" htmlFor="reg-pin">
            PIN de administrador
          </label>
          <input
            id="reg-pin"
            className="reg-input"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN de administrador"
          />

          {status && (
            <p
              className={
                "reg-msg" +
                (status === "error"
                  ? " reg-error"
                  : status === "saved"
                  ? " reg-ok"
                  : "")
              }
            >
              {statusMsg}
            </p>
          )}

          <div className="reg-actions">
            <button
              className="reg-submit"
              type="submit"
              disabled={status === "saving"}
            >
              {status === "saving" ? "Registrando..." : "Registrar"}
            </button>

            <button className="reg-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
