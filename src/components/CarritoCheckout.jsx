import React, { useState } from 'react';

export default function CarritoCheckout({ carrito, setCarrito, totalCarrito, setResultadoPago, setVistaActual, usuario }) {
  const [cliente, setCliente] = useState({
    nombre: usuario ? usuario.nombre : 'Pedro',
    apellido: usuario ? usuario.apellido : 'Hacker',
    correo: usuario ? usuario.correo : 'pedro.hacker20@example.com',
    calle: 'Los Crisantemos, Edificio Norte',
    depto: 'Depto 603',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos',
    indicaciones: 'El martes no estaremos en el depto, dejar con conserje.'
  });

  const cambiarCantidad = (id, delta) => {
    const nuevo = carrito.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cantidad + delta;
        return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
      }
      return item;
    }).filter(Boolean);
    setCarrito(nuevo);
  };

  const procesarPago = (simularError = false) => {
    if (carrito.length === 0) return;
    const datosFinales = { cliente, carrito, total: totalCarrito, exito: !simularError };
    setResultadoPago(datosFinales);
    if (!simularError) setCarrito([]);
    setVistaActual('resultado_pago');
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success mb-4">Carrito de Compra y Checkout</h2>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm p-3 mb-4">
            <h5 className="fw-bold mb-3">Detalle del Carrito</h5>
            {carrito.length === 0 ? (
              <p className="text-muted">El carrito está vacío.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cant.</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item => (
                      <tr key={item.id}>
                        <td>{item.nombre}</td>
                        <td>${item.precio.toLocaleString('es-CL')}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                            <span className="btn btn-light disabled">{item.cantidad}</span>
                            <button className="btn btn-outline-secondary" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                          </div>
                        </td>
                        <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <span className="fs-5 fw-bold">Total a pagar:</span>
              <span className="fs-4 fw-bold text-success">${totalCarrito.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm p-4">
            <h5 className="fw-bold mb-3">Información del Cliente y Dirección</h5>
            <div className="mb-2"><label className="form-label small">Nombre:</label><input type="text" className="form-control form-control-sm" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} /></div>
            <div className="mb-2"><label className="form-label small">Apellido:</label><input type="text" className="form-control form-control-sm" value={cliente.apellido} onChange={e => setCliente({...cliente, apellido: e.target.value})} /></div>
            <div className="mb-2"><label className="form-label small">Correo:</label><input type="email" className="form-control form-control-sm" value={cliente.correo} onChange={e => setCliente({...cliente, correo: e.target.value})} /></div>
            <div className="mb-2"><label className="form-label small">Calle/Número:</label><input type="text" className="form-control form-control-sm" value={cliente.calle} onChange={e => setCliente({...cliente, calle: e.target.value})} /></div>
            <div className="row g-2 mb-2">
              <div className="col"><label className="form-label small">Región:</label><input type="text" className="form-control form-control-sm" value={cliente.region} readOnly /></div>
              <div className="col"><label className="form-label small">Comuna:</label><input type="text" className="form-control form-control-sm" value={cliente.comuna} onChange={e => setCliente({...cliente, comuna: e.target.value})} /></div>
            </div>
            <div className="mb-3"><label className="form-label small">Indicaciones:</label><textarea className="form-control form-control-sm" rows="2" value={cliente.indicaciones} onChange={e => setCliente({...cliente, indicaciones: e.target.value})}></textarea></div>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-success fw-bold py-2" disabled={carrito.length === 0} onClick={() => procesarPago(false)}>
                ✅ Pagar Ahora ${totalCarrito.toLocaleString('es-CL')}
              </button>
              <button className="btn btn-outline-danger btn-sm" disabled={carrito.length === 0} onClick={() => procesarPago(true)}>
                ⚠️ Simular Error en Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}