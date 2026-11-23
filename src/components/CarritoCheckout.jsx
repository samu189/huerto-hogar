import React, { useState } from 'react';

export default function CarritoCheckout({ carrito, setCarrito, totalCarrito, onPagar, onPagoRechazado, setVistaActual, usuario }) {
  const [cliente, setCliente] = useState({
    nombre: usuario ? usuario.nombre : '',
    apellido: usuario ? usuario.apellido : '',
    correo: usuario ? usuario.correo : '',
    calle: 'Los Crisantemos, Edificio Norte',
    depto: 'Depto 603',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos',
    indicaciones: 'El martes no estaremos en el depto, dejar con conserje.'
  });
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

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

  // El pago se envía al backend (POST /api/v1/boletas). Si falla (por ejemplo, sin stock), se muestra el mensaje de la API.
  const procesarPago = async () => {
    if (carrito.length === 0) return;
    setError('');
    setProcesando(true);
    try {
      await onPagar(cliente);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  };

  const campo = (clave, texto, tipo = 'text') => (
    <div className="mb-2">
      <label className="form-label small" htmlFor={`chk-${clave}`}>{texto}:</label>
      <input id={`chk-${clave}`} type={tipo} className="form-control form-control-sm" value={cliente[clave]}
        onChange={e => setCliente({ ...cliente, [clave]: e.target.value })} />
    </div>
  );

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
                    <tr><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th><th></th></tr>
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
            {!usuario && (
              <div className="alert alert-warning py-2" id="avisoLogin">
                Para comprar debes iniciar sesión.
                <button className="btn btn-link btn-sm p-0 ms-1 align-baseline" onClick={() => setVistaActual('login')}>Iniciar sesión</button>
              </div>
            )}
            {error && <div className="alert alert-danger py-2" id="errPago">{error}</div>}
            {campo('nombre', 'Nombre')}
            {campo('apellido', 'Apellido')}
            {campo('correo', 'Correo', 'email')}
            {campo('calle', 'Calle/Número')}
            <div className="row g-2 mb-2">
              <div className="col"><label className="form-label small" htmlFor="chk-region">Región:</label><input id="chk-region" type="text" className="form-control form-control-sm" value={cliente.region} readOnly /></div>
              <div className="col"><label className="form-label small" htmlFor="chk-comuna">Comuna:</label><input id="chk-comuna" type="text" className="form-control form-control-sm" value={cliente.comuna} onChange={e => setCliente({ ...cliente, comuna: e.target.value })} /></div>
            </div>
            <div className="mb-3"><label className="form-label small" htmlFor="chk-indicaciones">Indicaciones:</label><textarea id="chk-indicaciones" className="form-control form-control-sm" rows="2" value={cliente.indicaciones} onChange={e => setCliente({ ...cliente, indicaciones: e.target.value })}></textarea></div>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-success fw-bold py-2" id="btnPagar" disabled={carrito.length === 0 || !usuario || procesando} onClick={procesarPago}>
                {procesando ? 'Procesando pago...' : `✅ Pagar Ahora $${totalCarrito.toLocaleString('es-CL')}`}
              </button>
              <button className="btn btn-outline-danger btn-sm" disabled={carrito.length === 0} onClick={() => onPagoRechazado(cliente)}>
                ⚠️ Simular Error en Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
