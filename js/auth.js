// Lista de usuarios con roles
const usuarios = [
    { username: "admin", password: "1234", rol: "admin" }, // Usuario con rol de administrador
    { username: "registrador", password: "12345", rol: "registrador" }, // Usuario con rol de registrador
    { username: "visor", password: "123456", rol: "visor" } // Usuario con rol de visor
];

// Función para iniciar sesión
function login(event) {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

    let username = document.getElementById("username").value; // Obtiene el valor ingresado en el campo de usuario
    let password = document.getElementById("password").value; // Obtiene el valor ingresado en el campo de contraseña

    // Busca un usuario cuyo nombre y contraseña coincidan con los valores ingresados
    const usuario = usuarios.find(u => u.username === username && u.password === password);

    if (usuario) {
        // Si el usuario existe, se establece la autenticación en localStorage
        localStorage.setItem("auth", "true"); // Marca al usuario como autenticado
        localStorage.setItem("rol", usuario.rol); // Guarda el rol del usuario para futuras restricciones
        window.location.href = "inicio.html"; // Redirige al usuario a la página principal
    } else {
        // Si no se encuentra un usuario válido, muestra un mensaje de error
        alert("Usuario o contraseña incorrectos");
    }
}

// Función para cerrar sesión
function logout() {
    // Elimina la información de autenticación y rol almacenada
    localStorage.removeItem("auth");
    localStorage.removeItem("rol");
    window.location.href = "login.html"; // Redirige a la página de inicio de sesión
}

// Función para verificar autenticación
function verificarAutenticacion() {
    // Si el valor almacenado de autenticación no es "true", redirige al login
    if (localStorage.getItem("auth") !== "true") {
        window.location.href = "login.html";
    }
}

// Función para aplicar restricciones según el rol
function aplicarRestriccionesPorRol() {
    const rol = localStorage.getItem("rol"); // Obtiene el rol almacenado del usuario autenticado
    if (!rol) return; // Si no hay rol definido, no aplica ninguna restricción

    // Redirección si el registrador intenta acceder a páginas no permitidas
    const paginaActual = location.pathname; // Obtiene la ruta del archivo actual
    const paginasPermitidas = ["registro.html", "indexRegistro.html", "inicio.html"]; // Páginas que puede ver el registrador
    const accesoPermitido = paginasPermitidas.some(pagina => paginaActual.includes(pagina)); // Verifica si la página actual está permitida

    if (rol === "registrador" && !accesoPermitido) {
        // Si el registrador intenta entrar a una página no permitida, muestra alerta y redirige
        alert("Acceso denegado para este rol.");
        window.location.href = "indexRegistro.html";
        return;
    }

    // Ocultar enlaces de navegación para el rol REGISTRADOR
    if (rol === "registrador") {
        // Recorre todos los enlaces del menú de navegación
        document.querySelectorAll("a.nav-link, a.dropdown-item").forEach(link => {
            const href = link.getAttribute("href"); // Obtiene la URL del enlace
            if (
                href !== "registro.html" &&
                href !== "indexRegistro.html" &&
                href !== "inicio.html"
            ) {
                link.style.display = "none"; // Oculta los enlaces que no están permitidos
            }
        });
    }

    // Restricciones para el VISOR
    if (rol === "visor") {
        // Ocultar botones de acciones
        document.querySelectorAll("a, button").forEach(el => {
            const texto = el.textContent.toLowerCase(); // Obtiene el texto del elemento en minúscula
            if (

                //nnnnnnnn

                texto.includes("guardar") || // Oculta si el botón contiene la palabra "guardar"
                texto.includes("editar") || // Oculta si contiene "editar"
                texto.includes("eliminar") // Oculta si contiene "eliminar"
            ) {
                el.style.display = "none"; // Oculta el botón o enlace correspondiente
            }
        });

        // Desactivar campos de formularios
        document.querySelectorAll("form").forEach(form => {
            // Desactiva todos los inputs, selects, textareas y botones dentro del formulario
            form.querySelectorAll("input, select, textarea, button").forEach(el => {
                el.disabled = true;
            });
        });
    }
}
