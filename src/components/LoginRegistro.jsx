import React, { useState } from 'react';

// Vista de Iniciar Sesión / Crear Cuenta. Valida contra los usuarios guardados en localStorage (data.js).
export default function LoginRegistro({ modo, setVistaActual, usuarios, onLogin, onRegistro }) {
  const esRegistro = modo === 'registro';
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const correo = form.correo.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError('Ingresa un correo válido.');
    if (form.password === '') return setError('La contraseña es obligatoria.');

    if (esRegistro) {
      if (form.nombre.trim() === '' || form.apellido.trim() === '') return setError('Nombre y apellido son obligatorios.');
      if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
      if (usuarios.some(u => u.correo === correo)) return setError('Ese correo ya está registrado.');
      onRegistro({ nombre: form.nombre.trim(), apellido: form.apellido.trim(), correo, password: form.password });
    } else {
      const usuario = onLogin(correo, form.password);
      if (!usuario) setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '450px' }}>
      <h2 className="fw-bold text-success mb-4 text-center">{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      {error && <div id="errAcceso" className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {esRegistro && (
          <div className="row g-2 mb-3">
            <div className="col">
              <label className="form-label" htmlFor="regNombre">Nombre:</label>
              <input type="text" id="regNombre" className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="col">
              <label className="form-label" htmlFor="regApellido">Apellido:</label>
              <input type="text" id="regApellido" className="form-control" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />
            </div>
          </div>
        )}
        <div className="mb-3">
          <label className="form-label" htmlFor="accesoCorreo">Correo Electrónico:</label>
          <input type="email" id="accesoCorreo" className="form-control" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="accesoPassword">Contraseña:</label>
          <input type="password" id="accesoPassword" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" id="btnAcceso" className="btn btn-success w-100">{esRegistro ? 'Registrarme' : 'Entrar'}</button>

        <button type="button" className="btn btn-link mt-2" onClick={() => setVistaActual(esRegistro ? 'login' : 'registro')}>
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
        {!esRegistro && (
          <small className="text-muted text-center d-block">Cuenta de prueba: admin@huertohogar.cl / admin123</small>
        )}
      </form>
    </div>
  );
}
