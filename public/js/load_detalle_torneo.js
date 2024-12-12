
const buttonNewFixture = document.querySelector("#buttonNewFixture")

async function getTorneoDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get('id');

  const response = await fetch(`/torneo/${tournamentId}`);
  const data = await response.json();

  return data; // Esto debería devolver el torneo con todos los detalles
}

async function showTournamentDetails() {
  const tournament = await getTorneoDetail();

  if (tournament) {
    // Completar los campos del torneo en el HTML
    document.getElementById("nameTorneo").innerText = tournament.nombre;
    document.getElementById("periodoInscripcion").innerText = `${tournament.fecha_inicio_insc} - ${tournament.fecha_final_insc}`;
    document.getElementById("periodoTorneo").innerText = `${tournament.fecha_inicio_torneo} - ${tournament.fecha_final_torneo}`;

    // Ahora puedes cargar las fixtures
    await loadFixtures(tournament.id_torneo);
  } else {
    console.error('No se pudo obtener el torneo');
  }
}

// Llamar a la función para mostrar los detalles cuando la página cargue
document.addEventListener('DOMContentLoaded', async () => {
  await showTournamentDetails()

  // #region Para rellenar los inputs de categorias y divisiones
  // Obtener las categorias disponibles
  const responseCategorias = await fetch('/categorias')
  const dataCategorias = await responseCategorias.json();


  // Obtener las divisiones disponibles
  const responseDivisiones = await fetch('/divisiones')
  const dataDivisiones = await responseDivisiones.json();

  // #endregion

  buttonNewFixture.addEventListener("click", () => {
    createFormNewFixture(dataCategorias, dataDivisiones)
  })
});


async function loadFixtures(tournamentId) {
  const response = await fetch(`/torneo/${tournamentId}/fixtures`);

  if (response.ok) {
    const data = await response.json();
    const fixtures = data.fixtures;

    const listFixtures = document.getElementById("listFixtures");
    // listFixtures.innerHTML = ''; // Limpiar la lista antes de llenarla

    fixtures.forEach(fixture => {
      // Ahora se pasan los valores de categoria y divisionfixtureItemWrapper
      createItemFixtures_HTML(fixture.id_fixture, fixture.cantidadRuedas, fixture.cantidad_fechas, fixture.categoria, fixture.division);
    });

    let fixturesHTML = document.querySelectorAll('#listFixtures > li.i_fix');
    fixturesHTML.forEach(element => {
      const id_fixture = element.querySelector(".fixtureItemWrapper").id.split("_")[1];
      element.addEventListener("click", () => showTeams(id_fixture));
    });
  } else {
    console.error('No se pudieron obtener las fixtures:', response.statusText);
  }
}


function createItemFixtures_HTML(id_fixture, ruedas, fechas, categoria, division) {
  let stringForHTML =
    `
      <li class="i_fix">
        <div id="fixture_${id_fixture}" class="fixtureItemWrapper">
              <h2>Fixture ${categoria} ${division}</h2>
              <div class="itemInfo"> 
                  <h5>Ruedas</h5>
                  <div>
                    <p>${ruedas}</p>
                  </div>
              </div>
              <div class="itemInfo"> 
                  <h5>Fechas</h5>
                  <div>
                      <p>${fechas}</p>
                  </div>
              </div>
        </div>
        <button class="buttonDeleteFixture" type="button" id="deleteFixture_${id_fixture}">X</button>
      </li>
  `
  buttonNewFixture.parentElement.insertAdjacentHTML('beforebegin', stringForHTML);
  listenerDeleteFixture()
}


function createFormNewFixture(categorias, divisiones) {

  let stringForHTML =
    `
      <form method="POST" id="formNewFixture">
        <div class="fixtureItemWrapper">
              <div class="itemInfo">
                    <label for="division">División</label>
                    <select id="division" name="division" required>
                        <option value="" disabled selected>---</option>
                        ${divisiones.map(division => `<option value="${division.id_division}">${division.nombre}</option>`).join('')}
                    </select>
                </div>
    
                <div class="itemInfo">
                    <label for="category">Categoría</label>
                    <select id="category" name="category" required>
                        <option value="" disabled selected>---</option>
                        ${categorias.map(categoria => `<option value="${categoria.id_categoria}">${categoria.nombre}</option>`).join('')}

                    </select>
                </div>
              <div class="itemInfo"> 
                  <label for="ruedas">Ruedas</label>
                    <input type="number" id="ruedas" name="ruedas"required>
              </div>
        </div>
        <button type="button" onclick="guardarFixture()" id="buttonGuardarFormFixture">✓</button>
        <button type="button" onclick="cancelarFormFixture()" id="buttonCancelarFormFixture">X</button>
    </form>

  `

  buttonNewFixture.style.display = "none"
  buttonNewFixture.parentElement.insertAdjacentHTML('beforebegin', stringForHTML);

}


