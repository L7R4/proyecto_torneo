// Variables globales para almacenar árbitros y canchas
let arbitros = [];
let canchas = [];
let fixtureHandled;
// Función para cargar árbitros y canchas al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    fetchArbitros();
    fetchCanchas();
});

// Función para obtener árbitros del backend
function fetchArbitros() {
    fetch('/arbitros')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener árbitros');
            }
            return response.json();
        })
        .then(data => {
            arbitros = data;
        })
        .catch(error => {
            console.error('Error al cargar árbitros:', error);
        });
}

// Función para obtener canchas del backend
function fetchCanchas() {
    fetch('/canchas')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener canchas');
            }
            return response.json();
        })
        .then(data => {
            canchas = data;
        })
        .catch(error => {
            console.error('Error al cargar canchas:', error);
        });
}


function listenerMatchsFixture() {
    let fixtures = document.querySelectorAll('#listFixtures > li.i_fix');
    fixtures.forEach(f => {
        const id_fixture = f.querySelector(".fixtureItemWrapper").id.split("_")[1];
        f.addEventListener("click", async() => {
            showMatchs(id_fixture)
            fixtureHandled = id_fixture
        });
    });

}


function showMatchs(id_fixture) {
    console.log(`Fixture -> ${id_fixture}`)
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
            console.log("asssssssss")
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
                        <h2>Fecha: ${parseInt(fecha.fecha)}</h2>
                    `;

                    fecha.encuentros.forEach(encuentro => {
                        // Generar HTML para el encuentro
                        const encuentroHTML = `
                        <div class="encuentroWrapper">
                            <div class="buttonsActionWrapper team1" id="bttns_${encuentro.id_participaEncuentro1}">
                                <button class="buttonGol" type="button">
                                <img src="../images/icons/icon_gol.svg" alt="">
                                </button>
                                <button class="buttonInfraccion" type="button">
                                <img src="../images/icons/icon_infraccion.svg" alt="">
                                </button>
                            </div>

                            <div class="encuentroContainer" id="e_${encuentro.id_encuentro}">
                                <div class="teamContainer" id="peq_${encuentro.id_participaEncuentro1}">
                                    <h4>${encuentro.equipo1}</h4>
                                </div>
                                <div class="golesEncuentroContainer" id="peq_${encuentro.id_participaEncuentro1}">
                                    <h3 class="golesTeam equipo1">${encuentro.golesEquipo1}</h3>
                                    <h4><strong>VS</strong></h4>
                                    <h3 class="golesTeam equipo2">${encuentro.golesEquipo2}</h3>
                                </div>
                                <div class="teamContainer" id="peq_${encuentro.id_participaEncuentro2}">
                                    <h4>${encuentro.equipo2}</h4>
                                </div>
                            </div>

                            <div class="buttonsActionWrapper team2" id="bttns_${encuentro.id_participaEncuentro2}">
                                <button class="buttonGol" type="button">
                                <img src="../images/icons/icon_gol.svg" alt="">
                                </button>
                                <button class="buttonInfraccion" type="button">
                                <img src="../images/icons/icon_infraccion.svg" alt="">
                                </button>
                            </div>
                        </div>
                        
                        
                        `;
                        

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
            let buttonTablaPuntosHTML = `
                    <button id="buttonTablaPuntos" type="button" onclick="obtenerTablaPuntos(${id_fixture})">Ver tabla de puntos</button>
                    `;
            document.querySelector("#containerDetailOne").insertAdjacentHTML("afterbegin",buttonTablaPuntosHTML)
            listenerDetailMatchs()
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Ocurrió un error al cargar los encuentros.</p>';
        });
}


function listenerDetailMatchs() {
    const encuentros = document.querySelectorAll('.encuentroContainer');
    encuentros.forEach(encuentro => {
        const id_encuentro = encuentro.id.split("_")[1];
        encuentro.addEventListener("click", () => showMatchDetails(id_encuentro));
    });

    const botonesGol = document.querySelectorAll('.buttonGol');
    const botonesInfraccion = document.querySelectorAll('.buttonInfraccion');

    botonesGol.forEach(boton => {
        const id_participaEncuentro = boton.parentElement.id.split("_")[1];
        boton.addEventListener("click", () => showGolPopup(id_participaEncuentro));
    });

    botonesInfraccion.forEach(boton => {
        const id_participaEncuentro = boton.parentElement.id.split("_")[1];
        boton.addEventListener("click", () => showInfraccionPopup(id_participaEncuentro));
    });
}

function showMatchDetails(id_encuentro) {
    const container = document.getElementById('containerDetailTwo');
    container.innerHTML = ''; // Limpiar contenido previo

    fetch(`/encuentro/${id_encuentro}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos del encuentro');
            }
            return response.json();
        })
        .then(data => {
            const {
                equipo1,
                equipo2,
                goles_equipo1,
                goles_equipo2,
                infracciones_equipo1,
                infracciones_equipo2,
                cancha,
                arbitro,
                dia,
                hora
            } = data;
            console.log(data)


            const infracciones1HTML = infracciones_equipo1.length > 0
            ? infracciones_equipo1.map(inf => `
                <div>
                    <p>${inf.jugador}</p>
                    <p>${inf.minuto}'</p>
                    <p>${inf.tarjeta || inf.tipo}</p>
                </div>
                <hr>
            `).join('')
            : '<p>No hay infracciones</p>';

            const infracciones2HTML = infracciones_equipo2.length > 0
            ? infracciones_equipo2.map(inf => `
                <div>
                    <p>${inf.jugador}</p>
                    <p>${inf.minuto}'</p>
                    <p>${inf.tarjeta || inf.tipo}</p>
                </div>
                <hr>
            `).join('')
            : '<p>No hay infracciones</p>';

            const goles1HTML = goles_equipo1.length > 0
            ? goles_equipo1.map(gol => `
                <div>
                    <p>${gol.jugador}</p>
                    <p>${gol.minuto}'</p>
                </div>
                <hr>
            `).join('')
            : '<p>No hay goles</p>';


            const goles2HTML = goles_equipo2.length > 0
            ? goles_equipo2.map(gol => `
                <div>
                    <p>${gol.jugador}</p>
                    <p>${gol.minuto}'</p>
                </div>
                <hr>
            `).join('')
            : '<p>No hay goles</p>';



            // Construir el HTML
            let htmlContent = `
                
                <div class="containerShowTeamsEncuentro">
                    <h5>${equipo1}</h5>
                    <p>vs</p>
                    <h5>${equipo2}</h5>
                </div>
                <h2>Detalles del Encuentro</h2>
                <div class="dataEncuentroContrainer">
                    <div>
                        <label for="canchaSelect"><strong>Cancha:</strong></label>
                        <select id="canchaSelect">
                        <option value="" disabled selected>Seleccionar cancha</option>
                            ${canchas.map(c => `
                                <option value="${c.id_cancha}" ${c.nombre === cancha ? 'selected' : ''}>${c.nombre}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="arbitroSelect"><strong>Árbitro:</strong></label>
                        <select id="arbitroSelect">
                            <option value="" disabled selected>Seleccionar arbitro</option>
                            ${arbitros.map(a => `
                                <option value="${a.dni_arbitro}" ${a.nombre === arbitro ? 'selected' : ''}>${a.nombre}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="diaInput"><strong>Fecha:</strong></label>
                        <input type="date" id="diaInput" value="${dia || ''}">
                    </div>
                    <div>
                        <label for="horaInput"><strong>Hora:</strong></label>
                        <input type="time" id="horaInput" value="${hora || ''}">
                    </div>
                    <button id="saveDetailsButton" disabled>Guardar Cambios</button>
                </div>
                <div class="matchDetails">
                    <div class="containerEquipo">
                        <h3>Goles</h3>
                        <div>
                            ${goles1HTML}
                        </div>
                        <div class="dividerData"></div>
                        <div>
                            ${goles2HTML}
                        </div>
                        
                    
                    </div>
                    <div class="containerEquipo">
                        <h3>Infracciones</h3>
                        <div>
                            ${infracciones1HTML}
                        </div>
                        <div class="dividerData"></div>
                        <div>
                            ${infracciones2HTML}
                        </div>
                    </div>
                </div>
            `;

            // Insertar contenido generado
            container.innerHTML = htmlContent;


            // Agregar evento para habilitar botón de guardar cambios
            const inputs = container.querySelectorAll('input, select');
            const botonGuardar = document.getElementById('saveDetailsButton');

            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    botonGuardar.disabled = false;
                });
            });

            // Evento para guardar cambios
            botonGuardar.addEventListener('click', () =>{
                saveMatchDetails(id_encuentro)
                botonGuardar.disabled = true;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Ocurrió un error al cargar los detalles del encuentro.</p>';
        });
}


