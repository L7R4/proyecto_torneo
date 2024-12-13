document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroArbitroForm");
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
        const apellido = document.getElementById("apellido").value;
        const dni_arbitro = document.getElementById("dni").value;
        const fec_nac = document.getElementById("fec_nac").value;
        const domic = document.getElementById("direccion").value;
        const experiencia = document.getElementById("experiencia_select").value;
        const es_certificado = document.getElementById("certificado").checked;

        // Crear el cuerpo de la solicitud
        const requestData = {
            nombre,
            apellido,
            dni_arbitro,
            fec_nac,
            domic,
            experiencia,
            es_certificado
        };

        try {
            // Realizar la petición POST al servidor
            const response = await fetch("/arbitros/crear_arbitro", {
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
            console.error("Error al registrar árbitro:", error);
            alert("Ocurrió un error al intentar registrar el árbitro. Por favor, inténtalo nuevamente.");
        }
    });
});
