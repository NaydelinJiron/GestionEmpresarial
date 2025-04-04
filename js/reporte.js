// js/reportes.js

// Evento que se ejecuta una vez que el DOM ha sido completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    const registros = JSON.parse(localStorage.getItem("registros")) || []; // Obtiene los registros almacenados
    const personas = JSON.parse(localStorage.getItem("personas")) || []; // Obtiene la lista de personas

    const conteo = {}; // Objeto para contar la cantidad de ingresos por persona

    // Recorre todos los registros y cuenta los de tipo "Ingreso"
    registros.forEach(reg => {
        if (reg.tipo === "Ingreso") {
            conteo[reg.personaId] = (conteo[reg.personaId] || 0) + 1; // Suma 1 por cada ingreso de una persona
        }
    });

    const labels = []; // Nombres de las personas (para etiquetas del gráfico)
    const data = []; // Cantidad de ingresos por persona

    // Asocia los IDs con nombres y organiza los datos para el gráfico
    Object.entries(conteo).forEach(([id, cantidad]) => {
        const persona = personas.find(p => p.id === id); // Busca el nombre de la persona por su ID
        if (persona) {
            labels.push(persona.nombre); // Agrega el nombre al array de etiquetas
            data.push(cantidad); // Agrega la cantidad de ingresos al array de datos
        }
    });

    const ctx = document.getElementById("graficoIngresos").getContext("2d"); // Obtiene el contexto del canvas para dibujar el gráfico

    // Crea un gráfico de barras con Chart.js
    new Chart(ctx, {
        type: "bar", // Tipo de gráfico: barras
        data: {
            labels, // Etiquetas del eje X (nombres de personas)
            datasets: [{
                label: "Cantidad de ingresos", // Etiqueta del conjunto de datos
                data, // Datos del eje Y (cantidad de ingresos)
                backgroundColor: "#87CEFA" // Color de las barras
            }]
        },
        options: {
            responsive: true, // Hace que el gráfico se adapte al tamaño del contenedor
            scales: {
                y: {
                    beginAtZero: true, // El eje Y comienza en cero
                    precision: 0 // Muestra solo números enteros
                }
            }
        }
    });
});
