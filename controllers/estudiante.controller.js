const db = require('../db');

// 1- Funcion para marcar un recurso como favorito
const marcarFavorito = async (req, res) => {
    try {

        const {
            id_usuario,
            id_recurso
        } = req.body;

        // Validar que ninguno venga vacio
        if (
            !id_usuario ||
            !id_recurso
        ) {
            return res.status(400).json({
                success: false,
                mensaje: "Todos los campos son obligatorios."
            });
        }

        // Verificar si ya fue marcado como favorito
        const [favoritos] = await db.query(
            `SELECT id_favorito
             FROM favoritos
             WHERE id_usuario = ? AND id_recurso = ?`,
            [id_usuario, id_recurso]
        );

        if (favoritos.length > 0) {
            // Si ya existe, se quita de favoritos
            await db.query(
                `DELETE FROM favoritos
                WHERE id_usuario = ? AND id_recurso = ?`,
                [id_usuario, id_recurso]
            );

            return res.status(200).json({
                success: true,
                mensaje: "Favorito desechado correctamente"
            });

        }

        // Crear el favorito en la base de datos
        const [resultado] = await db.query(
            `
            INSERT INTO favoritos (
                id_usuario,
                id_recurso
            )
            VALUES (?, ?)
            `,
            [
                id_usuario,
                id_recurso
            ]
        );
              
        // Respuesta a retornar a frontend
        return res.status(201).json({
            success: true,
            mensaje: "Favorito marcado correctamente.",
            id_favorito: resultado.insertId,
            
        });
             
    } catch (error) {
        console.error(
            "Error al marcar favorito:",
            error
        );
        return res.status(500).json({
            success: false,
            mensaje: "No se pudo marcar el favorito."
        });
    }
};

// 2- Funcion para dar de 1 a 5 estrellas a un recurso
const darEstrellas = async (req, res) => {
    try {

        const {
            id_usuario,
            id_recurso,
            puntaje
        } = req.body;

        // Validar que ninguno venga vacio
        if (
            !id_usuario ||
            !id_recurso ||
            !puntaje
        ) {
            return res.status(400).json({
                success: false,
                mensaje: "Todos los campos son obligatorios."
            });
        }

        // Verificar si previamente ya se le dio estrellas a ese recurso
        const [estrellas] = await db.query(
            `SELECT id_estrella
             FROM estrellas
             WHERE id_usuario = ? AND id_recurso = ?`,
            [id_usuario, id_recurso]
        );

        if (estrellas.length > 0) {
            // Si ya existe, se actualiza el puntaje
            await db.query(
                `UPDATE estrellas
                SET puntaje = ?
                WHERE id_usuario = ? AND id_recurso = ?`,
                [puntaje, id_usuario, id_recurso]
            );

            return res.status(200).json({
                success: true,
                mensaje: "Puntaje actualizado correctamente"
            });
        }

        // Crear el puntaje en la base de datos
        const [resultado] = await db.query(
            `
            INSERT INTO estrellas (
                id_usuario,
                id_recurso,
                puntaje
            )
            VALUES (?, ?, ?)
            `,
            [
                id_usuario,
                id_recurso,
                puntaje
            ]
        );

        return res.status(201).json({
            success: true,
            mensaje: "Puntaje registrado correctamente.",
            id_estrella: resultado.insertId
        });
             
    } catch (error) {
        console.error(
            "Error al dar estrellas:",
            error
        );
        return res.status(500).json({
            success: false,
            mensaje: "No se pudo dar las estrellas."
        });
    }
};


module.exports = {
    marcarFavorito,
    darEstrellas
};