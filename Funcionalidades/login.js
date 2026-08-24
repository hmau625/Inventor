// Login functions

document.getElementById('formulario-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-usuario').value.trim();
    const password = document.getElementById('password-usuario').value;
    const msgError = document.getElementById('mensaje-error');
    
    msgError.textContent = '';
    
    const usuario = USUARIOS.find(u => u.email === email);
    
    if (!usuario || password !== PASS) {
        msgError.textContent = 'Email o contraseña incorrectos';
        msgError.classList.add('mostrar');
        return;
    }
    
    const sesion = {
        email: email,
        nombre: usuario.nombre,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));
    setTimeout(() => window.location.href = 'inicio.html', 500);
});