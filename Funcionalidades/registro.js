// Registrar Llegada

const form = document.getElementById('form-llegada');
const checkActa = document.getElementById('generar-acta');
const containerCat = document.getElementById('container-categorias');

document.addEventListener('DOMContentLoaded', () => {
    inicializarRegistro();
});

function inicializarRegistro() {
    // Llenar categorías
    const categorias = obtenerDatos('categorias', CATEGORIAS_DEFAULT);
    containerCat.innerHTML = '';
    
    categorias.forEach(cat => {
        const label = document.createElement('label');
        label.className = 'checkbox-categoria';
        label.innerHTML = `
            <input type="checkbox" value="${cat.nombre}" class="checkbox-cat">
            <span>${cat.nombre}</span>
        `;
        containerCat.appendChild(label);
    });

    // Fecha de hoy
    document.getElementById('fecha-ingreso').valueAsDate = new Date();

    // Mostrar acta
    checkActa?.addEventListener('change', (e) => {
        document.getElementById('vista-acta').style.display = e.target.checked ? 'block' : 'none';
    });

    // Submit
    form?.addEventListener('submit', procesarRegistro);
}

function procesarRegistro(e) {
    e.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    const inventario = obtenerDatos('inventario', []);
    const operaciones = obtenerDatos('operaciones', []);
    
    // Obtener categorías seleccionadas
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('.checkbox-cat:checked'))
        .map(cb => cb.value);
    
    const elemento = {
        id: generarId(),
        tipo: document.getElementById('tipo-elemento').value,
        descripcion: document.getElementById('descripcion').value,
        marca: document.getElementById('marca').value,
        serial: document.getElementById('serial').value,
        codigo: document.getElementById('codigo').value,
        cantidad: parseInt(document.getElementById('cantidad').value),
        condicion: document.getElementById('condicion').value,
        ubicacion: document.getElementById('ubicacion').value,
        observaciones: document.getElementById('observaciones').value,
        fecha_ingreso: document.getElementById('fecha-ingreso').value,
        categorias: categoriasSeleccionadas,
        estado: 'Disponible',
        fecha_registro: new Date().toISOString(),
        historial: []
    };
    
    inventario.push(elemento);
    guardarDatos('inventario', inventario);
    
    operaciones.push({
        fecha: new Date().toISOString(),
        tipo: 'Registro Llegada',
        elemento: elemento.descripcion,
        usuario: usuario.nombre
    });
    guardarDatos('operaciones', operaciones);
    
    alert('Elemento registrado correctamente');
    setTimeout(() => window.location.href = 'inicio.html', 1000);
}