const path = require('path');

const express = require('express');
const Database = require('better-sqlite3');

// Crear la base de datos
const db = new Database('db');


// Inicializar la app de Express
const app = express();


app.use(express.static('public'));


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para datos de formularios


// #region Endpoint para obtener las categorias disponibles
app.get('/categorias', (req, res) => {
    try {
        // Consulta para obtener los equipos por categoría y división
        const cagetoriasConsult = db.prepare(`
            SELECT * FROM categoria
        `);
        const categorias = cagetoriasConsult.all();

        // Si no se encuentran equipos
        if (categorias.length === 0) {
            return res.status(404).json({ message: 'No existen categorias' });
        }

        // Devolver los equipos encontrados
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener las categorias:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener las categorias' });
    }
});
// #endregion


// #region Endpoint para obtener las divisiones disponibles
app.get('/divisiones', (req, res) => {
    try {
        // Consulta para obtener los equipos por categoría y división
        const divisionesConsult = db.prepare(`
            SELECT * FROM division
        `);
        const divisiones = divisionesConsult.all();

        // Si no se encuentran equipos
        if (divisiones.length === 0) {
            return res.status(404).json({ message: 'No existen divisiones' });
        }

        // Devolver los equipos encontrados
        res.json(divisiones);
    } catch (error) {
        console.error('Error al obtener las divisiones:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener las divisiones' });
    }
});
// #endregion


