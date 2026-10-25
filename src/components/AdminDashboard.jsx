import React, { useState } from 'react';

const IMAGEN_POR_DEFECTO = 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80';
const STOCK_CRITICO = 5;
const FORM_VACIO = { nombre: '', categoria: '', precio: '', stock: '', descripcion: '', imagen: '', oferta: false, precioOferta: '' };

const clp = (valor) => `$${Number(valor).toLocaleString('es-CL')}`;

export default function AdminDashboard({
  productos, setProductos,
  categorias, setCategorias,
  usuarios, setUsuarios,
  ordenes,
  saveProducto, deleteProducto,
  saveCategoria, deleteCategoria,
  deleteUsuario
}) {
  const [tab, setTab] = useState('dashboard');
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errorProd, setErrorProd] = useState('');
  const [nuevaCat, setNuevaCat] = useState('');

  const stockCritico = productos.filter(p => p.stock < STOCK_CRITICO);
  const totalVentas = ordenes.reduce((suma, o) => suma + o.total, 0);

  // ---------- PRODUCTOS: Create + Update ----------
  const handleGuardarProd = (e) => {
    e.preventDefault();
    const precio = Number(form.precio);
    const stock = form.stock === '' ? 10 : Number(form.stock);
    const precioOferta = Number(form.precioOferta);

    if (form.nombre.trim() === '') return setErrorProd('El nombre es obligatorio.');
    if (!(precio > 0)) return setErrorProd('El precio debe ser mayor a 0.');
    if (!Number.isInteger(stock) || stock < 0) return setErrorProd('El stock debe ser un número entero mayor o igual a 0.');
    if (form.oferta && !(precioOferta > 0 && precioOferta < precio)) {
      return setErrorProd('El precio de oferta debe ser mayor a 0 y menor que el precio normal.');
    }

    const original = editandoId ? productos.find(p => p.id === editandoId) : {};
    const producto = {
      ...original,
      nombre: form.nombre.trim(),
      categoria: form.categoria || categorias[0] || 'Sin categoría',
      precio,
      stock,
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim() || IMAGEN_POR_DEFECTO,
      oferta: form.oferta,
      precioOferta: form.oferta ? precioOferta : precio
    };

    const actualizados = saveProducto(producto);
    setProductos([...actualizados]);
    cancelarEdicion();
  };

  const handleEditarProd = (p) => {
    setEditandoId(p.id);
    setErrorProd('');
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: String(p.precio),
      stock: String(p.stock),
      descripcion: p.descripcion || '',
      imagen: p.imagen || '',
      oferta: Boolean(p.oferta),
      precioOferta: p.oferta ? String(p.precioOferta) : ''
    });
    setTab('productos');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrorProd('');
  };

  // ---------- PRODUCTOS: Delete ----------
  const handleEliminarProd = (id) => {
    const actualizados = deleteProducto(id);
    setProductos([...actualizados]);
    if (editandoId === id) cancelarEdicion();
  };

  // ---------- CATEGORÍAS ----------
  const handleCrearCat = (e) => {
    e.preventDefault();
    if (nuevaCat.trim() === '') return;
    const actualizadas = saveCategoria(nuevaCat);
    setCategorias([...actualizadas]);
    setNuevaCat('');
  };

  const handleEliminarCat = (nombre) => {
    const actualizadas = deleteCategoria(nombre);
    setCategorias([...actualizadas]);
  };

  // ---------- USUARIOS ----------
  const handleEliminarUsuario = (id) => {
    const actualizados = deleteUsuario(id);
    setUsuarios([...actualizados]);
  };

  const botonTab = (id, texto) => (
    <button className={`nav-link text-start ${tab === id ? 'active bg-success' : 'text-dark'}`} onClick={() => setTab(id)}>
      {texto}
    </button>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="bg-light p-3 rounded shadow-sm">
            <h5 className="fw-bold text-success mb-3">Panel Admin</h5>
            <div className="nav flex-column nav-pills gap-1">
              {botonTab('dashboard', '📊 Dashboard')}
              {botonTab('productos', '📦 Productos (CRUD)')}
              {botonTab('criticos', `⚠️ Stock Crítico (${stockCritico.length})`)}
              {botonTab('categorias', '📂 Categorías')}
              {botonTab('usuarios', '👥 Usuarios')}
            </div>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          {tab === 'dashboard' && (
            <div>
              <h3 className="fw-bold mb-4">Métricas del Sistema</h3>
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3"><div className="card bg-primary text-white p-3 shadow-sm h-100"><h6>Total Compras</h6><p className="fs-3 fw-bold mb-0" id="metricaCompras">{ordenes.length}</p></div></div>
                <div className="col-sm-6 col-xl-3"><div className="card bg-dark text-white p-3 shadow-sm h-100"><h6>Ventas Totales</h6><p className="fs-3 fw-bold mb-0" id="metricaVentas">{clp(totalVentas)}</p></div></div>
                <div className="col-sm-6 col-xl-3"><div className="card bg-success text-white p-3 shadow-sm h-100"><h6>Productos Activos</h6><p className="fs-3 fw-bold mb-0" id="metricaProductos">{productos.length}</p></div></div>
                <div className="col-sm-6 col-xl-3"><div className="card bg-warning text-dark p-3 shadow-sm h-100"><h6>Usuarios Registrados</h6><p className="fs-3 fw-bold mb-0" id="metricaUsuarios">{usuarios.length}</p></div></div>
              </div>

              {stockCritico.length > 0 && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>⚠️ Hay <strong>{stockCritico.length}</strong> producto(s) con stock crítico (menos de {STOCK_CRITICO} unidades).</span>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setTab('criticos')}>Ver detalle</button>
                </div>
              )}

              <h5 className="fw-bold mt-4 mb-3">Últimas compras</h5>
              {ordenes.length === 0 ? (
                <p className="text-muted">Aún no hay compras registradas. Cuando un cliente pague en el checkout, aparecerá aquí.</p>
              ) : (
                <div className="card shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead><tr><th>N° Orden</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th></tr></thead>
                      <tbody>
                        {[...ordenes].reverse().slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td>{new Date(o.fecha).toLocaleString('es-CL')}</td>
                            <td>{o.cliente.nombre} {o.cliente.apellido}</td>
                            <td>{o.items.reduce((s, i) => s + i.cantidad, 0)} unid.</td>
                            <td className="fw-bold">{clp(o.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'productos' && (
            <div>
              <h3 className="fw-bold mb-3">Mantenedor de Productos</h3>

              <form id="formProducto" onSubmit={handleGuardarProd} className={`card p-3 shadow-sm mb-4 ${editandoId ? 'border-warning' : ''}`}>
                <h6 className="fw-bold text-success">{editandoId ? `Editando producto #${editandoId}` : 'Agregar Nuevo Producto'}</h6>
                {errorProd && <div id="errProducto" className="alert alert-danger py-2">{errorProd}</div>}
                <div className="row g-2">
                  <div className="col-md-4"><input type="text" id="prodNombre" className="form-control form-control-sm" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                  <div className="col-md-3">
                    <select id="prodCategoria" className="form-select form-select-sm" value={form.categoria || categorias[0] || ''} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2"><input type="number" id="prodPrecio" className="form-control form-control-sm" placeholder="Precio" min="1" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></div>
                  <div className="col-md-3"><input type="number" id="prodStock" className="form-control form-control-sm" placeholder="Stock (vacío = 10)" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                  <div className="col-md-6"><input type="text" id="prodDescripcion" className="form-control form-control-sm" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                  <div className="col-md-6"><input type="url" id="prodImagen" className="form-control form-control-sm" placeholder="URL de imagen (opcional)" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} /></div>
                  <div className="col-md-3 d-flex align-items-center">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="prodOferta" checked={form.oferta} onChange={e => setForm({ ...form, oferta: e.target.checked })} />
                      <label className="form-check-label small" htmlFor="prodOferta">En oferta</label>
                    </div>
                  </div>
                  <div className="col-md-3"><input type="number" id="prodPrecioOferta" className="form-control form-control-sm" placeholder="Precio oferta" min="1" disabled={!form.oferta} value={form.precioOferta} onChange={e => setForm({ ...form, precioOferta: e.target.value })} /></div>
                  <div className="col-md-3"><button type="submit" id="btnGuardarProducto" className="btn btn-success btn-sm w-100">{editandoId ? '💾 Guardar Cambios' : '+ Guardar Producto'}</button></div>
                  {editandoId && <div className="col-md-3"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={cancelarEdicion}>Cancelar</button></div>}
                </div>
              </form>

              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0" id="tablaProductos">
                    <thead>
                      <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {productos.map(p => (
                        <tr key={p.id} className={editandoId === p.id ? 'table-warning' : ''}>
                          <td>{p.id}</td>
                          <td>{p.nombre}</td>
                          <td>{p.categoria}</td>
                          <td>
                            {p.oferta
                              ? <><span className="text-decoration-line-through text-muted me-1">{clp(p.precio)}</span><span className="text-danger fw-bold">{clp(p.precioOferta)}</span></>
                              : clp(p.precio)}
                          </td>
                          <td><span className={`badge ${p.stock < STOCK_CRITICO ? 'bg-danger' : 'bg-success'}`}>{p.stock}</span></td>
                          <td className="text-nowrap">
                            <button className="btn btn-outline-primary btn-sm me-1" onClick={() => handleEditarProd(p)}>Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminarProd(p.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'criticos' && (
            <div>
              <h3 className="fw-bold text-danger mb-3">Stock Crítico (&lt; {STOCK_CRITICO} unidades)</h3>
              {stockCritico.length === 0 ? (
                <div className="alert alert-success">Todo el inventario tiene stock suficiente. 🎉</div>
              ) : (
                <ul className="list-group">
                  {stockCritico.map(p => (
                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span><strong>{p.nombre}</strong> ({p.categoria})</span>
                      <span className="d-flex align-items-center gap-2">
                        <span className="badge bg-danger fs-6">{p.stock} disponibles</span>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleEditarProd(p)}>Reponer</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'categorias' && (
            <div>
              <h3 className="fw-bold mb-3">Gestión de Categorías</h3>
              <form onSubmit={handleCrearCat} className="d-flex gap-2 mb-3" style={{ maxWidth: '450px' }}>
                <input type="text" id="nuevaCategoria" className="form-control" placeholder="Nueva categoría..." value={nuevaCat} onChange={e => setNuevaCat(e.target.value)} />
                <button type="submit" className="btn btn-success">Agregar</button>
              </form>
              <ul className="list-group" style={{ maxWidth: '450px' }}>
                {categorias.map(c => {
                  const cantidad = productos.filter(p => p.categoria === c).length;
                  return (
                    <li key={c} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{c} <span className="badge bg-secondary ms-1">{cantidad} prod.</span></span>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={cantidad > 0}
                        title={cantidad > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar categoría'}
                        onClick={() => handleEliminarCat(c)}
                      >
                        Eliminar
                      </button>
                    </li>
                  );
                })}
              </ul>
              <small className="text-muted d-block mt-2">Solo se pueden eliminar categorías sin productos asociados.</small>
            </div>
          )}

          {tab === 'usuarios' && (
            <div>
              <h3 className="fw-bold mb-3">Usuarios del Sistema</h3>
              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id}>
                          <td>{u.nombre} {u.apellido}</td>
                          <td>{u.correo}</td>
                          <td><span className={`badge ${u.rol === 'Administrador' ? 'bg-dark' : 'bg-info'}`}>{u.rol}</span></td>
                          <td>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              disabled={u.rol === 'Administrador'}
                              title={u.rol === 'Administrador' ? 'No se puede eliminar un administrador' : 'Eliminar usuario'}
                              onClick={() => handleEliminarUsuario(u.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
