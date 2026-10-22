import React from 'react';

export default function Ofertas({ productos, agregarAlCarrito }) {
  const ofertas = productos.filter(p => p.oferta);

  return (
    <div className="container py-4">
      <div className="alert alert-warning text-center fw-bold fs-4 shadow-sm mb-4">
        🔥 ¡Ofertas Exclusivas de la Semana! 🔥
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {ofertas.map((prod) => (
          <div key={prod.id} className="col">
            <div className="card h-100 shadow-sm border-warning">
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-6">OFERTA</span>
              <img src={prod.imagen} className="card-img-top" alt={prod.nombre} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title">{prod.nombre}</h5>
                <div className="mb-3">
                  <span className="text-decoration-line-through text-muted me-2">${prod.precio.toLocaleString('es-CL')}</span>
                  <span className="fs-4 fw-bold text-danger">${prod.precioOferta.toLocaleString('es-CL')}</span>
                </div>
                <button className="btn btn-warning w-100 fw-bold" onClick={() => agregarAlCarrito({ ...prod, precio: prod.precioOferta })}>
                  🛒 Aprovechar Oferta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}