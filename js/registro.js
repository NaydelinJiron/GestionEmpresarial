// Función que carga las personas en el combo (select) para selección en formulario de registro
function cargarPersonasEnCombo() {
    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene la lista de personas desde localStorage
    let combo = document.getElementById("persona"); // Obtiene referencia al combo (select) de personas

    combo.innerHTML = ""; // Limpia el combo por si se recarga
    combo.innerHTML = '<option value="">Seleccione una persona</option>'; // Agrega opción por defecto

    // Muestra primero las personas más recientes
    [...personas].reverse().forEach(persona => {
        let opcion = document.createElement("option"); // Crea opción nueva
        opcion.value = persona.id; // Valor de la opción: ID de la persona
        opcion.text = `${persona.nombre} (${persona.id})`; // Texto visible: nombre e ID
        combo.appendChild(opcion); // Agrega la opción al combo
    });
}

// Mostrar automáticamente la oficina asociada al seleccionar persona
document.addEventListener("DOMContentLoaded", function () {
    cargarPersonasEnCombo(); // Carga las personas en el combo al cargar la página

    // Agrega listener al combo para detectar cambio de selección
    document.getElementById("persona").addEventListener("change", function () {
        let personaId = this.value; // Obtiene el ID seleccionado
        let personas = JSON.parse(localStorage.getItem("personas")) || []; // Lista de personas
        let persona = personas.find(p => p.id.toString() === personaId); // Busca la persona seleccionada

        if (persona) {
            document.getElementById("oficinaAsignada").value = persona.oficina || "No asignada"; // Muestra la oficina correspondiente
        } else {
            document.getElementById("oficinaAsignada").value = ""; // Limpia si no encuentra persona
        }
    });
});

// Función para guardar un nuevo registro de ingreso o salida
function guardarRegistro(event) {
    event.preventDefault(); // Previene comportamiento por defecto del formulario

    let personaId = document.getElementById("persona").value; // Obtiene ID de persona seleccionada
    let tipo = document.getElementById("tipoRegistro").value; // Obtiene tipo de registro: Ingreso o Salida
    let fechaHora = document.getElementById("fechaHora").value; // Obtiene fecha y hora ingresadas

    // Validación de campos obligatorios
    if (!personaId || !tipo || !fechaHora) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    let registros = JSON.parse(localStorage.getItem("registros")) || []; // Lista de registros existentes
    let personas = JSON.parse(localStorage.getItem("personas")) || []; // Lista de personas
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || []; // Lista de oficinas

    let persona = personas.find(p => p.id === personaId); // Busca la persona seleccionada
    if (!persona) {
        alert("Persona no encontrada.");
        return;
    }

    let oficina = oficinas.find(o => o.nombre === persona.oficina); // Busca la oficina asignada a la persona
    if (!oficina) {
        alert("La oficina asociada a esta persona no fue encontrada.");
        return;
    }

    // Se obtienen registros anteriores de esa persona
    let registrosPersona = registros.filter(r => r.personaId === personaId);
    let ultimoRegistro = registrosPersona[registrosPersona.length - 1]; // Último registro (si existe)

    if (tipo === "Ingreso") {
        // Verifica que no haya un ingreso sin salida previa
        if (ultimoRegistro?.tipo === "Ingreso") {
            alert("Esta persona ya ingresó y no ha salido.");
            return;
        }

        // Valida la capacidad actual de la oficina
        let personasDentro = personas.filter(p => {
            let historial = registros.filter(r => r.personaId === p.id);
            let ultimo = historial[historial.length - 1];
            return p.oficina === oficina.nombre && ultimo?.tipo === "Ingreso";
        });

        // Verifica si la oficina está llena
        if (personasDentro.length >= parseInt(oficina.maximoPersonas)) {
            alert(`La oficina "${oficina.nombre}" ya está llena (${oficina.maximoPersonas} personas).`);
            return;
        }

    } else if (tipo === "Salida") {
        // Valida que haya un ingreso previo para registrar salida
        if (!ultimoRegistro || ultimoRegistro.tipo !== "Ingreso") {
            alert("No se puede registrar salida si no ha ingresado primero.");
            return;
        }

        // Valida que la fecha de salida sea posterior al ingreso
        let fechaNueva = new Date(fechaHora);
        let fechaAnterior = new Date(ultimoRegistro.fechaHora);

        if (fechaNueva < fechaAnterior) {
            alert("La fecha de salida no puede ser anterior a la de ingreso.");
            return;
        }
    }

    // Crea el nuevo registro y lo guarda
    let nuevoRegistro = { personaId, tipo, fechaHora };
    registros.push(nuevoRegistro);
    localStorage.setItem("registros", JSON.stringify(registros)); // Guarda en localStorage

    alert("Registro guardado correctamente."); // Muestra mensaje de éxito
    window.location.href = "indexRegistro.html"; // Redirige a la página de registros
}

// Función para editar un registro
function editarRegistro(index) {
    localStorage.setItem("editRegistroIndex", index); // Guarda índice del registro a editar
    window.location.href = "registro.html"; // Redirige al formulario de edición
}

// Función para eliminar un registro por índice
function eliminarRegistro(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
        let registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene registros
        registros.splice(index, 1); // Elimina el registro
        localStorage.setItem("registros", JSON.stringify(registros)); // Guarda cambios
        location.reload(); // Recarga la página para reflejar los cambios
    }
}

// Aplicar restricciones del rol después de renderizar la tabla
document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol"); // Obtiene el rol del usuario

    if (rol === "visor") {
        // Oculta el botón de nuevo registro para el rol "visor"
        const nuevoBtn = document.querySelector("a[href='registro.html']");
        if (nuevoBtn) nuevoBtn.style.display = "none";

        // Oculta botones de acciones como editar, eliminar o registrar
        setTimeout(() => {
            document.querySelectorAll("button").forEach(btn => {
                const texto = btn.textContent.toLowerCase();
                if (texto.includes("editar") || texto.includes("eliminar") || texto.includes("registrar")) {
                    btn.style.display = "none";
                }
            });
        }, 100); // Se aplica con un pequeño retraso para asegurar que la tabla se haya renderizado
    }
});
