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

function verificarSesion() {
    const usuario = localStorage.getItem('usuarioLogueado');
    const ruta = window.location.pathname.split('/').pop() || 'login.html';
    
    if (ruta === 'login.html' || ruta === '' || ruta === 'Screen') {
        if (usuario) window.location.href = 'inicio.html';
    } else {
        if (!usuario) window.location.href = 'login.html';
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
            window.location.href = 'login.html';
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