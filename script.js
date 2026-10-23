"use strict";

/* =====================================================
   PARTE 1: DATOS Y FUNCIONES DE LÓGICA
   (no tocan la pantalla; por eso son fáciles de probar)
   ===================================================== */

const CLAVE_ALMACEN = "control-gastos:movimientos";

const CATEGORIAS = {
  ingreso: ["Salario", "Ventas", "Otros ingresos"],
  gasto: ["Alimentación", "Transporte", "Vivienda", "Servicios", "Salud", "Educación", "Ocio", "Otros gastos"]
};

// Aquí viven todos los movimientos mientras la página está abierta.
let movimientos = [];
let filtroActual = "todos";

// Convierte 1500000 en "$ 1.500.000"
function formatearCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor);
}

// Convierte "2026-10-22" en "22 oct 2026".
// Se separa el texto a mano para evitar errores de zona horaria.
function formatearFecha(textoISO) {
  const [anio, mes, dia] = textoISO.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric"
  });
}

// Fecha de hoy como "AAAA-MM-DD" (el formato que usa <input type="date">)
function hoyISO() {
  const h = new Date();
  const mes = String(h.getMonth() + 1).padStart(2, "0");
  const dia = String(h.getDate()).padStart(2, "0");
  return `${h.getFullYear()}-${mes}-${dia}`;
}

// Suma ingresos y gastos y calcula el saldo.
// Ejemplo: [{tipo:"ingreso", importe:100}, {tipo:"gasto", importe:30}] -> saldo 70
function calcularTotales(lista) {
  let ingresos = 0;
  let gastos = 0;
  for (const m of lista) {
    if (m.tipo === "ingreso") ingresos += m.importe;
    else gastos += m.importe;
  }
  return { ingresos, gastos, saldo: ingresos - gastos };
}

// Devuelve una copia de la lista según el filtro: "todos", "ingreso" o "gasto".
function filtrarMovimientos(lista, filtro) {
  if (filtro === "todos") return [...lista];
  return lista.filter((m) => m.tipo === filtro);
}

// Más recientes primero; si la fecha es igual, el último añadido va arriba.
function compararPorFecha(a, b) {
  return b.fecha.localeCompare(a.fecha) || b.creado - a.creado;
}

// Revisa los datos del formulario. Devuelve los errores encontrados
// y el importe ya convertido a número.
function validarMovimiento(datos) {
  const errores = {};

  if (datos.tipo !== "ingreso" && datos.tipo !== "gasto") {
    errores.tipo = "Elige si es un ingreso o un gasto.";
  }

  const descripcion = datos.descripcion.trim();
  if (descripcion.length < 3) {
    errores.descripcion = "Escribe una descripción de al menos 3 letras.";
  } else if (descripcion.length > 60) {
    errores.descripcion = "La descripción admite máximo 60 caracteres.";
  }

  // Se aceptan formatos como 85000, 85.000 o $ 85.000 (los puntos se ignoran).
  const textoImporte = datos.importe.replace(/[\s$.]/g, "");
  let importe = 0;
  if (!/^\d+$/.test(textoImporte)) {
    errores.importe = "Escribe solo números enteros, sin decimales ni letras.";
  } else {
    importe = Number(textoImporte);
    if (importe <= 0) errores.importe = "El importe debe ser mayor que cero.";
    else if (importe > 999999999999) errores.importe = "El importe es demasiado grande.";
  }

  if (!datos.tipo || !CATEGORIAS[datos.tipo] || !CATEGORIAS[datos.tipo].includes(datos.categoria)) {
    errores.categoria = "Elige una categoría de la lista.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
    errores.fecha = "Elige una fecha.";
  } else if (datos.fecha > hoyISO()) {
    errores.fecha = "La fecha no puede ser futura.";
  }

  return { errores, importe };
}

// Crea el objeto de un movimiento con un identificador único.
function crearMovimiento(datos, importe) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    descripcion: datos.descripcion.trim(),
    importe: importe,
    tipo: datos.tipo,
    categoria: datos.categoria,
    fecha: datos.fecha,
    creado: Date.now()
  };
}

// Comprueba que un dato leído del almacenamiento tiene la forma correcta.
function esMovimientoValido(m) {
  return Boolean(m) &&
    typeof m.id === "string" &&
    typeof m.descripcion === "string" &&
    Number.isFinite(m.importe) && m.importe > 0 &&
    (m.tipo === "ingreso" || m.tipo === "gasto") &&
    typeof m.categoria === "string" &&
    typeof m.fecha === "string" &&
    Number.isFinite(m.creado);
}

/* ---------- LocalStorage ---------- */

// LocalStorage solo guarda texto, por eso usamos JSON.stringify / JSON.parse.
function cargarMovimientos() {
  try {
    const texto = localStorage.getItem(CLAVE_ALMACEN);
    if (!texto) return [];
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos.filter(esMovimientoValido) : [];
  } catch (error) {
    return []; // Si los datos están dañados, se empieza de cero sin romper la app.
  }
}

function guardarMovimientos() {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(movimientos));
    return true;
  } catch (error) {
    return false; // Puede fallar en modo privado o con el almacenamiento lleno.
  }
}

/* =====================================================
   PARTE 2: PANTALLA (DOM)
   ===================================================== */

const $ = (id) => document.getElementById(id);

