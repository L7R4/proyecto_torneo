var torneosLoaded;
document.addEventListener('DOMContentLoaded', async () => {
    // const response = await fetch('/usuarios');
    const response = await fetch('/torneos')
    const data = await response.json();
    
    const torneosList = document.getElementById('listaTorneosActivos');
    torneosList.innerHTML = ''; // Limpiar lista existente

    // Mostrar los usuarios en el navegador
    data.forEach(torneo => {
        createItemTorneo_HTML(torneo["id_torneo"],torneo["nombre"],torneo["fecha_inicio_insc"],torneo["fecha_final_insc"],torneo["fecha_inicio_torneo"],torneo["fecha_final_torneo"],torneo["nombreEncargado"])
    });

    torneosLoaded = data
    
});

function createItemTorneo_HTML(id,name,f_inicio_insc,f_final_insc,f_inicio_torneo,f_final_torneo,encargado) {
    const torneosList = document.getElementById('listaTorneosActivos');
    console.log(id)
    let stringForHTML =
      `
      <a href="detalle_torneo.html?id=${id}" class="torneoItemWrapper">
            <h2>${name}</h2>
            <div class="containerInfo">
                <div class="itemInfo"> 
                  <h5>Periodo de inscripcion</h5>
                  <div>
                  <p>${f_inicio_insc} - ${f_final_insc}</p>
                  </div>
                </div>
                <div class="itemInfo"> 
                  <h5>Periodo de torneo</h5>
                  <div>
                  <p>${f_inicio_torneo} - ${f_final_torneo}</p>
                  </div>
                </div>
                <div class="itemInfo"> 
                  <h5>Encargado</h5>
                  <div>
                      <p>${encargado}</p>
                  </div>
                </div>

                </div>
      </a>
  `
  torneosList.insertAdjacentHTML('beforeend', stringForHTML);

}