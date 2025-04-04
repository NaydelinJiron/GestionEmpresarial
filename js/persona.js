// Función que carga la lista de personas almacenadas en localStorage y las muestra en la tabla
function cargarPersonas() {
    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene la lista de personas desde localStorage
    let tbody = document.getElementById("personas-list"); // Referencia al cuerpo de la tabla HTML
    tbody.innerHTML = ""; // Limpia el contenido anterior de la tabla

    if (personas.length === 0) {
        // Si no hay personas registradas, muestra mensaje de tabla vacía
        tbody.innerHTML = "<tr><td colspan='10' class='text-center'>No hay datos disponibles</td></tr>";
        return;
    }

    // Muestra las personas más recientes primero, sin alterar los índices originales
    [...personas].reverse().forEach((persona, visibleIndex) => {
        const realIndex = personas.length - 1 - visibleIndex; // Calcula el índice real

        const rol = localStorage.getItem("rol"); // Obtiene el rol del usuario actual
        let acciones = "";

        // Si el usuario no es "visor", se muestran botones de edición y eliminación
        if (rol !== "visor") {
            acciones = `
            <button onclick="editarPersona(${realIndex})" class="btn btn-warning">
                <i class="bi bi-person"></i> Editar
            </button>
            <button onclick="eliminarPersona(${realIndex})" class="btn btn-danger">
                <i class="bi bi-layers"></i> Eliminar
            </button>
        `;
        }

        // Se construye una fila HTML con los datos de la persona
        let fila = `<tr>
        <td>${persona.id}</td>
        <td>${persona.nombre}</td>
        <td>${persona.email}</td>
        <td>${persona.direccion}</td>
        <td>${persona.fechaNacimiento}</td>
        <td>${persona.telefono}</td>
        <td>${persona.cargo}</td>
        <td>${persona.estado}</td>
        <td>${persona.oficina}</td>
        <td>${acciones}</td>
    </tr>`;

        // Se agrega la fila al cuerpo de la tabla
        tbody.innerHTML += fila;
    });
}

// Función que elimina una persona por índice
function eliminarPersona(index) {
    if (localStorage.getItem("rol") === "visor") return; // Los usuarios con rol visor no pueden eliminar

    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Lista de personas
    let registros = JSON.parse(localStorage.getItem("registros")) || []; // Lista de registros (ingresos/salidas)

    // Validación de índice válido
    if (index < 0 || index >= personas.length) {
        alert("Índice inválido.");
        return;
    }

    const persona = personas[index]; // Persona seleccionada

    // Se obtienen los registros relacionados a la persona
    const registrosPersona = registros.filter(r => r.personaId === persona.id);

    // Si existen registros, se revisa el último
    if (registrosPersona.length > 0) {
        const ultimo = registrosPersona[registrosPersona.length - 1];

        // Si el último registro fue un ingreso, no se permite eliminar
        if (ultimo.tipo === "Ingreso") {
            alert(`No se puede eliminar a "${persona.nombre}" porque tiene un ingreso sin registrar salida.`);
            return;
        }
    }

    // Confirmación de eliminación
    if (confirm(`¿Estás seguro de que deseas eliminar a "${persona.nombre}"?`)) {
        personas.splice(index, 1); // Elimina la persona del array
        localStorage.setItem("personas", JSON.stringify(personas)); // Actualiza localStorage
        cargarPersonas(); // Recarga la tabla
    }
}

// Función que prepara los datos para editar una persona
function editarPersona(index) {
    localStorage.setItem("editIndex", index); // Guarda el índice a editar
    window.location.href = "form.html"; // Redirige al formulario de edición
}

// Función para guardar o editar persona
function guardarPersona(event) {
    event.preventDefault(); // Previene el envío tradicional del formulario
    let form = event.target;

    // Validación del formulario HTML5
    if (!form.checkValidity()) {
        event.stopPropagation(); // Detiene propagación del evento
        form.classList.add('was-validated'); // Marca los campos inválidos visualmente
        return;
    }

    // Obtención de datos desde el formulario
    let id = document.getElementById("id").value;
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let direccion = document.getElementById("direccion").value;
    let fechaNacimiento = document.getElementById("fechaNacimiento").value;
    let telefono = document.getElementById("telefono").value.trim();
    let cargo = document.getElementById("cargo").value.trim();
    let estado = document.getElementById("estado").value;
    let oficina = document.getElementById("oficina").value;

    // Objeto persona con los datos ingresados
    let persona = { id, nombre, email, direccion, fechaNacimiento, telefono, cargo, estado, oficina };

    // Validación manual de que todos los campos estén completos
    if (
        !persona.id || !persona.nombre || !persona.email || !persona.direccion ||
        !persona.fechaNacimiento || !persona.telefono || !persona.cargo || !persona.estado || !persona.oficina
    ) {
        console.warn("Persona con campos incompletos detectada:", persona); // Mensaje de advertencia en consola
        return;
    }

    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Lista de personas actuales

    let index = localStorage.getItem("editIndex"); // Verifica si estamos editando
    if (index !== null) {
        personas[index] = persona; // Actualiza persona existente
        localStorage.removeItem("editIndex"); // Elimina el índice para futuras operaciones
    } else {
        personas.push(persona); // Agrega nueva persona
    }

    localStorage.setItem("personas", JSON.stringify(personas)); // Guarda cambios en localStorage
    window.location.href = "index.html"; // Redirige al listado principal
}

// Función que carga las oficinas en el combo (select) del formulario de personas
function cargarOficinasEnCombo() {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || []; // Lista de oficinas
    let combo = document.getElementById("oficina"); // Referencia al select
    if (!combo) return; // Evita error si el select no existe (ej. si no estamos en el formulario)

    // Limpia oficinas inválidas o sin nombre
    oficinas = oficinas.filter(oficina => oficina && oficina.nombre);

    // Guarda nuevamente las oficinas filtradas
    localStorage.setItem("oficinas", JSON.stringify(oficinas));

    // Carga opciones válidas al combo
    oficinas.forEach((oficina) => {
        let opcion = document.createElement("option");
        opcion.value = oficina.nombre;
        opcion.text = oficina.nombre;
        combo.appendChild(opcion);
    });
}

// Evento que se ejecuta al cargar la página
window.onload = function () {
    if (document.getElementById("oficina")) {
        cargarOficinasEnCombo(); // Si hay un combo de oficinas, lo carga
    }
    if (document.getElementById("personas-list")) {
        cargarPersonas(); // Si hay una tabla de personas, la carga
    }
};
