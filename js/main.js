document.addEventListener("DOMContentLoaded", () => {
  // --- 1. VALIDACIÓN DEL FORMULARIO DE CONTACTO ---
  const formContacto = document.getElementById("formContacto");

  if (formContacto) {
    formContacto.addEventListener("submit", (e) => {
      e.preventDefault();

      let valido = true;
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const mensaje = document.getElementById("mensaje").value.trim();

      // Limpiar errores previos
      document.getElementById("errNombre").textContent = "";
      document.getElementById("errEmail").textContent = "";
      document.getElementById("errMensaje").textContent = "";
      document.getElementById("msgExito").textContent = "";

      // Validar Nombre
      if (nombre === "") {
        document.getElementById("errNombre").textContent = "El nombre es obligatorio.";
        valido = false;
      }

      // Validar Email restringido
      const emailRegex = /^[\w.-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
      if (!emailRegex.test(email)) {
        document.getElementById("errEmail").textContent = "El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.";
        valido = false;
      }

      // Validar Mensaje mínimo 10 caracteres
      if (mensaje.length < 10) {
        document.getElementById("errMensaje").textContent = "El mensaje debe tener al menos 10 caracteres.";
        valido = false;
      }

      if (valido) {
        document.getElementById("msgExito").textContent = "¡Mensaje enviado con éxito!";
        formContacto.reset();
      }
    });
  }

  const formRegistro = document.getElementById("formRegistro");

  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();

      let valido = true;
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();

      const errNombre = document.getElementById("errNombre");
      const errEmail = document.getElementById("errEmail");
      const msgExito = document.getElementById("msgExito");

      // Limpiar errores
      if (errNombre) errNombre.textContent = "";
      if (errEmail) errEmail.textContent = "";
      if (msgExito) msgExito.textContent = "";

      // Validar Nombre
      if (nombre === "") {
        if (errNombre) errNombre.textContent = "El nombre es obligatorio.";
        valido = false;
      }

      // Validar Email
      const emailRegex = /^[\w.-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
      if (!emailRegex.test(email)) {
        if (errEmail) errEmail.textContent = "El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.";
        valido = false;
      }

      if (valido) {
        if (msgExito) msgExito.textContent = "¡Registro realizado con éxito!";
        formRegistro.reset();
      }
    });
  }

  // Cargar estado inicial del carrito
  actualizarBadgeCarrito();
});

// --- 3. GESTIÓN DEL CARRITO CON LOCALSTORAGE ---
function agregarAlCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.push(id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

function actualizarBadgeCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = `Cart (${carrito.length})`;
  }
}