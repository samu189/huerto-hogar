// Dirección del backend Spring Boot. Se puede cambiar creando un archivo .env con VITE_API_URL=...
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const API_URL = env.VITE_API_URL || 'http://localhost:8080/api/v1';
