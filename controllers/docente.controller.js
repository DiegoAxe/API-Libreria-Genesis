const db = require('../db');

// 1- Funcion para agregar un recurso
const agregarRecurso = async (req, res) => {
    try {

        const {
            titulo,
            descripcion,
            tipo,
            enlace,
            imagen
        } = req.body;

        // Validar que ninguno venga vacio
        if (
            !titulo ||
            !descripcion ||
            !tipo ||
            !enlace ||
            !imagen
        ) {
            return res.status(400).json({
                success: false,
                mensaje: "Todos los campos son obligatorios."
            });
        }

        // Crear el recurso en la base de datos
        const [resultado] = await db.query(
            `
            INSERT INTO recursos (
                titulo,
                descripcion,
                tipo,
                enlace,
                imagen
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                titulo,
                descripcion,
                tipo,
                enlace,
                imagen
            ]
        );
              
        // Respuesta a retornar a frontend
        return res.status(201).json({
            success: true,
            mensaje: "Recurso creado correctamente.",
            id_recurso: resultado.insertId,
            recurso: {
                id_recurso: resultado.insertId,
                titulo,
                descripcion,
                tipo,
                enlace,
                imagen
            }
        });

    } catch (error) {

        console.error(
            "Error al crear recurso:",
            error
        );

        return res.status(500).json({
            success: false,
            mensaje: "No se pudo crear el recurso."
        });
    }
};

// 2- Funcion para editar un recurso
const editarRecurso = async (req, res) => {
    const { id_recurso } = req.params;
    
     try {
        const {
            titulo,
            descripcion,
            tipo,
            enlace,
            imagen
        } = req.body;

        // Verificar que el recurso exista
        const [recursos] = await db.query(
            `SELECT id_recurso, titulo, descripcion, tipo, enlace, imagen
             FROM recursos
             WHERE id_recurso = ?`,
            [id_recurso]
        );

        if (recursos.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "El recurso no existe"
            });
        }

        const recurso = recursos[0];

        // Cambiar estado
        await db.query(
            `UPDATE recursos
             SET titulo = ?, descripcion = ?, tipo = ?, enlace = ?, imagen = ?
             WHERE id_recurso = ?`,
            [titulo, descripcion, tipo, enlace, imagen, id_recurso]
        );

        return res.status(200).json({
            success: true,
            mensaje: "Recurso actualizado correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar recurso:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno del servidor"
        });
    }
};


// 3- Funcion para eliminar un recurso
const eliminarRecurso = async (req, res) => {
    const { id_recurso } = req.params;

     try {
        // Verificar que el recurso exista
        const [recursos] = await db.query(
            `SELECT id_recurso, titulo, descripcion, tipo, enlace, imagen
             FROM recursos
             WHERE id_recurso = ?`,
            [id_recurso]
        );

        if (recursos.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "El recurso no existe"
            });
        }

        const recurso = recursos[0];

        // Eliminar el recurso
        await db.query(
            `DELETE FROM recursos
             WHERE id_recurso = ?`,
            [id_recurso]
        );

        return res.status(200).json({
            success: true,
            mensaje: "Recurso eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar recurso:", error);
        return res.status(500).json({
            success: false,
            mensaje: "Error interno del servidor"
        });
    }
};

module.exports = {
    agregarRecurso,
    editarRecurso,
    eliminarRecurso
};