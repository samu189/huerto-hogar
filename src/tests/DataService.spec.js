// Pruebas unitarias del servicio de datos (src/data/data.js)
// Verifican el CRUD con localStorage: productos, categorías, usuarios y órdenes.
// Antes de cada prueba se limpia localStorage y se cargan los datos iniciales.

import {
  initData,
  getProductos, saveProducto, deleteProducto,
  getCategorias, saveCategoria, deleteCategoria,
  getUsuarios, saveUsuario, deleteUsuario, loginUsuario,
  getOrdenes, registrarOrden
} from '../data/data';

describe('Servicio de datos data.js (CRUD con localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
    initData();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('DATA 1: initData carga 5 productos, 4 categorías, 2 usuarios y 0 órdenes', () => {
    expect(getProductos().length).toBe(5);
    expect(getCategorias()).toEqual(['Semillas', 'Sustratos', 'Herramientas', 'Fertilizantes']);
    expect(getUsuarios().length).toBe(2);
    expect(getOrdenes()).toEqual([]);
  });

  it('DATA 2: initData no sobrescribe datos que ya existen', () => {
    deleteProducto(1);
    initData();
    expect(getProductos().length).toBe(4);
  });

  it('DATA 3: si el JSON guardado está dañado, se devuelve una lista vacía', () => {
    localStorage.setItem('hh_productos', '{esto no es json');
    expect(getProductos()).toEqual([]);
  });

  it('DATA 4: saveProducto sin id crea un producto nuevo con id asignado', () => {
    const lista = saveProducto({ nombre: 'Lechuga', categoria: 'Semillas', precio: 1500, stock: 3 });
    const nuevo = lista.find(p => p.nombre === 'Lechuga');
    expect(lista.length).toBe(6);
    expect(nuevo.id).toBeDefined();
    expect(getProductos().length).toBe(6);
  });

  it('DATA 5: saveProducto con id existente actualiza el producto', () => {
    const original = getProductos().find(p => p.id === 2);
    saveProducto({ ...original, stock: 99 });
    expect(getProductos().find(p => p.id === 2).stock).toBe(99);
    expect(getProductos().length).toBe(5);
  });

  it('DATA 6: saveProducto con un id que no existe no modifica la lista', () => {
    saveProducto({ id: 12345, nombre: 'Fantasma', precio: 1, stock: 1 });
    expect(getProductos().length).toBe(5);
    expect(getProductos().some(p => p.nombre === 'Fantasma')).toBeFalse();
  });

  it('DATA 7: deleteProducto elimina el producto indicado', () => {
    const lista = deleteProducto(3);
    expect(lista.length).toBe(4);
    expect(getProductos().some(p => p.id === 3)).toBeFalse();
  });

  it('DATA 8: saveCategoria agrega una categoría nueva y quita espacios', () => {
    const cats = saveCategoria('  Hidroponía  ');
    expect(cats).toContain('Hidroponía');
    expect(getCategorias().length).toBe(5);
  });

  it('DATA 9: saveCategoria no agrega duplicados (sin importar mayúsculas) ni nombres vacíos', () => {
    saveCategoria('semillas');
    saveCategoria('   ');
    expect(getCategorias().length).toBe(4);
  });

  it('DATA 10: deleteCategoria no elimina una categoría con productos asociados', () => {
    deleteCategoria('Semillas');
    expect(getCategorias()).toContain('Semillas');
  });

  it('DATA 11: deleteCategoria elimina una categoría sin productos', () => {
    saveCategoria('Hidroponía');
    deleteCategoria('Hidroponía');
    expect(getCategorias()).not.toContain('Hidroponía');
  });

  it('DATA 12: saveUsuario registra un usuario con rol Cliente y correo en minúsculas', () => {
    const usuarios = saveUsuario({ nombre: 'Ana', apellido: 'Rojas', correo: ' Ana@Duoc.CL ', password: 'secreto1' });
    const ana = usuarios.find(u => u.nombre === 'Ana');
    expect(ana.correo).toBe('ana@duoc.cl');
    expect(ana.rol).toBe('Cliente');
    expect(ana.id).toBeDefined();
  });

  it('DATA 13: saveUsuario respeta el rol indicado y actualiza un usuario existente', () => {
    saveUsuario({ nombre: 'Jefa', apellido: 'Admin', correo: 'jefa@huertohogar.cl', password: 'abc123', rol: 'Administrador' });
    expect(getUsuarios().find(u => u.nombre === 'Jefa').rol).toBe('Administrador');

    const pedro = getUsuarios().find(u => u.id === 1);
    saveUsuario({ ...pedro, nombre: 'Pedro Pablo' });
    expect(getUsuarios().find(u => u.id === 1).nombre).toBe('Pedro Pablo');

    saveUsuario({ id: 999, nombre: 'Nadie', correo: 'nadie@x.cl' });
    expect(getUsuarios().some(u => u.id === 999)).toBeFalse();
  });

  it('DATA 14: deleteUsuario elimina al usuario indicado', () => {
    deleteUsuario(1);
    expect(getUsuarios().length).toBe(1);
  });

  it('DATA 15: loginUsuario acepta credenciales correctas y rechaza las incorrectas', () => {
    expect(loginUsuario('ADMIN@huertohogar.cl ', 'admin123').rol).toBe('Administrador');
    expect(loginUsuario('admin@huertohogar.cl', 'malaclave')).toBeNull();
  });

  it('DATA 16: registrarOrden guarda la compra y descuenta el stock sin bajar de 0', () => {
    const cliente = { nombre: 'Pedro', apellido: 'Hacker', correo: 'pedro.hacker20@example.com', calle: 'x' };
    const carrito = [
      { id: 4, nombre: 'Humus', precio: 6200, cantidad: 3 },   // stock inicial 2 → queda en 0
      { id: 1, nombre: 'Tomate', precio: 2500, cantidad: 5 }   // stock inicial 45 → queda en 40
    ];
    const { ordenes, productos } = registrarOrden({ cliente, carrito, total: 31100 });

    expect(ordenes.length).toBe(1);
    expect(ordenes[0].total).toBe(31100);
    expect(ordenes[0].cliente).toEqual({ nombre: 'Pedro', apellido: 'Hacker', correo: 'pedro.hacker20@example.com' });
    expect(productos.find(p => p.id === 4).stock).toBe(0);
    expect(productos.find(p => p.id === 1).stock).toBe(40);
    expect(productos.find(p => p.id === 2).stock).toBe(12); // no comprado, no cambia
    expect(getOrdenes().length).toBe(1);
  });
});
