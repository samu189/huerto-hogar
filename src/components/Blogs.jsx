import React, { useState } from 'react';

export default function Blogs() {
  const [blogActivo, setBlogActivo] = useState(null);

  const posts = [
    { id: 1, titulo: 'Cómo iniciar tu primer huerto en el balcón', fecha: '02 de Octubre, 2026', resumen: 'Aprende los conceptos básicos para cultivar albahaca y tomates en maceteros.', contenido: 'Para iniciar tu huerto en balcón requieres al menos 4 horas de luz solar directa, maceteros con buen drenaje y un sustrato ligero enriquecido con compost.', imagen: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80' },
    { id: 2, titulo: 'Beneficios del Humus de Lombriz en tus cultivos', fecha: '15 de Septiembre, 2026', resumen: 'Descubre por qué este abono orgánico mejora el crecimiento vegetal.', contenido: 'El humus aporta bacterias benéficas, regula el pH del suelo y retiene la humedad óptima sin correr riesgos de sobre-fertilización.', imagen: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success mb-4">Blog y Consejos Verde</h2>
      {blogActivo ? (
        <div className="card p-4 shadow-sm">
          <button className="btn btn-link text-start text-decoration-none mb-3" onClick={() => setBlogActivo(null)}>← Volver a Blogs</button>
          <img src={blogActivo.imagen} alt={blogActivo.titulo} className="img-fluid rounded mb-3 w-100" style={{ height: '320px', objectFit: 'cover' }} />
          <h3>{blogActivo.titulo}</h3>
          <p className="text-muted"><small>{blogActivo.fecha}</small></p>
          <p className="fs-5 mt-3">{blogActivo.contenido}</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {posts.map(post => (
            <div key={post.id} className="col">
              <div className="card h-100 shadow-sm">
                <img src={post.imagen} className="card-img-top" alt={post.titulo} style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body">
                  <small className="text-muted">{post.fecha}</small>
                  <h5 className="card-title fw-bold mt-1">{post.titulo}</h5>
                  <p className="card-text">{post.resumen}</p>
                  <button className="btn btn-outline-success btn-sm" onClick={() => setBlogActivo(post)}>Leer Entrada Completa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}