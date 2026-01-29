const { Setting } = require('../../../database');
const {
  CONFIG_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COUNTRIES,
  CURRENCIES,
  TAX_REGIMES,
  BACKUP_FREQUENCIES
} = require('../../../shared/constants/settings.constants');
const { calculateNextBackup } = require('../../../utils/date.util');
const { deleteFile, getFileUrl } = require('../../../utils/file.util');
const logger = require('../../../utils/logger');

/**
 * Servicio de Configuración del Sistema
 * Sprint 1 - Configuración del Sistema
 * 
 * Maneja toda la lógica de negocio relacionada con la configuración
 */
class SettingService {
  /**
   * Obtener toda la configuración del sistema
   * @returns {Promise<Object>} Configuración completa
   */
  async getAllConfiguration() {
    try {
      const settings = await Setting.findAll({
        where: { isActive: true },
        attributes: ['configType', 'configData', 'updatedAt']
      });

      if (!settings || settings.length === 0) {
        throw new Error(ERROR_MESSAGES.CONFIG_NOT_FOUND);
      }

      // Organizar configuración por tipo
      const configuration = {
        company: null,
        fiscal: null,
        business: null,
        technical: null,
        backup: null
      };

      settings.forEach(setting => {
        configuration[setting.configType] = {
          ...setting.configData,
          lastUpdated: setting.updatedAt
        };
      });

      logger.info('Configuración general obtenida exitosamente');
      return configuration;

    } catch (error) {
      logger.error('Error al obtener configuración general:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración por tipo específico
   * @param {string} configType - Tipo de configuración
   * @returns {Promise<Object>}
   */
  async getConfigurationByType(configType) {
    try {
      // Validar tipo
      if (!Object.values(CONFIG_TYPES).includes(configType)) {
        throw new Error(ERROR_MESSAGES.INVALID_CONFIG_TYPE);
      }

      const setting = await Setting.findOne({
        where: {
          configType,
          isActive: true
        }
      });

      if (!setting) {
        throw new Error(ERROR_MESSAGES.CONFIG_NOT_FOUND);
      }

      logger.info(`Configuración de tipo ${configType} obtenida exitosamente`);
      return {
        type: setting.configType,
        data: setting.configData,
        lastUpdated: setting.updatedAt
      };

    } catch (error) {
      logger.error(`Error al obtener configuración de tipo ${configType}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar configuración completa
   * @param {Object} configurationData - Datos de configuración a actualizar
   * @param {number} userId - ID del usuario que realiza la actualización
   * @returns {Promise<Object>} Configuración actualizada
   */
  async updateConfiguration(configurationData, userId = null) {
    try {
      const updatedConfig = {};

      // Actualizar cada tipo de configuración
      for (const [configType, data] of Object.entries(configurationData)) {
        if (Object.values(CONFIG_TYPES).includes(configType) && data) {
          const updated = await this.updateConfigurationByType(
            configType,
            data,
            userId
          );
          updatedConfig[configType] = updated;
        }
      }

      logger.success('Configuración actualizada exitosamente', { userId });
      return updatedConfig;

    } catch (error) {
      logger.error('Error al actualizar configuración:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración por tipo
   * @param {string} configType - Tipo de configuración
   * @param {Object} data - Datos a actualizar
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async updateConfigurationByType(configType, data, userId = null) {
    try {
      // Validar tipo
      if (!Object.values(CONFIG_TYPES).includes(configType)) {
        throw new Error(ERROR_MESSAGES.INVALID_CONFIG_TYPE);
      }

      // Buscar configuración existente
      let setting = await Setting.findOne({
        where: { configType, isActive: true }
      });

      if (!setting) {
        // Crear nueva configuración si no existe
        setting = await Setting.create({
          configType,
          configData: data,
          lastModifiedBy: userId,
          isActive: true
        });
      } else {
        // Actualizar configuración existente
        setting.configData = {
          ...setting.configData,
          ...data
        };
        setting.lastModifiedBy = userId;

        // Validar datos antes de guardar
        const validation = setting.validateConfigData();
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }

        await setting.save();
      }

      // Si es configuración de backup, calcular próximo backup
      if (configType === CONFIG_TYPES.BACKUP && data.enabled) {
        const nextBackup = calculateNextBackup(
          data.frequency || 'daily',
          data.time || '02:00'
        );
        
        setting.configData = {
          ...setting.configData,
          nextBackup: nextBackup.toISOString()
        };
        
        await setting.save();
      }

      logger.info(`Configuración de tipo ${configType} actualizada`, { userId });
      return setting.configData;

    } catch (error) {
      logger.error(`Error al actualizar configuración de tipo ${configType}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar logo de la empresa
   * @param {string} logoPath - Ruta del nuevo logo
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} URL del nuevo logo
   */
  async updateCompanyLogo(logoPath, userId = null) {
    try {
      // Obtener configuración actual de empresa
      const companySetting = await Setting.findOne({
        where: {
          configType: CONFIG_TYPES.COMPANY,
          isActive: true
        }
      });

      if (!companySetting) {
        throw new Error(ERROR_MESSAGES.CONFIG_NOT_FOUND);
      }

      // Eliminar logo anterior si existe
      const oldLogo = companySetting.configData.logo;
      if (oldLogo) {
        await deleteFile(oldLogo);
      }

      // Actualizar con nuevo logo
      const logoUrl = getFileUrl(logoPath);
      companySetting.configData = {
        ...companySetting.configData,
        logo: logoUrl
      };
      companySetting.lastModifiedBy = userId;
      await companySetting.save();

      logger.success('Logo de empresa actualizado exitosamente', { userId });
      return {
        logoUrl,
        message: SUCCESS_MESSAGES.LOGO_UPLOADED
      };

    } catch (error) {
      logger.error('Error al actualizar logo:', error);
      // Si hay error, intentar eliminar el archivo subido
      if (logoPath) {
        await deleteFile(logoPath);
      }
      throw error;
    }
  }

  /**
   * Configurar backups automáticos
   * @param {Object} backupConfig - Configuración de backups
   * @param {boolean} backupConfig.enabled - Habilitar/deshabilitar backups
   * @param {string} backupConfig.frequency - Frecuencia (daily, weekly, monthly)
   * @param {string} backupConfig.time - Hora en formato HH:mm
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Configuración de backup actualizada
   */
  async configureBackups(backupConfig, userId = null) {
    try {
      const { enabled, frequency, time } = backupConfig;

      // Validar frecuencia
      if (frequency && !Object.values(BACKUP_FREQUENCIES).includes(frequency)) {
        throw new Error(ERROR_MESSAGES.INVALID_BACKUP_FREQUENCY);
      }

      // Calcular próximo backup si está habilitado
      let nextBackup = null;
      if (enabled && frequency && time) {
        nextBackup = calculateNextBackup(frequency, time);
      }

      // Actualizar configuración
      const backupData = {
        enabled,
        frequency,
        time,
        nextBackup: nextBackup ? nextBackup.toISOString() : null
      };

      await this.updateConfigurationByType(
        CONFIG_TYPES.BACKUP,
        backupData,
        userId
      );

      logger.success('Configuración de backups actualizada', {
        enabled,
        frequency,
        nextBackup,
        userId
      });

      return {
        ...backupData,
        nextBackup: nextBackup ? nextBackup : null,
        message: SUCCESS_MESSAGES.BACKUP_CONFIGURED
      };

    } catch (error) {
      logger.error('Error al configurar backups:', error);
      throw error;
    }
  }

  /**
   * Obtener parámetros técnicos del sistema
   * @returns {Promise<Object>} Parámetros técnicos
   */
  async getTechnicalParameters() {
    try {
      const setting = await Setting.findOne({
        where: {
          configType: CONFIG_TYPES.TECHNICAL,
          isActive: true
        }
      });

      if (!setting) {
        throw new Error(ERROR_MESSAGES.CONFIG_NOT_FOUND);
      }

      logger.info('Parámetros técnicos obtenidos exitosamente');
      return setting.configData;

    } catch (error) {
      logger.error('Error al obtener parámetros técnicos:', error);
      throw error;
    }
  }

  /**
   * Validar datos de configuración antes de guardar
   * @param {string} configType - Tipo de configuración
   * @param {Object} data - Datos a validar
   * @returns {Object} { isValid: boolean, errors: array }
   */
  validateConfigurationData(configType, data) {
    const errors = [];

    switch (configType) {
      case CONFIG_TYPES.COMPANY:
        if (data.name && data.name.length < 3) {
          errors.push('El nombre de la empresa debe tener al menos 3 caracteres');
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push('Email inválido');
        }
        break;

      case CONFIG_TYPES.FISCAL:
        if (data.country && !Object.keys(COUNTRIES).includes(data.country)) {
          errors.push(ERROR_MESSAGES.INVALID_COUNTRY);
        }
        if (data.currency && !Object.keys(CURRENCIES).includes(data.currency)) {
          errors.push(ERROR_MESSAGES.INVALID_CURRENCY);
        }
        if (data.taxRegime && !Object.values(TAX_REGIMES).includes(data.taxRegime)) {
          errors.push(ERROR_MESSAGES.INVALID_TAX_REGIME);
        }
        if (data.ivaPercentage && (data.ivaPercentage < 0 || data.ivaPercentage > 100)) {
          errors.push('El IVA debe estar entre 0% y 100%');
        }
        break;

      case CONFIG_TYPES.BUSINESS:
        if (data.minStock && data.minStock < 0) {
          errors.push('El stock mínimo no puede ser negativo');
        }
        if (data.defaultCreditDays && data.defaultCreditDays < 0) {
          errors.push('Los días de crédito no pueden ser negativos');
        }
        if (data.maxDiscountPercentage && (data.maxDiscountPercentage < 0 || data.maxDiscountPercentage > 100)) {
          errors.push('El descuento máximo debe estar entre 0% y 100%');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Resetear configuración a valores por defecto
   * @param {string} configType - Tipo de configuración a resetear
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async resetConfiguration(configType, userId = null) {
    try {
      const { DEFAULT_VALUES } = require('../../../shared/constants/settings.constants');
      
      let defaultData = {};
      
      switch (configType) {
        case CONFIG_TYPES.COMPANY:
          defaultData = {
            name: DEFAULT_VALUES.COMPANY_NAME,
            ruc: DEFAULT_VALUES.COMPANY_RUC,
            address: DEFAULT_VALUES.COMPANY_ADDRESS,
            phone: DEFAULT_VALUES.COMPANY_PHONE,
            email: DEFAULT_VALUES.COMPANY_EMAIL,
            logo: DEFAULT_VALUES.COMPANY_LOGO
          };
          break;
        case CONFIG_TYPES.FISCAL:
          defaultData = {
            country: DEFAULT_VALUES.COUNTRY,
            currency: DEFAULT_VALUES.CURRENCY,
            taxRegime: DEFAULT_VALUES.TAX_REGIME,
            ivaPercentage: DEFAULT_VALUES.IVA_PERCENTAGE
          };
          break;
        case CONFIG_TYPES.BUSINESS:
          defaultData = {
            minStock: DEFAULT_VALUES.MIN_STOCK,
            defaultCreditDays: DEFAULT_VALUES.DEFAULT_CREDIT_DAYS,
            maxDiscountPercentage: DEFAULT_VALUES.MAX_DISCOUNT_PERCENTAGE
          };
          break;
        case CONFIG_TYPES.TECHNICAL:
          defaultData = {
            sessionTimeoutMinutes: DEFAULT_VALUES.SESSION_TIMEOUT_MINUTES,
            logRetentionDays: DEFAULT_VALUES.LOG_RETENTION_DAYS,
            dateFormat: DEFAULT_VALUES.DATE_FORMAT,
            timeFormat: DEFAULT_VALUES.TIME_FORMAT
          };
          break;
        case CONFIG_TYPES.BACKUP:
          defaultData = {
            enabled: DEFAULT_VALUES.BACKUP_ENABLED,
            frequency: DEFAULT_VALUES.BACKUP_FREQUENCY,
            time: DEFAULT_VALUES.BACKUP_TIME
          };
          break;
      }

      const updated = await this.updateConfigurationByType(
        configType,
        defaultData,
        userId
      );

      logger.info(`Configuración ${configType} reseteada a valores por defecto`, { userId });
      return updated;

    } catch (error) {
      logger.error(`Error al resetear configuración ${configType}:`, error);
      throw error;
    }
  }
}

module.exports = new SettingService();