function cancelarFormFixture() {
  formNewFixture.remove()
  buttonNewFixture.style.display = "unset"
}


async function showTeams(id_fixture) {
  try {
    const response = await fetch(`/equipos-inscritos-fixture/${id_fixture}`);

    if (!response.ok) {
      throw new Error(`Error al cargar equipos: ${response.statusText}`);
    }

    const data = await response.json();
    const teamsContainer = document.getElementById('teamsContainer');

    let htmlContent = `<div><button id="btnInscribirEquipo" onclick="openInscribirPopup(${id_fixture})">Inscribir equipo</button><h2>Equipos inscritos</h2></div>`;
    if (!data.equipos || data.equipos.length === 0) {
      htmlContent += `<p>No hay equipos inscritos en este fixture.</p>`;
    } else {
      htmlContent += `<ul>`;
      data.equipos.forEach(team => {
        htmlContent += `<li class="team_inscripto" id="team_${team.num_equipo}">
                <p>${team.nombre}</p>
              </li>`;
      });
      htmlContent += `</ul>`;
    }

    teamsContainer.innerHTML = htmlContent;
    listenerObtenerJugadoresPorEquipo() // Cargar los listener cada vez que se muestran los equipos para que puedar ver los jugadores
  } catch (error) {
    console.error('Error:', error.message);
  }

}


async function openInscribirPopup(id_fixture) {
  const response = await fetch(`/equipos-disponibles-fixture/${id_fixture}`);
  if (response.ok) {
    const data = await response.json();

    let content = `<h2 class="tittleDisponibleTeams">Equipos disponibles</h2>`;
    if (data.equipos.length === 0) {
      content += `<p>No hay equipos disponibles para inscribir en este fixture.</p>`;
    } else {
      content += `<ul class="listDisponibleTeams">`;
      data.equipos.forEach(team => {
        content += `
                  <li>
                      ${team.nombre} 
                      <button onclick="openInscribirForm(${id_fixture}, ${team.num_equipo})">Inscribir</button>
                  </li>`;
      });
      content += `</ul>`;
    }

    const modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Cerrar",
    });

    modal.setContent(content);
    modal.open();

    // Guardar la instancia del modal en una variable global
    window.currentModal = modal;
  } else {
    console.error('Error al cargar equipos disponibles:', response.statusText);
  }
}


async function openInscribirForm(id_fixture, id_equipo) {
  // Crear formulario para capturar representante y DT
  const content = `
      <h2 class="tittleDisponibleTeams">Inscribir equipo</h2>
      <form id="formInscribirEquipo">
          <div>
            <label for="representante">Representante:</label>
          <input type="text" id="representante" name="representante" required>
          </div>
          <div>
          <label for="dt">DT:</label>
          <input type="text" id="dt" name="dt" required>
          
          </div>
          
          <button type="button" id="" onclick="submitInscripcion(${id_fixture}, ${id_equipo})">Confirmar inscripción</button>
      </form>
  `;

  const modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Cerrar",
  });

  modal.setContent(content);
  modal.open();
}


