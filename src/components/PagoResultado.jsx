import React from 'react';

export default function PagoResultado({ resultado, setVistaActual }) {
  if (!resultado) return <div className="container py-5">No hay orden registrada.</div>;

  const { cliente, carrito, total, exito } = resultado;

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      {exito ? (
        <div className="card border-success shadow p-4">
          <div className="text-center mb-4">
            <span className="display-1 text-success">🎉</span>
            <h3 className="fw-bold text-success mt-2">¡Se ha realizado la compra!</h3>
            <p className="text-muted">Código ORDER20240705</p>
          </div>
          <h5>Detalles de la Entrega:</h5>
          <p className="mb-1"><strong>Cliente:</strong> {cliente.nombre} {cliente.apellido} ({cliente.correo})</p>
          <p className="mb-3"><strong>Dirección:</strong> {cliente.calle}, {cliente.comuna}, {cliente.region}</p>
          <div className="alert alert-light border">
            <h6 className="fw-bold">Resumen de Productos:</h6>
            <ul className="mb-0">
              {carrito.map(p => (
                <li key={p.id}>{p.nombre} x {p.cantidad} - ${(p.precio * p.cantidad).toLocaleString('es-CL')}</li>
              ))}
            </ul>
            <div className="fw-bold text-end mt-2 fs-5">Total Pagado: ${total.toLocaleString('es-CL')}</div>
          </div>
          <button className="btn btn-success w-100 mt-3" onClick={() => setVistaActual('home')}>Volver al Inicio</button>
        </div>
      ) : (
        <div className="card border-danger shadow p-4 text-center">
          <span className="display-1 text-danger">❌</span>
          <h3 className="fw-bold text-danger mt-2">No se pudo realizar el pago.</h3>
          <p className="text-muted">Orden nro #20240705 - Fondos insuficientes o transacción rechazada por el banco.</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-danger" onClick={() => setVistaActual('checkout')}>Volver a Intentar Pago</button>
            <button className="btn btn-outline-secondary" onClick={() => setVistaActual('home')}>Ir al Inicio</button>
          </div>
        </div>
      )}
    </div>
  );
}