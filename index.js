const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const compartidasRoutes = require('./routes/compartidos.routes');
const docenteRoutes = require('./routes/docente.routes');
const estudianteRoutes = require("./routes/estudiante.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  try {
    // ==========================================
    // 1. Verificar la conexión y la base activa
    // ==========================================
    const [resultadoDB] = await db.query(
      'SELECT DATABASE() AS nombre_base'
    );

    const nombreBase = resultadoDB[0]?.nombre_base;

    if (!nombreBase) {
      return res.status(503).json({
        ok: false,
        service: 'ap_rest_libreria_genesis',
        database: 'unavailable',
        mensaje: 'No hay una base de datos seleccionada en la conexión'
      });
    }

    // ==========================================
    // 2. Verificar las tablas de la base activa
    // ==========================================
    const [tablas] = await db.query(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME IN (?, ?, ?, ?)`,
      [
        'usuarios',
        'recursos',
        'favoritos',
        'estrellas'
      ]
    );

    const tablasEncontradas = tablas.map(
      (tabla) => tabla.TABLE_NAME
    );

    const tablasRequeridas = [
      'usuarios',
      'recursos',
      'favoritos',
      'estrellas'
    ];

    const tablasFaltantes = tablasRequeridas.filter(
      (tabla) => !tablasEncontradas.includes(tabla)
    );

    // ==========================================
    // 3. Informar si faltan tablas
    // ==========================================
    if (tablasFaltantes.length > 0) {
      return res.status(503).json({
        ok: false,
        service: 'ap_rest_libreria_genesis',
        database: 'connected',
        schema: nombreBase,
        tablas_faltantes: tablasFaltantes
      });
    }

    // ==========================================
    // 4. Todo funciona correctamente
    // ==========================================
    return res.json({
      ok: true,
      service: 'ap_rest_libreria_genesis',
      database: 'connected',
      schema: nombreBase,
      schema_status: 'valid'
    });

  } catch (error) {
    // Mostrar el motivo real en los logs de Railway
    console.error('Health check de base de datos falló:', {
      mensaje: error.message,
      codigo: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });

    return res.status(503).json({
      ok: false,
      service: 'ap_rest_libreria_genesis',
      database: 'unavailable',
      mensaje: 'Falló la conexión o la consulta a la base de datos',
      codigo_error: error.code || error.errno || 'UNKNOWN'
    });
  }
});

app.use('/api/compartidas', compartidasRoutes);
app.use('/api/docente', docenteRoutes);
app.use("/api/estudiante", estudianteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor listo y corriendo en puerto: ${PORT}`);
});