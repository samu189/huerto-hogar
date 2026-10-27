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
          <img
            src="https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80"
            alt="Plantas cultivadas dentro de un hogar"
            className="img-fluid rounded shadow-sm w-100"
            style={{ height: '300px', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
}