function saveMatchDetails(id_encuentro) {
    const cancha = document.getElementById('canchaSelect').value;
    const arbitro = document.getElementById('arbitroSelect').value;
    const dia = document.getElementById('diaInput').value;
    const hora = document.getElementById('horaInput').value;

    const updatedData = {
        cancha,
        arbitro,
        dia,
        hora
    };

    fetch(`/encuentro/guardar/${id_encuentro}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar los cambios');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || 'Cambios guardados exitosamente');
        })
        .catch(error => {
            console.error('Error al guardar los cambios:', error);
            alert('Error al guardar los cambios');
        });
}


// #region Para agregar gol o infraccion
function showGolPopup(id_participaEncuentro) {
    fetch(`/jugadores/${id_participaEncuentro}`)
        .then(response => response.json())
        .then(jugadores => {
            const formHTML = `
                <h3 class="titlePopUp">Registrar Gol</h3>
                <form class="formPopInfraccionGoles" id="golForm">
                    <div>
                        <label for="jugador">Jugador:</label>
                        <select id="jugador" name="jugador">
                            ${jugadores.map(j => `<option value="${j.num_socio}">${j.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="minuto">Minuto:</label>
                        <input type="text" placeholder="MM:SS" id="minuto" name="minuto" required>            
                    </div>
                    <button id="saveEventButton" type="submit">Registrar</button>
                </form>
            `;

            const modal = new tingle.modal({
                onClose: () => {
                    modal.destroy(); // Elimina el popup del DOM al cerrarse
                }
            });
            modal.setContent(formHTML);
            modal.open();

            const form = document.getElementById('golForm');
            form.addEventListener('submit', event => {
                event.preventDefault();
                const data = {
                    jugador: form.jugador.value,
                    minuto: form.minuto.value,
                    id_participaEncuentro
                };
                fetch('/goles/crear_gol', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(() => {
                        modal.close();
                        const id_encuentro = document.querySelector(`#peq_${id_participaEncuentro}`).parentElement.id.split("_")[1];
                        showMatchDetails(id_encuentro);
                        showMatchs(fixtureHandled);
                    })
                    .catch(error => console.error('Error al registrar gol:', error));
            });
        });
}

function showInfraccionPopup(id_participaEncuentro) {
    fetch(`/jugadores/${id_participaEncuentro}`)
        .then(response => response.json())
        .then(jugadores => {
            const formHTML = `
                <h3 class="titlePopUp">Registrar Infracción</h3>
                <form class="formPopInfraccionGoles" id="infraccionForm">
                    <div>
                        <label for="jugador">Jugador:</label>
                        <select id="jugador" name="jugador">
                            ${jugadores.map(j => `<option value="${j.num_socio}">${j.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="minuto">Minuto:</label>
                        <input type="text" placeholder="MM:SS" id="minuto" name="minuto" required>
                    </div>

                    <div>
                        <label for="tipo">Tipo:</label>
                        <select id="tipo" name="tipo" required>
                            <option value="" disabled selected>Seleccionar</option>
                            <option value="Mala conducta">Mala conducta</option>
                            <option value="Falta">Falta</option>
                            <option value="Fuera de juego">Fuera de juego</option>

                        </select>
                    </div>

                    <div>
                        <label for="tarjeta">Tarjeta:</label>
                        <select id="tarjeta" name="tarjeta">
                            <option value="" disabled selected>Ninguna</option>
                            <option value="A">Amarilla</option>
                            <option value="R">Roja</option>
                        </select>
                    </div>
                    
                    
                    
                    <button id="saveEventButton" type="submit">Registrar</button>
                </form>
            `;

            const modal = new tingle.modal({
                onClose: () => {
                    modal.destroy(); // Elimina el popup del DOM al cerrarse
                }
            });
            modal.setContent(formHTML);
            modal.open();

            const form = document.getElementById('infraccionForm');
            form.addEventListener('submit', event => {
                event.preventDefault();
                const data = {
                    jugador: form.jugador.value,
                    minuto: form.minuto.value,
                    tipo: form.tipo.value,
                    tarjeta: form.tarjeta.value,
                    id_participaEncuentro
                };
                fetch('/infracciones/crear_infraccion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(() => {
                        modal.close();
                        const id_encuentro = document.querySelector(`#peq_${id_participaEncuentro}`).parentElement.id.split("_")[1];
                        showMatchDetails(id_encuentro);
                    })
                    .catch(error => console.error('Error al registrar infracción:', error));
            });
        });
}

