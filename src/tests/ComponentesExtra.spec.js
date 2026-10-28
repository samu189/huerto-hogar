// Pruebas complementarias de componentes (Navbar, Contacto y Productos).
// Cubren los casos que la suite principal no recorría: menú completo,
// usuario con sesión, envío exitoso del contacto y filtro por categoría.

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import Productos from '../components/Productos';
import Contacto from '../components/Contacto';

describe('Pruebas complementarias de componentes', () => {
  const mockProductos = [
    { id: 1, nombre: 'Tomate Limachino', categoria: 'Semillas', precio: 2500, stock: 10, descripcion: 'Semillas' },
    { id: 2, nombre: 'Sustrato 10L', categoria: 'Sustratos', precio: 8990, stock: 2, descripcion: 'Sustrato' }
  ];

  const renderNavbar = (props = {}) => {
    const setVistaActual = jasmine.createSpy('setVistaActual');
    const setUsuario = jasmine.createSpy('setUsuario');
    render(
      <Navbar
        vistaActual="home"
        setVistaActual={setVistaActual}
        carritoCount={0}
        totalCarrito={0}
        usuario={null}
        setUsuario={setUsuario}
        {...props}
      />
    );
    return { setVistaActual, setUsuario };
  };

  it('EXTRA 1: cada botón del menú cambia a su vista', () => {
    const { setVistaActual } = renderNavbar();
    const vistas = { Home: 'home', Productos: 'productos', 'Categorías': 'categorias', Ofertas: 'ofertas', Nosotros: 'nosotros', Blog: 'blogs', Contacto: 'contacto' };
    Object.entries(vistas).forEach(([texto, vista]) => {
      fireEvent.click(screen.getByText(texto));
      expect(setVistaActual).toHaveBeenCalledWith(vista);
    });
  });

  it('EXTRA 2: la vista activa del menú se destaca en verde', () => {
    ['productos', 'categorias', 'ofertas', 'nosotros', 'blogs', 'contacto'].forEach((vista, i) => {
      const { unmount } = render(
        <Navbar vistaActual={vista} setVistaActual={() => {}} carritoCount={0} totalCarrito={0} usuario={null} setUsuario={() => {}} />
      );
      expect(document.querySelectorAll('.nav-link.text-success').length).toBe(1);
      unmount();
    });
  });

  it('EXTRA 3: sin sesión, los botones llevan al carrito, al login y al registro', () => {
    const { setVistaActual } = renderNavbar();
    fireEvent.click(screen.getByText(/Carrito \(0\)/));
    fireEvent.click(screen.getByText('Iniciar Sesión'));
    fireEvent.click(screen.getByText('Crear Cuenta'));
    expect(setVistaActual).toHaveBeenCalledWith('checkout');
    expect(setVistaActual).toHaveBeenCalledWith('login');
    expect(setVistaActual).toHaveBeenCalledWith('registro');
  });

  it('EXTRA 4: con sesión, muestra el nombre, abre el Panel Admin y permite cerrar sesión', () => {
    const { setVistaActual, setUsuario } = renderNavbar({ usuario: { nombre: 'Pedro' } });
    expect(screen.getByText(/Pedro/)).toBeDefined();
    expect(screen.queryByText('Iniciar Sesión')).toBeNull();
    fireEvent.click(screen.getByText('Panel Admin'));
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(setVistaActual).toHaveBeenCalledWith('admin');
    expect(setUsuario).toHaveBeenCalledWith(null);
  });

  it('EXTRA 5: contacto muestra error si faltan nombre o correo', () => {
    render(<Contacto />);
    fireEvent.click(screen.getByText('Enviar Consulta'));
    expect(screen.getByText('Nombre y correo son obligatorios.')).toBeDefined();
  });

  it('EXTRA 6: contacto con datos válidos muestra éxito y limpia el formulario', () => {
    render(<Contacto />);
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'María' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'maria@duoc.cl' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '912345678' } });
    fireEvent.change(screen.getByLabelText(/Mensaje/i), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByText('Enviar Consulta'));
    expect(screen.getByText(/Mensaje enviado con éxito/)).toBeDefined();
    expect(screen.getByLabelText(/Nombre Completo/i).value).toBe('');
  });

  it('EXTRA 7: el filtro por categoría deja solo los productos de esa categoría', () => {
    render(<Productos productos={mockProductos} agregarAlCarrito={() => {}} setProductoSeleccionado={() => {}} setVistaActual={() => {}} />);
    fireEvent.change(screen.getByDisplayValue('Todas las categorías'), { target: { value: 'Sustratos' } });
    expect(screen.getByText('Sustrato 10L')).toBeDefined();
    expect(screen.queryByText('Tomate Limachino')).toBeNull();
  });

  it('EXTRA 8: "Ver Detalle" selecciona el producto y cambia a la vista de detalle', () => {
    const setProductoSeleccionado = jasmine.createSpy('setProductoSeleccionado');
    const setVistaActual = jasmine.createSpy('setVistaActual');
    render(<Productos productos={mockProductos} agregarAlCarrito={() => {}} setProductoSeleccionado={setProductoSeleccionado} setVistaActual={setVistaActual} />);
    fireEvent.click(screen.getAllByText('Ver Detalle')[1]);
    expect(setProductoSeleccionado).toHaveBeenCalledWith(mockProductos[1]);
    expect(setVistaActual).toHaveBeenCalledWith('detalle');
  });
});
