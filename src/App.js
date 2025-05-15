import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MachineDetail from "./pages/MachineDetail";
import MatrixBackground from "./components/MatrixBackground";
import "./App.css";

function App() {
  return (
    <>
      <MatrixBackground />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/machine/:machineName" element={<MachineDetail />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