// #endregion


// Función para renderizar la tabla con los datos recibidos
function renderizarTabla(listaEquipos) {
    let tablaHTML = `
        <div class="containerTablaPosiciones">
        <h2>Tabla de posiciones</h2>
        <table class="tablaPosiciones">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Equipo</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DIF</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaEquipos.forEach((equipo, index) => {
        tablaHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${equipo.equipo}</td>
                <td>${equipo.goles_a_favor}</td>
                <td>${equipo.goles_en_contra}</td>
                <td>${equipo.diferencia_goles}</td>
            </tr>
        `;
    });

    tablaHTML += `
            </tbody>
        </table>
        </div>
    `;

    return tablaHTML;
}

// Función principal para obtener la tabla de puntos y mostrarla en el popup
async function obtenerTablaPuntos(fixtureId) {
    try {
        // Llamada al endpoint para obtener los datos
        const response = await fetch(`/tabla-puntos/${fixtureId}`);
        if (!response.ok) {
            throw new Error("Error al obtener los datos de la tabla");
        }
        const tablaPuntos = await response.json();

        // Generar el HTML de la tabla usando la función renderizarTabla
        const tablaHTML = renderizarTabla(tablaPuntos);

        // Crear el popup con Tingle.js
        const modal = new tingle.modal({
            footer: true,
            stickyFooter: false,
            closeLabel: "Cerrar",
            cssClass: ["custom-class-1", "custom-class-2"],
        });

        modal.setContent(tablaHTML);

        // Añadir un botón para cerrar el popup
        modal.addFooterBtn("Cerrar", "tingle-btn tingle-btn--primary buttonCloseTablaPosiciones", function () {
            modal.close();
        });

        // Abrir el popup
        modal.open();
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al obtener la tabla de puntos. Intenta nuevamente.");
    }
}
