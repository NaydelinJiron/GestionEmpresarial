// Evento que se ejecuta cuando el DOM ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {
    actualizarResumenDashboard(); // Actualiza los totales de personas, oficinas y personas dentro
    mostrarGraficoPersonasConMasIngresos(); // Genera el gráfico de personas con más ingresos
    mostrarGraficoOficinasIngresos(); // Genera el gráfico de oficinas con más ingresos
    mostrarGraficoPersonasDentro(); // Genera el gráfico de personas que están actualmente dentro
});

// Gráfico 1: Personas con más ingresos
function mostrarGraficoPersonasConMasIngresos() {
    const registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene los registros del localStorage
    const personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene las personas del localStorage

    const conteoPorPersona = {}; // Objeto para contar ingresos por ID de persona

    registros.forEach(reg => {
        if (reg.tipo === "Ingreso") { // Solo se cuentan los registros de tipo "Ingreso"
            conteoPorPersona[reg.personaId] = (conteoPorPersona[reg.personaId] || 0) + 1; // Suma 1 por ingreso
        }
    });

    const labels = []; // Etiquetas del gráfico (nombres de personas)
    const data = []; // Datos del gráfico (cantidad de ingresos)

    Object.entries(conteoPorPersona).forEach(([id, cantidad]) => {
        const persona = personas.find(p => p.id === id); // Busca el nombre de la persona por ID
        labels.push(persona ? persona.nombre : `ID: ${id}`); // Si la persona existe, usa su nombre, si no, el ID
        data.push(cantidad); // Agrega la cantidad de ingresos
    });

    if (labels.length && data.length) {
        // Si hay datos para mostrar, crea el gráfico de barras
        new Chart(document.getElementById("graficoPersonasIngresos"), {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Ingresos", // Etiqueta del conjunto de datos
                    data
                }]
            },
            options: {
                responsive: true, // Hace el gráfico adaptable
                plugins: {
                    legend: { display: false }, // Oculta la leyenda
                    title: {
                        display: true,
                        text: "Personas con Más Ingresos" // Título del gráfico
                    }
                }
            }
        });
    }
}

// Gráfico 2: Oficinas con más ingresos
function mostrarGraficoOficinasIngresos() {
    const registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene los registros del localStorage
    const personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene las personas del localStorage

    const conteoPorOficina = {}; // Objeto para contar ingresos por oficina

    registros.forEach(reg => {
        if (reg.tipo === "Ingreso") { // Solo se cuentan registros de ingreso
            const persona = personas.find(p => p.id === reg.personaId); // Busca la persona asociada al registro
            if (persona && persona.oficina) {
                conteoPorOficina[persona.oficina] = (conteoPorOficina[persona.oficina] || 0) + 1; // Suma ingresos por oficina
            }
        }
    });

    const labels = Object.keys(conteoPorOficina); // Etiquetas del gráfico (nombres de oficinas)
    const data = Object.values(conteoPorOficina); // Datos del gráfico (cantidad de ingresos)

    if (labels.length && data.length) {
        // Si hay datos, se genera el gráfico de barras
        new Chart(document.getElementById("graficoOficinasIngresos"), {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Cantidad de Ingresos", // Etiqueta del dataset
                    data
                }]
            },
            options: {
                responsive: true, // Hace el gráfico adaptable
                plugins: {
                    legend: { display: false }, // Oculta la leyenda
                    title: {
                        display: true,
                        text: "Oficinas con Mayor Número de Ingresos" // Título del gráfico
                    }
                }
            }
        });
    }
}

// Gráfico 3: Personas actualmente dentro
function mostrarGraficoPersonasDentro() {
    const personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene las personas del localStorage
    const registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene los registros del localStorage

    const personasDentro = []; // Lista para almacenar nombres de personas que están actualmente dentro

    personas.forEach(persona => {
        const historial = registros.filter(r => r.personaId === persona.id); // Filtra registros por persona
        const ultimo = historial[historial.length - 1]; // Obtiene el último registro de la persona
        if (ultimo && ultimo.tipo === "Ingreso") {
            personasDentro.push(persona.nombre); // Si el último fue un ingreso, la persona está dentro
        }
    });

    if (personasDentro.length) {
        // Si hay personas dentro, se genera el gráfico de barras horizontal
        new Chart(document.getElementById("graficoPersonasDentro"), {
            type: "bar",
            data: {
                labels: personasDentro, // Nombres de personas
                datasets: [{
                    label: "Personas Dentro", // Etiqueta del dataset
                    data: personasDentro.map(() => 1), // Se asigna valor 1 por cada persona
                    backgroundColor: "#ffc107" // Color de las barras
                }]
            },
            options: {
                responsive: true, // Gráfico adaptable
                plugins: {
                    legend: { display: false }, // Oculta la leyenda
                    title: {
                        display: true,
                        text: "Personas Actualmente Dentro de una Oficina" // Título del gráfico
                    }
                },
                indexAxis: "y", // Eje Y como índice (horizontal)
                scales: {
                    x: {
                        beginAtZero: true, // Comienza desde cero
                        ticks: { stepSize: 1 } // Paso de 1 en el eje X
                    }
                }
            }
        });
    }
}

// Mostrar totales
function actualizarResumenDashboard() {
    const personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene la lista de personas
    const oficinas = JSON.parse(localStorage.getItem("oficinas")) || []; // Obtiene la lista de oficinas
    const registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene la lista de registros

    // Muestra el total de personas en el elemento correspondiente
    document.getElementById("totalPersonas").textContent = personas.length;

    // Muestra el total de oficinas
    document.getElementById("totalOficinas").textContent = oficinas.length;

    // Filtra las personas que están actualmente dentro
    const personasDentro = personas.filter(p => {
        const historial = registros.filter(r => r.personaId === p.id); // Obtiene los registros de esa persona
        const ultimo = historial[historial.length - 1]; // Toma el último registro
        return ultimo?.tipo === "Ingreso"; // Verifica si el último registro fue de ingreso
    });

    // Muestra el total de personas dentro
    document.getElementById("totalDentro").textContent = personasDentro.length;
}
