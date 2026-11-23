// Permisos del frontend según el rol del usuario.
// Administrador: acceso total. Vendedor: solo ve productos y órdenes. Cliente: solo la tienda.
// Ojo: esto solo oculta pantallas. La protección real está en el backend, que revisa el rol en cada solicitud.

export const ROLES = { ADMIN: 'ADMIN', VENDEDOR: 'VENDEDOR', CLIENTE: 'CLIENTE' };

export const PESTANAS_POR_ROL = {
  ADMIN: ['dashboard', 'productos', 'criticos', 'ordenes', 'categorias', 'usuarios'],
  VENDEDOR: ['productos', 'ordenes']
};

export const esAdmin = (usuario) => usuario?.rol === ROLES.ADMIN;

export const puedeVerPanel = (usuario) => Boolean(usuario && PESTANAS_POR_ROL[usuario.rol]);

export const pestanasPermitidas = (usuario) => (usuario && PESTANAS_POR_ROL[usuario.rol]) || [];

export const nombrePanel = (usuario) => (esAdmin(usuario) ? 'Panel Admin' : 'Panel Vendedor');
