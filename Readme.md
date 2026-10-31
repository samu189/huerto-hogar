# HuertoHogar 2.0 🌱

Tienda web de semillas, sustratos, herramientas y fertilizantes para huertos urbanos.
Proyecto de la **Evaluación Parcial N°2 de DSY1104 (Desarrollo Fullstack II, sección 003D, Duoc UC)**:
migración del sitio estático de la EP1 a una aplicación **React + Bootstrap**, con pruebas unitarias en **Jasmine y Karma**.

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
| Persistencia | `localStorage` del navegador (servicio `src/data/data.js`) |
| Pruebas unitarias | Jasmine 4.6 + Karma 6.4 + React Testing Library |
| Cobertura | karma-coverage (Istanbul), umbral mínimo de 80 % |
| Control de versiones | Git y GitHub (ramas `feature/*` y pull requests a `main`) |

## ✨ Funcionalidades

- **Tienda pública:** inicio, catálogo con búsqueda y filtro por categoría, detalle de producto, categorías, ofertas, blog, nosotros y contacto con validación.
- **Carrito y compra:** carrito con cantidades, checkout con datos de despacho y pago simulado (exitoso o rechazado) que registra la orden y descuenta stock.
- **Cuentas:** registro e inicio de sesión con roles Cliente y Administrador.
- **Panel de administración:** métricas de ventas, CRUD de productos, stock crítico, categorías y usuarios.

Cuenta de prueba del administrador: `admin@huertohogar.cl` / `admin123`.

## 🚀 Cómo ejecutar

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev        # abrir http://localhost:5173/app.html
```

## 🧪 Pruebas unitarias

```bash
npm test           # Karma abre Chrome, ejecuta las 34 pruebas y genera la cobertura
npm run test:ci    # lo mismo en modo headless (sin abrir ventana)
```

- 34 pruebas en 3 archivos de `src/tests/`: `HuertoHogar.spec.js` (10, componentes), `DataService.spec.js` (16, servicio de datos) y `ComponentesExtra.spec.js` (8, componentes).
- Los mocks se hacen con `jasmine.createSpy`.
- Resultado de la última medición sobre los 5 archivos probados (Navbar, Productos, Contacto, Footer y `data.js`): 100 % de sentencias, 98,48 % de ramas, 100 % de funciones y 100 % de líneas.
- El informe HTML queda en `coverage/html/index.html`.
- Los componentes sin pruebas automatizadas (App, AdminDashboard, CarritoCheckout, LoginRegistro y otros) están registrados como riesgo residual en el informe de cobertura.

## 📁 Estructura del repositorio

```text
huerto-hogar/
├── app.html               # entrada de la tienda React
├── index.html             # sitio estático de la EP1 (se conserva)
├── src/
│   ├── main.jsx           # monta la aplicación y carga Bootstrap
│   ├── App.jsx            # estado global (carrito, sesión, vista actual)
│   ├── components/        # un componente por vista (Navbar, Productos, Contacto, etc.)
│   ├── data/data.js       # servicio de datos sobre localStorage
│   └── tests/             # pruebas Jasmine (*.spec.js)
├── karma.conf.cjs         # configuración de Karma y umbrales de cobertura
├── vite.config.js
├── docs/                  # ERS, informe de cobertura y planilla de requerimientos
└── Readme.md
```

## 📄 Documentación

En la carpeta `docs/`:

- `ERS_HuertoHogar_v2.1.docx`: Especificación de Requisitos de Software (IEEE 830).
- `DSY1104-003D-HuertoHogar-ICP-001_v1.0.docx`: informe de cobertura de pruebas.
- `Planilla_Requerimientos_HuertoHogar.xlsx`: los 35 requerimientos con su criterio de aceptación y estado.
