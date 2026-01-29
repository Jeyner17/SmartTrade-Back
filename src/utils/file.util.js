const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { VALIDATION_LIMITS } = require('../shared/constants/settings.constants');

/**
 * Utilidad para manejo de archivos
 * Sprint 1 - Configuración del Sistema
 */

/**
 * Configuración de almacenamiento de multer
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    
    // Crear directorio si no existe
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  
  filename: (req, file, cb) => {
    // Generar nombre único: company-logo-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `company-logo-${uniqueSuffix}${ext}`);
  }
});

/**
 * Filtro para validar tipo de archivo
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = VALIDATION_LIMITS.ALLOWED_LOGO_FORMATS;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Use JPG o PNG'), false);
  }
};

/**
 * Configuración de multer para logo de empresa
 */
const uploadLogo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: VALIDATION_LIMITS.MAX_LOGO_SIZE_MB * 1024 * 1024 // Convertir MB a bytes
  }
});

/**
 * Eliminar archivo del servidor
 * @param {string} filePath - Ruta del archivo a eliminar
 * @returns {Promise<boolean>}
 */
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

/**
 * Obtener URL pública del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL pública
 */
const getFileUrl = (filename) => {
  return `/uploads/logos/${filename}`;
};

/**
 * Validar si un archivo existe
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<boolean>}
 */
const fileExists = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  uploadLogo,
  deleteFile,
  getFileUrl,
  fileExists
};