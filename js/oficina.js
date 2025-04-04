// Función que carga y muestra la lista de oficinas en la tabla
function cargarOficinas() {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || []; // Obtiene las oficinas almacenadas en localStorage
    let tbody = document.getElementById("oficinas-list"); // Referencia al cuerpo de la tabla donde se listan las oficinas
    tbody.innerHTML = ""; // Limpia el contenido previo

    if (oficinas.length === 0) {
        // Si no hay oficinas, muestra un mensaje indicando que no hay datos
        tbody.innerHTML = "<tr><td colspan='4' class='text-center'>No hay datos disponibles</td></tr>";
        return;
    }

    const rol = localStorage.getItem("rol"); // Obtiene el rol del usuario autenticado

    // Recorre las oficinas en orden inverso (la más reciente primero)
    [...oficinas].reverse().forEach((oficina, visibleIndex) => {
        const realIndex = oficinas.length - 1 - visibleIndex; // Calcula el índice real en el array original

        // Botón para ver la oficina en el mapa
        let acciones = `
            <button onclick="verMapa('${oficina.ubicacion}')" class="btn btn-info">
                <i class="bi bi-geo-alt"></i> Mapa
            </button>
        `;

        // Si el usuario no es "visor", se agregan botones de editar y eliminar
        if (rol !== "visor") {
            acciones = `
                <button onclick="editarOficina(${realIndex})" class="btn btn-warning">
                    <i class="bi bi-building"></i> Editar
                </button>
                <button onclick="eliminarOficina(${realIndex})" class="btn btn-danger">
                    <i class="bi bi-layers"></i> Eliminar
                </button>
                ${acciones}
            `;
        }


        // Crea una fila con los datos de la oficina y los botones correspondientes
        let fila = `<tr>
            <td>${oficina.nombre}</td>
            <td>${oficina.ubicacion}</td>
            <td>${oficina.maximoPersonas || "N/A"}</td>
            <td>${acciones}</td>
        </tr>`;

        // Agrega la fila al cuerpo de la tabla
        tbody.innerHTML += fila;
    });
}

// Función que elimina una oficina de la lista según su índice
function eliminarOficina(index)
{
    if (localStorage.getItem("rol") === "visor") return; // Previene la acción si el usuario es "visor"

    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || []; // Carga la lista de oficinas
    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Carga la lista de personas

    if (index >= 0 && index < oficinas.length) {
        let nombreOficina = oficinas[index].nombre; // Obtiene el nombre de la oficina seleccionada

        // Verifica si alguna persona está asociada a esta oficina
        let personasConEsaOficina = personas.filter(p => p.oficina === nombreOficina);
        if (personasConEsaOficina.length > 0) {
            alert(`No se puede eliminar la oficina "${nombreOficina}" porque está asignada a personas.`);
            return;
        }

        // Confirma si el usuario desea eliminar la oficina
        if (confirm("¿Estás seguro de que deseas eliminar esta oficina?")) {
            oficinas.splice(index, 1); // Elimina la oficina del array
            localStorage.setItem("oficinas", JSON.stringify(oficinas)); // Guarda la lista actualizada
            cargarOficinas(); // Recarga la tabla con los datos actualizados
        }
    } else {
        alert("Error: No se pudo eliminar la oficina. Índice inválido."); // Muestra un mensaje si el índice no es válido
    }
}

// Función que prepara los datos de una oficina para ser editados
function editarOficina(index) {
    localStorage.setItem("editIndex", index); // Guarda el índice de la oficina que se va a editar
    window.location.href = "formOficina.html"; // Redirige al formulario de edición de oficinas
}

// Función que guarda una nueva oficina o actualiza una existente
function guardarOficina(event) {
    event.preventDefault(); // Previene que el formulario se envíe de forma tradicional y recargue la página
    let form = event.target;

    // Verifica la validez del formulario
    if (!form.checkValidity()){
        event.stopPropagation(); // Detiene la propagación del evento
        form.classList.add('was-validated'); // Agrega clase de validación para estilos de Bootstrap
        return;
    }

    // Obtiene los valores ingresados en el formulario
    let nombre = document.getElementById("nombreOficina").value;
    let ubicacion = document.getElementById("ubicacionOficina").value;
    let ubicacionRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/; // Expresión regular para validar formato de coordenadas
    if (!ubicacionRegex.test(ubicacion)) {
        alert("La ubicación debe tener el formato correcto: latitud,longitud. Ej: 9.9761,-84.1336");
        return;
    }
    let maximoPersonas = parseInt(document.getElementById("maximoPersonas").value);

    // Verifica que todos los campos sean válidos antes de guardar
    if (!nombre || !ubicacion || isNaN(maximoPersonas) || maximoPersonas<=0) {
        alert("Todos los campos son obligatorios"); // Muestra alerta si falta algún campo
        return;
    }

    // Crea el objeto oficina con los datos ingresados
    let oficina = { nombre, ubicacion, maximoPersonas };

    // Obtiene la lista actual de oficinas desde localStorage
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    // Verifica si se está editando una oficina ya existente
    let index = localStorage.getItem("editIndex");

    if (index !== null) {
        oficinas[index] = oficina; // Reemplaza los datos en la posición correspondiente
        localStorage.removeItem("editIndex"); // Limpia el valor para futuras operaciones
    } else {
        oficinas.push(oficina); // Agrega una nueva oficina a la lista
    }

    // Guarda la lista actualizada en localStorage
    localStorage.setItem("oficinas", JSON.stringify(oficinas));

    // Redirige a la página principal de oficinas
    window.location.href = "indexOficina.html";
}

// Función que abre un mapa con la ubicación de la oficina en una nueva pestaña
function verMapa(ubicacion) {
    const partes = ubicacion.split(","); // Divide la cadena por coma para obtener latitud y longitud
    if (partes.length === 2) {
        const lat = partes[0]; // Latitud
        const lng = partes[1]; // Longitud
        window.open(`mapaOficina.html?lat=${lat}&lng=${lng}`, "_blank"); // Abre la página del mapa con los parámetros
    } else {
        alert("Ubicación no válida."); // Muestra error si la ubicación no tiene el formato correcto
    }
}
