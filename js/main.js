document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let valido = true;
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const mensaje = document.getElementById("mensaje").value.trim();

      document.getElementById("errNombre").textContent = "";
      document.getElementById("errEmail").textContent = "";
      document.getElementById("errMensaje").textContent = "";
      document.getElementById("msgExito").textContent = "";

      if (nombre === "") {
        document.getElementById("errNombre").textContent = "El nombre es obligatorio.";
        valido = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        document.getElementById("errEmail").textContent = "Ingresa un correo electrónico válido.";
        valido = false;
      }

      if (mensaje.length < 10) {
        document.getElementById("errMensaje").textContent = "El mensaje debe tener al menos 10 caracteres.";
        valido = false;
      }

      if (valido) {
        document.getElementById("msgExito").textContent = "¡Mensaje enviado con éxito!";
        form.reset();
      }
    });
  }
});