async function renderFormNewTorneo() {
    return `
    <div id="formNewTorneoContainer">
        <h2 class="tittleModal">Registrar nuevo torneo</h2>
        <form id="registerTorneoForm">
            <div class="inputWrapper">
                <label class="labelInput">Nombre del torneo</label>
                <input type="text" name="nombre" class="inputCheck" placeholder="Ej. Torneo" />
            </div>
            <div class="inputWrapper">
                <label class="labelInput">Periodo de inscripción</label>
                <div>
                    <input type="date" name="insc_inicio_date" class="inputCheck" required pattern="\d{4}-\d{2}-\d{2}" />
                    <input type="date" name="insc_final_date" class="inputCheck" required pattern="\d{4}-\d{2}-\d{2}" />
                </div>
            </div>
            <div class="inputWrapper">
                <label class="labelInput">Periodo de torneo</label>
                <div>
                    <input type="date" name="torneo_inicio_date" class="inputCheck" required pattern="\d{4}-\d{2}-\d{2}" />
                    <input type="date" name="torneo_final_date" class="inputCheck" required pattern="\d{4}-\d{2}-\d{2}" />
                </div>
            </div>
        </form>
    </div>
    `;
}

async function newModalImport() {
    let modal = new tingle.modal({
        footer: true,
        closeMethods: [''],
        cssClass: ['modalContainerImport'],
        onClose: function () {
            modal.destroy();
        },
    });

    // Set content
    modal.setContent(await renderFormNewTorneo());

    // Add a button
    modal.addFooterBtn('Guardar', 'tingle-btn tingle-btn--primary', async function () {

        // Obtener los datos del formulario
        const formData = new FormData(document.getElementById('registerTorneoForm'));
        const body = {
            nombre: formData.get('nombre'), // Suponiendo que agregues un campo 'nombre' al formulario
            fecha_inicio_insc: formData.get('insc_inicio_date'),
            fecha_final_insc: formData.get('insc_final_date'),
            fecha_inicio_torneo: formData.get('torneo_inicio_date'),
            fecha_final_torneo: formData.get('torneo_final_date'),
        };
        console.log('Body de la solicitud:', body);

        try {
            // Enviar los datos al servidor para crear el torneo
            const response = await fetchFunction(body, '/create_torneos');

            // Verificar si la creación fue exitosa
            if (response && response.id) {
                // Redirigir al detalle del torneo
                window.location.href = `detalle_torneo.html?id=${response.id}`;
            } else {
                console.error('Error al crear el torneo');
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }

        modal.close();
        modal.destroy();
    });

    // Add another button
    modal.addFooterBtn('Cancelar', 'tingle-btn tingle-btn--default', function () {
        modal.close();
        modal.destroy();
    });

    // Open modal
    modal.open();

    // Gestión de validación de inputs
    document.querySelector(".tingle-btn--primary").disabled = true;

    const inputs = document.querySelectorAll(".inputCheck");

    const validateInputs = () => {
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
        return allFilled; // Devuelve true si todos los campos están rellenos
    };

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            document.querySelector(".tingle-btn--primary").disabled = !validateInputs(); // Habilita el botón si todo está completo
        });
    });
}


async function fetchFunction(body, url) {
    try {
        let response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'  // Aseguramos que se envíen como JSON
            },
        })
        if (!response.ok) {
            throw new Error("Error")
        }
        const data = await response.json();
        return data;
    } catch (error) {
    }
}



