const express = require('express');
const router = express.Router();
const {
  marcarFavorito,
  darEstrellas
} = require('../controllers/estudiante.controller');

// Ruta para marcar un favorito (POST)
router.post('/like/', marcarFavorito);

// Ruta para dar estrellas (POST)
router.post('/stars/', darEstrellas);

module.exports = router;