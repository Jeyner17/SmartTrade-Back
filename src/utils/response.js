/**
 * Utilidad para respuestas HTTP estandarizadas
 * Sistema Integral de Gestión Comercial
 */

class ApiResponse {
  /**
   * Respuesta exitosa
   * @param {Object} res - Response de Express
   * @param {*} data - Datos a retornar
   * @param {string} message - Mensaje de éxito
   * @param {number} statusCode - Código HTTP
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Respuesta de error
   * @param {Object} res - Response de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código HTTP
   * @param {*} errors - Errores específicos
   */
  static error(res, message = 'Error en la operación', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  /**
   * Respuesta de creación exitosa
   */
  static created(res, data = null, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta no autorizado
   */
  static unauthorized(res, message = 'No autorizado') {
    return this.error(res, message, 401);
  }

  /**
   * Respuesta prohibido
   */
  static forbidden(res, message = 'Acceso denegado') {
    return this.error(res, message, 403);
  }

  /**
   * Respuesta no encontrado
   */
  static notFound(res, message = 'Recurso no encontrado') {
    return this.error(res, message, 404);
  }

  /**
   * Respuesta de error de validación
   */
  static validationError(res, errors, message = 'Error de validación') {
    return this.error(res, message, 422, errors);
  }

  /**
   * Respuesta de conflicto
   */
  static conflict(res, message = 'Conflicto con el estado actual') {
    return this.error(res, message, 409);
  }
}

module.exports = ApiResponse;