document.addEventListener("DOMContentLoaded", () => {
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
        const division = document.getElementById("division").value;
        const category = document.getElementById("category").value;

        // Crear el cuerpo de la solicitud
        const requestData = {
            nombre: teamName,
            id_categoriaFK: category,
            id_divisionFK: division
        };

        try {
            // Realizar la petición POST al servidor
            const response = await fetch("/equipo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            // Verificar la respuesta del servidor
            if (response.ok) {
                const result = await response.json();
                alert(`Equipo registrado exitosamente. ID: ${result.id}`);
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