async function submitInscripcion(id_fixture, id_equipo) {
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get('id');

  const representante = document.getElementById('representante').value.trim();
  const dt = document.getElementById('dt').value.trim();

  if (!tournamentId || !id_equipo || !representante || !dt) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  const body = {
    num_equipoPKFK: id_equipo,
    id_torneoPKFK: tournamentId,
    representante: representante,
    dt: dt
  };

  try {
    const response = await fetch(`/inscribir-equipo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      showTeams(id_fixture); // Actualizar la lista de equipos inscritos

      // Cerrar el modal de Tingle.js
      if (window.currentModal) {
        window.currentModal.close(); // Cierra el modal
        window.currentModal.destroy(); // Limpia la instancia
        window.currentModal = null; // Asegura que no se guarde referencia a un modal eliminado
      }

    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error al inscribir equipo:', error);
    alert('Error al intentar inscribir el equipo. Por favor, inténtalo nuevamente.');
  }
}


async function guardarFixture() {
  // Capturar los datos del formulario
  const ruedasInput = document.getElementById("ruedas").value;
  const categoriaInput = document.getElementById("category").value;
  const divisionInput = document.getElementById("division").value;

  // Validar si los campos están completos
  if (!ruedasInput || !categoriaInput || !divisionInput) {
    alert("Por favor complete todos los campos.");
    return;
  }

  const tournament = await getTorneoDetail();
  // Crear el objeto de datos que se enviará al backend
  const fixtureData = {
    cantidad_ruedas: ruedasInput,
    id_categoriaFK: categoriaInput, // Se debe enviar el nombre o el ID de la categoría, dependiendo de tu backend
    id_divisionFK: divisionInput, // Lo mismo con la división
    id_torneoFK: tournament.id_torneo
  };

  try {
    // Enviar los datos al backend
    const response = await fetch('/fixtures/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtureData)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Fixture creado exitosamente");
      createItemFixtures_HTML(data.id, ruedasInput, "0", data.categoria, data.division);
      cancelarFormFixture(); // Eliminar el formulario
      let fixtures = document.querySelectorAll('#listFixtures > li.i_fix');
      fixtures[fixtures.length - 1].addEventListener("click", () => {
        const id_fixture = fixtures[fixtures.length - 1].querySelector(".fixtureItemWrapper").id.split("_")[1]; // Extraer el id_fixture
        showTeams(id_fixture); // Llamar a la función con el id_fixture
      });

    } else {
      alert("Error al crear el fixture: " + data.error);
    }
  } catch (error) {
    console.error("Error de red:", error);
    alert("Ocurrió un error al guardar el fixture.");
  }
}


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


// #region Region para eliminar fixtures  
function listenerDeleteFixture() {
  // Seleccionar todos los botones de eliminar
  const deleteButtons = document.querySelectorAll(".buttonDeleteFixture");

  deleteButtons.forEach(button => {
    const id_fixture = button.id.split("_")[1];

    button.removeEventListener("click", handleDeleteFixture); // Eliminar el listener antiguo

    button.addEventListener("click", () => {
      handleDeleteFixture(id_fixture)// Agregar el listener nuevo
    });

  });
}

// Definir el listener nombrado para reutilización
async function handleDeleteFixture(id_fixture) {
  // Crear el modal de confirmación
  const modal = new tingle.modal({
    footer: true,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Cerrar",
  });

  modal.setContent(`<h3>¿Estás seguro de eliminar este fixture?</h3>`);

  modal.addFooterBtn("Cancelar", "tingle-btn tingle-btn--secondary", () => {
    modal.close();
  });

  modal.addFooterBtn("Eliminar", "tingle-btn tingle-btn--danger", async () => {
    try {
      const response = await fetch(`/fixtures/delete_fixture`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_fixture }),
      });

      const data = await response.json();
      if (response.ok) {
        // Eliminar el elemento del DOM
        document.getElementById(`fixture_${id_fixture}`).parentElement.remove();
        alert(data.message || "Fixture eliminado exitosamente.");
      } else {
        alert(data.error || "No se pudo eliminar el fixture.");
      }
    } catch (error) {
      console.error("Error al eliminar el fixture:", error);
      alert("Hubo un problema al intentar eliminar el fixture.");
    }
    modal.close();
  });

  modal.open();
}

// #endregion


// #region Region para el manejo de jugadores en torneo

function listenerObtenerJugadoresPorEquipo() {
  const equiposInscriptos = document.querySelectorAll(".team_inscripto");

  equiposInscriptos.forEach(team => {
    const id_equipo = team.id.split("_")[1];

    team.removeEventListener("click", handleGetPlayers); // Eliminar el listener antiguo

    team.addEventListener("click", () => {
      handleGetPlayers(id_equipo)// Agregar el listener nuevo
    });
  });
}


async function handleGetPlayers(id_equipo) {

  try {
    // Hacer una petición para obtener los jugadores del equipo seleccionado
    const response = await fetch('/jugadores/por_equipo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_equipo: id_equipo })
    });

    if (!response.ok) {
      throw new Error('Error al obtener jugadores.');
    }

    const jugadores = await response.json();
    console.log("WEps")
    mostrarJugadores(jugadores); // Mostrar jugadores
  } catch (error) {
    console.error('Error:', error.message);
    alert('Hubo un problema al obtener los jugadores.');
  }

}


// Mostrar los jugadores en un UL
function mostrarJugadores(jugadores) {
  const jugadoresContainer = document.querySelector("#jugadoresContainer > ul");
  jugadoresContainer.innerHTML = ''; // Limpiar lista anterior

  if (jugadores.length === 0) {
    jugadoresContainer.innerHTML = `<li>No hay jugadores asociados a este equipo.</li>`;
    return;
  }

  let liJugadores = ""
  jugadores.forEach(jugador => {
    liJugadores += `
    <li class="jugadorContainer" id="player_${jugador.num_socio}">
        <input type="checkbox" class="inscripcionCheckbox" value="${jugador.num_socio}"
        <label> ${jugador.num_socio} ${jugador.nombre} ${jugador.apellido}</label>
    </li>`;
  });

  jugadoresContainer.innerHTML = liJugadores;

  // Configurar los listeners para los checkboxes
  setupCheckboxListeners();
}


// Configurar listeners para los checkboxes de inscripción
function setupCheckboxListeners() {
  const listaJugadores = document.querySelectorAll(".jugadorContainer");

  listaJugadores.forEach(jugador => {
    jugador.addEventListener("click", async (event) => {
      console.log("aaaaaaaa")
      const id_jugador = jugador.id.split("_")[1];
      const checkbox = jugador.querySelector("input")

      // Evitar que el evento haga doble clic en el checkbox
      if (event.target.tagName === "INPUT") return;

      // Alternar el estado del checkbox
      checkbox.checked = !checkbox.checked;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get('id');

        const response = await fetch('/torneos/inscripcion_jugador', {
          method: checkbox.checked ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ num_socio: id_jugador, id_torneo: tournamentId })
        });

        if (!response.ok) {
          throw new Error('Error al inscribir/desinscribir jugador.');
        }
        console.log("assssssssss")

        const result = await response.json();
        console.log(result.message); // Mensaje de éxito o error
      } catch (error) {
        console.error('Error:', error.message);
        alert('Hubo un problema al inscribir/desinscribir al jugador.');
        checkbox.checked = !checkbox.checked; // Restaurar estado del checkbox en caso de error
      }
    });
  });
}

// #endregion




async function comenzarTorneo() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('id');

    // Hacer una petición para obtener los jugadores del equipo seleccionado
    const response = await fetch('/comenzar-torneo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_torneo: tournamentId })
    });

    if (!response.ok) {
      throw new Error('Error.');
    }

    const torneo = await response.json();
    console.log("WEps")
    console.log(torneo)
  } catch (error) {
    console.error('Error:', error.message);
    alert("Error al generar torneo")
  }
}


// function generarEncuentros(equipos) {
//   const totalFechas = equipos.length - 1; // Cantidad de fechas
//   const totalEquipos = equipos.length;

//   if (totalEquipos % 2 !== 0) {
//     // Añadir un equipo ficticio si el número de equipos es impar
//     equipos.push("Descansa");
//   }

//   const fechas = [];

//   for (let i = 0; i < totalFechas; i++) {
//     const fecha = [];

//     for (let j = 0; j < totalEquipos / 2; j++) {
//       // Emparejar el primer equipo con el último, segundo con penúltimo, etc.
//       const equipo1 = equipos[j];
//       const equipo2 = equipos[totalEquipos - 1 - j];

//       if (equipo1 !== "Descansa" && equipo2 !== "Descansa") {
//         fecha.push([equipo1, equipo2]);
//       }
//     }

//     fechas.push(fecha);

//     // Rotar equipos para la siguiente fecha
//     const rotar = equipos.splice(1, 1); // Extrae el segundo equipo
//     equipos.push(...rotar); // Añádelo al final
//   }

//   return fechas;
// }

// // Ejemplo de uso
// const equipos = ["Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4"];
// const fechas = generarEncuentros(equipos);
// console.log(fechas)

// for (let r = 1; r <= 2; r++) {
//   console.log(`Rueda ${r}`)
//   fechas.forEach((fecha, index) => {
//     console.log(`   Fecha ${index + 1}:`);
//     fecha.forEach(encuentro => console.log(`    ${encuentro[0]} vs ${encuentro[1]}`));
//   });
// }
