// Suite de pruebas unitarias de HuertoHogar (Jasmine + Karma + React Testing Library)
// Ejecutar con: npm test
//
// Cada prueba renderiza un componente real en Chrome y revisa lo que el usuario vería.
// Se agrupan en 4 categorías: renderizado, props, estado y eventos/mocks.

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import Productos from '../components/Productos';
import Contacto from '../components/Contacto';
import Footer from '../components/Footer';

describe('Suite de Pruebas Unitarias - HuertoHogar (10/10)', () => {
  // Datos de prueba: dos productos inventados para no depender de localStorage.
  const mockProductos = [
    { id: 1, nombre: 'Tomate Limachino', categoria: 'Semillas', precio: 2500, stock: 10, descripcion: 'Semillas' },
    { id: 2, nombre: 'Sustrato 10L', categoria: 'Sustratos', precio: 8990, stock: 2, descripcion: 'Sustrato' }
  ];

  // ---------- 1. PRUEBAS DE RENDERIZADO (2 tests) ----------

  it('TEST 1: Renderizado correcto - Debería mostrar la lista de productos suministrada por props', () => {
    render(<Productos productos={mockProductos} agregarAlCarrito={() => {}} setProductoSeleccionado={() => {}} setVistaActual={() => {}} />);
    expect(screen.getByText('Tomate Limachino')).toBeDefined();
    expect(screen.getByText('Sustrato 10L')).toBeDefined();
  });

  it('TEST 2: Renderizado condicional - Debería renderizar el Footer con el texto institucional', () => {
    render(<Footer />);
    expect(screen.getByText(/HuertoHogar Chile/i)).toBeDefined();
  });

  // ---------- 2. PRUEBAS DE PROPIEDADES / PROPS (2 tests) ----------

  it('TEST 3: Props recibidas - Navbar debe renderizar el total formateado del carrito recibido en props', () => {
    render(<Navbar vistaActual="home" setVistaActual={() => {}} carritoCount={3} totalCarrito={15000} usuario={null} setUsuario={() => {}} />);
    expect(screen.getByText(/Carrito \(3\) - \$15.000/i)).toBeDefined();
  });

  it('TEST 4: Props recibidas - Debería mostrar los botones de Iniciar Sesión cuando usuario prop es null', () => {
    render(<Navbar vistaActual="home" setVistaActual={() => {}} carritoCount={0} totalCarrito={0} usuario={null} setUsuario={() => {}} />);
    expect(screen.getByText('Iniciar Sesión')).toBeDefined();
  });

  // ---------- 3. PRUEBAS DE ESTADO / STATE (3 tests) ----------

  it('TEST 5: Estado de Formulario - Debería actualizar el estado del input de nombre en contacto al escribir', () => {
    render(<Contacto />);
    const inputNombre = screen.getByLabelText(/Nombre Completo/i);
    fireEvent.change(inputNombre, { target: { value: 'Juan Pérez' } });
    expect(inputNombre.value).toBe('Juan Pérez');
  });

  it('TEST 6: Estado de Formulario - Debería actualizar el estado del input de teléfono al escribir', () => {
    render(<Contacto />);
    const inputTel = screen.getByLabelText(/Teléfono/i);
    fireEvent.change(inputTel, { target: { value: '912345678' } });
    expect(inputTel.value).toBe('912345678');
  });

  it('TEST 7: Estado de Filtro - Debería filtrar los productos según el texto de búsqueda ingresado', () => {
    render(<Productos productos={mockProductos} agregarAlCarrito={() => {}} setProductoSeleccionado={() => {}} setVistaActual={() => {}} />);
    const inputBusqueda = screen.getByPlaceholderText(/Buscar producto por nombre/i);
    fireEvent.change(inputBusqueda, { target: { value: 'Tomate' } });
    expect(screen.getByText('Tomate Limachino')).toBeDefined();
    expect(screen.queryByText('Sustrato 10L')).toBeNull();
  });

  // ---------- 4. PRUEBAS DE EVENTOS Y MOCKS (3 tests) ----------

  it('TEST 8: Simulación de Eventos - Debería gatillar la función agregarAlCarrito al pulsar el botón', () => {
    // jasmine.createSpy crea una función falsa que registra cómo fue llamada.
    const mockAgregar = jasmine.createSpy('agregarAlCarrito');
    render(<Productos productos={mockProductos} agregarAlCarrito={mockAgregar} setProductoSeleccionado={() => {}} setVistaActual={() => {}} />);
    const botonesAñadir = screen.getAllByText('Añadir');
    fireEvent.click(botonesAñadir[0]);
    expect(mockAgregar).toHaveBeenCalledWith(mockProductos[0]);
  });

  it('TEST 9: Simulación de Eventos - Debería cambiar la vista al hacer clic en el logo del Navbar', () => {
    const mockSetVista = jasmine.createSpy('setVistaActual');
    render(<Navbar vistaActual="productos" setVistaActual={mockSetVista} carritoCount={0} totalCarrito={0} usuario={null} setUsuario={() => {}} />);
    const logo = screen.getByText(/🌱 HuertoHogar/i);
    fireEvent.click(logo);
    expect(mockSetVista).toHaveBeenCalledWith('home');
  });

  it('TEST 10: Validación de Formulario - Debería mostrar mensaje de error si el teléfono no tiene 9 dígitos', () => {
    render(<Contacto />);
    const inputNombre = screen.getByLabelText(/Nombre Completo/i);
    const inputEmail = screen.getByLabelText(/Correo Electrónico/i);
    const inputTel = screen.getByLabelText(/Teléfono/i);
    const btnEnviar = screen.getByText('Enviar Consulta');

    fireEvent.change(inputNombre, { target: { value: 'María' } });
    fireEvent.change(inputEmail, { target: { value: 'maria@duoc.cl' } });
    fireEvent.change(inputTel, { target: { value: '123' } }); // Inválido: solo 3 dígitos
    fireEvent.click(btnEnviar);

    expect(screen.getByText('El teléfono debe tener exactamente 9 dígitos.')).toBeDefined();
  });
});
