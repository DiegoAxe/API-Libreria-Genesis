const db = require('../db');

// 1- Funcion para el login
const login = async (req, res) => {
    try {
        const { nombre_usuario, contrasena } = req.body;

        // Validar que los campos estén presentes
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({
                success: false,
                mensaje: "Por favor, complete todos los campos."
            });
        }

        // Comprobar que el nombre_usuario este registrado
        const [usuarios] = await db.query(
            "SELECT * FROM usuarios WHERE nombre_usuario = ?",
            [nombre_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "El usuario no existe."
            });
        }

        const usuario = usuarios[0];

        // Verificar la contraseña
        if (contrasena !== usuario.contrasena) {
            return res.status(401).json({
                success: false,
                mensaje: "Contraseña incorrecta."
            });
        }

        // Devolver respuesta exitosa
        return res.status(200).json({
            success: true,
            mensaje: "Login exitoso.",
            usuario
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({
            success: false,
            mensaje: "No se pudo iniciar sesión."
        });
    }
};

// 2- Funcion para el registro
const registro = async (req, res) => {
    try {
        const { nombre_usuario, contrasena, rol } = req.body;

        // Validar que los campos estén presentes
        if (!nombre_usuario || !contrasena || !rol) {
            return res.status(400).json({
                success: false,
                mensaje: "Por favor, complete todos los campos."
            });
        }

        // Verificar si el usuario ya existe
        const [usuarioExistente] = await db.query(
            "SELECT * FROM usuarios WHERE nombre_usuario = ?",
            [nombre_usuario]
        );

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                success: false,
                mensaje: "El usuario ya existe."
            });
        }

        // Insertar el nuevo usuario en la base de datos
        const [nuevoUsuario] = await db.query(
            "INSERT INTO usuarios (nombre_usuario, contrasena, rol) VALUES (?, ?, ?)",
            [nombre_usuario, contrasena, rol]
        );

        // Devolver respuesta exitosa
        return res.status(201).json({
            success: true,
            mensaje: "Registro exitoso.",
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({
            success: false,
            mensaje: "No se pudo registrar el usuario."
        });
    }
};

// 3- Funcion para mostrar la Lista de recursos (y tambien para ordenar, filtrar y buscar)
const verListadoRecursos = async (req, res) => {
    try {
        const {
            busqueda = "",
            ordenar = "ASC",
            filtro,
            id_usuario
        } = req.query;

        // Validar los parámetros recibidos
        if (
            typeof busqueda !== "string" ||
            (filtro !== undefined && typeof filtro !== "string") ||
            typeof ordenar !== "string"
        ) {
            return res.status(400).json({
                success: false,
                mensaje: "Los parámetros enviados no son válidos."
            });
        }

        // Validar el ID del usuario
        const idUsuario = Number(id_usuario);
        if (
            !Number.isInteger(idUsuario) ||
            idUsuario <= 0
        ) {
            return res.status(400).json({
                success: false,
                mensaje: "Debe proporcionar un usuario válido."
            });
        }

        // Validar el ordenamiento
        const direccion = ordenar.toUpperCase();

        if (!["ASC", "DESC"].includes(direccion)) {
            return res.status(400).json({
                success: false,
                mensaje: "El orden debe ser ASC o DESC."
            });
        }

        // Construir los filtros
        const condiciones = [];
        const valores = [];

        // Filtrar por tipo de recurso
        if (filtro && filtro.trim()) {
            condiciones.push("r.tipo = ?");
            valores.push(filtro.trim());
        }

        // Buscar por título o tipo
        if (busqueda.trim()) {
            condiciones.push(
                "(r.titulo LIKE ? OR r.tipo LIKE ?)"
            );

            const termino = `%${busqueda.trim()}%`;

            valores.push(termino, termino);
        }

        // Construir WHERE solo si hay condiciones
        const where = condiciones.length > 0
            ? `WHERE ${condiciones.join(" AND ")}`
            : "";

        // Consultar recursos, mi puntaje del recurso, si fue mi favorito y el promedio de estrellas
        const [recursos] = await db.query(
            `
            SELECT
                r.id_recurso,
                r.titulo,
                r.descripcion,
                r.tipo,
                r.enlace,
                r.imagen,

                COALESCE(e.promedio, 0) AS prom_estrellas,

                (
                    SELECT es.puntaje
                    FROM estrellas es
                    WHERE es.id_recurso = r.id_recurso
                    AND es.id_usuario = ?
                    LIMIT 1
                ) AS mi_puntaje,

                EXISTS (
                    SELECT 1
                    FROM favoritos f
                    WHERE f.id_recurso = r.id_recurso
                    AND f.id_usuario = ?
                ) AS favorito

            FROM recursos r

            LEFT JOIN (
                SELECT
                    id_recurso,
                    ROUND(AVG(puntaje), 1) AS promedio
                FROM estrellas
                GROUP BY id_recurso
            ) e ON e.id_recurso = r.id_recurso

            ${where}

            ORDER BY r.titulo ${direccion}
            `,
            [idUsuario, idUsuario, ...valores]
        );

        // Garantizar los tipos esperados por el frontend
        const recursosFormateados = recursos.map(recurso => ({
            ...recurso,
            prom_estrellas: Number(recurso.prom_estrellas),
            mi_puntaje: recurso.mi_puntaje !== null ? Number(recurso.mi_puntaje) : 0,
            favorito: Boolean(recurso.favorito)
        }));

        return res.status(200).json({
            success: true,
            mensaje: "Listado de recursos obtenido correctamente.",
            cantidad: recursosFormateados.length,
            recursos: recursosFormateados
        });

    } catch (error) {
        console.error(
            "Error al obtener el listado de recursos:",
            error
        );

        return res.status(500).json({
            success: false,
            mensaje: "No se pudo obtener el listado de recursos."
        });
    }
};
module.exports = {
    login,
    registro,
    verListadoRecursos
};