import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MachineDetail from "./pages/MachineDetail";
import "./App.css";
import MatrixBackground from "./components/MatrixBackground";

export default function App() {
  return (
    <>
      <MatrixBackground />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/machine/:name" element={<MachineDetail />} />
        </Routes>
      </div>
    </>
  );
}
