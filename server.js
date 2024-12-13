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


//#region Endpoint para obtener equipos disponibles para inscribir en un torneo
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
// #endregion


// #region Endpoint para inscribir equipo 
app.post('/inscribir-equipo', (req, res) => {
    const { id_torneoPKFK, num_equipoPKFK, representante, dt } = req.body;


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
// #endregion


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

        if (torneo.estado == "Inscripcion") {
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
                


                // 4) Las ruedas de ese fixture - - - - - - - - - - - - - - - - -
                const consultaRuedas = db.prepare(`
                    SELECT *
                    FROM rueda
                    WHERE id_fixtureFK = ?
                `);

                const ruedas = consultaRuedas.all(idFixture);


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


// #region Endpoint para obtener el detalle del encuentro
app.get('/encuentro/:id_encuentro', (req, res) => {
    const id_encuentro = req.params.id_encuentro;

    try {
        // Consulta para obtener información del encuentro y los equipos
        const info_encuentro = db.prepare(`
            SELECT 
            e1.nombre AS equipo1, 
            e2.nombre AS equipo2, 
            pe1.id_participaEncuentro AS id_participa1, 
            pe2.id_participaEncuentro AS id_participa2,
            c.nombre AS cancha, 
            a.nombre AS arbitro, 
            en.dia AS dia, 
            en.hora AS hora
            FROM encuentro en
            JOIN participaEncuentro pe1 ON pe1.id_encuentroFK = en.id_encuentro
            JOIN equipo e1 ON pe1.num_equipoFK = e1.num_equipo
            JOIN participaEncuentro pe2 ON pe2.id_encuentroFK = en.id_encuentro AND pe1.id_participaEncuentro != pe2.id_participaEncuentro
            JOIN equipo e2 ON pe2.num_equipoFK = e2.num_equipo
            LEFT JOIN cancha c ON pe1.id_canchaFK = c.id_cancha
            LEFT JOIN arbitro a ON pe1.dni_arbitroFK = a.dni_arbitro
            WHERE en.id_encuentro = ?
        `).get(id_encuentro);

        // Consulta para obtener goles por equipo
        const goles_equipo1 = db.prepare(`
            SELECT g.minuto, j.nombre AS jugador
            FROM gol g
            JOIN jugador j ON g.num_socioFK = j.num_socio
            JOIN participaEncuentro pe ON g.participaEncuentroFK = pe.id_participaEncuentro
            WHERE pe.id_encuentroFK = ? AND pe.num_equipoFK = (
                SELECT num_equipoFK FROM participaEncuentro WHERE id_encuentroFK = ? LIMIT 1
            )
        `).all(id_encuentro, id_encuentro);

        const goles_equipo2 = db.prepare(`
            SELECT g.minuto, j.nombre AS jugador
            FROM gol g
            JOIN jugador j ON g.num_socioFK = j.num_socio
            JOIN participaEncuentro pe ON g.participaEncuentroFK = pe.id_participaEncuentro
            WHERE pe.id_encuentroFK = ? AND pe.num_equipoFK != (
                SELECT num_equipoFK FROM participaEncuentro WHERE id_encuentroFK = ? LIMIT 1
            )
        `).all(id_encuentro, id_encuentro);

        // Consulta para obtener infracciones por equipo
        const infracciones_equipo1 = db.prepare(`
            SELECT i.minuto, i.tipo, i.tarjeta, j.nombre AS jugador
            FROM infraccion i
            JOIN jugador j ON i.num_socioFK = j.num_socio
            JOIN participaEncuentro pe ON i.participaEncuentroFK = pe.id_participaEncuentro
            WHERE pe.id_encuentroFK = ? AND pe.num_equipoFK = (
                SELECT num_equipoFK FROM participaEncuentro WHERE id_encuentroFK = ? LIMIT 1
            )
        `).all(id_encuentro, id_encuentro);

        const infracciones_equipo2 = db.prepare(`
            SELECT i.minuto, i.tipo, i.tarjeta, j.nombre AS jugador
            FROM infraccion i
            JOIN jugador j ON i.num_socioFK = j.num_socio
            JOIN participaEncuentro pe ON i.participaEncuentroFK = pe.id_participaEncuentro
            WHERE pe.id_encuentroFK = ? AND pe.num_equipoFK != (
                SELECT num_equipoFK FROM participaEncuentro WHERE id_encuentroFK = ? LIMIT 1
            )
        `).all(id_encuentro, id_encuentro);

        res.json({
            equipo1: info_encuentro.equipo1,
            equipo2: info_encuentro.equipo2,
            goles_equipo1,
            goles_equipo2,
            infracciones_equipo1,
            infracciones_equipo2,
            cancha: info_encuentro.cancha || 'Sin asignar',
            arbitro: info_encuentro.arbitro || 'Sin asignar',
            dia: info_encuentro.dia || '',
            hora:info_encuentro.hora || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del encuentro' });
    }
});
// #endregion


// #region Endpoint para obtener la lista de jugadores de dicho equipo atraves de participaEncuentro
app.get('/jugadores/:id_participaEncuentro', (req, res) => {
    const id_participaEncuentro = req.params.id_participaEncuentro;

    try {
        const jugadores = db.prepare(`
            SELECT j.num_socio, j.nombre
            FROM jugador j
            JOIN equipo e ON j.num_equipoFK = e.num_equipo
            JOIN participaEncuentro pe ON e.num_equipo = pe.num_equipoFK
            WHERE pe.id_participaEncuentro = ?
        `).all(id_participaEncuentro);

        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({ error: 'Error al obtener jugadores' });
    }
});

// #endregion


// #region Endpoint para registrar un gol
app.post('/goles/crear_gol', (req, res) => {
    const { jugador, minuto, id_participaEncuentro } = req.body;

    try {
        db.prepare(`
            INSERT INTO gol (num_socioFK, minuto, participaEncuentroFK)
            VALUES (?, ?, ?)
        `).run(jugador, minuto, id_participaEncuentro);

        res.status(200).json({ message: 'Gol registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar gol:', error);
        res.status(500).json({ error: 'Error al registrar gol' });
    }
});

// #endregion


// #region Endpoint para registrar una infraccion
app.post('/infracciones/crear_infraccion', (req, res) => {
    const { jugador, minuto, tipo, tarjeta, id_participaEncuentro } = req.body;

    try {
        db.prepare(`
            INSERT INTO infraccion (num_socioFK, minuto, tipo, tarjeta, participaEncuentroFK)
            VALUES (?, ?, ?, ?, ?)
        `).run(jugador, minuto, tipo, tarjeta, id_participaEncuentro);

        res.status(200).json({ message: 'Infracción registrada correctamente' });
    } catch (error) {
        console.error('Error al registrar infracción:', error);
        res.status(500).json({ error: 'Error al registrar infracción' });
    }
});

// #endregion


// #region Enpoint para obtener todos los matchs con su info de dicha fixture
app.get('/encuentros/:id_fixture', (req, res) => {
    const { id_fixture } = req.params;
    try {
        // Consultar ruedas asociadas al fixture
        const consultaRuedas = db.prepare(`
            SELECT id_ruedaPK AS id_rueda, numero
            FROM rueda
            WHERE id_fixtureFK = ?
        `);
        const ruedas = consultaRuedas.all(id_fixture);

        const resultado = [];

        for (const rueda of ruedas) {
            // Consultar fechas asociadas a cada rueda
            const consultaFechas = db.prepare(`
                SELECT DISTINCT fecha
                FROM encuentro
                WHERE id_ruedaFK = ?
            `);
            const fechas = consultaFechas.all(rueda.id_rueda);

            const detallesRueda = {
                id_rueda: rueda.id_rueda,
                fechas: [],
            };

            for (const fecha of fechas) {
                // Consultar encuentros asociados a cada fecha
                const consultaEncuentros = db.prepare(`
                    SELECT  e.id_encuentro, 
                            e.fecha, 
                            p1.id_participaEncuentro AS id_participaEncuentro1,
                            eq1.nombre AS equipo1,
                            (SELECT COUNT(*) 
                                 FROM gol g 
                                 WHERE g.participaEncuentroFK = p1.id_participaEncuentro) AS golesEquipo1,
                            p2.id_participaEncuentro AS id_participaEncuentro2,
                            eq2.nombre AS equipo2,
                            (SELECT COUNT(*) 
                                 FROM gol g 
                                 WHERE g.participaEncuentroFK = p2.id_participaEncuentro) AS golesEquipo2
                    FROM encuentro e
                    JOIN participaEncuentro p1 ON e.id_encuentro = p1.id_encuentroFK
                    JOIN equipo eq1 ON p1.num_equipoFK = eq1.num_equipo
                    JOIN participaEncuentro p2 ON e.id_encuentro = p2.id_encuentroFK
                    JOIN equipo eq2 ON p2.num_equipoFK = eq2.num_equipo
                    WHERE e.id_ruedaFK = ? 
                    AND e.fecha = ?
                    AND p1.num_equipoFK < p2.num_equipoFK

                `);
                const encuentros = consultaEncuentros.all(rueda.id_rueda, fecha.fecha);

                detallesRueda.fechas.push({
                    fecha: fecha.fecha,
                    encuentros,
                });
            }

            resultado.push(detallesRueda);

        }

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener los encuentros:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los encuentros.' });
    }
});

// #endregion


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


// #region Endpoint para registrar una cancha
app.post("/canchas/crear_cancha", (req, res) => {
    const { nombre, direcc } = req.body;

    // Validar que los campos no estén vacíos
    if (!nombre || !direcc) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO cancha (nombre, direcc) 
            VALUES (?, ?)
        `);
        stmt.run(nombre, direcc);

        res.status(201).json({ message: "Cancha registrada exitosamente" });
    } catch (error) {
        console.error("Error al registrar la cancha:", error);
        res.status(500).json({ error: "Error al registrar la cancha" });
    }
});
// #endregion


// #region Endpoint para registrar un árbitro
app.post("/arbitros/crear_arbitro", (req, res) => {
    const { nombre, apellido, dni_arbitro, fec_nac, domic, es_certificado, experiencia } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !apellido || !dni_arbitro || !fec_nac || !domic || es_certificado === undefined || !experiencia) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO arbitro (dni_arbitro, nombre, apellido, fec_nac, domic, es_certificado, experiencia)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(dni_arbitro, nombre, apellido, fec_nac, domic, es_certificado ? 1 : 0, experiencia);

        res.status(201).json({ message: "Árbitro registrado exitosamente." });
    } catch (error) {
        console.error("Error al insertar árbitro:", error.message);
        res.status(500).json({ error: "Error al registrar el árbitro." });
    }
});
// #endregion


//#region Endpoint para obtener árbitros
app.get('/arbitros', (req, res) => {
    try {
        const arbitros = db.prepare('SELECT dni_arbitro, nombre FROM arbitro').all();
        res.json(arbitros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener árbitros' });
    }
});
// #endregion


// #region Endpoint para obtener canchas
app.get('/canchas', (req, res) => {
    try {
        const canchas = db.prepare('SELECT id_cancha, nombre FROM cancha').all();
        res.json(canchas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener canchas' });
    }
});
// #endregion


// #region Endpoint para actualizar datos del encuentro
app.put('/encuentro/guardar/:id_encuentro', (req, res) => {
    const { id_encuentro } = req.params;
    const { cancha, arbitro, dia, hora } = req.body;

    try {
        db.prepare(`
            UPDATE encuentro
            SET dia = ?, hora = ?
            WHERE id_encuentro = ?
        `).run(dia, hora, id_encuentro);

        db.prepare(`
            UPDATE participaEncuentro
            SET id_canchaFK = ?, dni_arbitroFK = ?
            WHERE id_encuentroFK = ?
        `).run(cancha, arbitro, id_encuentro);

        res.json({ message: 'Datos del encuentro actualizados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar los datos del encuentro' });
    }
});
// #endregion


// #region Endpoint para obtener goles a favor, en contra y diferencia de goles
app.get('/tabla-puntos/:id_fixture', (req, res) => {
    const fixtureId = req.params.id_fixture;
  
    // Consulta para obtener los equipos de la fixture
    const equiposQuery = `
      SELECT DISTINCT
          eq.num_equipo,
          eq.nombre AS equipo
      FROM
          encuentro e
      JOIN participaEncuentro p1 ON e.id_encuentro = p1.id_encuentroFK
      JOIN equipo eq ON p1.num_equipoFK = eq.num_equipo
      JOIN rueda r ON e.id_ruedaFK = r.id_ruedaPK
      WHERE
          r.id_fixtureFK = ?;  -- Filtra por el fixture específico
    `;
    const equipos = db.prepare(equiposQuery).all(fixtureId);
  
    // Resultados a devolver
    const resultados = [];
  
    // Recorremos los equipos obtenidos
    for (let e = 0; e < equipos.length; e++) {
      const numEquipo = equipos[e].num_equipo;
  
      // Consulta para obtener los goles a favor de cada equipo
      const golesAFavorQuery = `
        SELECT
            eq.num_equipo,
            COUNT(g.id_gol) AS goles_a_favor
        FROM
            encuentro e
        JOIN participaEncuentro p1 ON e.id_encuentro = p1.id_encuentroFK
        JOIN equipo eq ON p1.num_equipoFK = eq.num_equipo
        LEFT JOIN gol g ON g.participaEncuentroFK = p1.id_participaEncuentro
        JOIN rueda r ON e.id_ruedaFK = r.id_ruedaPK
        WHERE
            r.id_fixtureFK = ?  -- Filtra por el fixture específico
            AND eq.num_equipo = ?  -- Filtra por el nombre del equipo
        GROUP BY
            eq.nombre;
      `;
      const golesAFavor = db.prepare(golesAFavorQuery).get(fixtureId, numEquipo) || { goles_a_favor: 0 };
  
      // Consulta para obtener los goles en contra de cada equipo
      const golesEnContraQuery = `
        SELECT 
        COUNT(g.id_gol) AS goles_en_contra
        FROM
            participaEncuentro pe
        JOIN encuentro e ON pe.id_encuentroFK = e.id_encuentro
        JOIN equipo eq_contrario ON pe.num_equipoFK = eq_contrario.num_equipo -- Equipo contrario
        JOIN rueda r ON e.id_ruedaFK = r.id_ruedaPK
        JOIN gol g ON g.participaEncuentroFK = pe.id_participaEncuentro -- Goles del equipo contrario
        WHERE
            r.id_fixtureFK = ? -- Filtra por el fixture específico
            AND e.id_encuentro IN (
                SELECT e_sub.id_encuentro
                FROM
                    participaEncuentro pe_sub
                JOIN encuentro e_sub ON pe_sub.id_encuentroFK = e_sub.id_encuentro
                WHERE
                    pe_sub.num_equipoFK = ? -- Encuentros donde participó el equipo 10
            )
            AND eq_contrario.num_equipo != ?; -- Para contar solo goles del equipo contrario

      `;
      const golesEnContra = db.prepare(golesEnContraQuery).get(fixtureId, numEquipo, numEquipo) || { goles_en_contra: 0 };
  
      // Cálculo de la diferencia de goles
      const golesFavor = golesAFavor.goles_a_favor;
      const golesContra = golesEnContra.goles_en_contra;
      const diferenciaGoles = golesFavor - golesContra;
  
      // Almacenamos la información en el arreglo de resultados
      resultados.push({
        equipo: equipos[e].equipo,
        goles_a_favor: golesFavor,
        goles_en_contra: golesContra,
        diferencia_goles: diferenciaGoles,
      });
    }
  
    // Ordenar los resultados por diferencia de goles (de mayor a menor)
    resultados.sort((a, b) => b.diferencia_goles - a.diferencia_goles);
    console.log(resultados)
    // Enviar la respuesta
    res.json(resultados);
  });
// #endregion


// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
