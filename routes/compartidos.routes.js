const express = require('express');
const router = express.Router();
const {
    login,
    registro,
    verListadoRecursos
} = require('../controllers/compartidos.controller');

// Ruta para hacer login (POST)
router.post('/login/', login);

// Ruta para hacer registro (POST)
router.post('/registro/', registro);

// Ruta para devolver el listado de recursos (GET)
router.get('/', verListadoRecursos);

module.exports = router;