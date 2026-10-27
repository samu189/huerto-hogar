import React from 'react';

// Imágenes de Unsplash (uso libre). El banner lleva una capa oscura para que el texto blanco se lea bien.
const IMAGEN_BANNER = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1600&q=80';

const CATEGORIAS_HOME = [
  { nombre: 'Semillas', imagen: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80' },
  { nombre: 'Sustratos', imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80' },
  { nombre: 'Herramientas', imagen: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=400&q=80' },
  { nombre: 'Fertilizantes', imagen: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80' }
];

export default function Home({ setVistaActual, productos, agregarAlCarrito }) {
  return (
    <div className="container py-4">
      <div
        className="p-5 mb-4 rounded-3 shadow-sm text-center text-white d-flex flex-column justify-content-center"
        style={{
          minHeight: '300px',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${IMAGEN_BANNER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h1 className="display-4 fw-bold">Nuevos Lanzamientos</h1>
        <p className="fs-5">Encuentra todo para tu huerto urbano con la mejor calidad y asesoría.</p>
        <div>
          <button className="btn btn-success btn-lg" onClick={() => setVistaActual('productos')}>Ver Catálogo Completo</button>
        </div>
      </div>

      <h3 className="mb-3 fw-bold">Categorías</h3>
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-5 text-center">
        {CATEGORIAS_HOME.map((cat) => (
          <div key={cat.nombre} className="col">
            <div className="card h-100 shadow-sm" role="button" onClick={() => setVistaActual('categorias')}>
              <img src={cat.imagen} className="card-img-top" alt={cat.nombre} style={{ height: '150px', objectFit: 'cover' }} />
              <div className="card-footer bg-white border-0">
                <h5 className="card-title text-success mb-0">{cat.nombre}</h5>
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