// Dar de Baja

const form = document.getElementById('form-baja');
const btnBuscar = document.getElementById('btn-buscar-baja');
const selectDestino = document.getElementById('destino-baja');
const checkFirma = document.getElementById('requiere-firma-baja');

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('fecha-baja')) {
        document.getElementById('fecha-baja').valueAsDate = new Date();
        document.getElementById('fecha-acta').valueAsDate = new Date();
        document.getElementById('numero-acta').value = 'AUTO-' + Date.now().toString().slice(-6);
    }
    
    btnBuscar?.addEventListener('click', buscarElementoBaja);
    selectDestino?.addEventListener('change', mostrarOpcionesDestino);
    checkFirma?.addEventListener('change', (e) => {
        const firmaDiv = document.getElementById('firma-baja');
        if (firmaDiv) {
            firmaDiv.style.display = e.target.checked ? 'block' : 'none';
            if (e.target.checked) inicializarCanvasFirma();
        }
    });
    
    if (form) form.addEventListener('submit', procesarBaja);
});

function buscarElementoBaja() {
    const serial = document.getElementById('serial-baja')?.value.trim();
    if (!serial) {
        alert('Ingrese serial o código');
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const elemento = inventario.find(e => e.serial === serial || e.codigo === serial);
    const infoDiv = document.getElementById('info-elemento-baja');
    
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    if (elemento.estado === 'Dado de Baja') {
        alert('Elemento ya fue dado de baja');
        return;
    }
    
    document.getElementById('desc-baja').textContent = elemento.descripcion;
    document.getElementById('serial-baja-info').textContent = elemento.serial || 'N/A';
    document.getElementById('cond-baja').textContent = elemento.condicion;
    document.getElementById('estado-baja').textContent = elemento.estado;
    
    infoDiv.style.display = 'block';
    document.getElementById('fieldset-baja').style.display = 'block';
    document.getElementById('btn-finalizar-baja').style.display = 'block';
    
    form.dataset.elementoId = elemento.id;
}

function mostrarOpcionesDestino() {
    const destino = selectDestino.value;
    const fieldAmbiental = document.getElementById('opciones-ambiental');
    const rutaInfo = document.getElementById('ruta-baja-info');
    
    if (destino === 'Ambiental') {
        if (fieldAmbiental) fieldAmbiental.style.display = 'block';
        if (rutaInfo) rutaInfo.textContent = 'Ruta: \\Servidor\\Inventario\\Bajas\\Ambiental\\';
    } else {
        if (fieldAmbiental) fieldAmbiental.style.display = 'none';
        if (destino === 'Desecho' && rutaInfo) {
            rutaInfo.textContent = 'Ruta: \\Servidor\\Inventario\\Bajas\\Desecho\\';
        } else if (rutaInfo) {
            rutaInfo.textContent = 'Ruta: \\Servidor\\Inventario\\Entradas\\';
        }
    }
}

function inicializarCanvasFirma() {
    const canvas = document.getElementById('canvas-firma-baja');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let dibujando = false;
    
    canvas.addEventListener('mousedown', () => dibujando = true);
    canvas.addEventListener('mouseup', () => dibujando = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!dibujando) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    document.getElementById('btn-limpiar-firma-baja')?.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function procesarBaja(e) {
    e.preventDefault();
    
    const elementoId = form.dataset.elementoId;
    if (!elementoId) {
        alert('Seleccione un elemento primero');
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const operaciones = obtenerDatos('operaciones', []);
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    const elemento = inventario.find(e => e.id === elementoId);
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    const motivo = document.getElementById('motivo-baja')?.value;
    const fecha = document.getElementById('fecha-baja')?.value;
    const destino = selectDestino?.value;
    
    if (!motivo || !fecha || !destino) {
        alert('Complete los campos requeridos');
        return;
    }
    
    elemento.estado = 'Dado de Baja';
    elemento.motivo_baja = motivo;
    elemento.fecha_baja = fecha;
    elemento.destino = destino;
    
    if (!elemento.historial) elemento.historial = [];
    elemento.historial.push({
        fecha: new Date().toISOString(),
        tipo: 'Baja',
        desc: `Dado de baja - ${destino}`
    });
    
    guardarDatos('inventario', inventario);
    
    operaciones.push({
        fecha: new Date().toISOString(),
        tipo: 'Baja',
        elemento: elemento.descripcion,
        usuario: usuario.nombre
    });
    guardarDatos('operaciones', operaciones);
    
    alert('Baja registrada correctamente');
    setTimeout(() => window.location.href = 'inicio.html', 1000);
}