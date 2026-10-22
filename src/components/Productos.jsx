import React, { useState } from 'react';

export default function Productos({ productos, agregarAlCarrito, setProductoSeleccionado, setVistaActual }) {
  const [busqueda, setBusqueda] = useState('');
  const [catFiltro, setCatFiltro] = useState('Todas');

  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = catFiltro === 'Todas' || p.categoria === catFiltro;
    return coincideNombre && coincideCat;
  });

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success mb-4">Catálogo de Productos</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar producto por nombre..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>
        <div className="col-md-6">
          <select className="form-select" value={catFiltro} onChange={(e) => setCatFiltro(e.target.value)}>
            <option value="Todas">Todas las categorías</option>
            <option value="Semillas">Semillas</option>
            <option value="Sustratos">Sustratos</option>
            <option value="Herramientas">Herramientas</option>
            <option value="Fertilizantes">Fertilizantes</option>
          </select>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4" id="lista-productos">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="col">
            <div className="card h-100 shadow-sm">
              <img src={prod.imagen} className="card-img-top" alt={prod.nombre} style={{ height: '220px', objectFit: 'cover' }} />
              <div className="card-body">
                <span className="badge bg-secondary mb-2">{prod.categoria}</span>
                <h5 className="card-title">{prod.nombre}</h5>
                <p className="card-text text-truncate">{prod.descripcion}</p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-5 fw-bold text-success">${prod.precio.toLocaleString('es-CL')}</span>
                  <small className={`badge ${prod.stock < 5 ? 'bg-danger' : 'bg-success'}`}>Stock: {prod.stock}</small>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => { setProductoSeleccionado(prod); setVistaActual('detalle'); }}>Ver Detalle</button>
                  <button className="btn btn-success btn-sm flex-grow-1" onClick={() => agregarAlCarrito(prod)}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}