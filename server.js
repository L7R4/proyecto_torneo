const path = require('path');

const express = require('express');
const Database = require('better-sqlite3');

// Crear la base de datos
const db = new Database('db');


// Inicializar la app de Express
const app = express();


app.use(express.static('public'));

// db.run("PRAGMA journal_mode=WAL;");


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para datos de formularios


// Endpoint para registrar jugador
app.post('/create_jugador', (req, res) => {
    const { dni, nombre, apellido, fecha_nac, direcc, foto,  id_categoriaFK, num_equipoFK } = req.body;

    if (!dni || !nombre || !apellido || !fecha_nac || !direcc || !foto || !id_categoriaFK || !num_equipoFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        
        const insertarJugador = db.prepare(`
            INSERT INTO jugador (dni, nombre, apellido, fecha_nac, direcc, foto, id_categoriaFK, num_equipoFK)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const resultado = insertarJugador.run(dni, nombre, apellido, fecha_nac, direcc, foto, id_categoriaFK, num_equipoFK);

        res.json({ message: 'Usuario registrado exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Ocurrió un error al registrar el usuario' });
    }
});

// Endpoint para registrar equipo
app.post('/equipo', (req, res) => {
    const { nombre, id_categoriaFK, id_divisionFK } = req.body;

    // Validar que los datos requeridos estén presentes
    if (!nombre || !id_categoriaFK || !id_divisionFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Preparar y ejecutar la consulta para insertar un nuevo equipo
        const insertarEquipo = db.prepare(`
            INSERT INTO equipo (nombre, id_categoriaFK, id_divisionFK)
            VALUES (?, ?, ?)
        `);

        const resultado = insertarEquipo.run(nombre, id_categoriaFK, id_divisionFK);

        // Enviar respuesta con el ID del equipo insertado
        res.json({ message: 'Equipo registrado exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar equipo:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al registrar el equipo' });
    }
});

// Endpoint para traer jugadores por categoria
app.get('/jugadores/categoria/:id_categoriaFK', (req, res) => {
    const { id_categoriaFK } = req.params;

    try {
        // Consulta para obtener jugadores por categoría
        const consultaJugadores = db.prepare(`
            SELECT * FROM jugador WHERE id_categoriaFK = ?
        `);
        const jugadores = consultaJugadores.all(id_categoriaFK);

        // Si no se encuentran jugadores
        if (jugadores.length === 0) {
            return res.status(404).json({ message: 'No se encontraron jugadores para esta categoría' });
        }

        // Devolver los jugadores encontrados
        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los jugadores' });
    }
});

app.get('/encargados', (req, res) => {
    try {
        // Consulta para obtener los equipos por categoría y división
        const consultaEncargados = db.prepare(`
            SELECT * FROM encargado
        `);
        const encargados = consultaEncargados.all();
        // Si no se encuentran equipos
        if (encargados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron encargados' });
        }

        // Devolver los equipos encontrados
        res.json(encargados);
    } catch (error) {
        console.error('Error al obtener encargados:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los encargados' });
    }
});

// Endpoint para traer los equipos
app.get('/equipos', (req, res) => {
    try {
        // Consulta para obtener los equipos por categoría y división
        const consultaEquipos = db.prepare(`
            SELECT * FROM equipo
        `);
        const equipos = consultaEquipos.all();
        // Si no se encuentran equipos
        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos para esta categoría y división' });
        }

        // Devolver los equipos encontrados
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener equipos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los equipos' });
    }
});


app.get('/torneos', (req, res) => {
    try {
        // Consulta para obtener los torneos con el nombre del encargado
        const torneosConsultas = db.prepare(`
            SELECT 
                torneo.id_torneo, 
                torneo.nombre, 
                torneo.fecha_inicio_insc, 
                torneo.fecha_final_insc, 
                torneo.fecha_inicio_torneo, 
                torneo.fecha_final_torneo, 
                encargado.nombre AS nombreEncargado
            FROM torneo
            JOIN encargado ON torneo.dni_encargadoFK = encargado.dni
        `);
        const torneos = torneosConsultas.all();
        console.log(torneos)
        // Si no se encuentran torneos
        if (torneos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron torneos' });
        }

        // Devolver los torneos personalizados
        res.json(torneos);
    } catch (error) {
        console.error('Error al obtener torneos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los torneos' });
    }
});


app.post('/create_torneos', (req, res) => {
    try {
        // Obtener los datos del torneo desde el cuerpo de la solicitud
        const { nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo, dni_encargadoFK} = req.body;
        console.log('Datos recibidos:', req.body);
        // Insertar el nuevo torneo en la base de datos
        const insertTorneo = db.prepare(`
            INSERT INTO torneo (nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo, dni_encargadoFK)
            VALUES (?, ?, ?, ?, ?,?)
        `);
        const result = insertTorneo.run(nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo,dni_encargadoFK);

        // Obtener el ID del torneo recién creado
        const newTorneoId = result.lastInsertRowid;

        // Responder con el ID del nuevo torneo
        res.json({ id: newTorneoId });
    } catch (error) {
        console.error('Error al crear el torneo:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al crear el torneo' });
    }
});

app.get('/torneo/:id', (req, res) => {
    const torneoId = req.params.id;

    // Buscar el torneo en la base de datos usando el ID
    const torneo = db.prepare(`
        SELECT 
                torneo.id_torneo, 
                torneo.nombre, 
                torneo.fecha_inicio_insc, 
                torneo.fecha_final_insc, 
                torneo.fecha_inicio_torneo, 
                torneo.fecha_final_torneo, 
                encargado.nombre AS nombreEncargado
            FROM torneo
            JOIN encargado ON torneo.dni_encargadoFK = encargado.dni
            WHERE torneo.id_torneo = ?
    `).get(torneoId);

    if (torneo) {
        res.json(torneo);
    } else {
        res.status(404).json({ error: "Torneo no encontrado" });
    }
});

app.get('/torneo/:id/fixtures', (req, res) => {
    const torneoId = req.params.id;

    // Buscar las fixtures para el torneo en la base de datos
    const fixtures = db.prepare(`
        SELECT 
            f.*, 
            c.nombre AS categoria, 
            d.nombre AS division
        FROM fixture f
        JOIN categoria c ON f.id_categoriaFK = c.id_categoria
        JOIN division d ON f.id_divisionFK = d.id_division
        WHERE f.id_torneoFK = ?
    `).all(torneoId);

    if (fixtures.length > 0) {
        res.json({ fixtures });
    } else {
        res.status(404).json({ error: "No se encontraron fixtures para este torneo" });
    }
});

// Endpoint para traer jugadores por categoria y division
app.get('/equipos/categoria/:id_categoriaFK/:id_divisionFK', (req, res) => {
    const { id_categoriaFK, id_divisionFK } = req.params;

    try {
        // Consulta para obtener los equipos por categoría y división
        const consultaEquipos = db.prepare(`
            SELECT * FROM equipo WHERE id_categoriaFK = ? AND id_divisionFK = ?
        `);
        const equipos = consultaEquipos.all(id_categoriaFK, id_divisionFK);

        // Si no se encuentran equipos
        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos para esta categoría y división' });
        }

        // Devolver los equipos encontrados
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener equipos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los equipos' });
    }
});

app.post('/fixture', (req, res) => {
    const { cantidad_ruedas, id_categoriaFK, id_divisionFK,id_torneoFK } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!cantidad_ruedas || !id_categoriaFK || !id_divisionFK || !id_torneoFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Insertar el nuevo fixture en la base de datos
        const insertarFixture = db.prepare(`
            INSERT INTO fixture (cantidad_ruedas, id_categoriaFK, id_divisionFK,id_torneoFK)
            VALUES (?, ?, ?, ?)
        `);
        const resultadoFixture = insertarFixture.run(cantidad_ruedas, id_categoriaFK, id_divisionFK, id_torneoFK);

        const obtenerDatos = db.prepare(
            `
            SELECT c.nombre AS categoria, d.nombre AS division
            FROM fixture f
            JOIN categoria c ON f.id_categoriaFK = c.id_categoria
            JOIN division d ON f.id_divisionFK = d.id_division
            WHERE f.id_fixture = ?
        `
        );
        const datosFixture = obtenerDatos.get(resultadoFixture.lastInsertRowid);
        console.log(datosFixture)
        // Devolver una respuesta con el ID del fixture insertado, junto con el nombre de la categoría y la división
        res.json({
            message: 'Fixture creado exitosamente',
            id: resultadoFixture.lastInsertRowid,
            categoria: datosFixture.categoria,
            division: datosFixture.division
        });
    } catch (error) {
        console.error('Error al crear fixture:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al crear el fixture' });
    }
});



// Endpoint para actualizar el fixture y calcular la fecha
app.put('/fixture/:id', (req, res) => {
    const { id } = req.params; // ID del fixture que se va a actualizar
    const { rueda, id_categoriaFK, id_divisionFK } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!rueda || !id_categoriaFK || !id_divisionFK) {
        return res.status(400).json({ error: 'rueda, id_categoriaFK y id_divisionFK son obligatorios' });
    }

    try {
        // Paso 1: Calcular la cantidad de equipos inscriptos en los torneos de la misma categoría y división
        const consultaEquiposInscriptos = db.prepare(`
            SELECT COUNT(*) AS cantidad_equipos
            FROM InscribeEquipo IE
            JOIN Torneo T ON IE.id_torneoFK = T.id_torneo
            WHERE T.id_categoriaFK = ? AND T.id_divisionFK = ?
        `);
        const resultado = consultaEquiposInscriptos.get(id_categoriaFK, id_divisionFK);
        const cantidadEquipos = resultado.cantidad_equipos;

        if (cantidadEquipos === 0) {
            return res.status(404).json({ message: 'No hay equipos inscriptos en torneos con esta categoría y división' });
        }

        // Paso 2: Calcular el valor de fechas
        const fechas = cantidadEquipos - 1;

        // Paso 3: Actualizar el fixture con los nuevos valores
        const actualizarFixture = db.prepare(`
            UPDATE Fixture
            SET rueda = ?, id_categoriaFK = ?, id_divisionFK = ?, fechas = ?
            WHERE id = ?
        `);
        const resultadoActualizacion = actualizarFixture.run(rueda, id_categoriaFK, id_divisionFK, fechas, id);

        // Verificar si la actualización fue exitosa
        if (resultadoActualizacion.changes === 0) {
            return res.status(404).json({ message: 'No se encontró el fixture para actualizar' });
        }

        // Devolver una respuesta indicando que el fixture fue actualizado exitosamente
        res.json({ message: 'Fixture actualizado exitosamente', id: id, fechas });
    } catch (error) {
        console.error('Error al actualizar fixture:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el fixture' });
    }
});

app.get('/equipos-inscritos-fixture/:id_fixture', (req, res) => {
    const { id_fixture } = req.params; // Usamos req.params para obtener el id del fixture.
    console.log("ID del fixture recibido:", id_fixture);

    try {
        // Obtener categoría y división del fixture
        const consultaFixture = db.prepare(`
            SELECT id_torneoFK, id_categoriaFK, id_divisionFK
            FROM fixture
            WHERE id_fixture = ?
        `);
        const fixture = consultaFixture.get(id_fixture);

        if (!fixture) {
            return res.status(404).json({ error: 'Fixture no encontrado' });
        }

        const { id_torneoFK, id_categoriaFK, id_divisionFK } = fixture;

        // Consultar equipos inscritos en el torneo, filtrados por categoría y división
        const consultaEquiposInscritos = db.prepare(`
            SELECT e.num_equipo, e.nombre
            FROM equipo e
            INNER JOIN inscribeEquipo ie ON e.num_equipo = ie.num_equipoPKFK
            WHERE ie.id_torneoPKFK = ?
            AND e.id_categoriaFK = ?
            AND e.id_divisionFK = ?
        `);

        const equiposInscritos = consultaEquiposInscritos.all(id_torneoFK, id_categoriaFK, id_divisionFK);

        res.json({
            message: 'Equipos inscritos obtenidos correctamente',
            equipos: equiposInscritos
        });
    } catch (error) {
        console.error('Error al obtener equipos inscritos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los equipos inscritos' });
    }
});


// Endpoint para obtener equipos disponibles para inscribir en un torneo
app.get('/equipos-disponibles-fixture/:id_fixture', (req, res) => {
    const { id_fixture } = req.params;

    // Validar que se envíen los datos requeridos
    if (!id_fixture) {
        return res.status(400).json({ error: 'El id_fixture es obligatorio' });
    }

    try {
        // Obtener categoría y división del fixture
        const consultaFixture = db.prepare(`
            SELECT id_torneoFK, id_categoriaFK, id_divisionFK
            FROM fixture
            WHERE id_fixture = ?
        `);
        const fixture = consultaFixture.get(id_fixture);

        if (!fixture) {
            return res.status(404).json({ error: 'Fixture no encontrado' });
        }

        const { id_torneoFK, id_categoriaFK, id_divisionFK } = fixture;

        // Consultar equipos que cumplen con la categoría y división, pero no están inscritos en el torneo
        const consultaEquiposDisponibles = db.prepare(`
            SELECT e.num_equipo, e.nombre
            FROM equipo e
            WHERE e.id_categoriaFK = ? AND e.id_divisionFK = ?
            AND e.num_equipo NOT IN (
                SELECT num_equipoPKFK
                FROM inscribeEquipo
                WHERE id_torneoPKFK = ?
            )
        `);

        console.log(consultaEquiposDisponibles)

        const equiposDisponibles = consultaEquiposDisponibles.all(id_categoriaFK, id_divisionFK, id_torneoFK);

        res.json({
            message: 'Equipos disponibles obtenidos correctamente',
            equipos: equiposDisponibles
        });
    } catch (error) {
        console.error('Error al obtener equipos disponibles:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los equipos disponibles' });
    }
});




app.post('/inscribir-equipo', (req, res) => {
    const { id_torneoPKFK, num_equipoPKFK, representante, dt } = req.body;

    console.log("Datos recibidos para inscripción:", req.body);

    if (!id_torneoPKFK || !num_equipoPKFK || !representante || !dt) {
        return res.status(400).json({ error: 'Todos los campos (id_torneoPKFK, num_equipoPKFK, representante y DT) son obligatorios.' });
    }

    try {
        // Verificar si el equipo ya está inscrito en el torneo
        const verificarEquipo = db.prepare(`
            SELECT COUNT(*) AS count
            FROM inscribeEquipo
            WHERE num_equipoPKFK = ? AND id_torneoPKFK = ?
        `);
        const { count } = verificarEquipo.get(num_equipoPKFK, id_torneoPKFK);

        if (count > 0) {
            return res.status(409).json({ error: 'El equipo ya está inscrito en este torneo.' });
        }

        // Insertar nuevo registro en inscribeEquipo
        const insertarInscribeEquipo = db.prepare(`
            INSERT INTO inscribeEquipo (num_equipoPKFK, id_torneoPKFK, representante, dt)
            VALUES (?, ?, ?, ?)
        `);
        const resultado = insertarInscribeEquipo.run(num_equipoPKFK, id_torneoPKFK, representante, dt);

        res.status(201).json({
            message: 'Equipo inscrito correctamente en el torneo.',
            id: resultado.lastInsertRowid
        });
    } catch (error) {
        console.error('Error al inscribir equipo:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al inscribir el equipo en el torneo.' });
    }
});




app.post('/generar-encuentros', (req, res) => {
    const { id_fixtureFK } = req.body;

    if (!id_fixtureFK) {
        return res.status(400).json({ error: 'El ID del fixture es obligatorio' });
    }

    try {
        // Obtener datos del fixture
        const consultaFixture = db.prepare(`
            SELECT fechas, id_categoriaFK, id_divisionFK, rueda
            FROM Fixture
            WHERE id_fixture = ?
        `);
        const fixture = consultaFixture.get(id_fixtureFK);

        if (!fixture) {
            return res.status(404).json({ message: 'No se encontró el fixture especificado' });
        }

        const { fechas, id_categoriaFK, id_divisionFK, rueda } = fixture;

        // Obtener equipos inscriptos en el torneo
        const consultaEquipos = db.prepare(`
            SELECT num_equipoFK, nombre
            FROM InscribeEquipo IE
            JOIN Equipo E ON IE.num_equipoFK = E.num_equipo
            JOIN Torneo T ON IE.id_torneoFK = T.id_torneo
            WHERE T.id_categoriaFK = ? AND T.id_divisionFK = ?
        `);
        const equipos = consultaEquipos.all(id_categoriaFK, id_divisionFK);

        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No hay equipos inscriptos en esta categoría y división' });
        }

        // Generar encuentros para cada fecha y rueda
        const insertarEncuentro = db.prepare(`
            INSERT INTO Encuentro (Fecha, Num_rueda, ID_fixtureFK)
            VALUES (?, ?, ?)
        `);
        const insertarParticipaEncuentro = db.prepare(`
            INSERT INTO ParticipaEncuentro (Num_equipoFK, ID_encuentroFK)
            VALUES (?, ?)
        `);

        let diaBase = new Date(); // Día base inicial
        const jsonEncuentros = [];

        for (let r = 1; r <= rueda; r++) { // Para cada rueda
            const combinaciones = generarCombinaciones(equipos);

            const ruedaData = {
                rueda: r,
                fechas: [],
            };

            for (let fecha = 1; fecha <= fechas; fecha++) {
                const partidosFecha = combinaciones.splice(0, equipos.length / 2);

                const fechaData = {
                    fecha,
                    encuentros: [],
                };

                for (const partido of partidosFecha) {
                    const [equipo1, equipo2] = partido;

                    // Crear el encuentro con `Dia` y `Hora` vacíos
                    const resultadoEncuentro = insertarEncuentro.run(fecha, r, id_fixtureFK);

                    // Registrar los equipos participantes en el encuentro
                    const idEncuentro = resultadoEncuentro.lastInsertRowid;
                    insertarParticipaEncuentro.run(equipo1.num_equipoFK, idEncuentro);
                    insertarParticipaEncuentro.run(equipo2.num_equipoFK, idEncuentro);

                    // Agregar el encuentro al JSON
                    fechaData.encuentros.push({
                        equipo1: equipo1.nombre,
                        equipo2: equipo2.nombre,
                    });
                }

                ruedaData.fechas.push(fechaData);
            }

            jsonEncuentros.push(ruedaData);
        }

        res.json({
            message: 'Encuentros generados exitosamente',
            encuentros: jsonEncuentros,
        });
    } catch (error) {
        console.error('Error al generar encuentros:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al generar los encuentros' });
    }
});

//Asignar fechas al Encuentro
app.post('/asignar_fecha', (req, res) => {
    const { id_encuentro, dia, hora } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!id_encuentro || !dia || !hora) {
        return res.status(400).json({ error: 'El ID del encuentro, el día y la hora son obligatorios' });
    }

    try {
        // Actualizar el campo Dia y Hora del encuentro
        const actualizarEncuentro = db.prepare(`
            UPDATE Encuentro
            SET Dia = ?, Hora = ?
            WHERE ID_encuentro = ?
        `);
        const resultado = actualizarEncuentro.run(dia, hora, id_encuentro);

        if (resultado.changes === 0) {
            return res.status(404).json({ message: 'No se encontró el encuentro especificado' });
        }

        res.json({ message: 'Fecha y hora asignadas correctamente al encuentro' });
    } catch (error) {
        console.error('Error al asignar fecha y hora:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al asignar fecha y hora' });
    }
});

// Función para generar combinaciones de equipos
function generarCombinaciones(equipos) {
    const combinaciones = [];
    const numEquipos = equipos.length;

    for (let i = 0; i < numEquipos; i++) {
        for (let j = i + 1; j < numEquipos; j++) {
            combinaciones.push([equipos[i], equipos[j]]);
        }
    }
    return combinaciones;
}
// crea una cancha nueva
app.post('/registrar_cancha', (req, res) => {
    const { nombre, direcc } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!nombre || !direcc) {
        return res.status(400).json({ error: 'El nombre y la dirección de la cancha son obligatorios' });
    }

    try {
        // Insertar la cancha en la base de datos
        const insertarCancha = db.prepare(`
            INSERT INTO Cancha (nombre, direcc)
            VALUES (?, ?)
        `);
        const resultado = insertarCancha.run(nombre, direcc);

        // Devolver una respuesta con el ID de la cancha creada
        res.json({ message: 'Cancha registrada exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar cancha:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al registrar la cancha' });
    }
});
// asigna una cancha a un ParticipaEncuentro
app.post('/asignar_cancha', (req, res) => {
    const { id_encuentroFK, id_canchaFK } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!id_encuentroFK || !id_canchaFK) {
        return res.status(400).json({ error: 'El ID del encuentro y el ID de la cancha son obligatorios' });
    }

    try {
        // Actualizar el campo ID_canchaFK en ParticipaEncuentro
        const actualizarCancha = db.prepare(`
            UPDATE ParticipaEncuentro
            SET ID_canchaFK = ?
            WHERE ID_encuentroFK = ?
        `);
        const resultado = actualizarCancha.run(id_canchaFK, id_encuentroFK);

        if (resultado.changes === 0) {
            return res.status(404).json({ message: 'No se encontró el encuentro especificado para asignar la cancha' });
        }

        res.json({ message: 'Cancha asignada correctamente al encuentro' });
    } catch (error) {
        console.error('Error al asignar cancha:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al asignar la cancha' });
    }
});

//crea un nuevo arbitro
app.post('/registrar_arbitros', (req, res) => {
    const { nombre, domicilio, fecha_nac, EsCertificado, experiencia } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!nombre || !domicilio || !fecha_nac || EsCertificado === undefined || !experiencia) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Insertar el árbitro en la base de datos
        const insertarArbitro = db.prepare(`
            INSERT INTO Arbitro (nombre, domicilio, fecha_nac, EsCertificado, experiencia)
            VALUES (?, ?, ?, ?, ?)
        `);
        const resultado = insertarArbitro.run(nombre, domicilio, fecha_nac, EsCertificado, experiencia);

        // Devolver una respuesta con el ID del árbitro creado
        res.json({ message: 'Árbitro registrado exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar árbitro:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al registrar el árbitro' });
    }
});

//asigna el arbitro a un ParticipaEncuentro
app.post('/asignar_arbitro', (req, res) => {
    const { id_encuentroFK, id_arbitroFK } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!id_encuentroFK || !id_arbitroFK) {
        return res.status(400).json({ error: 'El ID del encuentro y el ID del árbitro son obligatorios' });
    }

    try {
        // Actualizar el campo ID_arbitroFK en ParticipaEncuentro
        const actualizarArbitro = db.prepare(`
            UPDATE ParticipaEncuentro
            SET ID_arbitroFK = ?
            WHERE ID_encuentroFK = ?
        `);
        const resultado = actualizarArbitro.run(id_arbitroFK, id_encuentroFK);

        if (resultado.changes === 0) {
            return res.status(404).json({ message: 'No se encontró el encuentro especificado para asignar el árbitro' });
        }

        res.json({ message: 'Árbitro asignado correctamente al encuentro' });
    } catch (error) {
        console.error('Error al asignar árbitro:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al asignar el árbitro' });
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
