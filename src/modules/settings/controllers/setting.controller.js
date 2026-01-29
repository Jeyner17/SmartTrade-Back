const settingService = require('../services/setting.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');
const {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} = require('../../../shared/constants/settings.constants');

/**
 * Controller de Configuración del Sistema
 * Sprint 1 - Configuración del Sistema
 * 
 * Maneja las peticiones HTTP y delega la lógica al servicio
 */
class SettingController {
  /**
   * GET /api/v1/settings
   * Obtener toda la configuración del sistema
   */
  async getAllConfiguration(req, res) {
    try {
      const configuration = await settingService.getAllConfiguration();

      return ApiResponse.success(
        res,
        configuration,
        SUCCESS_MESSAGES.CONFIG_RETRIEVED
      );

    } catch (error) {
      logger.error('Error en getAllConfiguration controller:', error);

      if (error.message.includes('no encontrada')) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(
        res,
        'Error al obtener la configuración del sistema'
      );
    }
  }

  /**
   * GET /api/v1/settings/:configType
   * Obtener configuración por tipo específico
   */
  async getConfigurationByType(req, res) {
    try {
      const { configType } = req.params;

      const configuration = await settingService.getConfigurationByType(configType);

      return ApiResponse.success(
        res,
        configuration,
        SUCCESS_MESSAGES.CONFIG_RETRIEVED
      );

    } catch (error) {
      logger.error('Error en getConfigurationByType controller:', error);

      if (error.message.includes(ERROR_MESSAGES.INVALID_CONFIG_TYPE)) {
        return ApiResponse.validationError(
          res,
          [{ field: 'configType', message: error.message }],
          error.message
        );
      }

      if (error.message.includes('no encontrada')) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(
        res,
        'Error al obtener la configuración'
      );
    }
  }

  /**
   * PUT /api/v1/settings
   * Actualizar configuración completa del sistema
   */
  async updateConfiguration(req, res) {
    try {
      const configurationData = req.body;
      const userId = req.user?.id || null;

      const updatedConfig = await settingService.updateConfiguration(
        configurationData,
        userId
      );

      return ApiResponse.success(
        res,
        updatedConfig,
        SUCCESS_MESSAGES.CONFIG_UPDATED
      );

    } catch (error) {
      logger.error('Error en updateConfiguration controller:', error);

      if (error.message.includes('no válido') || error.message.includes('inválid')) {
        return ApiResponse.validationError(
          res,
          [{ message: error.message }],
          'Error de validación en los datos'
        );
      }

      if (error.message.includes('no encontrada')) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(
        res,
        ERROR_MESSAGES.UPDATE_FAILED
      );
    }
  }

  /**
   * PUT /api/v1/settings/:configType
   * Actualizar configuración por tipo específico
   */
  async updateConfigurationByType(req, res) {
    try {
      const { configType } = req.params;
      const data = req.body;
      const userId = req.user?.id || null;

      const updatedConfig = await settingService.updateConfigurationByType(
        configType,
        data,
        userId
      );

      return ApiResponse.success(
        res,
        updatedConfig,
        SUCCESS_MESSAGES.CONFIG_UPDATED
      );

    } catch (error) {
      logger.error('Error en updateConfigurationByType controller:', error);

      if (error.message.includes(ERROR_MESSAGES.INVALID_CONFIG_TYPE)) {
        return ApiResponse.validationError(
          res,
          [{ field: 'configType', message: error.message }],
          error.message
        );
      }

      if (error.message.includes('no válido') || error.message.includes('inválid')) {
        return ApiResponse.validationError(
          res,
          [{ message: error.message }],
          'Error de validación en los datos'
        );
      }

      return ApiResponse.error(
        res,
        ERROR_MESSAGES.UPDATE_FAILED
      );
    }
  }

