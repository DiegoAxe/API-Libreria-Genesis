const express = require('express');
const router = express.Router();
const {
  agregarRecurso,
  editarRecurso,
  eliminarRecurso
} = require('../controllers/docente.controller');

// Ruta para agregar un recurso (POST)
router.post('/', agregarRecurso);

// Ruta para editar un recurso (PUT)
router.put('/:id_recurso', editarRecurso);

// Ruta para eliminar un recurso (DELETE)
router.delete('/:id_recurso', eliminarRecurso);

module.exports = router;