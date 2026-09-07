document.addEventListener("DOMContentLoaded", () => {
  // --- 1. VALIDACIÓN DEL FORMULARIO DE CONTACTO ---
  const form = document.getElementById("formContacto");

  if (form) {
    form.addEventListener("submit", (e) => {
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

      // Validar Email con Expresión Regular
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        document.getElementById("errEmail").textContent = "Ingresa un correo electrónico válido.";
        valido = false;
      }

      // Validar Mensaje mínimo 10 caracteres
      if (mensaje.length < 10) {
        document.getElementById("errMensaje").textContent = "El mensaje debe tener al menos 10 caracteres.";
        valido = false;
      }

      // Envío exitoso
      if (valido) {
        document.getElementById("msgExito").textContent = "¡Mensaje enviado con éxito! Nos contactaremos pronto.";
        form.reset();
      }
    });
  }

  // --- 2. SIMULADOR DE CARRITO DE COMPRAS ---
  let contadorCarrito = 0;
  const botonesAgregar = document.querySelectorAll(".btn");

  botonesAgregar.forEach((boton) => {
    // Evitar asignar la alerta al botón de enviar formulario
    if (boton.getAttribute("type") !== "submit") {
      boton.addEventListener("click", () => {
        contadorCarrito++;
        alert(`¡Producto añadido al carrito! Total acumulado: ${contadorCarrito} producto(s)`);
      });
    }
  });
});