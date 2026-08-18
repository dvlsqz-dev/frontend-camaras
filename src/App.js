import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CameraGrid from "./CameraGrid";
import Player from "./Player";
import ViewCamera from "./pages/ViewCamera";
import EditCamera from "./pages/EditCamera";

export default function App() {
  const [selectedCamera, setSelectedCamera] = useState(null);

  return (
    <Router>
      <div style={{ fontFamily: "sans-serif", padding: 20 }}>
        <Routes>
          {/* Página principal con las cámaras */}
          <Route
            path="/"
            element={
              !selectedCamera ? (
                <CameraGrid onSelectCamera={(cam) => setSelectedCamera(cam)} />
              ) : (
                <Player
                  camera={selectedCamera}
                  onBack={() => setSelectedCamera(null)}
                />
              )
            }
          />

          {/* Nueva página que muestra la cámara desde la URL */}
          <Route path="/view/:serial" element={<ViewCamera />} />

          {/* Página para editar nombre y descripción */}
          <Route path="/editar" element={<EditCamera />} />
        </Routes>
      </div>
    </Router>
  );
}
