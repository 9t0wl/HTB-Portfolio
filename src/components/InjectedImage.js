// src/components/InjectedImage.js
import React from "react";

export default function InjectedImage({ imgSrc, alt }) {
  if (!imgSrc) return null;

  return (
    <div
      style={{
        border: "2px solid #0f0",
        padding: "10px",
        margin: "1rem auto",
        textAlign: "center",
        backgroundColor: "#000",
        boxShadow: "0 0 10px #0f0",
        maxWidth: "90%",
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        style={{ maxWidth: "100%", borderRadius: "8px" }}
      />
    </div>
  );
}
