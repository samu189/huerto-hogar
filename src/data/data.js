// Servicio de Datos y Lógica CRUD con LocalStorage (HuertoHogar)
// Simula una base de datos en el navegador: productos, categorías, usuarios y órdenes.
// Cada colección se guarda como JSON en una clave de localStorage.

const CLAVES = {
  productos: 'hh_productos',
  categorias: 'hh_categorias',
  usuarios: 'hh_usuarios',
  ordenes: 'hh_ordenes'
};

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Semillas de Tomate Limachino', categoria: 'Semillas', precio: 2500, stock: 45, oferta: true, precioOferta: 1990, imagen: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80', descripcion: 'Semillas orgánicas de alta germinación.' },
  { id: 2, nombre: 'Kit Sustrato Orgánico 10L', categoria: 'Sustratos', precio: 8990, stock: 12, oferta: false, precioOferta: 8990, imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80', descripcion: 'Mezcla nutritiva ideal para maceteros.' },
  { id: 3, nombre: 'Macetero Cerámica Biodegradable', categoria: 'Herramientas', precio: 4500, stock: 4, oferta: true, precioOferta: 3490, imagen: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80', descripcion: 'Ecológico y resistente a la intemperie.' },
  { id: 4, nombre: 'Fertilizante Humus de Lombriz 5kg', categoria: 'Fertilizantes', precio: 6200, stock: 2, oferta: true, precioOferta: 4990, imagen: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80', descripcion: 'Aporte de nitrógeno natural para tus plantas.' },
  { id: 5, nombre: 'Semillas de Albahaca Silvestre', categoria: 'Semillas', precio: 1800, stock: 30, oferta: false, precioOferta: 1800, imagen: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80', descripcion: 'Aromática y fácil de cultivar en casa.' }
];

const CATEGORIAS_INICIALES = ['Semillas', 'Sustratos', 'Herramientas', 'Fertilizantes'];

// Contraseñas en texto plano solo porque es una simulación académica (no hay backend).
const USUARIOS_INICIALES = [
  { id: 1, nombre: 'Pedro', apellido: 'Hacker', correo: 'pedro.hacker20@example.com', password: 'pedro123', rol: 'Cliente' },
  { id: 2, nombre: 'Admin', apellido: 'Huerto', correo: 'admin@huertohogar.cl', password: 'admin123', rol: 'Administrador' }
];

// ---------- Helpers internos ----------

// Lee una colección; si no existe o el JSON está dañado, devuelve un arreglo vacío.
const leer = (clave) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) || [];
  } catch {
    return [];
  }
};

const guardar = (clave, datos) => {
  localStorage.setItem(clave, JSON.stringify(datos));
};

// Carga los datos iniciales solo la primera vez (si la clave no existe).
export const initData = () => {
  if (!localStorage.getItem(CLAVES.productos)) guardar(CLAVES.productos, PRODUCTOS_INICIALES);
  if (!localStorage.getItem(CLAVES.categorias)) guardar(CLAVES.categorias, CATEGORIAS_INICIALES);
  if (!localStorage.getItem(CLAVES.usuarios)) guardar(CLAVES.usuarios, USUARIOS_INICIALES);
  if (!localStorage.getItem(CLAVES.ordenes)) guardar(CLAVES.ordenes, []);
};

// ---------- PRODUCTOS (Create, Read, Update, Delete) ----------

export const getProductos = () => leer(CLAVES.productos);

// Si el producto trae id lo actualiza (Update); si no, lo crea con un id nuevo (Create).
export const saveProducto = (producto) => {
  const productos = getProductos();
  if (producto.id) {
    const index = productos.findIndex(p => p.id === producto.id);
    if (index !== -1) productos[index] = producto;
  } else {
    productos.push({ ...producto, id: Date.now() });
  }
  guardar(CLAVES.productos, productos);
  return productos;
};

export const deleteProducto = (id) => {
  const productos = getProductos().filter(p => p.id !== id);
  guardar(CLAVES.productos, productos);
  return productos;
};

// ---------- CATEGORÍAS ----------

export const getCategorias = () => leer(CLAVES.categorias);

export const saveCategoria = (nuevaCat) => {
  const nombre = nuevaCat.trim();
  const categorias = getCategorias();
  const existe = categorias.some(c => c.toLowerCase() === nombre.toLowerCase());
  if (nombre !== '' && !existe) {
    categorias.push(nombre);
    guardar(CLAVES.categorias, categorias);
  }
  return categorias;
};

// No se borra una categoría que todavía tiene productos asociados.
export const deleteCategoria = (nombre) => {
  const enUso = getProductos().some(p => p.categoria === nombre);
  if (enUso) return getCategorias();
  const categorias = getCategorias().filter(c => c !== nombre);
  guardar(CLAVES.categorias, categorias);
  return categorias;
};

// ---------- USUARIOS ----------

export const getUsuarios = () => leer(CLAVES.usuarios);

export const saveUsuario = (usuario) => {
  const usuarios = getUsuarios();
  const datos = { ...usuario, correo: usuario.correo.trim().toLowerCase() };
  if (datos.id) {
    const index = usuarios.findIndex(u => u.id === datos.id);
    if (index !== -1) usuarios[index] = datos;
  } else {
    usuarios.push({ ...datos, id: Date.now(), rol: datos.rol || 'Cliente' });
  }
  guardar(CLAVES.usuarios, usuarios);
  return usuarios;
};

export const deleteUsuario = (id) => {
  const usuarios = getUsuarios().filter(u => u.id !== id);
  guardar(CLAVES.usuarios, usuarios);
  return usuarios;
};

// Devuelve el usuario si correo y contraseña coinciden; si no, null.
export const loginUsuario = (correo, password) => {
  const correoNormalizado = correo.trim().toLowerCase();
  return getUsuarios().find(u => u.correo === correoNormalizado && u.password === password) || null;
};

// ---------- ÓRDENES DE COMPRA ----------

export const getOrdenes = () => leer(CLAVES.ordenes);

// Guarda la compra y descuenta del stock las unidades vendidas.
export const registrarOrden = ({ cliente, carrito, total }) => {
  const ordenes = getOrdenes();
  ordenes.push({
    id: Date.now(),
    fecha: new Date().toISOString(),
    cliente: { nombre: cliente.nombre, apellido: cliente.apellido, correo: cliente.correo },
    items: carrito.map(({ id, nombre, precio, cantidad }) => ({ id, nombre, precio, cantidad })),
    total
  });
  guardar(CLAVES.ordenes, ordenes);

  const productos = getProductos().map(p => {
    const vendidos = carrito
      .filter(item => item.id === p.id)
      .reduce((suma, item) => suma + item.cantidad, 0);
    return vendidos > 0 ? { ...p, stock: Math.max(0, p.stock - vendidos) } : p;
  });
  guardar(CLAVES.productos, productos);

  return { ordenes, productos };
};
