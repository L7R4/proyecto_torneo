document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroCanchaForm");
    const submitButton = form.querySelector("button[type='submit']");

    // Habilitar el botón solo cuando todos los campos estén completos
    form.addEventListener("input", () => {
        const isFormValid = form.checkValidity();
        submitButton.disabled = !isFormValid;
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Recopilar los datos del formulario
        const nombre = document.getElementById("name").value;
        const direcc = document.getElementById("direccion").value;

        // Crear el cuerpo de la solicitud
        const requestData = {
            nombre,
            direcc
        };

        try {
            // Realizar la petición POST al servidor
            const response = await fetch("/canchas/crear_cancha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            // Verificar la respuesta del servidor
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                form.reset();
                submitButton.disabled = true; // Deshabilitar el botón después del registro
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error al registrar cancha:", error);
            alert("Ocurrió un error al intentar registrar la cancha. Por favor, inténtalo nuevamente.");
        }
    });
});
