import React from "react";
import Routes from "./Routes";

// Componente de prueba para verificar que React funciona
function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'blue' }}>¡React está funcionando!</h1>
      <p>Si ves este mensaje, React está trabajando correctamente.</p>
      <Routes />
    </div>
  );
}

export default App;
