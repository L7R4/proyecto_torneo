document.getElementById('jugador-foto').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'Ningún archivo seleccionado';
    document.getElementById('file-name').textContent = fileName;
});

document.getElementById('jugador-fec_nac').addEventListener('input', function() {
    const fechaNacimiento = this.value;
    const fecha = fechaNacimiento.split('/');

    if (fecha.length === 3) {
        const dia = parseInt(fecha[0], 10);
        const mes = parseInt(fecha[1], 10) - 1;
        const anio = parseInt(fecha[2], 10);

        const fechaNacimientoObj = new Date(anio, mes, dia);
        const edad = calcularEdad(fechaNacimientoObj);

        let categoria = '';
        if (edad >= 41 && edad <= 45) {
            categoria = 'Maxi';
        } else if (edad >= 46 && edad <= 50) {
            categoria = 'Super';
        } else if (edad >= 51 && edad <= 55) {
            categoria = 'Master';
        }

        if (categoria) {
            document.getElementById('jugador-categoria').value = categoria;
            document.getElementById('submit-btn').disabled = false;
        } else {
            document.getElementById('jugador-categoria').value = '';
            document.getElementById('submit-btn').disabled = true;
        }
    }
});

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth();
    if (mes < fechaNacimiento.getMonth() || (mes === fechaNacimiento.getMonth() && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}

document.getElementById('registroJugadorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Formulario enviado');
});