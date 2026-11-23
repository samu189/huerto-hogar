// Cliente HTTP de HuertoHogar: todas las llamadas al backend pasan por aquí.
// - Agrega el token JWT en el encabezado Authorization.
// - Si el token de acceso venció (401), lo renueva con el refresh token y repite la llamada una vez.
// - Convierte los errores del backend en un ApiError con el mensaje que envía la API.
import { API_URL } from './config';

const CLAVE_SESION = 'hh_sesion';
let alExpirarSesion = null;
let renovacionEnCurso = null;

export class ApiError extends Error {
  constructor(mensaje, estado, detalles = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.estado = estado;
    this.detalles = detalles;
  }
}

// ---------- Sesión guardada en el navegador (sobrevive a recargar la página) ----------

export const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
};

export const guardarSesion = (sesion) => localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

export const borrarSesion = () => localStorage.removeItem(CLAVE_SESION);

// App.jsx registra aquí qué hacer si la sesión no se puede renovar (cerrar sesión en pantalla).
export const onSesionExpirada = (fn) => {
  alExpirarSesion = fn;
};

// Pide un token nuevo con el refresh token. Si varias llamadas fallan a la vez, se renueva una sola vez.
async function renovarToken() {
  const sesion = leerSesion();
  if (!renovacionEnCurso) {
    renovacionEnCurso = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: sesion.refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError('Sesión expirada', 401);
        const data = await res.json();
        guardarSesion({ token: data.token, refreshToken: data.refreshToken, usuario: data.usuario });
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

export async function request(ruta, { method = 'GET', body, conToken = true, reintento = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const sesion = leerSesion();
  if (conToken && sesion?.token) headers.Authorization = `Bearer ${sesion.token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa que el backend esté encendido.', 0);
  }

  if (res.status === 401 && conToken && sesion?.refreshToken && reintento) {
    try {
      await renovarToken();
    } catch {
      borrarSesion();
      if (alExpirarSesion) alExpirarSesion();
      throw new ApiError('Tu sesión expiró. Inicia sesión nuevamente.', 401);
    }
    return request(ruta, { method, body, conToken, reintento: false });
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.mensaje || `Error ${res.status}`, res.status, data?.detalles || []);
  }
  return data;
}
