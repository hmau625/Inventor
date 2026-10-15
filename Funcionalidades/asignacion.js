// Asignación - Asignar Equipo

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-buscar-elemento')?.addEventListener('click', buscarElemento);
    document.getElementById('generar-acta-asignacion')?.addEventListener('change', mostrarVistaAsignacion);
    document.getElementById('form-asignacion')?.addEventListener('submit', procesarAsignacion);
    
    const fecha = document.getElementById('fecha-asignacion');
    if (fecha) fecha.value = new Date().toISOString().split('T')[0];
});

function valor(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function buscarElemento() {
    const serial = valor('serial-buscar');
    
    if (!serial) {
        alert('Ingrese un serial o código');
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const elemento = inventario.find(e => e.serial === serial || e.codigo === serial);
    
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    if (elemento.estado !== 'Disponible') {
        alert('Este elemento no está disponible para asignar');
        return;
    }
    
    document.getElementById('desc-elemento').textContent = elemento.descripcion;
    document.getElementById('serial-elemento').textContent = elemento.serial || elemento.codigo;
    document.getElementById('cond-elemento').textContent = elemento.condicion;
    document.getElementById('estado-elemento').textContent = elemento.estado;
    
    document.getElementById('info-elemento').style.display = 'block';
    document.getElementById('fieldset-asignacion').style.display = 'block';
    document.getElementById('btn-finalizar-asignacion').style.display = 'block';
    
    document.getElementById('form-asignacion').dataset.elementoId = elemento.id;
    document.getElementById('form-asignacion').dataset.elementoSerial = serial;
}

function mostrarVistaAsignacion(e) {
    const vista = document.getElementById('vista-acta-asignacion');
    if (e.target.checked) {
        vista.style.display = 'block';
        actualizarVistaAsignacion();
    } else {
        vista.style.display = 'none';
    }
}

function actualizarVistaAsignacion() {
    const desc = document.getElementById('desc-elemento').textContent;
    const responsable = valor('responsable') || '-';
    const departamento = valor('departamento') || '-';
    
    document.getElementById('acta-fecha-asig').textContent = new Date().toLocaleDateString('es-ES');
    document.getElementById('acta-desc-asig').textContent = desc;
    document.getElementById('acta-resp-asig').textContent = responsable;
    document.getElementById('acta-depto-asig').textContent = departamento;
}

function procesarAsignacion(e) {
    e.preventDefault();
    
    const elementoId = e.target.dataset.elementoId;
    const responsable = valor('responsable');
    const fechaAsignacion = document.getElementById('fecha-asignacion').value;
    
    if (!elementoId) {
        alert('Busque y seleccione un elemento primero');
        return;
    }
    
    if (!responsable || !fechaAsignacion) {
        alert('Complete los datos de asignación');
        return;
    }
    
    const generarActa = document.getElementById('generar-acta-asignacion').checked;
    
    if (generarActa && !valor('cc-responsable')) {
        alert('Para generar el acta ingrese la C.C. del responsable');
        document.getElementById('cc-responsable').focus();
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const elemento = inventario.find(el => el.id === elementoId);
    
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    // Lo que se guarda en el inventario
    const accion = {
        tipo: 'asignacion',
        datos: {
            elementoId: elementoId,
            responsable: responsable,
            departamento: valor('departamento'),
            ubicacionUso: valor('ubicacion-uso'),
            fechaAsignacion: fechaAsignacion
        }
    };
    
    // Con acta: NO se guarda todavia. Se guarda al confirmar en plantilla-asignacion.html
    if (generarActa) {
        abrirActa('asignacion', {
            responsable: responsable,
            ccResponsable: valor('cc-responsable'),
            cargo: valor('cargo-responsable'),
            sede: valor('sede-asignacion'),
            area: valor('area-asignacion'),
            departamento: valor('departamento'),
            ubicacionUso: valor('ubicacion-uso'),
            fechaAsignacion: fechaAsignacion,
            tipo: elemento.tipo,
            marca: elemento.marca,
            modelo: elemento.modelo,
            serial: elemento.serial || elemento.codigo,
            descripcion: elemento.descripcion,
            condicion: elemento.condicion
        }, accion);
        return;
    }
    
    // Sin acta: se guarda directo
    const error = aplicarAsignacion(accion.datos);
    if (error) {
        alert(error);
        return;
    }
    alert('Asignación registrada correctamente');
    
    e.target.reset();
    delete e.target.dataset.elementoId;
    document.getElementById('fecha-asignacion').value = new Date().toISOString().split('T')[0];
    document.getElementById('info-elemento').style.display = 'none';
    document.getElementById('fieldset-asignacion').style.display = 'none';
    document.getElementById('btn-finalizar-asignacion').style.display = 'none';
    document.getElementById('vista-acta-asignacion').style.display = 'none';
}