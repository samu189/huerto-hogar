// Servicio de datos de HuertoHogar (Evaluación 3).
// Antes guardaba todo en localStorage; ahora cada función llama a la API REST del backend Spring Boot,
// que guarda los datos en MySQL. Se mantienen los nombres de las funciones para que los componentes no cambien.
import { request, guardarSesion, borrarSesion, leerSesion } from '../services/api';

// El backend envía la categoría como objeto {id, nombre}; la tienda trabaja con el nombre.
export const normalizarProducto = (p) => ({
  ...p,
  categoriaId: p.categoria?.id ?? p.categoriaId,
  categoria: p.categoria?.nombre ?? p.categoria,
  precioOferta: p.precioOferta ?? p.precio
});

// Precio que se cobra: el de oferta si corresponde (el backend calcula lo mismo).
export const precioVigente = (p) => (p.oferta && p.precioOferta ? p.precioOferta : p.precio);

// ---------- AUTENTICACIÓN ----------

const iniciarSesionCon = (data) => {
  guardarSesion({ token: data.token, refreshToken: data.refreshToken, usuario: data.usuario });
  return data.usuario;
};

export async function loginUsuario(correo, password) {
  const data = await request('/auth/login', { method: 'POST', body: { correo, password }, conToken: false });
  return iniciarSesionCon(data);
}

export async function registrarUsuario(datos) {
  const data = await request('/auth/registro', { method: 'POST', body: datos, conToken: false });
  return iniciarSesionCon(data);
}

export function cerrarSesion() {
  borrarSesion();
}

// Al recargar la página: si hay un token guardado, se valida contra el backend (/auth/me).
export async function restaurarSesion() {
  const sesion = leerSesion();
  if (!sesion?.token) return null;
  try {
    const usuario = await request('/auth/me');
    guardarSesion({ ...leerSesion(), usuario });
    return usuario;
  } catch {
    borrarSesion();
    return null;
  }
}

// ---------- PRODUCTOS (Create, Read, Update, Delete) ----------

export async function getProductos() {
  const lista = await request('/productos', { conToken: false });
  return lista.map(normalizarProducto);
}

export async function getProducto(id) {
  return normalizarProducto(await request(`/productos/${id}`, { conToken: false }));
}

// Si el producto trae id lo actualiza (PUT); si no, lo crea (POST).
export async function saveProducto(producto) {
  const body = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    stock: producto.stock,
    oferta: Boolean(producto.oferta),
    precioOferta: producto.oferta ? producto.precioOferta : null,
    imagen: producto.imagen,
    categoriaId: producto.categoriaId
  };
  const guardado = producto.id
    ? await request(`/productos/${producto.id}`, { method: 'PUT', body })
    : await request('/productos', { method: 'POST', body });
  return normalizarProducto(guardado);
}

export const deleteProducto = (id) => request(`/productos/${id}`, { method: 'DELETE' });

// ---------- CATEGORÍAS ----------

export const getCategorias = () => request('/categorias', { conToken: false });

export const saveCategoria = (nombre) => request('/categorias', { method: 'POST', body: { nombre } });

export const deleteCategoria = (id) => request(`/categorias/${id}`, { method: 'DELETE' });

// ---------- USUARIOS (solo administrador) ----------

export const getUsuarios = () => request('/usuarios');

export const saveUsuario = (usuario) =>
  usuario.id
    ? request(`/usuarios/${usuario.id}`, { method: 'PUT', body: usuario })
    : request('/usuarios', { method: 'POST', body: usuario });

export const deleteUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE' });

// ---------- ÓRDENES (BOLETAS) ----------

// Envía la compra al backend: solo ids y cantidades. El total y el stock los calcula el servidor.
export const registrarOrden = (carrito, cliente) =>
  request('/boletas', {
    method: 'POST',
    body: {
      items: carrito.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
      despacho: {
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        calle: cliente.calle,
        departamento: cliente.depto,
        region: cliente.region,
        comuna: cliente.comuna,
        indicaciones: cliente.indicaciones
      }
    }
  });

export const getOrdenes = () => request('/boletas');

export const getOrden = (id) => request(`/boletas/${id}`);

export const getMisOrdenes = () => request('/boletas/mis-boletas');

export const cambiarEstadoOrden = (id, estado) => request(`/boletas/${id}/estado`, { method: 'PUT', body: { estado } });

export const deleteOrden = (id) => request(`/boletas/${id}`, { method: 'DELETE' });
