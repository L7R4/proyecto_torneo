document.addEventListener("DOMContentLoaded", async () => {
    // Obtener las categorias disponibles
    const responseCategorias = await fetch('/categorias')
    const dataCategorias = await responseCategorias.json();


    // Obtener las divisiones disponibles
    const responseDivisiones = await fetch('/divisiones')
    const dataDivisiones = await responseDivisiones.json();

    rellanarSelects_Categorias_Divisiones(dataCategorias, dataDivisiones)

    const form = document.getElementById("registroEquipoForm");
    const submitButton = form.querySelector("button[type='submit']");

    // Habilitar el botón solo cuando todos los campos estén completos
    form.addEventListener("input", () => {
        const isFormValid = form.checkValidity();
        submitButton.disabled = !isFormValid;
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Recopilar los datos del formulario
        const teamName = document.getElementById("team-name").value;
        const division = document.getElementById("division_select").value;
        const category = document.getElementById("category_select").value;

        // Crear el cuerpo de la solicitud
        const requestData = {
            nombre: teamName,
            id_categoriaFK: category,
            id_divisionFK: division
        };

        try {
            // Realizar la petición POST al servidor
            const response = await fetch("/equipo/crear_equipo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            // Verificar la respuesta del servidor
            if (response.ok) {
                const result = await response.json();
                alert(`Equipo registrado exitosamente`);
                form.reset();
                submitButton.disabled = true; // Deshabilitar el botón después del registro
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error al registrar equipo:", error);
            alert("Ocurrió un error al intentar registrar el equipo. Por favor, inténtalo nuevamente.");
        }
    });
});


function rellanarSelects_Categorias_Divisiones(categorias, divisiones) {
    const division_select = document.querySelector("#division_select")
    const categoria_select = document.querySelector("#category_select")

    categorias.forEach(element => {
        const option = `<option value="${element.id_categoria}">${element.nombre}</option>`
        categoria_select.insertAdjacentHTML("beforeend", option)
    });

    divisiones.forEach(element => {
        const option = `<option value="${element.id_division}">${element.nombre}</option>`
        division_select.insertAdjacentHTML("beforeend", option)
    });
}
