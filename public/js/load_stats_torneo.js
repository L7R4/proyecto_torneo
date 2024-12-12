function listenerMatchsFixture() {
    let fixtures = document.querySelectorAll('#listFixtures > li.i_fix');
    console.log(fixtures)
    fixtures.forEach(f => {
        const id_fixture = f.querySelector(".fixtureItemWrapper").id.split("_")[1];
        f.addEventListener("click", () => showMatchs(id_fixture));
    });

}


function showMatchs(id_fixture) {
    // Limpiar el contenedor antes de agregar nuevos datos
    const container = document.getElementById('containerDetailOne');
    container.innerHTML = '';

    fetch(`/encuentros/${id_fixture}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los encuentros');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            // Crear un string acumulativo para el HTML
            let htmlContent = '';

            data.forEach((rueda, numeroRueda) => {
                // Generar HTML para la rueda
                let ruedaHTML = `
                <div class="ruedaContainer" id="r_${rueda.id_rueda}">
                    <h2>Rueda Nro.: ${numeroRueda + 1}</h2>
                `;

                rueda.fechas.forEach(fecha => {
                    // Generar HTML para la fecha
                    let fechaHTML = `
                    <div class="fechaContainer" id="f_${fecha.fecha}">
                        <h3>Fecha: ${fecha.fecha}</h3>
                    `;

                    fecha.encuentros.forEach(encuentro => {
                        // Generar HTML para el encuentro
                        const encuentroHTML = `
                        <div class="encuentroContainer" id="e_${encuentro.id_encuentro}">
                            <div class="teamContainer" id="peq_${encuentro.id_participaEncuentro1}">
                                <h4>${encuentro.equipo1}</h4>
                            </div>
                            <h4><strong>VS</strong></h4>
                            <div class="teamContainer" id="peq_${encuentro.id_participaEncuentro2}">
                                <h4>${encuentro.equipo2}</h4>
                            </div>
                        </div>`;

                        // Agregar cada encuentro al HTML de la fecha
                        fechaHTML += encuentroHTML;
                    });

                    // Cerrar contenedor de la fecha y agregar al HTML de la rueda
                    fechaHTML += '</div>';
                    ruedaHTML += fechaHTML;
                });

                // Cerrar contenedor de la rueda y agregar al HTML principal
                ruedaHTML += '</div>';
                htmlContent += ruedaHTML;
            });

            // Insertar el HTML acumulado en el contenedor principal
            container.insertAdjacentHTML('beforeend', htmlContent);
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Ocurrió un error al cargar los encuentros.</p>';
        });
}

