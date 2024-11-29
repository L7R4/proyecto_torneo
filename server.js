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

app.get('/torneo/registrar_jugador', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar_jugador.html'));
});

app.get('/torneo/registrar_equipo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar_equipo.html'));
});

// Endpoint para registrar jugador
app.post('/torneo/jugador', (req, res) => {
    const { dni, nombre, apellido, fecha_nac, direcc, id_categoriaFK } = req.body;

    if (!dni || !nombre || !apellido || !fecha_nac || !direcc || !id_categoriaFK) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const insertarJugador = db.prepare(`
            INSERT INTO jugador (dni, nombre, apellido, fecha_nac, direcc, id_categoriaFK)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const resultado = insertarJugador.run(dni, nombre, apellido, fecha_nac, direcc, id_categoriaFK);

        res.json({ message: 'Usuario registrado exitosamente', id: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Ocurrió un error al registrar el usuario' });
    }
});

app.post('/torneo/equipo', (req, res) => {
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

app.get('/equipos/categoria/:id_categoriaFK', (req, res) => {
    const { id_categoriaFK } = req.params;

    try {
        // Consulta para obtener los equipos por categoría
        const consultaEquipos = db.prepare(`
            SELECT * FROM equipo WHERE id_categoriaFK = ?
        `);
        const equipos = consultaEquipos.all(id_categoriaFK);

        // Si no se encuentran equipos
        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos para esta categoría' });
        }

        // Devolver los equipos encontrados
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener equipos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al obtener los equipos' });
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
