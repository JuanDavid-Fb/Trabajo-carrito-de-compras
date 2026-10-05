# Carrito de Compras con Validaciones de Stock – TIENDA PALMIRA

Reto práctico React – SENA, Centro de Biotecnología Industrial CBI Palmira (Desarrollo Front-End con React, DS-RC v1.0, 2025).

| Dato | Valor |
| --- | --- |
| Aprendiz | _NOMBRE COMPLETO DEL APRENDIZ_ |
| Ficha | _NÚMERO DE FICHA_ |
| Instructor | Daniel Alfonso Martínez Payán |
| Tecnología usada | **React 18 + Vite** (hooks, componentes reutilizables) |
| Repositorio público | _https://github.com/USUARIO/Apellido_Nombre_CarritoReact_ |
| Despliegue (opcional) | _enlace si aplica_ |

## Instalación y ejecución

Requisitos: Node.js 18 o superior.

```bash
git clone <URL-DEL-REPOSITORIO>
cd Apellido_Nombre_CarritoReact
npm install
npm run dev        # abre la URL que muestra la consola (http://localhost:5173)
```

Otros comandos:

```bash
npm test           # 35 pruebas: 12 casos del instructor + validaciones + mejoras (Vitest)
npm run build      # build de producción
```

## Funcionalidades

- **Catálogo** desde un array JSON en el frontend (`src/data/productos.js`) con los 6 productos exactos del reto.
- **Navbar fija**: nombre de la tienda a la izquierda, ícono del carrito a la derecha con contador de unidades (oculto en 0). El panel del carrito abre y cierra (botón ✕, clic fuera o Escape).
- **Agregar** sin duplicar líneas (suma a la línea existente). El botón se deshabilita cuando no queda stock disponible.
- **Campo de cantidad** (`QuantityInput`, usado en catálogo y carrito): bloquea `e`, `E`, `+`, `-`, `.`, `,`; solo acepta pegado de dígitos; no acepta 0 ni negativos; la rueda del mouse no cambia el valor.
- **Stock máximo**: se corrige al máximo y aparece el toast _“Este es el máximo de producto disponible en stock”_ al escribir, al pulsar `+` y al agregar de nuevo.
- **Mínimo 1**: con cantidad 1, `−` o escribir 0 muestra un toast con botón “Sí, eliminar”. También hay botón **Quitar** directo.
- **Subtotales, total de la compra y total de unidades** con formato COP (`$98.400`), actualizados al instante.
- **Toasts** propios (sin `alert()`): se cierran solos y manualmente, anunciables por lectores de pantalla (`aria-live`).
### Valor agregado (no altera los requisitos del reto)

- **Persistencia** del carrito en `localStorage` (validada contra el catálogo y el stock; un dato dañado no rompe la app).
- **Diseño** renovado: banner, tarjetas con ilustración, aviso "Últimas unidades" / "Agotado", panel de carrito con totales fijos abajo y animaciones sutiles (se desactivan con `prefers-reduced-motion`).
- **Responsive** pensado para celular: panel a pantalla completa, botones de 44 px y campos de 16 px (sin zoom en iOS).
- **Toasts** con ícono, barra de progreso y pausa al pasar el mouse o enfocar (el de confirmación dura más tiempo).
- **Vaciar carrito** (con confirmación por toast) y **Seguir comprando**.
- **Accesibilidad**: enlace "Saltar al catálogo", landmarks, foco visible, el scroll de fondo se bloquea con el carrito abierto y el botón del carrito anuncia las unidades.

## Estructura

```
src/
  data/productos.js          # array JSON del catálogo
  hooks/useCart.js           # estado y reglas del carrito (stock, sin duplicados, totales)
  hooks/useToasts.js         # cola de toasts
  utils/format.js            # formato de moneda COP
  utils/messages.js          # textos de los toasts
  utils/productVisuals.js    # ilustración decorativa por producto
  components/                # Navbar, ProductCard, QuantityInput, Cart, CartItem, ToastContainer, Icons
  App.jsx / main.jsx / styles.css
  App.test.jsx               # casos de prueba del instructor
  Mejoras.test.jsx           # pruebas del valor agregado
```

## Evidencias

Guarde las capturas en `docs/evidencias/` con estos nombres (o ajuste la tabla).

| # | Funcionalidad | Captura | ¿Funciona? |
| --- | --- | --- | --- |
| 1 | Navbar e ícono con contador | `docs/evidencias/01-navbar-contador.png` | Sí |
| 2 | Agregar producto desde el catálogo | `docs/evidencias/02-agregar.png` | Sí |
| 3 | Bloqueo de la tecla “e” y de negativos / 0 | `docs/evidencias/03-bloqueo-teclas.png` | Sí |
| 4 | Toast de stock máximo | `docs/evidencias/04-toast-maximo.png` | Sí |
| 5 | Toast de cantidad mínima con opción de eliminar | `docs/evidencias/05-toast-minimo.png` | Sí |
| 6 | Subtotales y total con varios productos | `docs/evidencias/06-totales.png` | Sí |
| 7 | Producto eliminado y total recalculado | `docs/evidencias/07-eliminado.png` | Sí |

![Navbar](docs/evidencias/01-navbar-contador.png)
![Agregar](docs/evidencias/02-agregar.png)
![Bloqueo de teclas](docs/evidencias/03-bloqueo-teclas.png)
![Toast máximo](docs/evidencias/04-toast-maximo.png)
![Toast mínimo](docs/evidencias/05-toast-minimo.png)
![Totales](docs/evidencias/06-totales.png)
![Eliminado](docs/evidencias/07-eliminado.png)
