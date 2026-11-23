// Pruebas del servicio de datos (src/data/data.js) y del cliente HTTP (src/services/api.js).
// No se necesita el backend encendido: window.fetch se reemplaza por un espía de Jasmine
// que responde como lo haría la API REST de Spring Boot.

import {
  normalizarProducto, precioVigente,
  loginUsuario, registrarUsuario, cerrarSesion, restaurarSesion,
  getProductos, getProducto, saveProducto, deleteProducto,
  getCategorias, saveCategoria, deleteCategoria,
  getUsuarios, saveUsuario, deleteUsuario,
  registrarOrden, getOrdenes, getOrden, getMisOrdenes, cambiarEstadoOrden, deleteOrden
} from '../data/data';
import { request, leerSesion, guardarSesion, onSesionExpirada, ApiError } from '../services/api';
import { API_URL } from '../services/config';
import { puedeVerPanel, pestanasPermitidas, esAdmin, nombrePanel } from '../services/permisos';

const respuesta = (estado, cuerpo) =>
  Promise.resolve(new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' }
  }));

const PRODUCTO_API = {
  id: 1, nombre: 'Tomate', precio: 2500, stock: 45, oferta: true, precioOferta: 1990,
  categoria: { id: 3, nombre: 'Semillas' }
};
const USUARIO = { id: 2, nombre: 'Admin', apellido: 'Huerto', correo: 'admin@huertohogar.cl', rol: 'ADMIN' };

