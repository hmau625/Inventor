// Asignar Equipo

const form = document.getElementById('form-asignacion');
const btnBuscar = document.getElementById('btn-buscar-elemento');
const checkActa = document.getElementById('generar-acta-asignacion');

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('fecha-asignacion')) {
        document.getElementById('fecha-asignacion').valueAsDate = new Date();
    }
    
    btnBuscar?.addEventListener('click', buscarElementoAsignacion);
    checkActa?.addEventListener('change', (e) => {
        const vista = document.getElementById('vista-acta-asignacion');
        if (vista) vista.style.display = e.target.checked ? 'block' : 'none';
    });
    
    if (form) form.addEventListener('submit', procesarAsignacion);
});

function buscarElementoAsignacion() {
    const serial = document.getElementById('serial-buscar')?.value.trim();
    if (!serial) {
        alert('Ingrese serial o código');
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const elemento = inventario.find(e => e.serial === serial || e.codigo === serial);
    const infoDiv = document.getElementById('info-elemento');
    
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    if (elemento.estado !== 'Disponible') {
        alert('Elemento no disponible para asignar');
        return;
    }
    
    document.getElementById('desc-elemento').textContent = elemento.descripcion;
    document.getElementById('serial-elemento').textContent = elemento.serial || 'N/A';
    document.getElementById('cond-elemento').textContent = elemento.condicion;
    document.getElementById('estado-elemento').textContent = elemento.estado;
    
    infoDiv.style.display = 'block';
    document.getElementById('fieldset-asignacion').style.display = 'block';
    document.getElementById('btn-finalizar-asignacion').style.display = 'block';
    
    form.dataset.elementoId = elemento.id;
}

function procesarAsignacion(e) {
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
    
    const responsable = document.getElementById('responsable')?.value;
    const fecha = document.getElementById('fecha-asignacion')?.value;
    
    if (!responsable || !fecha) {
        alert('Complete los campos requeridos');
        return;
    }
    
    elemento.estado = 'Asignado';
    elemento.responsable = responsable;
    elemento.fecha_asignacion = fecha;
    elemento.departamento = document.getElementById('departamento')?.value || '';
    elemento.ubicacion_uso = document.getElementById('ubicacion-uso')?.value || '';
    
    if (!elemento.historial) elemento.historial = [];
    elemento.historial.push({
        fecha: new Date().toISOString(),
        tipo: 'Asignación',
        desc: `Asignado a ${responsable}`
    });
    
    guardarDatos('inventario', inventario);
    
    operaciones.push({
        fecha: new Date().toISOString(),
        tipo: 'Asignación',
        elemento: elemento.descripcion,
        usuario: usuario.nombre
    });
    guardarDatos('operaciones', operaciones);
    
    alert('Equipo asignado correctamente');
    setTimeout(() => window.location.href = 'inicio.html', 1000);
}