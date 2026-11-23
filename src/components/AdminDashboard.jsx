import React, { useEffect, useState } from 'react';
import {
  getProductos, saveProducto, deleteProducto,
  getCategorias, saveCategoria, deleteCategoria,
  getUsuarios, saveUsuario, deleteUsuario,
  getOrdenes, cambiarEstadoOrden
} from '../data/data';
import { esAdmin, pestanasPermitidas } from '../services/permisos';

const IMAGEN_POR_DEFECTO = 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80';
const STOCK_CRITICO = 5;
const FORM_VACIO = { nombre: '', categoriaId: '', precio: '', stock: '', descripcion: '', imagen: '', oferta: false, precioOferta: '' };
const USUARIO_VACIO = { nombre: '', apellido: '', correo: '', password: '', rol: 'VENDEDOR' };
const ESTADOS = ['PAGADA', 'ENVIADA', 'ENTREGADA', 'ANULADA'];
const COLOR_ESTADO = { PAGADA: 'bg-primary', ENVIADA: 'bg-info text-dark', ENTREGADA: 'bg-success', ANULADA: 'bg-secondary' };

const TITULOS = {
  dashboard: '📊 Dashboard',
  productos: '📦 Productos',
  criticos: '⚠️ Stock Crítico',
  ordenes: '🧾 Órdenes',
  categorias: '📂 Categorías',
  usuarios: '👥 Usuarios'
};

const clp = (valor) => `$${Number(valor).toLocaleString('es-CL')}`;
const fecha = (iso) => new Date(iso).toLocaleString('es-CL');

/**
 * Panel de administración conectado a la API.
 * - ADMIN: todas las pestañas y acciones (CRUD de productos, categorías, usuarios y órdenes).
 * - VENDEDOR: solo ve la lista y el detalle de productos y de órdenes (sin botones de edición).
 */
