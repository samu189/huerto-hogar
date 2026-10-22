import React from 'react';

export default function Navbar({ vistaActual, setVistaActual, carritoCount, totalCarrito, usuario, setUsuario }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container">
        <button className="navbar-brand btn border-0 fw-bold text-success fs-4" onClick={() => setVistaActual('home')}>
          🌱 HuertoHogar
        </button>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'home' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('home')}>Home</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'productos' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('productos')}>Productos</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'categorias' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('categorias')}>Categorías</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'ofertas' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('ofertas')}>Ofertas</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'nosotros' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('nosotros')}>Nosotros</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'blogs' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('blogs')}>Blog</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link btn border-0 ${vistaActual === 'contacto' ? 'fw-bold text-success' : ''}`} onClick={() => setVistaActual('contacto')}>Contacto</button>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => setVistaActual('checkout')}>
              <i className="bi bi-cart-fill"></i>
              <span>Carrito ({carritoCount}) - ${totalCarrito.toLocaleString('es-CL')}</span>
            </button>

            {usuario ? (
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  👤 {usuario.nombre}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item btn border-0 w-100 text-start" onClick={() => setVistaActual('admin')}>Panel Admin</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item btn border-0 w-100 text-start text-danger" onClick={() => setUsuario(null)}>Cerrar Sesión</button></li>
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-primary" onClick={() => setVistaActual('login')}>Iniciar Sesión</button>
                <button className="btn btn-primary" onClick={() => setVistaActual('registro')}>Crear Cuenta</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}