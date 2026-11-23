import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Productos from './components/Productos';
import DetalleProducto from './components/DetalleProducto';
import Categorias from './components/Categorias';
import Ofertas from './components/Ofertas';
import Nosotros from './components/Nosotros';
import Blogs from './components/Blogs';
import Contacto from './components/Contacto';
import CarritoCheckout from './components/CarritoCheckout';
import PagoResultado from './components/PagoResultado';
import AdminDashboard from './components/AdminDashboard';
import LoginRegistro from './components/LoginRegistro';
import MisCompras from './components/MisCompras';
import {
  getProductos, getCategorias,
  loginUsuario, registrarUsuario, cerrarSesion, restaurarSesion,
  registrarOrden, precioVigente
} from './data/data';
import { onSesionExpirada } from './services/api';
import { puedeVerPanel } from './services/permisos';

export default function App() {
  // Estado global: lo que se muestra en pantalla siempre sale de aquí.
  const [vistaActual, setVistaActual] = useState('home');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resultadoPago, setResultadoPago] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [errorConexion, setErrorConexion] = useState('');
  const [avisoSesion, setAvisoSesion] = useState('');

  const cargarCatalogo = async () => {
    try {
      const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
      setProductos(prods);
      setCategorias(cats);
      setErrorConexion('');
    } catch (e) {
      setErrorConexion(e.message);
    }
  };

  // Al abrir la app: se carga el catálogo desde la API y se restaura la sesión guardada (si el token sigue válido).
  useEffect(() => {
    cargarCatalogo();
    restaurarSesion()
      .then(setUsuarioLogueado)
      .finally(() => setCargandoSesion(false));
    // Si el token no se puede renovar, se cierra la sesión en pantalla.
    onSesionExpirada(() => {
      setUsuarioLogueado(null);
      setAvisoSesion('Tu sesión expiró. Inicia sesión nuevamente.');
      setVistaActual('login');
    });
  }, []);

  // Se guarda en el carrito el precio que realmente se cobra (oferta si corresponde).
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, precio: precioVigente(producto), cantidad: 1 }]);
    }
  };

  // Pago: se envía la compra al backend. El servidor valida stock, calcula el total y descuenta el stock.
  const pagar = async (cliente) => {
    const boleta = await registrarOrden(carrito, cliente);
    setResultadoPago({ exito: true, boleta });
    setCarrito([]);
    setVistaActual('resultado_pago');
    cargarCatalogo(); // el stock cambió
  };

  const simularPagoRechazado = () => {
    setResultadoPago({ exito: false });
    setVistaActual('resultado_pago');
  };

  const iniciarSesion = async (correo, password) => {
    const usuario = await loginUsuario(correo, password);
    setUsuarioLogueado(usuario);
    setAvisoSesion('');
    setVistaActual(puedeVerPanel(usuario) ? 'admin' : 'home');
  };

  const registrarse = async (datos) => {
    const usuario = await registrarUsuario(datos);
    setUsuarioLogueado(usuario);
    setVistaActual('home');
  };

  // Navbar llama a setUsuario(null) al cerrar sesión: se borra el token y se vuelve al inicio.
  const cambiarUsuario = (usuario) => {
    if (!usuario) {
      cerrarSesion();
      setCarrito([]);
      setVistaActual('home');
    }
    setUsuarioLogueado(usuario);
  };

  const totalCarrito = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  const totalCantidad = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  // Restricción de acceso: el panel solo se muestra a administrador y vendedor.
  const vistaAdmin = () => {
    if (cargandoSesion) return <p className="container py-5 text-muted">Verificando sesión...</p>;
    if (!puedeVerPanel(usuarioLogueado)) {
      return (
        <div className="container py-5 text-center" id="accesoDenegado" style={{ maxWidth: '520px' }}>
          <span className="display-4">🔒</span>
          <h3 className="fw-bold mt-2">Acceso restringido</h3>
          <p className="text-muted">Esta sección es solo para administradores y vendedores.</p>
          {!usuarioLogueado && <button className="btn btn-success" onClick={() => setVistaActual('login')}>Iniciar Sesión</button>}
        </div>
      );
    }
    return <AdminDashboard key={usuarioLogueado.id} usuario={usuarioLogueado} onProductosCambiados={cargarCatalogo} />;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        carritoCount={totalCantidad}
        totalCarrito={totalCarrito}
        usuario={usuarioLogueado}
        setUsuario={cambiarUsuario}
      />

      <main className="flex-grow-1">
        {errorConexion && (
          <div className="container mt-3"><div className="alert alert-danger" id="errorConexion">{errorConexion}</div></div>
        )}
        {avisoSesion && vistaActual === 'login' && (
          <div className="container mt-3" style={{ maxWidth: '450px' }}><div className="alert alert-warning">{avisoSesion}</div></div>
        )}

        {vistaActual === 'home' && <Home setVistaActual={setVistaActual} productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'productos' && <Productos productos={productos} categorias={categorias} agregarAlCarrito={agregarAlCarrito} setProductoSeleccionado={setProductoSeleccionado} setVistaActual={setVistaActual} />}
        {vistaActual === 'detalle' && <DetalleProducto producto={productoSeleccionado} agregarAlCarrito={agregarAlCarrito} setVistaActual={setVistaActual} />}
        {vistaActual === 'categorias' && <Categorias categorias={categorias} productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'ofertas' && <Ofertas productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'nosotros' && <Nosotros />}
        {vistaActual === 'blogs' && <Blogs />}
        {vistaActual === 'contacto' && <Contacto />}
        {vistaActual === 'checkout' && (
          <CarritoCheckout key={usuarioLogueado?.id || 'invitado'} carrito={carrito} setCarrito={setCarrito} totalCarrito={totalCarrito}
            onPagar={pagar} onPagoRechazado={simularPagoRechazado} setVistaActual={setVistaActual} usuario={usuarioLogueado} />
        )}
        {vistaActual === 'resultado_pago' && <PagoResultado resultado={resultadoPago} setVistaActual={setVistaActual} />}
        {(vistaActual === 'login' || vistaActual === 'registro') && (
          <LoginRegistro key={vistaActual} modo={vistaActual} setVistaActual={setVistaActual} onLogin={iniciarSesion} onRegistro={registrarse} />
        )}
        {vistaActual === 'mis_compras' && (usuarioLogueado ? <MisCompras /> : (
          <div className="container py-5 text-center">
            <p className="text-muted">Inicia sesión para ver tus compras.</p>
            <button className="btn btn-success" onClick={() => setVistaActual('login')}>Iniciar Sesión</button>
          </div>
        ))}
        {vistaActual === 'admin' && vistaAdmin()}
      </main>

      <Footer />
    </div>
  );
}