export default function AdminDashboard({ usuario, onProductosCambiados }) {
  const admin = esAdmin(usuario);
  const pestanas = pestanasPermitidas(usuario);

  const [tab, setTab] = useState(pestanas[0]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null); // { tipo: 'success' | 'danger', texto }

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaCat, setNuevaCat] = useState('');
  const [formUsuario, setFormUsuario] = useState(USUARIO_VACIO);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);

  // Carga inicial: cada rol pide solo lo que puede ver.
  const cargar = async () => {
    setCargando(true);
    try {
      const [prods, cats, ords, usrs] = await Promise.all([
        getProductos(),
        getCategorias(),
        getOrdenes(),
        admin ? getUsuarios() : Promise.resolve([])
      ]);
      setProductos(prods);
      setCategorias(cats);
      setOrdenes(ords);
      setUsuarios(usrs);
    } catch (e) {
      mostrar('danger', e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const mostrar = (tipo, texto) => setAviso({ tipo, texto });

  // Ejecuta una acción contra la API, muestra el resultado y recarga los datos.
  const ejecutar = async (accion, textoExito) => {
    try {
      await accion();
      await cargar();
      if (onProductosCambiados) onProductosCambiados();
      mostrar('success', textoExito);
      return true;
    } catch (e) {
      mostrar('danger', e.detalles?.length ? `${e.message}: ${e.detalles.join(', ')}` : e.message);
      return false;
    }
  };

  const stockCritico = productos.filter(p => p.stock < STOCK_CRITICO);
  const ventasValidas = ordenes.filter(o => o.estado !== 'ANULADA');
  const totalVentas = ventasValidas.reduce((suma, o) => suma + o.total, 0);

  // ---------- PRODUCTOS (solo ADMIN) ----------
  const handleGuardarProd = async (e) => {
    e.preventDefault();
    const precio = Number(form.precio);
    const stock = form.stock === '' ? 10 : Number(form.stock);
    if (form.nombre.trim() === '') return mostrar('danger', 'El nombre es obligatorio.');
    if (!(precio > 0)) return mostrar('danger', 'El precio debe ser mayor a 0.');
    if (!Number.isInteger(stock) || stock < 0) return mostrar('danger', 'El stock debe ser un número entero mayor o igual a 0.');
    if (form.oferta && !(Number(form.precioOferta) > 0 && Number(form.precioOferta) < precio)) {
      return mostrar('danger', 'El precio de oferta debe ser mayor a 0 y menor que el precio normal.');
    }
    const producto = {
      id: editandoId,
      nombre: form.nombre.trim(),
      categoriaId: Number(form.categoriaId || categorias[0]?.id),
      precio,
      stock,
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim() || IMAGEN_POR_DEFECTO,
      oferta: form.oferta,
      precioOferta: form.oferta ? Number(form.precioOferta) : null
    };
    const ok = await ejecutar(() => saveProducto(producto), editandoId ? 'Producto actualizado.' : 'Producto creado.');
    if (ok) cancelarEdicion();
  };

  const handleEditarProd = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      categoriaId: String(p.categoriaId),
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
  };

  // ---------- CATEGORÍAS ----------
  const handleCrearCat = async (e) => {
    e.preventDefault();
    if (nuevaCat.trim() === '') return;
    if (await ejecutar(() => saveCategoria(nuevaCat.trim()), 'Categoría creada.')) setNuevaCat('');
  };

  // ---------- USUARIOS ----------
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (await ejecutar(() => saveUsuario(formUsuario), 'Usuario creado.')) setFormUsuario(USUARIO_VACIO);
  };

  const cambiarRol = (u, rol) => ejecutar(() => saveUsuario({ ...u, rol, password: '' }), `Rol de ${u.nombre} cambiado a ${rol}.`);

  // ---------- ÓRDENES ----------
  const cambiarEstado = async (o, estado) => {
    const ok = await ejecutar(() => cambiarEstadoOrden(o.id, estado), `Boleta N° ${o.id} marcada como ${estado}.`);
    if (ok && ordenDetalle?.id === o.id) setOrdenDetalle({ ...o, estado });
  };

  const botonTab = (id) => (
    <button key={id} className={`nav-link text-start ${tab === id ? 'active bg-success' : 'text-dark'}`} onClick={() => setTab(id)}>
      {TITULOS[id]}{id === 'criticos' ? ` (${stockCritico.length})` : ''}
    </button>
  );

  const tablaOrdenes = (lista) => (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0" id="tablaOrdenes">
          <thead><tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{fecha(o.fecha)}</td>
                <td>{o.nombreCliente} {o.apellidoCliente}</td>
                <td className="fw-bold">{clp(o.total)}</td>
                <td><span className={`badge ${COLOR_ESTADO[o.estado]}`}>{o.estado}</span></td>
                <td><button className="btn btn-outline-primary btn-sm" onClick={() => { setOrdenDetalle(o); setTab('ordenes'); }}>Ver detalle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="bg-light p-3 rounded shadow-sm">
            <h5 className="fw-bold text-success mb-1">{admin ? 'Panel Admin' : 'Panel Vendedor'}</h5>
            <p className="small text-muted mb-3">{usuario.nombre} · {usuario.rol}</p>
            <div className="nav flex-column nav-pills gap-1">{pestanas.map(botonTab)}</div>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          {aviso && (
            <div className={`alert alert-${aviso.tipo} alert-dismissible`} id="avisoPanel">
              {aviso.texto}
              <button type="button" className="btn-close" onClick={() => setAviso(null)}></button>
            </div>
          )}
          {cargando && <p className="text-muted">Cargando datos desde el servidor...</p>}

          {tab === 'dashboard' && admin && (
            <div>
              <h3 className="fw-bold mb-4">Métricas del Sistema</h3>
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3"><div className="card bg-primary text-white p-3 shadow-sm h-100"><h6>Total Compras</h6><p className="fs-3 fw-bold mb-0" id="metricaCompras">{ventasValidas.length}</p></div></div>
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
              {ordenes.length === 0 ? <p className="text-muted">Aún no hay compras registradas.</p> : tablaOrdenes(ordenes.slice(0, 5))}
            </div>
          )}

          {tab === 'productos' && (
            <div>
              <h3 className="fw-bold mb-3">{admin ? 'Mantenedor de Productos' : 'Productos'}</h3>

              {admin && (
                <form id="formProducto" onSubmit={handleGuardarProd} className={`card p-3 shadow-sm mb-4 ${editandoId ? 'border-warning' : ''}`}>
                  <h6 className="fw-bold text-success">{editandoId ? `Editando producto #${editandoId}` : 'Agregar Nuevo Producto'}</h6>
                  <div className="row g-2">
                    <div className="col-md-4"><input type="text" id="prodNombre" className="form-control form-control-sm" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                    <div className="col-md-3">
                      <select id="prodCategoria" className="form-select form-select-sm" value={form.categoriaId || categorias[0]?.id || ''} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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
              )}

              {productoDetalle && (
                <div className="card shadow-sm mb-4 border-primary" id="detalleProducto">
                  <div className="row g-0">
                    <div className="col-md-3"><img src={productoDetalle.imagen} alt={productoDetalle.nombre} className="img-fluid rounded-start h-100" style={{ objectFit: 'cover' }} /></div>
                    <div className="col-md-9">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <h5 className="card-title fw-bold">{productoDetalle.nombre}</h5>
                          <button className="btn-close" onClick={() => setProductoDetalle(null)}></button>
                        </div>
                        <p className="mb-1"><strong>Categoría:</strong> {productoDetalle.categoria}</p>
                        <p className="mb-1"><strong>Precio:</strong> {clp(productoDetalle.precio)}{productoDetalle.oferta ? ` (oferta ${clp(productoDetalle.precioOferta)})` : ''}</p>
                        <p className="mb-1"><strong>Stock:</strong> {productoDetalle.stock} unidades</p>
                        <p className="mb-0 text-muted">{productoDetalle.descripcion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0" id="tablaProductos">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
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
                            <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => setProductoDetalle(p)}>Ver</button>
                            {admin && <button className="btn btn-outline-primary btn-sm me-1" onClick={() => handleEditarProd(p)}>Editar</button>}
                            {admin && <button className="btn btn-danger btn-sm" onClick={() => ejecutar(() => deleteProducto(p.id), `Producto ${p.nombre} eliminado.`)}>Eliminar</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'criticos' && admin && (
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

          {tab === 'ordenes' && (
            <div>
              <h3 className="fw-bold mb-3">Órdenes de Compra</h3>
              {ordenDetalle && (
                <div className="card shadow-sm mb-4 border-primary" id="detalleOrden">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>Boleta N° {ordenDetalle.id} · {fecha(ordenDetalle.fecha)}</strong>
                    <button className="btn-close" onClick={() => setOrdenDetalle(null)}></button>
                  </div>
                  <div className="card-body">
                    <p className="mb-1"><strong>Cliente:</strong> {ordenDetalle.nombreCliente} {ordenDetalle.apellidoCliente} ({ordenDetalle.correoCliente})</p>
                    <p className="mb-3"><strong>Despacho:</strong> {ordenDetalle.calle}{ordenDetalle.departamento ? `, ${ordenDetalle.departamento}` : ''}, {ordenDetalle.comuna}, {ordenDetalle.region}</p>
                    <table className="table table-sm mb-3">
                      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        {ordenDetalle.detalles.map(d => (
                          <tr key={d.id}><td>{d.nombreProducto}</td><td>{d.cantidad}</td><td>{clp(d.precioUnitario)}</td><td>{clp(d.subtotal)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fs-5 fw-bold">Total: {clp(ordenDetalle.total)}</span>
                      {admin ? (
                        <div className="d-flex gap-2 align-items-center">
                          <label className="small" htmlFor="estadoOrden">Estado:</label>
                          <select id="estadoOrden" className="form-select form-select-sm" value={ordenDetalle.estado}
                            disabled={ordenDetalle.estado === 'ANULADA'} onChange={e => cambiarEstado(ordenDetalle, e.target.value)}>
                            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className={`badge ${COLOR_ESTADO[ordenDetalle.estado]} fs-6`}>{ordenDetalle.estado}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {ordenes.length === 0 ? <p className="text-muted">Aún no hay compras registradas.</p> : tablaOrdenes(ordenes)}
            </div>
          )}

          {tab === 'categorias' && admin && (
            <div>
              <h3 className="fw-bold mb-3">Gestión de Categorías</h3>
              <form onSubmit={handleCrearCat} className="d-flex gap-2 mb-3" style={{ maxWidth: '450px' }}>
                <input type="text" id="nuevaCategoria" className="form-control" placeholder="Nueva categoría..." value={nuevaCat} onChange={e => setNuevaCat(e.target.value)} />
                <button type="submit" className="btn btn-success">Agregar</button>
              </form>
              <ul className="list-group" style={{ maxWidth: '450px' }}>
                {categorias.map(c => {
                  const cantidad = productos.filter(p => p.categoriaId === c.id).length;
                  return (
                    <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{c.nombre} <span className="badge bg-secondary ms-1">{cantidad} prod.</span></span>
                      <button className="btn btn-outline-danger btn-sm" disabled={cantidad > 0}
                        title={cantidad > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar categoría'}
                        onClick={() => ejecutar(() => deleteCategoria(c.id), `Categoría ${c.nombre} eliminada.`)}>
                        Eliminar
                      </button>
                    </li>
                  );
                })}
              </ul>
              <small className="text-muted d-block mt-2">Solo se pueden eliminar categorías sin productos asociados.</small>
            </div>
          )}

          {tab === 'usuarios' && admin && (
            <div>
              <h3 className="fw-bold mb-3">Usuarios del Sistema</h3>
              <form id="formUsuario" onSubmit={handleCrearUsuario} className="card p-3 shadow-sm mb-4">
                <h6 className="fw-bold text-success">Crear usuario (por ejemplo, un vendedor)</h6>
                <div className="row g-2">
                  <div className="col-md-2"><input className="form-control form-control-sm" id="usrNombre" placeholder="Nombre" value={formUsuario.nombre} onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" id="usrApellido" placeholder="Apellido" value={formUsuario.apellido} onChange={e => setFormUsuario({ ...formUsuario, apellido: e.target.value })} /></div>
                  <div className="col-md-3"><input className="form-control form-control-sm" id="usrCorreo" type="email" placeholder="Correo" value={formUsuario.correo} onChange={e => setFormUsuario({ ...formUsuario, correo: e.target.value })} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" id="usrPassword" type="password" placeholder="Contraseña" value={formUsuario.password} onChange={e => setFormUsuario({ ...formUsuario, password: e.target.value })} /></div>
                  <div className="col-md-2">
                    <select className="form-select form-select-sm" id="usrRol" value={formUsuario.rol} onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })}>
                      <option value="VENDEDOR">Vendedor</option><option value="CLIENTE">Cliente</option><option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="col-md-1"><button type="submit" className="btn btn-success btn-sm w-100">Crear</button></div>
                </div>
              </form>
              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0" id="tablaUsuarios">
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {usuarios.map(u => {
                        const esYo = u.correo === usuario.correo;
                        return (
                          <tr key={u.id}>
                            <td>{u.nombre} {u.apellido}</td>
                            <td>{u.correo}</td>
                            <td style={{ maxWidth: '160px' }}>
                              <select className="form-select form-select-sm" value={u.rol} disabled={esYo} onChange={e => cambiarRol(u, e.target.value)}>
                                <option value="ADMIN">ADMIN</option><option value="VENDEDOR">VENDEDOR</option><option value="CLIENTE">CLIENTE</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn btn-outline-danger btn-sm" disabled={esYo}
                                title={esYo ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                                onClick={() => ejecutar(() => deleteUsuario(u.id), `Usuario ${u.nombre} eliminado.`)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
