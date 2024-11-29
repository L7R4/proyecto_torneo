// document.getElementById('jugador-foto').addEventListener('change', function(e) {
//     const fileName = e.target.files[0] ? e.target.files[0].name : 'Ningún archivo seleccionado';
//     document.getElementById('file-name').textContent = fileName;
// });

document.getElementById('jugador-fec_nac').addEventListener('input', function () {
    const fechaNacimiento = this.value;
    const fecha = fechaNacimiento.split('/');

    if (fecha.length === 3) {
        const dia = parseInt(fecha[0], 10);
        const mes = parseInt(fecha[1], 10) - 1;
        const anio = parseInt(fecha[2], 10);

        const fechaNacimientoObj = new Date(anio, mes, dia);
        const edad = calcularEdad(fechaNacimientoObj);

        let categoria = '';
        if (edad >= 41 && edad <= 45) {
            categoria = '1'; // ID de categoría para Maxi
        } else if (edad >= 46 && edad <= 50) {
            categoria = '2'; // ID de categoría para Super
        } else if (edad >= 51 && edad <= 55) {
            categoria = '3'; // ID de categoría para Master
        }

        // Actualizar el valor del <select> si se encontró una categoría válida
        const categorySelect = document.getElementById('category');
        if (categoria) {
            categorySelect.value = categoria;
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

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("registroJugadorForm");
    const submitButton = document.getElementById("submit-btn");
    const fileInput = document.getElementById("jugador-foto");
    const fileNameDisplay = document.getElementById("file-name");

    // Habilitar el botón de envío solo si todos los campos están completos
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
            fecha_nac: document.getElementById("jugador-fec_nac").value,
            direcc: document.getElementById("jugador-direcc").value,
            foto: fileInput.files[0]?.name || '', // Enviar solo el nombre del archivo
            id_categoriaFK: parseInt(document.getElementById("category").value),
            num_equipoFK: parseInt(document.getElementById("equipo").value)
        };

        console.log(requestData)

        try {
            // Realizar la petición POST
            const response = await fetch("/create_jugador", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            // Verificar la respuesta del servidor
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

    const response = await fetch('/equipos')
    const data = await response.json();

    // Mostrar los usuarios en el navegador
    data.forEach(team => {
        createItemEquipo_HTML(team["num_equipo"],team["nombre"])
    });
});


function createItemEquipo_HTML(id,nombre) {
    const selectWrapperEquipo = document.getElementById("equipo")
    let stringForHTML =
      `
      <option value="${id}">${nombre}</option>
  `
  selectWrapperEquipo.insertAdjacentHTML('beforeend', stringForHTML);

}


