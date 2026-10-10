CREATE DATABASE IF NOT EXISTS libreria_genesis;
USE libreria_genesis;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	rol VARCHAR(50) NOT NULL
);

-- Tabla de recursos
CREATE TABLE recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(100) NOT NULL,
    enlace VARCHAR(255) NOT NULL,
    imagen VARCHAR(255) NOT NULL
);

-- Tabla de favoritos
CREATE TABLE favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_recurso INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_recurso) REFERENCES recursos(id_recurso)
);

-- Tabla de estrellas
CREATE TABLE estrellas (
    id_estrella INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_recurso INT NOT NULL,
    puntaje INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_recurso) REFERENCES recursos(id_recurso)
);
