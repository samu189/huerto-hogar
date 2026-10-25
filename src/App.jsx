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
import {
  initData,
  getProductos, saveProducto, deleteProducto,
  getCategorias, saveCategoria, deleteCategoria,
  getUsuarios, saveUsuario, deleteUsuario, loginUsuario,
  getOrdenes, registrarOrden
} from './data/data';

export default function App() {
  // Estado global: lo que se muestra en pantalla siempre sale de aquí.
  const [vistaActual, setVistaActual] = useState('home');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resultadoPago, setResultadoPago] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState({ id: 1, nombre: 'Pedro', apellido: 'Hacker', correo: 'pedro.hacker20@example.com', rol: 'Cliente' });

  // Al montar la app: se crean los datos iniciales (si no existen) y se cargan desde localStorage.
  useEffect(() => {
    initData();
    setProductos(getProductos());
    setCategorias(getCategorias());
    setUsuarios(getUsuarios());
    setOrdenes(getOrdenes());
  }, []);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // El checkout entrega el resultado del pago. Si fue exitoso, se guarda la orden y se descuenta el stock.
  const manejarResultadoPago = (resultado) => {
    if (resultado.exito) {
      const { ordenes: ordenesActualizadas, productos: productosActualizados } = registrarOrden(resultado);
      setOrdenes([...ordenesActualizadas]);
      setProductos([...productosActualizados]);
    }
    setResultadoPago(resultado);
  };

  const iniciarSesion = (correo, password) => {
    const usuario = loginUsuario(correo, password);
    if (usuario) {
      setUsuarioLogueado(usuario);
      setVistaActual('home');
    }
    return usuario;
  };

  const registrarUsuario = (datos) => {
    const actualizados = saveUsuario({ ...datos, rol: 'Cliente' });
    setUsuarios([...actualizados]);
    setUsuarioLogueado(actualizados[actualizados.length - 1]);
    setVistaActual('home');
  };

  // Al cerrar sesión se vuelve al inicio (para no quedar dentro del panel admin).
  const cambiarUsuario = (usuario) => {
    setUsuarioLogueado(usuario);
    if (!usuario) setVistaActual('home');
  };

  const totalCarrito = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  const totalCantidad = carrito.reduce((sum, p) => sum + p.cantidad, 0);

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
        {vistaActual === 'home' && <Home setVistaActual={setVistaActual} productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'productos' && <Productos productos={productos} agregarAlCarrito={agregarAlCarrito} setProductoSeleccionado={setProductoSeleccionado} setVistaActual={setVistaActual} />}
        {vistaActual === 'detalle' && <DetalleProducto producto={productoSeleccionado} agregarAlCarrito={agregarAlCarrito} setVistaActual={setVistaActual} />}
        {vistaActual === 'categorias' && <Categorias categorias={categorias} productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'ofertas' && <Ofertas productos={productos} agregarAlCarrito={agregarAlCarrito} />}
        {vistaActual === 'nosotros' && <Nosotros />}
        {vistaActual === 'blogs' && <Blogs />}
        {vistaActual === 'contacto' && <Contacto />}
        {vistaActual === 'checkout' && <CarritoCheckout carrito={carrito} setCarrito={setCarrito} totalCarrito={totalCarrito} setResultadoPago={manejarResultadoPago} setVistaActual={setVistaActual} usuario={usuarioLogueado} />}
        {vistaActual === 'resultado_pago' && <PagoResultado resultado={resultadoPago} setVistaActual={setVistaActual} />}
        {(vistaActual === 'login' || vistaActual === 'registro') && (
          <LoginRegistro key={vistaActual} modo={vistaActual} setVistaActual={setVistaActual} usuarios={usuarios} onLogin={iniciarSesion} onRegistro={registrarUsuario} />
        )}
        {vistaActual === 'admin' && (
          <AdminDashboard
            productos={productos} setProductos={setProductos}
            categorias={categorias} setCategorias={setCategorias}
            usuarios={usuarios} setUsuarios={setUsuarios}
            ordenes={ordenes}
            saveProducto={saveProducto} deleteProducto={deleteProducto}
            saveCategoria={saveCategoria} deleteCategoria={deleteCategoria}
            deleteUsuario={deleteUsuario}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
