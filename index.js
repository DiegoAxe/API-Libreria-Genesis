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
    const [tablas] = await db.query(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME IN (?, ?, ?, ?)`,
      [
        process.env.DB_NAME,
        'usuarios',
        'recursos',
        'favoritos',
        'estrellas'
      ]
    );

    const tablasEncontradas = tablas.map((tabla) => tabla.TABLE_NAME);
    const tablasFaltantes = [
        'usuarios',
        'recursos',
        'favoritos',
        'estrellas'
    ].filter((tabla) => !tablasEncontradas.includes(tabla));

    if (tablasFaltantes.length > 0) {
      return res.status(503).json({
        ok: false,
        service: 'ap_rest_libreria_genesis',
        database: 'connected',
        tablas_faltantes: tablasFaltantes
      });
    }

    return res.json({
      ok: true,
      service: 'ap_rest_libreria_genesis',
      database: 'connected',
      schema: 'valid'
    });
  } catch (error) {
    console.error('Health check de base de datos falló:', error.message);
    return res.status(503).json({
      ok: false,
      service: 'ap_rest_libreria_genesis',
      database: 'unavailable',
      mensaje: 'No se pudo validar la base de datos'
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