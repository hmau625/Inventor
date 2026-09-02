// Login functions

document.getElementById('formulario-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario-login')?.value.trim();
    const password = document.getElementById('password-usuario').value;
    const msgError = document.getElementById('mensaje-error');
    
    msgError.textContent = '';
    
    const usuarioObj = USUARIOS.find(u => u.nombre === usuario);
    
    if (!usuarioObj || password !== PASS) {
        msgError.textContent = 'Usuario o contraseña incorrectos';
        msgError.classList.add('mostrar');
        return;
    }
    
    const sesion = {
        nombre: usuario,
        rol: usuarioObj.rol,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));
    setTimeout(() => window.location.href = 'inicio.html', 500);
});