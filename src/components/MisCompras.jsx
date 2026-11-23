import React, { useEffect, useState } from 'react';
import { getMisOrdenes } from '../data/data';

// Historial de compras del usuario con sesión (GET /api/v1/boletas/mis-boletas).
export default function MisCompras() {
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMisOrdenes().then(setOrdenes).catch(e => setError(e.message));
  }, []);

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <h2 className="fw-bold text-success mb-4">Mis Compras</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {!ordenes && !error && <p className="text-muted">Cargando...</p>}
      {ordenes && ordenes.length === 0 && <p className="text-muted">Todavía no tienes compras.</p>}
      {ordenes && ordenes.map(o => (
        <div key={o.id} className="card shadow-sm mb-3">
          <div className="card-header d-flex justify-content-between">
            <span><strong>Boleta N° {o.id}</strong> · {new Date(o.fecha).toLocaleString('es-CL')}</span>
            <span className="badge bg-success">{o.estado}</span>
          </div>
          <ul className="list-group list-group-flush">
            {o.detalles.map(d => (
              <li key={d.id} className="list-group-item d-flex justify-content-between">
                <span>{d.nombreProducto} x {d.cantidad}</span>
                <span>${d.subtotal.toLocaleString('es-CL')}</span>
              </li>
            ))}
          </ul>
          <div className="card-footer text-end fw-bold">Total: ${o.total.toLocaleString('es-CL')}</div>
        </div>
      ))}
    </div>
  );
}
