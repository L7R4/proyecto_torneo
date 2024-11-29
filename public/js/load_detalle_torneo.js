
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
      document.getElementById("encargadoName").innerText = tournament.nombreEncargado;
      
      // Ahora puedes cargar las fixtures
      await loadFixtures(tournament.id_torneo);
  } else {
      console.error('No se pudo obtener el torneo');
  }
}

// Llamar a la función para mostrar los detalles cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
  // Aquí va tu código de inicialización
  window.onload = showTournamentDetails;
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
        createItemFixtures_HTML(fixture.id_fixture, fixture.cantidad_ruedas, fixture.cantidad_fechas, fixture.categoria, fixture.division);
      });

      let fixturesHTML = document.querySelectorAll('#listFixtures > li.i_fix');
      console.log(fixturesHTML)
      fixturesHTML.forEach(element => {
        const id_fixture = element.querySelector(".fixtureItemWrapper").id.split("_")[1];
        element.addEventListener("click", () => showTeams(id_fixture));
    });
  } else {
      console.error('No se pudieron obtener las fixtures:', response.statusText);
  }
}





function createItemFixtures_HTML(id_fixture,ruedas,fechas,categoria,division) {
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
      </li>
  `
  buttonNewFixture.parentElement.insertAdjacentHTML('beforebegin', stringForHTML);

}


function createFormNewFixture() {
  const listFixtures = document.getElementById('listFixtures');
   
    let stringForHTML =
      `
      <form method="POST" id="formNewFixture">
        <div class="fixtureItemWrapper">
              <div class="itemInfo">
                    <label for="division">División</label>
                    <select id="division" name="division" required>
                        <option value="" disabled selected>---</option>
                        <option value=1>A</option>
                        <option value=2>B</option>
                        <option value=3>C</option>
                    </select>
                </div>
    
                <div class="itemInfo">
                    <label for="category">Categoría</label>
                    <select id="category" name="category" required>
                        <option value="" disabled selected>---</option>
                        <option value=1>Maxi</option>
                        <option value=2>Super</option>
                        <option value=3>Master<option>
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

  buttonNewFixture.style.display="none"
  buttonNewFixture.parentElement.insertAdjacentHTML('beforebegin', stringForHTML);

  // console.log(listFixtures.lastChild)
}

function cancelarFormFixture() {
  formNewFixture.remove()
  buttonNewFixture.style.display="unset"
}

async function showTeams(id_fixture) {
  console.log("ID del fixture:", id_fixture);

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
              htmlContent += `<li>
                <p>${team.nombre}</p>
              </li>`;
          });
          htmlContent += `</ul>`;
      }

      teamsContainer.innerHTML = htmlContent;
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



// async function openInscribirPopup(id_fixture) {
//   const response = await fetch(`/equipos-disponibles-fixture/${id_fixture}`);
//   if (response.ok) {
//       const data = await response.json();

//       let content = `<h2>Equipos disponibles</h2>`;
//       if (data.equipos.length === 0) {
//           content += `<p>No hay equipos disponibles para inscribir en este fixture.</p>`;
//       } else {
//           content += `<ul>`;
//           data.equipos.forEach(team => {
//               content += `
//                   <li>
//                       ${team.nombre} 
//                       <button onclick="inscribirEquipo(${id_fixture}, ${team.num_equipo})">Inscribir</button>
//                   </li>`;
//           });
//           content += `</ul>`;
//       }

//       // Usar Tingle.js para mostrar el popup
//       const modal = new tingle.modal({
//           footer: true,
//           stickyFooter: false,
//           closeMethods: ['overlay', 'button', 'escape'],
//           closeLabel: "Cerrar",
//       });

//       modal.setContent(content);
//       modal.open();
//   } else {
//       console.error('Error al cargar equipos disponibles:', response.statusText);
//   }
// }

// async function inscribirEquipo(id_fixture, id_equipo) {
//   const urlParams = new URLSearchParams(window.location.search);
//   const tournamentId = urlParams.get('id'); // Obtiene el ID del torneo de los parámetros de la URL

//   if (!tournamentId || !id_equipo) {
//       alert('Datos insuficientes para inscribir el equipo.');
//       return;
//   }

//   const body = {
//       num_equipoPKFK: id_equipo,
//       id_torneoPKFK: tournamentId
//   };

//   try {
//       const response = await fetch(`/inscribir-equipo`, {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (response.ok) {
//           alert(data.message);
//           // Actualizar la lista de equipos inscritos
//           showTeams(id_fixture);
//       } else {
//           alert(`Error: ${data.error}`);
//       }
//   } catch (error) {
//       console.error('Error al inscribir equipo:', error);
//       alert('Error al intentar inscribir el equipo. Por favor, inténtalo nuevamente.');
//   }
// }





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
    id_torneoFK : tournament.id_torneo
  };

  try {
    // Enviar los datos al backend
    const response = await fetch('/fixture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtureData)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Fixture creado exitosamente");
      createItemFixtures_HTML(data.id, ruedasInput, "-", data.categoria, data.division);
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