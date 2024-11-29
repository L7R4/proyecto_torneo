function renderFormNewTorneo() {
    return `
    <div id="formNewTorneoContainer">
        <h2 class="tittleModal">Registrar nuevo torneo</h2>
        <form id="registerTorneoForm">
            <div class="inputWrapper">
                <label class="labelInput">Nombre del torneo</label>
                <input type="text" class="inputCheck" placeholder="Ej. Torneo Gaona" />
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

function newModalImport() {
    let modal = new tingle.modal({
        footer: true,
        closeMethods: [''],
        cssClass: ['modalContainerImport'],
        onClose: function () {
            modal.destroy();
        },
    });

    // Set content
    modal.setContent(renderFormNewTorneo());

    // Add a button
    modal.addFooterBtn('Guardar', 'tingle-btn tingle-btn--primary', async function () {
        console.log("Formulario enviado");
        modal.close();
        modal.destroy();

        // Obtiene el último torneo del JSON y calcula el nuevo ID
        const lastTorneo = getMaxIdObject(torneosLoaded); 
        const idNewTorneo = lastTorneo.id + 1;

        // Redirige al nuevo URL con el ID calculado
        window.location.href = `detalle_torneo.html?id=${idNewTorneo}`;

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
        })
        if (!response.ok) {
            throw new Error("Error")
        }
        const data = await response.json();
        return data;
    } catch (error) {
    }
}

function getMaxIdObject(jsonArray) {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
        throw new Error("El JSON debe ser un array no vacío.");
    }

    return jsonArray.reduce((maxObj, currentObj) => {
        return currentObj.id > maxObj.id ? currentObj : maxObj;
    });
}


