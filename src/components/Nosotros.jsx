import React from 'react';

export default function Nosotros() {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-success mb-3">Sobre HuertoHogar</h2>
          <p className="lead">Somos un emprendimiento chileno dedicado a promover el autocultivo sustentable en espacios urbanos.</p>
          <p>Entregamos herramientas, insumos de primera calidad y asesoría técnica especializada para que transformes tu hogar en un espacio verde y lleno de vida.</p>
        </div>
        <div className="col-md-6">
          <div className="bg-light p-5 text-center rounded shadow-sm fs-3 text-secondary">
            400 x 300 - Imagen Nosotros
          </div>
        </div>
      </div>
    </div>
  );
}