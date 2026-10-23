# Control de Gastos

Aplicación web para registrar ingresos y gastos personales en pesos colombianos (COP). Está hecha con HTML5, CSS3 y JavaScript puro, sin frameworks ni dependencias. Los datos se guardan en el navegador con LocalStorage.

## Funcionalidades

- Tarjetas con el saldo, el total de ingresos y el total de gastos.
- Formulario para añadir movimientos: tipo, descripción, importe, categoría y fecha.
- Validación de todos los campos con mensajes de error claros.
- Historial ordenado del más reciente al más antiguo.
- Eliminación de movimientos (con confirmación).
- Filtro por tipo: todos, ingresos o gastos.
- Los datos se conservan al recargar la página.
- Importes con formato COP (por ejemplo, `$ 1.500.000`).
- Diseño adaptable a móviles, tabletas y escritorio.

## Estructura del proyecto

```
control-de-gastos/
├── index.html   # Estructura de la página
├── style.css    # Estilos y diseño adaptable
├── script.js    # Lógica: cálculos, validación, LocalStorage y pantalla
└── README.md    # Este archivo
```

## Cómo ejecutarla

1. Descarga o copia la carpeta del proyecto.
2. Abre `index.html` con doble clic en tu navegador. No necesita servidor ni instalación.

## Cómo probarla

1. **Añadir:** registra un ingreso de `2.000.000` (categoría Salario) y un gasto de `85.000` (categoría Alimentación). Las tarjetas deben mostrar ingresos `$ 2.000.000`, gastos `$ 85.000` y saldo `$ 1.915.000`.
2. **Validar:** pulsa «Añadir movimiento» con el formulario vacío, con un importe `0`, con letras (`abc`), con decimales (`12,5`) y con una fecha futura. Cada caso debe mostrar un mensaje y no guardar nada.
3. **Filtrar:** pulsa «Ingresos», «Gastos» y «Todos». La lista cambia, pero las tarjetas siguen mostrando los totales completos.
4. **Eliminar:** pulsa «Eliminar» y confirma. El movimiento desaparece y los totales se recalculan.
5. **Persistencia:** recarga la página (F5) y cierra y abre el navegador. Los movimientos deben seguir ahí.
6. **Adaptabilidad:** reduce el ancho de la ventana o abre las herramientas de desarrollo (F12) y activa la vista de móvil. El diseño debe pasar a una sola columna.
7. **Datos guardados:** en F12, pestaña *Application* (o *Almacenamiento*) → *Local Storage*, verás la clave `control-gastos:movimientos`. Para empezar de cero, bórrala y recarga.

## Preparar el proyecto para GitHub

Estos pasos son una guía; ejecútalos cuando decidas publicar.

1. Instala [Git](https://git-scm.com) y configura tu nombre y correo (`git config --global user.name "Tu Nombre"` y `git config --global user.email "tu@correo.com"`).
2. En la carpeta del proyecto: `git init`, luego `git add .` y `git commit -m "Primera versión de Control de Gastos"`.
3. Crea un repositorio vacío en GitHub (sin README ni .gitignore, porque ya tienes los tuyos).
4. Conéctalo y súbelo con los comandos que GitHub te muestra: `git remote add origin <URL>`, `git branch -M main` y `git push -u origin main`.
5. Opcional: en *Settings → Pages* del repositorio puedes publicar la aplicación gratis desde la rama `main`.

## Posibles mejoras

- Editar movimientos existentes.
- Filtrar por categoría y por mes.
- Gráfico de gastos por categoría.
- Exportar los datos a CSV.