function dibujarResumen() {
  const t = calcularTotales(movimientos);
  $("saldo").textContent = formatearCOP(t.saldo);
  $("total-ingresos").textContent = formatearCOP(t.ingresos);
  $("total-gastos").textContent = formatearCOP(t.gastos);
}

function crearFila(m) {
  const fila = document.createElement("li");
  fila.className = "movimiento";

  const info = document.createElement("div");
  info.className = "info";
  const titulo = document.createElement("strong");
  titulo.textContent = m.descripcion; // textContent evita que se ejecute código escrito por el usuario
  const meta = document.createElement("div");
  meta.className = "meta";
  const categoria = document.createElement("span");
  categoria.className = "categoria";
  categoria.textContent = m.categoria;
  const fecha = document.createElement("span");
  fecha.textContent = formatearFecha(m.fecha);
  meta.append(categoria, fecha);
  info.append(titulo, meta);

  const importe = document.createElement("span");
  importe.className = "importe " + m.tipo;
  importe.textContent = (m.tipo === "ingreso" ? "+ " : "− ") + formatearCOP(m.importe);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "eliminar";
  boton.dataset.id = m.id;
  boton.textContent = "Eliminar";
  boton.setAttribute("aria-label", "Eliminar " + m.descripcion);

  fila.append(info, importe, boton);
  return fila;
}

function dibujarLista() {
  const lista = $("lista");
  lista.replaceChildren();
  const visibles = filtrarMovimientos(movimientos, filtroActual).sort(compararPorFecha);

  $("vacio").hidden = visibles.length > 0;
  $("vacio").textContent = movimientos.length === 0
    ? "Aún no hay movimientos. Añade el primero con el formulario."
    : "No hay movimientos de este tipo.";

  for (const m of visibles) lista.appendChild(crearFila(m));
}

function dibujarTodo() {
  dibujarResumen();
  dibujarLista();
}

// Rellena el menú de categorías según el tipo elegido.
function rellenarCategorias(tipo) {
  const select = $("categoria");
  select.replaceChildren();
  for (const nombre of CATEGORIAS[tipo]) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    select.appendChild(opcion);
  }
}

function leerFormulario() {
  const f = $("formulario");
  return {
    tipo: f.elements["tipo"].value,
    descripcion: f.elements["descripcion"].value,
    importe: f.elements["importe"].value,
    categoria: f.elements["categoria"].value,
    fecha: f.elements["fecha"].value
  };
}

function mostrarErrores(errores) {
  let primerCampo = null;
  for (const campo of ["tipo", "descripcion", "importe", "categoria", "fecha"]) {
    const mensaje = errores[campo] || "";
    $("error-" + campo).textContent = mensaje;
    const entrada = $(campo);
    if (entrada) entrada.setAttribute("aria-invalid", mensaje ? "true" : "false");
    if (mensaje && !primerCampo && entrada) primerCampo = entrada;
  }
  if (primerCampo) primerCampo.focus();
}

function alEnviar(evento) {
  evento.preventDefault(); // evita que la página se recargue
  const datos = leerFormulario();
  const { errores, importe } = validarMovimiento(datos);
  mostrarErrores(errores);
  if (Object.keys(errores).length > 0) return;

  movimientos.push(crearMovimiento(datos, importe));
  const guardado = guardarMovimientos();
  dibujarTodo();

  const formulario = $("formulario");
  formulario.reset();
  rellenarCategorias("gasto");
  $("fecha").value = hoyISO();
  $("aviso").textContent = guardado
    ? "Movimiento añadido."
    : "Se añadió, pero este navegador no permite guardarlo: se perderá al recargar.";
  $("descripcion").focus();
}

function alPulsarLista(evento) {
  const boton = evento.target.closest(".eliminar");
  if (!boton) return;
  const movimiento = movimientos.find((m) => m.id === boton.dataset.id);
  if (!movimiento) return;
  if (!confirm(`¿Eliminar "${movimiento.descripcion}"?`)) return;

  movimientos = movimientos.filter((m) => m.id !== movimiento.id);
  guardarMovimientos();
  dibujarTodo();
  $("aviso").textContent = "Movimiento eliminado.";
}

function alElegirFiltro(evento) {
  const boton = evento.target.closest(".filtro");
  if (!boton) return;
  filtroActual = boton.dataset.filtro;
  for (const b of document.querySelectorAll(".filtro")) {
    b.setAttribute("aria-pressed", String(b === boton));
  }
  dibujarLista();
}

function iniciar() {
  movimientos = cargarMovimientos();
  rellenarCategorias("gasto");
  $("fecha").value = hoyISO();
  $("fecha").max = hoyISO();

  $("formulario").addEventListener("submit", alEnviar);
  $("formulario").addEventListener("change", (e) => {
    if (e.target.name === "tipo") rellenarCategorias(e.target.value);
  });
  $("lista").addEventListener("click", alPulsarLista);
  document.querySelector(".filtros").addEventListener("click", alElegirFiltro);

  dibujarTodo();
}

/* =====================================================
   PARTE 3: ARRANQUE
   ===================================================== */

if (typeof document !== "undefined") {
  iniciar(); // el script está al final del <body>, la página ya existe
}

// Permite probar las funciones de lógica desde Node (no afecta al navegador).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatearCOP, formatearFecha, hoyISO, calcularTotales, filtrarMovimientos,
    compararPorFecha, validarMovimiento, crearMovimiento, esMovimientoValido,
    cargarMovimientos, guardarMovimientos, CLAVE_ALMACEN };
}
