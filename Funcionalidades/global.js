// Global - Autenticación y variables globales

const USUARIOS = [
    { nombre: 'harold.montenegro', rol: 'Administrator' },
    { nombre: 'edwar.ardila', rol: 'Administrator' }
];

const PASS = 'Admin123*+';

const CATEGORIAS_DEFAULT = [
    { id: 1, nombre: 'Computadoras' },
    { id: 2, nombre: 'Periféricos' },
    { id: 3, nombre: 'Mobiliario' },
    { id: 4, nombre: 'Cables' },
    { id: 5, nombre: 'Software' }
];

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    actualizarUsuario();
    configurarSalida();
});

// Desde Screen/Pantallas/ las paginas estan un nivel arriba
const BASE = window.location.pathname.includes('/Pantallas/') ? '../' : '';

function verificarSesion() {
    const usuario = localStorage.getItem('usuarioLogueado');
    const ruta = window.location.pathname.split('/').pop() || 'login.html';
    
    if (ruta === 'login.html' || ruta === '' || ruta === 'Screen') {
        if (usuario) window.location.href = BASE + 'inicio.html';
    } else {
        if (!usuario) window.location.href = BASE + 'login.html';
    }
}

function actualizarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    document.querySelectorAll('#usuario-nombre').forEach(el => {
        el.textContent = usuario.nombre || 'Usuario';
    });
}

function configurarSalida() {
    document.querySelectorAll('#btn-salir').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            window.location.href = BASE + 'login.html';
        });
    });
}

function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function obtenerDatos(key, default_val = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : default_val;
}

function generarId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==========================================================
// Operaciones sobre el inventario
// Cada funcion devuelve null si todo salio bien o un texto con el error.
// Cuando exista la base de datos, solo hay que cambiar estas funciones.
// ==========================================================

function usuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
}

function registrarOperacion(tipo, descripcionElemento) {
    const operaciones = obtenerDatos('operaciones', []);
    operaciones.unshift({
        fecha: new Date().toISOString(),
        tipo: tipo,
        elemento: descripcionElemento,
        usuario: usuarioActual().nombre
    });
    guardarDatos('operaciones', operaciones);
}

function aplicarEntrada(registro) {
    const inventario = obtenerDatos('inventario', []);
    inventario.push(registro);
    guardarDatos('inventario', inventario);
    registrarOperacion('Entrada', registro.descripcion);
    return null;
}

function aplicarAsignacion(a) {
    const inventario = obtenerDatos('inventario', []);
    const el = inventario.find(e => e.id === a.elementoId);
    if (!el) return 'Elemento no encontrado';
    if (el.estado !== 'Disponible') return 'El elemento ya no está disponible para asignar';

    el.estado = 'Asignado';
    el.responsable = a.responsable;
    el.departamento = a.departamento;
    el.ubicacion = a.ubicacionUso;
    el.fecha_asignacion = a.fechaAsignacion;

    if (!el.historial) el.historial = [];
    el.historial.push({
        fecha: new Date().toISOString(),
        tipo: 'Asignación',
        descripcion: `Asignado a ${a.responsable}`
    });

    guardarDatos('inventario', inventario);
    registrarOperacion('Asignación', el.descripcion);
    return null;
}

function aplicarBaja(b) {
    const inventario = obtenerDatos('inventario', []);
    const el = inventario.find(e => e.id === b.elementoId);
    if (!el) return 'Elemento no encontrado';
    if (el.estado === 'Dado de Baja') return 'Este elemento ya fue dado de baja';

    el.estado = 'Dado de Baja';
    el.fecha_baja = b.fechaBaja;
    el.motivo_baja = b.motivo;
    el.destino = b.destino;
    el.destino_baja = b.destino;

    if (!el.historial) el.historial = [];
    el.historial.push({
        fecha: new Date().toISOString(),
        tipo: 'Baja',
        descripcion: `Dado de baja - ${b.motivo}`
    });

    guardarDatos('inventario', inventario);
    registrarOperacion('Baja', el.descripcion);
    return null;
}

// ==========================================================
// Actas
// Flujo: el formulario llama abrirActa(tipo, datos, accion).
//  - NO guarda nada en el inventario todavia.
//  - La plantilla muestra el acta y tiene el boton "Confirmar y guardar".
//  - Solo al confirmar se aplica la accion (inventario + operaciones + historial de actas).
//  - Si el usuario sale sin confirmar, no queda ningun cambio.
// ==========================================================

const RUTA_PLANTILLAS = 'Pantallas/';   // relativa a Screen/

// tipo: 'entrada' | 'asignacion' | 'baja' | 'pazysalvo'
// datos: lo que se imprime en el acta
// accion: { tipo, datos } lo que se guarda al confirmar (opcional)
function abrirActa(tipo, datos, accion = null) {
    const acta = {
        id: generarId(),
        tipo: tipo,
        fecha: new Date().toISOString(),
        usuario: usuarioActual().nombre || '',
        datos: datos,
        accion: accion,
        confirmada: false
    };
    guardarDatos('actaActual', acta);
    window.location.href = RUTA_PLANTILLAS + 'plantilla-' + tipo + '.html';
}

// Aplica la accion pendiente del acta actual. Devuelve { ok, mensaje }
function confirmarActa() {
    const acta = obtenerDatos('actaActual', null);
    if (!acta || !acta.accion) return { ok: false, mensaje: 'No hay ningún registro pendiente' };
    if (acta.confirmada) return { ok: false, mensaje: 'Esta acta ya fue guardada' };

    const a = acta.accion;
    let error = null;
    if (a.tipo === 'entrada') error = aplicarEntrada(a.datos);
    else if (a.tipo === 'asignacion') error = aplicarAsignacion(a.datos);
    else if (a.tipo === 'baja') error = aplicarBaja(a.datos);
    else error = 'Tipo de acta desconocido';

    if (error) return { ok: false, mensaje: error };

    acta.confirmada = true;
    acta.fechaConfirmacion = new Date().toISOString();

    const actas = obtenerDatos('actas', []);
    actas.push(acta);
    guardarDatos('actas', actas);
    guardarDatos('actaActual', acta);
    return { ok: true };
}

// ---- Usado por las plantillas ----
function prepararConfirmacion(acta) {
    const btn = document.getElementById('btn-confirmar');
    const aviso = document.getElementById('aviso-acta');
    if (!btn || !aviso || !acta || !acta.accion) return;

    if (acta.confirmada) {
        btn.style.display = 'none';
        aviso.textContent = 'Acta guardada. El registro ya está en el inventario.';
        aviso.className = 'aviso-acta aviso-ok';
    } else {
        btn.style.display = '';
        aviso.textContent = 'Todavía no se ha guardado nada. Revise el acta y pulse "Confirmar y guardar".';
        aviso.className = 'aviso-acta aviso-pendiente';
    }
}

function confirmarDesdePlantilla() {
    const r = confirmarActa();
    if (!r.ok) {
        alert(r.mensaje);
        return;
    }
    alert('Registro guardado correctamente');
    window.location.href = '../inicio.html';
}