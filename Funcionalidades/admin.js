// Admin - Tabs, categorías y reportes

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    inicializarCategorias();
});

function inicializarTabs() {
    document.querySelectorAll('.tab-boton').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-boton').forEach(b => b.classList.remove('activo'));
            document.querySelectorAll('.contenido-tab').forEach(t => t.classList.remove('activo'));
            
            btn.classList.add('activo');
            document.getElementById(tab)?.classList.add('activo');
        });
    });
}

function inicializarCategorias() {
    const btnAgregar = document.getElementById('btn-agregar-categoria');
    const input = document.getElementById('nueva-categoria');
    
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const nombre = input.value.trim();
            if (!nombre) {
                alert('Ingrese nombre de categoría');
                return;
            }
            agregarCategoria(nombre);
            input.value = '';
        });
    }
    
    llenarCategorias();
}

function agregarCategoria(nombre) {
    const categorias = obtenerDatos('categorias', CATEGORIAS_DEFAULT);
    
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert('Categoría ya existe');
        return;
    }
    
    categorias.push({
        id: Math.max(...categorias.map(c => c.id), 0) + 1,
        nombre: nombre
    });
    
    guardarDatos('categorias', categorias);
    llenarCategorias();
    alert('Categoría agregada');
}

function llenarCategorias() {
    const categorias = obtenerDatos('categorias', CATEGORIAS_DEFAULT);
    const inventario = obtenerDatos('inventario', []);
    const tbody = document.getElementById('tbody-categorias');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    categorias.forEach(cat => {
        const cantidad = inventario.filter(e => 
            e.categorias?.includes(cat.nombre)
        ).length;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat.nombre}</td>
            <td>${cantidad}</td>
            <td>Activa</td>
            <td><button class="btn-primario" style="font-size: 12px; padding: 6px 12px;">Editar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function generarReporte(tipo) {
    const inventario = obtenerDatos('inventario', []);
    const contenedor = document.getElementById('contenedor-reporte');
    const contenido = document.getElementById('contenido-reporte');
    
    let html = '<table class="tabla-principal"><thead><tr>';
    
    if (tipo === 'general') {
        const total = inventario.length;
        const disp = inventario.filter(e => e.estado === 'Disponible').length;
        const asig = inventario.filter(e => e.estado === 'Asignado').length;
        const bajas = inventario.filter(e => e.estado === 'Dado de Baja').length;
        
        html = `
            <table class="tabla-principal">
                <tr><td>Total</td><td>${total}</td></tr>
                <tr><td>Disponibles</td><td>${disp}</td></tr>
                <tr><td>Asignados</td><td>${asig}</td></tr>
                <tr><td>Dados de Baja</td><td>${bajas}</td></tr>
            </table>
        `;
    } else if (tipo === 'categorias') {
        const categorias = obtenerDatos('categorias', CATEGORIAS_DEFAULT);
        html = '<table class="tabla-principal"><tr><th>Categoría</th><th>Cantidad</th></tr>';
        categorias.forEach(cat => {
            const cant = inventario.filter(e => e.categorias?.includes(cat.nombre)).length;
            html += `<tr><td>${cat.nombre}</td><td>${cant}</td></tr>`;
        });
        html += '</table>';
    } else if (tipo === 'asignados') {
        const asignados = inventario.filter(e => e.estado === 'Asignado');
        html = '<table class="tabla-principal"><tr><th>Elemento</th><th>Responsable</th><th>Fecha</th></tr>';
        asignados.forEach(e => {
            html += `<tr><td>${e.descripcion}</td><td>${e.responsable || '-'}</td><td>${e.fecha_asignacion || '-'}</td></tr>`;
        });
        html += '</table>';
    } else if (tipo === 'bajas') {
        const bajas = inventario.filter(e => e.estado === 'Dado de Baja');
        html = '<table class="tabla-principal"><tr><th>Elemento</th><th>Motivo</th><th>Destino</th></tr>';
        bajas.forEach(e => {
            html += `<tr><td>${e.descripcion}</td><td>${e.motivo_baja || '-'}</td><td>${e.destino || '-'}</td></tr>`;
        });
        html += '</table>';
    }
    
    contenido.innerHTML = html;
    contenedor.style.display = 'block';
}