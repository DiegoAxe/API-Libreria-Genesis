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
        const [usuario] = await db.query(
            "SELECT * FROM usuarios WHERE nombre_usuario = ?",
            [nombre_usuario]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "El usuario no existe."
            });
        }

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

// 3- Funcion para mostrar la Lista de recursos
const verListadoRecursos = async (req, res) => {
    try {
        const {
            busqueda = "",
            ordenar = "ASC",
            filtro
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

        // Validar el ordenamiento
        const direccion = ordenar.toUpperCase();

        if (!["ASC", "DESC"].includes(direccion)) {
            return res.status(400).json({
                success: false,
                mensaje: "El orden debe ser ASC o DESC."
            });
        }

        // Construir las condiciones de búsqueda
        const condiciones = [];
        const valores = [];

        // Filtrar por tipo de recurso
        if (filtro && filtro.trim()) {
            condiciones.push("tipo = ?");
            valores.push(filtro.trim());
        }

        // Buscar por título o tipo
        if (busqueda.trim()) {
            condiciones.push(
                "(titulo LIKE ? OR tipo LIKE ?)"
            );

            const termino = `%${busqueda.trim()}%`;

            valores.push(termino, termino);
        }

        // Agregar WHERE únicamente si existen filtros
        const where = condiciones.length > 0
            ? `WHERE ${condiciones.join(" AND ")}`
            : "";

        // Consultar recursos
        const [recursos] = await db.query(
            `
            SELECT *
            FROM recursos
            ${where}
            ORDER BY titulo ${direccion}
            `,
            valores
        );

        return res.status(200).json({
            success: true,
            mensaje: "Listado de recursos obtenido correctamente.",
            cantidad: recursos.length,
            recursos
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