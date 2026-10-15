// Bajas - Dar de Baja
// (reemplaza tambien al otro script de bajas que tenias; usa solo este)

document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaBaja = document.getElementById('fecha-baja');
    if (fechaBaja) fechaBaja.value = hoy;
    
    document.getElementById('btn-buscar-baja')?.addEventListener('click', buscarElementoBaja);
    document.getElementById('destino-baja')?.addEventListener('change', mostrarOpcionesAmbiental);
    document.getElementById('requiere-firma-baja')?.addEventListener('change', mostrarCanvasFirma);
    document.getElementById('form-baja')?.addEventListener('submit', procesarBaja);
});

function valor(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function buscarElementoBaja() {
    const serial = valor('serial-baja');
    
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
    
    if (elemento.estado === 'Dado de Baja') {
        alert('Este elemento ya fue dado de baja');
        return;
    }
    
    document.getElementById('desc-baja').textContent = elemento.descripcion;
    document.getElementById('serial-baja-info').textContent = elemento.serial || elemento.codigo;
    document.getElementById('cond-baja').textContent = elemento.condicion;
    document.getElementById('estado-baja').textContent = elemento.estado;
    
    document.getElementById('info-elemento-baja').style.display = 'block';
    document.getElementById('fieldset-baja').style.display = 'block';
    document.getElementById('btn-finalizar-baja').style.display = 'block';
    
    document.getElementById('form-baja').dataset.elementoId = elemento.id;
    document.getElementById('numero-acta').value = 'BJ-' + Date.now().toString().slice(-6);
    
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-acta').value = hoy;
    if (!valor('fecha-baja')) document.getElementById('fecha-baja').value = hoy;
}

function mostrarOpcionesAmbiental(e) {
    const opcionesAmbiental = document.getElementById('opciones-ambiental');
    const rutaBaja = document.getElementById('ruta-baja-info');
    
    if (e.target.value === 'Ambiental') {
        opcionesAmbiental.style.display = 'block';
        rutaBaja.textContent = 'Ruta: \\\\Servidor\\Inventario\\Bajas\\Ambiental\\';
    } else {
        opcionesAmbiental.style.display = 'none';
        rutaBaja.textContent = 'Ruta: \\\\Servidor\\Inventario\\Bajas\\Desecho\\';
    }
}

function mostrarCanvasFirma(e) {
    const contenedor = document.getElementById('firma-baja');
    if (e.target.checked) {
        contenedor.style.display = 'block';
        inicializarCanvasFirma();
    } else {
        contenedor.style.display = 'none';
    }
}

function inicializarCanvasFirma() {
    const canvas = document.getElementById('canvas-firma-baja');
    if (canvas.dataset.listo) return;          // evita duplicar los eventos
    canvas.dataset.listo = '1';
    
    const ctx = canvas.getContext('2d');
    let dibujando = false;
    
    canvas.addEventListener('mousedown', () => dibujando = true);
    canvas.addEventListener('mouseup', () => dibujando = false);
    canvas.addEventListener('mouseleave', () => dibujando = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!dibujando) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    document.getElementById('btn-limpiar-firma-baja').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function procesarBaja(e) {
    e.preventDefault();
    
    const elementoId = e.target.dataset.elementoId;
    const motivo = valor('motivo-baja');
    const destino = valor('destino-baja');
    const fechaBaja = valor('fecha-baja');
    const responsableActa = valor('responsable-acta');
    
    if (!elementoId) {
        alert('Busque y seleccione un elemento primero');
        return;
    }
    
    if (!motivo || !destino || !fechaBaja || !responsableActa) {
        alert('Complete todos los campos requeridos');
        return;
    }
    
    const inventario = obtenerDatos('inventario', []);
    const elemento = inventario.find(el => el.id === elementoId);
    
    if (!elemento) {
        alert('Elemento no encontrado');
        return;
    }
    
    const datosActa = {
        numeroActa: valor('numero-acta'),
        fechaActa: valor('fecha-acta'),
        responsableActa: responsableActa,
        ccBaja: valor('cc-responsable-acta'),
        motivo: motivo,
        destino: destino,
        fechaBaja: fechaBaja,
        tipoResiduo: valor('tipo-residuo'),
        empresaAmbiental: valor('empresa-ambiental'),
        tipo: elemento.tipo,
        marca: elemento.marca,
        modelo: elemento.modelo,
        serial: elemento.serial || elemento.codigo,
        descripcion: elemento.descripcion,
        condicion: elemento.condicion
    };
    
    if (document.getElementById('requiere-firma-baja').checked) {
        datosActa.firmaData = document.getElementById('canvas-firma-baja').toDataURL();
    }
    
    // La baja siempre lleva acta: NO se guarda todavia.
    // Se guarda al confirmar en plantilla-baja.html
    abrirActa('baja', datosActa, {
        tipo: 'baja',
        datos: { elementoId: elementoId, motivo: motivo, destino: destino, fechaBaja: fechaBaja }
    });
}