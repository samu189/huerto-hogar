import React from 'react';

export default function DetalleProducto({ producto, agregarAlCarrito, setVistaActual }) {
  if (!producto) return <div className="container py-5 text-center">No hay producto seleccionado.</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-link text-decoration-none mb-3" onClick={() => setVistaActual('productos')}>← Volver a Productos</button>
      <div className="card shadow-sm p-4">
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded shadow-sm" />
          </div>
          <div className="col-md-6">
            <span className="badge bg-secondary fs-6 mb-2">{producto.categoria}</span>
            <h2 className="fw-bold">{producto.nombre}</h2>
            <p className="lead text-muted">{producto.descripcion}</p>
            <h3 className="text-success fw-bold my-3">${producto.precio.toLocaleString('es-CL')} CLP</h3>
            <p className="mb-4"><strong>Disponibilidad:</strong> {producto.stock} unidades en bodega</p>
            <button className="btn btn-success btn-lg w-100" onClick={() => agregarAlCarrito(producto)}>
              🛒 Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}