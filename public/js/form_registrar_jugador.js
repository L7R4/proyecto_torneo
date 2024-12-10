document.getElementById('jugador-fec_nac').addEventListener('input', function () {
    const fechaNacimiento = this.value;
    const fecha = fechaNacimiento.split('/');

    if (fecha.length === 3) {
        const dia = parseInt(fecha[0], 10);
        const mes = parseInt(fecha[1], 10) - 1;
        const anio = parseInt(fecha[2], 10);

        const fechaNacimientoObj = new Date(anio, mes, dia);
        const edad = calcularEdad(fechaNacimientoObj);

        let categoria = obtenerCategoriaPorEdad(edad);

        // Actualizar el valor del <select> si se encontró una categoría válida
        const categorySelect = document.getElementById('category_select');
        if (categoria) {
            categorySelect.value = categoria.id_categoria;
            document.getElementById('submit-btn').disabled = false;
        } else {
            categorySelect.value = ''; // Resetear el valor si no hay categoría válida
            document.getElementById('submit-btn').disabled = true;
        }
    }
});

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth();
    if (mes < fechaNacimiento.getMonth() || (mes === fechaNacimiento.getMonth() && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}

let dataCategorias = []; // Inicializamos la variable

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("registroJugadorForm");
    const submitButton = document.getElementById("submit-btn");
    const fileInput = document.getElementById("jugador-foto");
    const fileNameDisplay = document.getElementById("file-name");

    // Obtener las categorías disponibles
    const responseCategorias = await fetch('/categorias');
    dataCategorias = await responseCategorias.json();

    // Obtener los equipos disponibles
    const responseEquipos = await fetch('/equipos');
    const dataEquipos = await responseEquipos.json();

    // Llenar los selects
    rellenarSelects_Equipos_Categorias(dataCategorias, dataEquipos);

    // Lógica de habilitar botón
    form.addEventListener("input", () => {
        const isFormValid = form.checkValidity();
        submitButton.disabled = !isFormValid;
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const requestData = {
            dni: parseInt(document.getElementById("jugador-dni").value),
            nombre: document.getElementById("jugador-name").value,
            apellido: document.getElementById("jugador-apellido").value,
            fec_nac: document.getElementById("jugador-fec_nac").value,
            domic: document.getElementById("jugador-direcc").value,
            foto: fileInput.files[0]?.name || '', // Enviar solo el nombre del archivo
            id_categoriaFK: parseInt(document.getElementById("category_select").value),
            num_equipoFK: parseInt(document.getElementById("equipo_select").value)
        };

        try {
            const response = await fetch("/create_jugador", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Jugador registrado exitosamente. ID: ${result.id}`);
                form.reset();
                fileNameDisplay.textContent = "Ningún archivo seleccionado";
                submitButton.disabled = true;
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error al registrar jugador:", error);
            alert("Ocurrió un error al intentar registrar el jugador. Por favor, inténtalo nuevamente.");
        }
    });
});

function rellenarSelects_Equipos_Categorias(categorias, equipos) {
    const equipo_select = document.querySelector("#equipo_select");
    const categoria_select = document.querySelector("#category_select");

    categorias.forEach(element => {
        const option = `<option value="${element.id_categoria}">${element.nombre}</option>`;
        categoria_select.insertAdjacentHTML("beforeend", option);
    });

    equipos.forEach(element => {
        const option = `<option value="${element.num_equipo}">${element.nombre}</option>`;
        equipo_select.insertAdjacentHTML("beforeend", option);
    });
}

function obtenerCategoriaPorEdad(edad) {
    return dataCategorias.find(categoria => edad >= categoria.edad_min && edad <= categoria.edad_max) || null;
}
