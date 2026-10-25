import React, { useState } from 'react';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.nombre.trim() === '' || form.email.trim() === '') {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    const telefonoRegex = /^\d{9}$/;
    if (form.telefono && !telefonoRegex.test(form.telefono)) {
      setError('El teléfono debe tener exactamente 9 dígitos.');
      return;
    }
    setError('');
    setExito(true);
    setForm({ nombre: '', email: '', telefono: '', mensaje: '' });
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h2 className="fw-bold text-success mb-4 text-center">Contáctanos</h2>
      
      {exito && <div id="msgExito" className="alert alert-success">¡Mensaje enviado con éxito! Te responderemos pronto.</div>}
      {error && <div id="errContacto" className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label htmlFor="nombreContacto" className="form-label">Nombre Completo:</label>
          <input type="text" id="nombreContacto" className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
        </div>
        <div className="mb-3">
          <label htmlFor="emailContacto" className="form-label">Correo Electrónico:</label>
          <input type="email" id="emailContacto" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="mb-3">
          <label htmlFor="telefonoContacto" className="form-label">Teléfono (9 dígitos):</label>
          <input type="text" id="telefonoContacto" className="form-control" placeholder="912345678" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
        </div>
        <div className="mb-3">
          <label htmlFor="mensajeContacto" className="form-label">Mensaje:</label>
          <textarea id="mensajeContacto" className="form-control" rows="3" value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})}></textarea>
        </div>
        <button type="submit" id="btnEnviarContacto" className="btn btn-success w-100">Enviar Consulta</button>
      </form>
    </div>
  );
}