  /**
   * POST /api/v1/settings/logo
   * Subir logo de la empresa
   */
  async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return ApiResponse.validationError(
          res,
          [{ field: 'logo', message: 'No se proporcionó ningún archivo' }],
          'Archivo de logo requerido'
        );
      }

      const userId = req.user?.id || null;
      const logoPath = req.file.filename;

      const result = await settingService.updateCompanyLogo(logoPath, userId);

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.LOGO_UPLOADED
      );

    } catch (error) {
      logger.error('Error en uploadLogo controller:', error);

      if (error.message.includes('demasiado grande')) {
        return ApiResponse.validationError(
          res,
          [{ field: 'logo', message: ERROR_MESSAGES.LOGO_TOO_LARGE }],
          ERROR_MESSAGES.LOGO_TOO_LARGE
        );
      }

      if (error.message.includes('formato')) {
        return ApiResponse.validationError(
          res,
          [{ field: 'logo', message: ERROR_MESSAGES.INVALID_LOGO_FORMAT }],
          ERROR_MESSAGES.INVALID_LOGO_FORMAT
        );
      }

      return ApiResponse.error(
        res,
        'Error al subir el logo'
      );
    }
  }

  /**
   * POST /api/v1/settings/backup/configure
   * Configurar backups automáticos
   */
  async configureBackups(req, res) {
    try {
      const backupConfig = req.body;
      const userId = req.user?.id || null;

      const result = await settingService.configureBackups(backupConfig, userId);

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.BACKUP_CONFIGURED
      );

    } catch (error) {
      logger.error('Error en configureBackups controller:', error);

      if (error.message.includes(ERROR_MESSAGES.INVALID_BACKUP_FREQUENCY)) {
        return ApiResponse.validationError(
          res,
          [{ field: 'frequency', message: error.message }],
          error.message
        );
      }

      if (error.message.includes('no válido') || error.message.includes('inválid')) {
        return ApiResponse.validationError(
          res,
          [{ message: error.message }],
          'Error de validación en los datos de backup'
        );
      }

      return ApiResponse.error(
        res,
        'Error al configurar los backups'
      );
    }
  }

  /**
   * GET /api/v1/settings/technical/parameters
   * Obtener parámetros técnicos del sistema
   */
  async getTechnicalParameters(req, res) {
    try {
      const parameters = await settingService.getTechnicalParameters();

      return ApiResponse.success(
        res,
        parameters,
        SUCCESS_MESSAGES.CONFIG_RETRIEVED
      );

    } catch (error) {
      logger.error('Error en getTechnicalParameters controller:', error);

      if (error.message.includes('no encontrada')) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(
        res,
        'Error al obtener los parámetros técnicos'
      );
    }
  }

  /**
   * POST /api/v1/settings/:configType/reset
   * Resetear configuración a valores por defecto
   */
  async resetConfiguration(req, res) {
    try {
      const { configType } = req.params;
      const userId = req.user?.id || null;

      const result = await settingService.resetConfiguration(configType, userId);

      return ApiResponse.success(
        res,
        result,
        `Configuración de ${configType} reseteada a valores por defecto`
      );

    } catch (error) {
      logger.error('Error en resetConfiguration controller:', error);

      if (error.message.includes(ERROR_MESSAGES.INVALID_CONFIG_TYPE)) {
        return ApiResponse.validationError(
          res,
          [{ field: 'configType', message: error.message }],
          error.message
        );
      }

      return ApiResponse.error(
        res,
        'Error al resetear la configuración'
      );
    }
  }

  /**
   * GET /api/v1/settings/health
   * Health check endpoint para verificar que el módulo funciona
   */
  async healthCheck(req, res) {
    try {
      // Verificar que podemos acceder a la BD
      const config = await settingService.getAllConfiguration();

      return ApiResponse.success(
        res,
        {
          status: 'healthy',
          module: 'settings',
          timestamp: new Date().toISOString(),
          configTypes: Object.keys(config)
        },
        'Módulo de configuración funcionando correctamente'
      );

    } catch (error) {
      logger.error('Error en healthCheck controller:', error);

      return ApiResponse.error(
        res,
        'El módulo de configuración no está funcionando correctamente',
        503
      );
    }
  }
}

module.exports = new SettingController();