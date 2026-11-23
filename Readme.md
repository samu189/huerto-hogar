# HuertoHogar 3.0 🌱

Tienda web de semillas, sustratos, herramientas y fertilizantes para huertos urbanos.
Proyecto de **DSY1104 (Desarrollo Fullstack II, sección 003D, Duoc UC)**. Este repositorio es el **frontend React**.
En la **Evaluación Parcial N°3** se conectó a un backend **Spring Boot + MySQL** con autenticación **JWT por roles**:
👉 Backend: https://github.com/samu189/huerto-hogar-backend

## 👥 Equipo

- Samuel Berrios
- Antonio Espinoza
- Tomas Gonzalez Llanos

## 🛠️ Tecnologías

| Área | Herramienta |
|---|---|
| Interfaz | React 18.3 (componentes, props, `useState`, `useEffect`) |
| Diseño responsivo | Bootstrap 5.3 y Bootstrap Icons |
| Servidor de desarrollo y empaquetado | Vite 5.4 |
| Datos | API REST del backend Spring Boot (`fetch`), servicio `src/data/data.js` |
| Sesión | JWT guardado en el navegador (`hh_sesion`), con renovación automática del token |
| Pruebas unitarias | Jasmine 4.6 + Karma 6.4 + React Testing Library |
| Cobertura | karma-coverage (Istanbul), umbral mínimo de 80 % |
| Control de versiones | Git y GitHub (ramas `feature/*` y pull requests a `main`) |

## ✨ Funcionalidades

- **Tienda pública:** inicio, catálogo con búsqueda y filtro por categoría, detalle, categorías, ofertas, blog, nosotros y contacto con validación.
- **Carrito y compra:** el checkout exige sesión; la compra se registra en el backend, que valida stock, calcula el total y descuenta el stock.
- **Cuentas:** registro e inicio de sesión contra la API; la sesión se mantiene al recargar y se renueva sola.
- **Roles:** el **administrador** tiene acceso total; el **vendedor** solo ve productos y órdenes; el **cliente** solo usa la tienda y ve sus compras.
- **Panel de administración:** métricas, CRUD de productos, stock crítico, órdenes con cambio de estado, categorías y usuarios con roles.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@huertohogar.cl | admin123 |
| Vendedor | vendedor@huertohogar.cl | vendedor123 |
| Cliente | pedro.hacker20@example.com | pedro123 |

## 🚀 Cómo ejecutar

1. Inicia el **backend** (ver su README): `.\mvnw.cmd spring-boot:run` con MySQL encendido.
2. En este repositorio (Node.js 18 o superior):

```bash
npm install
npm run dev        # abrir http://localhost:5173/app.html
```

La dirección de la API se puede cambiar creando un archivo `.env` con `VITE_API_URL=http://localhost:8080/api/v1`.

## 🧪 Pruebas unitarias

```bash
npm test           # Karma abre Chrome, ejecuta las 36 pruebas y genera la cobertura
npm run test:ci    # lo mismo en modo headless (sin abrir ventana)
```

- 36 pruebas en 3 archivos de `src/tests/`: `HuertoHogar.spec.js` (10, componentes), `DataService.spec.js` (16, cliente HTTP, servicio de datos y permisos; `fetch` simulado con `spyOn`) y `ComponentesExtra.spec.js` (10, componentes y restricciones por rol).
- Cobertura de la última medición: 100 % de sentencias, 97,14 % de ramas, 100 % de funciones y 100 % de líneas.
- El informe HTML queda en `coverage/html/index.html`.

## 📁 Estructura del repositorio

```text
huerto-hogar/
├── app.html               # entrada de la tienda React
├── index.html             # sitio estático de la EP1 (se conserva)
├── src/
│   ├── main.jsx           # monta la aplicación y carga Bootstrap
│   ├── App.jsx            # estado global (carrito, sesión, vista actual)
│   ├── components/        # un componente por vista (Navbar, Productos, Contacto, etc.)
│   ├── data/data.js       # servicio de datos: llama a la API del backend
│   ├── services/          # api.js (fetch + JWT), config.js (URL de la API), permisos.js (roles)
│   └── tests/             # pruebas Jasmine (*.spec.js)
├── karma.conf.cjs         # configuración de Karma y umbrales de cobertura
├── vite.config.js
├── docs/                  # ERS, informe de cobertura y planilla de requerimientos
└── Readme.md
```

## 📄 Documentación

En la carpeta `docs/`:

- Evaluación 3: `ERS_HuertoHogar_v3.0.docx`, `Manual_de_Usuario_HuertoHogar.docx`, `Documentacion_APIs_HuertoHogar.xlsx`, `Documentacion_APIs_e_Integracion_HuertoHogar.docx` y `Planilla_Requerimientos_HuertoHogar_v3.0.xlsx`.
- `ERS_HuertoHogar_v2.1.docx`: Especificación de Requisitos de Software de la EP2 (IEEE 830).
- `DSY1104-003D-HuertoHogar-ICP-001_v1.0.docx`: informe de cobertura de pruebas.
- `Planilla_Requerimientos_HuertoHogar.xlsx`: los 35 requerimientos con su criterio de aceptación y estado.
