// Registro - Registrar Llegada

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    configurarFechaHoy();
    
    document.getElementById('generar-acta')?.addEventListener('change', mostrarVistaPrevia);
    document.getElementById('form-llegada')?.addEventListener('submit', procesarRegistro);
});

function configurarFechaHoy() {
    const input = document.getElementById('fecha-ingreso');
    if (input) {
        const hoy = new Date().toISOString().split('T')[0];
        input.value = hoy;
    }
}

function cargarCategorias() {
    const categorias = obtenerDatos('categorias', CATEGORIAS_DEFAULT);
    const container = document.getElementById('container-categorias');
    
    if (container) {
        container.innerHTML = '';
        categorias.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'checkbox-categoria';
            label.innerHTML = `
                <input type="checkbox" value="${cat.nombre}" class="categoria-check">
                <span>${cat.nombre}</span>
            `;
            container.appendChild(label);
        });
    }
}

function mostrarVistaPrevia(e) {
    const vistaActa = document.getElementById('vista-acta');
    if (e.target.checked) {
        vistaActa.style.display = 'block';
        actualizarVistaPrevia();
    } else {
        vistaActa.style.display = 'none';
    }
}

function actualizarVistaPrevia() {
    const tipo = document.getElementById('tipo-elemento')?.value || '-';
    const desc = document.getElementById('descripcion')?.value || '-';
    const serial = document.getElementById('serial')?.value || '-';
    const condicion = document.getElementById('condicion')?.value || '-';
    
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('.categoria-check:checked'))
        .map(c => c.value)
        .join(', ');
    
    document.getElementById('acta-fecha').textContent = new Date().toLocaleDateString('es-ES');
    document.getElementById('acta-desc').textContent = `${tipo} - ${desc}`;
    document.getElementById('acta-serial').textContent = serial;
    document.getElementById('acta-cond').textContent = condicion;
    document.getElementById('acta-cats').textContent = categoriasSeleccionadas || 'Sin categoría';
}

function valor(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function procesarRegistro(e) {
    e.preventDefault();
    
    const generarActa = document.getElementById('generar-acta').checked;
    
    if (generarActa && (!valor('emp-nombre') || !valor('emp-cc'))) {
        alert('Para generar el acta ingrese el nombre y la C.C. del empleado que recibe');
        document.getElementById(valor('emp-nombre') ? 'emp-cc' : 'emp-nombre').focus();
        return;
    }
    
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('.categoria-check:checked'))
        .map(c => c.value);
    
    // "Dell Inspiron 15" -> marca "Dell", modelo "Inspiron 15"
    const [marca, ...resto] = valor('marca').split(/\s+/);
    
    const datosRegistro = {
        id: generarId(),
        tipo: valor('tipo-elemento'),
        descripcion: document.getElementById('descripcion').value,
        marca: marca || '',
        modelo: resto.join(' '),
        serial: valor('serial'),
        codigo: valor('codigo'),
        cantidad: parseInt(document.getElementById('cantidad').value) || 1,
        condicion: document.getElementById('condicion').value,
        fecha_ingreso: document.getElementById('fecha-ingreso').value,
        ubicacion: valor('ubicacion'),
        observaciones: document.getElementById('observaciones').value,
        categorias: categoriasSeleccionadas,
        estado: 'Disponible',
        fecha_registro: new Date().toISOString(),
        historial: [{
            fecha: new Date().toISOString(),
            tipo: 'Entrada',
            descripcion: 'Elemento registrado'
        }]
    };
    
    // Con acta: NO se guarda todavia. Se guarda al confirmar en plantilla-entrada.html
    if (generarActa) {
        abrirActa('entrada', {
            nombreEmpleado: valor('emp-nombre'),
            ccEmpleado: valor('emp-cc'),
            cargo: valor('emp-cargo'),
            sede: valor('emp-sede'),
            area: valor('emp-area'),
            tipo: datosRegistro.tipo,
            marca: datosRegistro.marca,
            modelo: datosRegistro.modelo,
            serial: datosRegistro.serial || datosRegistro.codigo,
            descripcion: datosRegistro.descripcion,
            cantidad: datosRegistro.cantidad,
            condicion: datosRegistro.condicion,
            fechaIngreso: datosRegistro.fecha_ingreso
        }, { tipo: 'entrada', datos: datosRegistro });
        return;
    }
    
    // Sin acta: se guarda directo
    aplicarEntrada(datosRegistro);
    alert('Elemento registrado correctamente');
    
    e.target.reset();
    cargarCategorias();
    configurarFechaHoy();
    document.getElementById('vista-acta').style.display = 'none';
}