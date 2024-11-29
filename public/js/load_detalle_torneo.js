function createItemFixtures_HTML(id_fixture,ruedas,fechas,categoria,division) {
    const listFixtures = document.getElementById('listFixtures');
   
    let stringForHTML =
      `
      <div id="fixture_${id_fixture}" class="fixtureItemWrapper">
            <h2>Fixture ${categoria} ${division}</h2>
            <div class="itemInfo"> 
                <h5>Periodo de torneo</h5>
                <div>
                  <p>${ruedas}</p>
                </div>
            </div>
            <div class="itemInfo"> 
                <h5>Encargado</h5>
                <div>
                    <p>${fechas}</p>
                </div>
            </div>
      </div>
  `
  listFixtures.insertAdjacentHTML('beforeend', stringForHTML);

}


// async function getTorneoDetail(){
//     const urlParams = new URLSearchParams(window.location.search);
//     const tournamentId = urlParams.get('id');

//     const response = await fetch('/generated_data.json')
//     const data = await response.json();

//     // Buscar el torneo correspondiente
//     const tournament = data["torneo"].find(t => t.id === parseInt(tournamentId));

//     return tournament
// } 


// document.addEventListener('DOMContentLoaded', async () => {
// console.log(await getTorneoDetail())
//     // const response = await fetch('/usuarios');
//     const response = await fetch('/generated_data.json')
//     const data = await response.json();

//     const torneosList = document.getElementById('listaTorneosActivos');
//     torneosList.innerHTML = ''; // Limpiar lista existente

//     const torneoActual = await getTorneoDetail()
//     data["torneo"].forEach(torneo => {
//     createItemTorneo_HTML(torneo["id"],torneo["nombre"],torneo["fecha_inicio_insc"],torneo["fecha_final_insc"],torneo["fecha_inicio_torneo"],torneo["fecha_final_torneo"],torneo["nombreEncargado"])
// });
// });

