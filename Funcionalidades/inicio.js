// Inicio - Dashboard

document.addEventListener('DOMContentLoaded', () => {
    actualizarDashboard();
    establecerFecha();
});

function establecerFecha() {
    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = hoy.toLocaleDateString('es-ES', opciones);
    const elem = document.getElementById('fecha-actual');
    if (elem) elem.textContent = fecha;
}

function actualizarDashboard() {
    const inventario = obtenerDatos('inventario', []);
    const operaciones = obtenerDatos('operaciones', []);
    
    const total = inventario.length;
    const disponibles = inventario.filter(e => e.estado === 'Disponible').length;
    const asignados = inventario.filter(e => e.estado === 'Asignado').length;
    const bajas = inventario.filter(e => e.estado === 'Dado de Baja').length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-disponibles').textContent = disponibles;
    document.getElementById('stat-asignados').textContent = asignados;
    document.getElementById('stat-bajas').textContent = bajas;
    
    llenarOperaciones(operaciones);
}

function llenarOperaciones(operaciones) {
    const tbody = document.getElementById('tbody-operaciones');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const recientes = operaciones.slice(-5).reverse();
    
    recientes.forEach(op => {
        const hora = new Date(op.fecha).toLocaleTimeString('es-ES');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${hora}</td>
            <td>${op.tipo}</td>
            <td>${op.elemento}</td>
            <td>${op.usuario}</td>
        `;
        tbody.appendChild(tr);
    });
}