describe('Servicio de datos conectado a la API REST', () => {
  let fetchSpy;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = spyOn(window, 'fetch');
    onSesionExpirada(null);
  });

  afterEach(() => localStorage.clear());

  const llamada = (n = 0) => {
    const [url, opciones] = fetchSpy.calls.argsFor(n);
    return { url, opciones, body: opciones.body ? JSON.parse(opciones.body) : undefined };
  };

  it('DATA 1: normaliza el producto del backend (categoría como texto) y calcula el precio vigente', () => {
    const p = normalizarProducto(PRODUCTO_API);
    expect(p.categoria).toBe('Semillas');
    expect(p.categoriaId).toBe(3);
    expect(precioVigente(p)).toBe(1990);
    expect(precioVigente({ precio: 1000, oferta: false })).toBe(1000);
    expect(normalizarProducto({ id: 9, precio: 500, categoria: 'Ya texto', categoriaId: 1 }).precioOferta).toBe(500);
  });

  it('DATA 2: getProductos llama a GET /productos sin token y devuelve los productos normalizados', async () => {
    guardarSesion({ token: 'abc', refreshToken: 'r', usuario: USUARIO });
    fetchSpy.and.returnValue(respuesta(200, [PRODUCTO_API]));
    const lista = await getProductos();
    const { url, opciones } = llamada();
    expect(url).toBe(`${API_URL}/productos`);
    expect(opciones.method).toBe('GET');
    expect(opciones.headers.Authorization).toBeUndefined();
    expect(lista[0].categoria).toBe('Semillas');
  });

  it('DATA 3: loginUsuario guarda token, refresh token y usuario para mantener la sesión al recargar', async () => {
    fetchSpy.and.returnValue(respuesta(200, { token: 'T1', refreshToken: 'R1', usuario: USUARIO }));
    const usuario = await loginUsuario('admin@huertohogar.cl', 'admin123');
    expect(llamada().url).toBe(`${API_URL}/auth/login`);
    expect(llamada().body).toEqual({ correo: 'admin@huertohogar.cl', password: 'admin123' });
    expect(usuario.rol).toBe('ADMIN');
    expect(leerSesion()).toEqual({ token: 'T1', refreshToken: 'R1', usuario: USUARIO });
  });

  it('DATA 4: un login incorrecto lanza ApiError con el mensaje del backend y no guarda sesión', async () => {
    fetchSpy.and.returnValue(respuesta(401, { mensaje: 'Correo o contraseña incorrectos' }));
    await expectAsync(loginUsuario('x@x.cl', 'mala')).toBeRejectedWith(new ApiError('Correo o contraseña incorrectos', 401));
    expect(leerSesion()).toBeNull();
  });

  it('DATA 5: registrarUsuario crea la cuenta e inicia sesión; cerrarSesion borra el token', async () => {
    fetchSpy.and.returnValue(respuesta(201, { token: 'T', refreshToken: 'R', usuario: { ...USUARIO, rol: 'CLIENTE' } }));
    await registrarUsuario({ nombre: 'Ana', apellido: 'Rojas', correo: 'ana@duoc.cl', password: 'secreto1' });
    expect(llamada().url).toBe(`${API_URL}/auth/registro`);
    expect(leerSesion().usuario.rol).toBe('CLIENTE');
    cerrarSesion();
    expect(leerSesion()).toBeNull();
  });

  it('DATA 6: las llamadas protegidas envían el encabezado Authorization: Bearer <token>', async () => {
    guardarSesion({ token: 'TOKEN-ADMIN', refreshToken: 'R', usuario: USUARIO });
    fetchSpy.and.returnValue(respuesta(200, [USUARIO]));
    await getUsuarios();
    expect(llamada().opciones.headers.Authorization).toBe('Bearer TOKEN-ADMIN');
  });

  it('DATA 7: si el token venció (401), lo renueva con el refresh token y repite la llamada', async () => {
    guardarSesion({ token: 'VIEJO', refreshToken: 'R1', usuario: USUARIO });
    fetchSpy.and.returnValues(
      respuesta(401, { mensaje: 'El token expiró' }),
      respuesta(200, { token: 'NUEVO', refreshToken: 'R2', usuario: USUARIO }),
      respuesta(200, [])
    );
    const ordenes = await getOrdenes();
    expect(ordenes).toEqual([]);
    expect(llamada(1).url).toBe(`${API_URL}/auth/refresh`);
    expect(llamada(1).body).toEqual({ refreshToken: 'R1' });
    expect(llamada(2).opciones.headers.Authorization).toBe('Bearer NUEVO');
    expect(leerSesion().token).toBe('NUEVO');
  });

  it('DATA 8: si el refresh también falla, borra la sesión y avisa a la app', async () => {
    const aviso = jasmine.createSpy('alExpirar');
    onSesionExpirada(aviso);
    guardarSesion({ token: 'VIEJO', refreshToken: 'VENCIDO', usuario: USUARIO });
    fetchSpy.and.returnValues(respuesta(401, {}), respuesta(401, {}));
    await expectAsync(getMisOrdenes()).toBeRejectedWithError(ApiError, 'Tu sesión expiró. Inicia sesión nuevamente.');
    expect(leerSesion()).toBeNull();
    expect(aviso).toHaveBeenCalled();
  });

  it('DATA 9: sin conexión con el backend muestra un mensaje claro', async () => {
    fetchSpy.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    await expectAsync(getCategorias()).toBeRejectedWithError(ApiError, /No se pudo conectar con el servidor/);
  });

  it('DATA 10: saveProducto usa POST si el producto es nuevo y PUT si tiene id', async () => {
    guardarSesion({ token: 'T', refreshToken: 'R', usuario: USUARIO });
    fetchSpy.and.returnValues(respuesta(201, PRODUCTO_API), respuesta(200, PRODUCTO_API));
    await saveProducto({ nombre: 'Tomate', precio: 2500, stock: 45, categoriaId: 3, oferta: false, precioOferta: 900 });
    await saveProducto({ id: 1, nombre: 'Tomate', precio: 2500, stock: 40, categoriaId: 3, oferta: true, precioOferta: 1990 });
    expect(llamada(0).opciones.method).toBe('POST');
    expect(llamada(0).url).toBe(`${API_URL}/productos`);
    expect(llamada(0).body.precioOferta).toBeNull();
    expect(llamada(1).opciones.method).toBe('PUT');
    expect(llamada(1).url).toBe(`${API_URL}/productos/1`);
    expect(llamada(1).body.precioOferta).toBe(1990);
  });

  it('DATA 11: los DELETE devuelven null (204) y los errores 409 traen el mensaje de la regla de negocio', async () => {
    guardarSesion({ token: 'T', refreshToken: 'R', usuario: USUARIO });
    fetchSpy.and.returnValues(
      respuesta(204),
      respuesta(409, { mensaje: 'No se puede eliminar Semillas: tiene 2 producto(s) asociado(s)' }),
      respuesta(204),
      respuesta(204)
    );
    expect(await deleteProducto(5)).toBeNull();
    await expectAsync(deleteCategoria(1)).toBeRejectedWithError(ApiError, /tiene 2 producto/);
    await deleteUsuario(7);
    await deleteOrden(3);
    expect(llamada(0).url).toBe(`${API_URL}/productos/5`);
    expect(llamada(2).url).toBe(`${API_URL}/usuarios/7`);
    expect(llamada(3).opciones.method).toBe('DELETE');
  });

  it('DATA 12: registrarOrden envía solo ids, cantidades y despacho (el total lo calcula el servidor)', async () => {
    guardarSesion({ token: 'T', refreshToken: 'R', usuario: USUARIO });
    fetchSpy.and.returnValue(respuesta(201, { id: 10, total: 3980 }));
    const carrito = [{ id: 1, nombre: 'Tomate', precio: 1990, cantidad: 2 }];
    const cliente = { nombre: 'Pedro', apellido: 'Hacker', correo: 'p@x.cl', calle: 'Calle 1', depto: '603', region: 'RM', comuna: 'Cerrillos', indicaciones: '' };
    const boleta = await registrarOrden(carrito, cliente);
    expect(boleta.id).toBe(10);
    expect(llamada().body.items).toEqual([{ productoId: 1, cantidad: 2 }]);
    expect(llamada().body.despacho.departamento).toBe('603');
    expect(llamada().body.total).toBeUndefined();
  });

  it('DATA 13: rutas de categorías, usuarios y órdenes', async () => {
    guardarSesion({ token: 'T', refreshToken: 'R', usuario: USUARIO });
    fetchSpy.and.callFake(() => respuesta(200, { id: 1, categoria: { id: 1, nombre: 'Semillas' } }));
    await saveCategoria('Hidroponía');
    await saveUsuario({ nombre: 'Luis', rol: 'VENDEDOR' });
    await saveUsuario({ id: 4, nombre: 'Luis', rol: 'CLIENTE' });
    await getOrden(10);
    await cambiarEstadoOrden(10, 'ENVIADA');
    await getProducto(1);
    expect(llamada(0).body).toEqual({ nombre: 'Hidroponía' });
    expect(llamada(1).opciones.method).toBe('POST');
    expect(llamada(2).url).toBe(`${API_URL}/usuarios/4`);
    expect(llamada(3).url).toBe(`${API_URL}/boletas/10`);
    expect(llamada(4).body).toEqual({ estado: 'ENVIADA' });
    expect(llamada(5).url).toBe(`${API_URL}/productos/1`);
  });

  it('DATA 14: restaurarSesion valida el token con /auth/me; si es inválido, borra la sesión', async () => {
    expect(await restaurarSesion()).toBeNull();
    guardarSesion({ token: 'T', refreshToken: null, usuario: USUARIO });
    fetchSpy.and.returnValues(respuesta(200, USUARIO), respuesta(401, { mensaje: 'Token inválido' }));
    expect((await restaurarSesion()).correo).toBe('admin@huertohogar.cl');
    expect(await restaurarSesion()).toBeNull();
    expect(leerSesion()).toBeNull();
  });

  it('DATA 15: errores sin cuerpo JSON y validaciones con detalles', async () => {
    fetchSpy.and.returnValues(
      Promise.resolve(new Response('error', { status: 500 })),
      respuesta(400, { mensaje: 'Datos inválidos', detalles: ['precio: debe ser mayor a 0'] })
    );
    await expectAsync(request('/x')).toBeRejectedWithError(ApiError, 'Error 500');
    try {
      await request('/y', { method: 'POST', body: {} });
    } catch (e) {
      expect(e.estado).toBe(400);
      expect(e.detalles).toEqual(['precio: debe ser mayor a 0']);
    }
    localStorage.setItem('hh_sesion', '{dañado');
    expect(leerSesion()).toBeNull();
  });

  it('DATA 16: permisos por rol: admin todo, vendedor productos y órdenes, cliente sin panel', () => {
    expect(puedeVerPanel({ rol: 'ADMIN' })).toBeTrue();
    expect(puedeVerPanel({ rol: 'VENDEDOR' })).toBeTrue();
    expect(puedeVerPanel({ rol: 'CLIENTE' })).toBeFalse();
    expect(puedeVerPanel(null)).toBeFalse();
    expect(pestanasPermitidas({ rol: 'VENDEDOR' })).toEqual(['productos', 'ordenes']);
    expect(pestanasPermitidas({ rol: 'ADMIN' })).toContain('usuarios');
    expect(pestanasPermitidas(null)).toEqual([]);
    expect(esAdmin({ rol: 'VENDEDOR' })).toBeFalse();
    expect(nombrePanel({ rol: 'ADMIN' })).toBe('Panel Admin');
    expect(nombrePanel({ rol: 'VENDEDOR' })).toBe('Panel Vendedor');
  });
});
