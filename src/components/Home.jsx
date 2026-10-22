import React from 'react';

export default function Home({ setVistaActual, productos, agregarAlCarrito }) {
  return (
    <div className="container py-4">
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm text-center">
        <h1 className="display-4 fw-bold text-success">1200 x 300 - Nuevos Lanzamientos</h1>
        <p className="fs-5 text-muted">Encuentra todo para tu huerto urbano con la mejor calidad y asesoría.</p>
        <button className="btn btn-success btn-lg" onClick={() => setVistaActual('productos')}>Ver Catálogo Completo</button>
      </div>

      <h3 className="mb-3 fw-bold">Categorías</h3>
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-5 text-center">
        {['Semillas', 'Sustratos', 'Herramientas', 'Fertilizantes'].map((cat, idx) => (
          <div key={idx} className="col">
            <div className="card h-100 shadow-sm cursor-pointer" onClick={() => setVistaActual('categorias')}>
              <div className="card-body bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                <span className="fs-4 fw-semibold text-secondary">400 x 200 - {cat}</span>
              </div>
              <div className="card-footer bg-white border-0">
                <h5 className="card-title text-success mb-0">{cat}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 fw-bold">Productos Destacados</h3>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {productos.slice(0, 3).map((prod) => (
          <div key={prod.id} className="col">
            <div className="card h-100 shadow-sm">
              <img src={prod.imagen} className="card-img-top" alt={prod.nombre} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body">
                <span className="badge bg-secondary mb-2">{prod.categoria}</span>
                <h5 className="card-title">{prod.nombre}</h5>
                <p className="card-text text-muted fs-5 fw-bold">${prod.precio.toLocaleString('es-CL')}</p>
                <button className="btn btn-outline-success w-100" onClick={() => agregarAlCarrito(prod)}>
                  🛒 Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}