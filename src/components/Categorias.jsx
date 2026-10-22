import React from 'react';

export default function Categorias({ categorias, productos, agregarAlCarrito }) {
  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success mb-4">Nuestras Categorías</h2>

      {categorias.map((cat, idx) => {
        const prodsCat = productos.filter(p => p.categoria === cat);
        return (
          <div key={idx} className="mb-5">
            <h3 className="border-bottom pb-2 text-dark">{cat}</h3>
            <div className="row row-cols-1 row-cols-md-3 g-3 mt-2">
              {prodsCat.length > 0 ? prodsCat.map(p => (
                <div key={p.id} className="col">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{p.nombre}</h5>
                      <p className="text-success fw-bold">${p.precio.toLocaleString('es-CL')}</p>
                      <button className="btn btn-outline-success btn-sm w-100" onClick={() => agregarAlCarrito(p)}>Añadir</button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-muted">No hay productos disponibles en esta categoría.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}