//#region Endpoint para registrar jugador
app.post('/create_jugador', (req, res) => {
    const { dni, nombre, apellido, fec_nac, domic, foto, id_categoriaFK, num_equipoFK } = req.body;

    if (!dni || !nombre || !apellido || !fec_nac || !domic || !foto || !id_categoriaFK || !num_equipoFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {

        const insertarJugador = db.prepare(`
            INSERT INTO jugador (dni, nombre, apellido, fec_nac, domic, foto, id_categoriaFK, num_equipoFK)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const resultado = insertarJugador.run(dni, nombre, apellido, fec_nac, domic, foto, id_categoriaFK, num_equipoFK);

        res.json({ message: 'Usuario registrado exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Ocurrió un error al registrar el usuario' });
    }
});

// #endregion


//#region Endpoint para registrar equipo
app.post('/equipo/crear_equipo', (req, res) => {
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
// #endregion


//#region Endpoint para traer jugadores por categoria
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
// #endregion


//#region Endpoint para traer los equipos
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
// #endregion


// #region Endpoint para traer los torneos
app.get('/torneos', (req, res) => {
    try {
        const torneosConsultas = db.prepare(`
            SELECT * FROM torneo
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

// #endregion


// #region Endpoint para crear torneos
app.post('/create_torneos', (req, res) => {
    try {
        // Obtener los datos del torneo desde el cuerpo de la solicitud
        const { nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo } = req.body;
        console.log('Datos recibidos:', req.body);

        // Insertar el nuevo torneo en la base de datos
        const insertTorneo = db.prepare(`
            INSERT INTO torneo (nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = insertTorneo.run(nombre, fecha_inicio_insc, fecha_final_insc, fecha_inicio_torneo, fecha_final_torneo);

        // Obtener el ID del torneo recién creado
        const newTorneoId = result.lastInsertRowid;

        // Responder con el ID del nuevo torneo
        res.json({ id: newTorneoId });
    } catch (error) {
        console.error('Error al crear el torneo:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al crear el torneo' });
    }
});
// #endregion


// #region Endpoint para obtener un torneo en especifico
app.get('/torneo/:id', (req, res) => {
    const torneoId = req.params.id;

    // Buscar el torneo en la base de datos usando el ID
    const torneo = db.prepare(`
        SELECT *
        FROM torneo
        WHERE torneo.id_torneo = ?
    `).get(torneoId);

    if (torneo) {
        res.json(torneo);
    } else {
        res.status(404).json({ error: "Torneo no encontrado" });
    }
});
// #endregion


// #region Endpoint para obtener las fixtures de un torneo
app.get('/torneo/:id/fixtures', (req, res) => {
    const torneoId = req.params.id;

    // Buscar las fixtures para el torneo en la base de datos
    const fixtures = db.prepare(`
        SELECT 
            f.*, 
            c.nombre AS categoria, 
            d.nombre AS division, 
            COUNT(r.id_fixtureFK) AS cantidadRuedas
        FROM 
            fixture f
        JOIN 
            categoria c ON f.id_categoriaFK = c.id_categoria
        JOIN 
            division d ON f.id_divisionFK = d.id_division
        LEFT JOIN 
            rueda r ON r.id_fixtureFK = f.id_fixture
        WHERE 
            f.id_torneoFK = ?
        GROUP BY 
            f.id_fixture, c.nombre, d.nombre;
    `).all(torneoId);
    if (fixtures.length > 0) {
        res.json({ fixtures });
        console.log(fixtures)

    } else {
        res.status(404).json({ error: "No se encontraron fixtures para este torneo" });
    }
});
// #endregion


//#region Endpoint para traer jugadores por categoria y division
app.get('/equipos/categoria/:id_categoriaFK/:id_divisionFK', (req, res) => {
    const { id_categoriaFK, id_divisionFK } = req.params;

    try {
        const consultaJugadores = db.prepare(`
            SELECT * 
            FROM equipo 
            WHERE id_categoriaFK = ? AND id_divisionFK = ?
        `);
        const jugadores = consultaJugadores.all(id_categoriaFK, id_divisionFK);

        // Si no se encuentran equipos
        if (jugadores.length === 0) {
            return res.status(404).json({ message: 'No se encontraron jugadores para esta categoría y división' });
        }

        // Devolver los jugadores encontrados
        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los jugadores' });
    }
});
// #endregion


//#region Endpoint para traer jugadores por equipo asociado
app.post('/jugadores/por_equipo', (req, res) => {
    const { id_equipo } = req.body;
    console.log("esad")
    try {
        const consultaJugadores = db.prepare(`
            SELECT * 
            FROM jugador 
            WHERE num_equipoFK = ?
        `);
        const jugadores = consultaJugadores.all(id_equipo);

        // Si no se encuentran equipos
        if (jugadores.length === 0) {
            return res.status(404).json({ message: 'No se encontraron jugadores de este equipo asociados' });
        }

        // Devolver los jugadores encontrados
        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los jugadores' });
    }
});
// #endregion


// #region Endpoint para crear fixtures y ruedas
app.post('/fixtures/crear', (req, res) => {
    const { cantidad_ruedas, id_categoriaFK, id_divisionFK, id_torneoFK } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!cantidad_ruedas || !id_categoriaFK || !id_divisionFK || !id_torneoFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Insertar el nuevo fixture en la base de datos
        const insertarFixture = db.prepare(`
            INSERT INTO fixture (id_categoriaFK, id_divisionFK,id_torneoFK)
            VALUES (?, ?, ?)
        `);
        const resultadoFixture = insertarFixture.run(id_categoriaFK, id_divisionFK, id_torneoFK);

        // Obtener los datos nuevamente para luego enviarlos y actualizarlos en el Front
        const obtenerDatos = db.prepare(
            `
            SELECT c.nombre AS categoria, d.nombre AS division
            FROM fixture f
            JOIN categoria c ON f.id_categoriaFK = c.id_categoria
            JOIN division d ON f.id_divisionFK = d.id_division
            WHERE f.id_fixture = ?
        `
        );
        const datosFixture = obtenerDatos.get(resultadoFixture.lastInsertRowid); // Se obtiene la ultima fixture agregada

        crearRuedas(resultadoFixture.lastInsertRowid, cantidad_ruedas) // Luego generamos la rueda a traves del ID del nuevo fixture

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


// Funcion para insertar la rueda de una determinada fixture en la base de datos
function crearRuedas(id_fixture, cantidad_ruedas) {
    for (let i = 1; i <= cantidad_ruedas; i++) {
        try {
            const generarRueda = db.prepare(`
                INSERT INTO rueda (numero, id_fixtureFK)
                VALUES (?, ?)
            `);
            generarRueda.run(i, id_fixture);
        } catch (error) {
            console.error('Error al crear la rueda:', error.message);
            res.status(500).json({ error: 'Ocurrió un error al generar las ruedas' });
        }
    }
}

// #endregion


// #region Enpoint para eliminar fixture
app.delete('/fixtures/delete_fixture', (req, res) => {
    const { id_fixture } = req.body;

    try {
        // Obtener la categoría y división del fixture a eliminar
        const fixtureInfo = db.prepare(`
        SELECT id_categoriaFK, id_divisionFK 
        FROM fixture 
        WHERE id_fixture = ?
      `).get(id_fixture);


        const { id_categoriaFK, id_divisionFK } = fixtureInfo;

        // Eliminar equipos inscritos en el torneo con la misma categoría y división
        const eliminarEquipos = db.prepare(`
        DELETE FROM inscribeEquipo
        WHERE id_torneoPKFK IN (
          SELECT id_torneoFK 
          FROM fixture 
          WHERE id_categoriaFK = ? AND id_divisionFK = ?
        )
      `).run(id_categoriaFK, id_divisionFK);



        // Eliminar ruedas relacionadas con el fixture
        db.prepare(`
            DELETE FROM rueda 
            WHERE id_fixtureFK = ?
        `).run(id_fixture);


        // Eliminar el fixture
        const eliminarFixture = db.prepare(`
        DELETE FROM fixture 
        WHERE id_fixture = ?
        `).run(id_fixture);

        res.json({ message: "Fixture y equipos relacionados eliminados exitosamente." });
    } catch (error) {
        console.error("Error al eliminar fixture:", error.message);
        res.status(500).json({ error: "Ocurrió un error al eliminar el fixture." });
    }
});
// #endregion


//#region Endpoint para actualizar el fixture y calcular la fecha
app.put('fixtures/fixture/:id', (req, res) => {
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

// #endregion


// #region Endpoint Para inscribir jugadores al torneo

app.post('/torneos/inscripcion_jugador', (req, res) => {
    const { num_socio, id_torneo } = req.body;

    try {
        const inscribirJugador = db.prepare(`
            INSERT INTO inscribeJugador (id_jugadorPKFK, id_torneoPKFK) 
            VALUES (?, ?)
        `);
        inscribirJugador.run(num_socio, id_torneo);

        res.json({ message: "Jugador inscrito exitosamente." });
    } catch (error) {
        console.error("Error al inscribir jugador:", error.message);
        res.status(500).json({ error: "Ocurrió un error al inscribir al jugador." });
    }
});

// #endregion


// #region Endpoint Para desinscribir jugadores al torneo
app.delete('/torneos/inscripcion_jugador', (req, res) => {
    const { num_socio, id_torneo } = req.body;

    try {
        const desinscribirJugador = db.prepare(`
            DELETE FROM inscribeJugador 
            WHERE id_jugadorPKFK = ? AND id_torneoPKFK = ?
        `);
        desinscribirJugador.run(num_socio, id_torneo);

        res.json({ message: "Jugador desinscrito exitosamente." });
    } catch (error) {
        console.error("Error al desinscribir jugador:", error.message);
        res.status(500).json({ error: "Ocurrió un error al desinscribir al jugador." });
    }
});

// #endregion



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



// #region Endpoint para calcular fechas y generar encuentros de los equipos

app.post('/comenzar-torneo', (req, res) => {
    const { id_torneo } = req.body;

    try {

        const consultaTorneo = db.prepare(`
            SELECT *
            FROM torneo
            WHERE id_torneo = ?
        `);
        const torneo = consultaTorneo.get(id_torneo);

        if(torneo.estado == "Inscripcion"){
            // 1) Obtener los fixtures que estan en el torneo - - - - - - - - - - - - - - - - -
            const consultaFixtures = db.prepare(`
                SELECT *
                FROM fixture
                WHERE id_torneoFK = ?
            `);
            const fixtures = consultaFixtures.all(id_torneo);
    
            // 2) Por cada fixture realizar la asignacion de Ruedas, Fechas, Encuentros etc - - - - - - - - - - - - - - - - -
            for (let f = 0; f < fixtures.length; f++) {
                const idFixture = fixtures[f].id_fixture
    
                const categoriaFixture = fixtures[f].id_categoriaFK
                const divisionFixture = fixtures[f].id_divisionFK
    
                // 3)  Obtener equipos inscriptos en el torneo - - - - - - - - - - - - - - - - -
                const consultaEquipos = db.prepare(`
                    SELECT DISTINCT num_equipoPKFK , e.nombre
                    FROM inscribeEquipo ie
                    JOIN equipo e ON ie.num_equipoPKFK = e.num_equipo
                    JOIN torneo t ON ie.id_torneoPKFK = t.id_torneo
                    JOIN fixture f ON t.id_torneo = f.id_torneoFK
                    WHERE t.id_torneo = ? AND e.id_categoriaFK = ? AND e.id_divisionFK = ? AND f.id_categoriaFK = ? AND f.id_divisionFK = ?
                `);
                const equipos = consultaEquipos.all(id_torneo, categoriaFixture, divisionFixture, categoriaFixture, divisionFixture);
                equipos.forEach(element => {
                    console.log(`Equipos del fixture ${idFixture} -> ${element.nombre}`)
                });
    
    
                // 4) Las ruedas de ese fixture - - - - - - - - - - - - - - - - -
                const consultaRuedas = db.prepare(`
                    SELECT *
                    FROM rueda
                    WHERE id_fixtureFK = ?
                `);
    
                const ruedas = consultaRuedas.all(idFixture);
                console.log(`Todas las ruedas del fixture ${idFixture} -> ${ruedas}`)
    
    
                // 5) Genero las fechas con sus combinaciones de los encuentros - - - - - - - - - - - - - - - - -
                const fechas = generarEncuentros(equipos);
    
                // 6) Creo las instancias de "encuentro" - - - - - - - - - - - - - - - - -
                for (let r = 0; r < ruedas.length; r++) {
                    fechas.forEach((fecha, indexF) => {
                        fecha.forEach(encuentro => {
                            let fechaIndex = indexF + 1;
                            let id_ruedaFK = ruedas[r].id_ruedaPK;
    
                            const insertarEncuentro = db.prepare(`
                                INSERT INTO encuentro (fecha, id_ruedaFK)
                                VALUES (?, ?)
                            `);
                            
    
                            const infoEncuentro = insertarEncuentro.run(fechaIndex, id_ruedaFK);
                            
                            // Obtener el id del encuentro recién creado
                            const id_encuentroFK = infoEncuentro.lastInsertRowid;
    
    
                            // Insertar en participaEncuentro para los equipos
                            const insertarParticipaEncuentro = db.prepare(`
                                INSERT INTO participaEncuentro (num_equipoFK, id_encuentroFK, id_arbitroFK, id_canchaFK, asistencia)
                                VALUES (?, ?, NULL, NULL, NULL)
                            `);
    
                            // Equipo 1
                            const equipo1 = encuentro[0];
                            insertarParticipaEncuentro.run(equipo1.num_equipoPKFK, id_encuentroFK);
    
                            // Equipo 2
                            const equipo2 = encuentro[1];
                            insertarParticipaEncuentro.run(equipo2.num_equipoPKFK, id_encuentroFK);
                            });
                    });
                }
            }


            // 7. Actualizar el estado del torneo a "En curso"
            const actualizarEstadoTorneo = db.prepare(`
                UPDATE torneo
                SET estado = 'En curso'
                WHERE id_torneo = ?
            `);
            actualizarEstadoTorneo.run(id_torneo);

            
            res.json({
                message: 'Encuentros generados exitosamente',
                // encuentros: jsonEncuentros,
            });
        }
        else {
            res.status(400).json({ error: 'El torneo no está en estado de Inscripcion.' });
        }


    } catch (error) {
        console.error('Error al generar encuentros:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al generar los encuentros' });
    }
});

// #endregion


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
function generarEncuentros(equipos) {
    const totalFechas = equipos.length - 1; // Cantidad de fechas
    const totalEquipos = equipos.length;

    if (totalEquipos % 2 !== 0) {
        // Añadir un equipo ficticio si el número de equipos es impar
        equipos.push("Descansa");
    }

    const fechas = [];

    for (let i = 0; i < totalFechas; i++) {
        const fecha = [];

        for (let j = 0; j < totalEquipos / 2; j++) {
            // Emparejar el primer equipo con el último, segundo con penúltimo, etc.
            const equipo1 = equipos[j];
            const equipo2 = equipos[totalEquipos - 1 - j];

            if (equipo1 !== "Descansa" && equipo2 !== "Descansa") {
                fecha.push([equipo1, equipo2]);
            }
        }

        fechas.push(fecha);

        // Rotar equipos para la siguiente fecha
        const rotar = equipos.splice(1, 1); // Extrae el segundo equipo
        equipos.push(...rotar); // Añádelo al final
    }

    return fechas;
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
