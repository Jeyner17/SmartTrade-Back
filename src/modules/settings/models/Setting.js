const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const {
  CONFIG_TYPES,
  COUNTRIES,
  CURRENCIES,
  TAX_REGIMES,
  BACKUP_FREQUENCIES,
  DATE_FORMATS,
  TIME_FORMATS,
  VALIDATION_LIMITS
} = require('../../../shared/constants/settings.constants');


/**
 * Modelo Setting - Configuración del Sistema
 * Tabla: settings.settings
 * Sprint 1 - Configuración del Sistema
 * 
 * Almacena toda la configuración del sistema en formato JSON
 * organizada por tipo (empresa, fiscal, negocio, técnico, backup)
 */
module.exports = (sequelize) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único de la configuración'
    },
    
    configType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'config_type',
      validate: {
        notEmpty: {
          msg: 'El tipo de configuración es requerido'
        },
        isIn: {
          args: [Object.values(CONFIG_TYPES)],
          msg: 'Tipo de configuración no válido'
        }
      },
      comment: 'Tipo de configuración (company, fiscal, business, technical, backup)'
    },
    
    configData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'config_data',
      comment: 'Datos de configuración en formato JSON'
    },
    
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si la configuración está activa'
    },
    
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'last_modified_by',
      comment: 'ID del usuario que modificó por última vez'
    }
  }, {
    tableName: 'settings',
    schema: DB_SCHEMAS.SETTINGS,
    timestamps: true,
    underscored: true,
    
    indexes: [
      {
        unique: true,
        fields: ['config_type'],
        name: 'settings_config_type_unique'
      },
      {
        fields: ['is_active'],
        name: 'settings_is_active_idx'
      }
    ],
    
    comment: 'Tabla de configuración del sistema'
  });

  /**
   * Método de instancia: Obtener valor específico de la configuración
   * @param {string} key - Clave del valor a obtener
   * @returns {*} Valor de la configuración
   */
  Setting.prototype.getValue = function(key) {
    return this.configData[key];
  };

  /**
   * Método de instancia: Establecer valor específico de la configuración
   * @param {string} key - Clave del valor
   * @param {*} value - Valor a establecer
   */
  Setting.prototype.setValue = function(key, value) {
    this.configData = {
      ...this.configData,
      [key]: value
    };
  };

  /**
   * Método de instancia: Validar datos según el tipo de configuración
   * @returns {Object} { isValid: boolean, errors: array }
   */
  Setting.prototype.validateConfigData = function() {
    const errors = [];
    const data = this.configData;

    switch (this.configType) {
      case CONFIG_TYPES.COMPANY:
        if (data.name && data.name.length < VALIDATION_LIMITS.COMPANY_NAME_MIN) {
          errors.push(`El nombre debe tener al menos ${VALIDATION_LIMITS.COMPANY_NAME_MIN} caracteres`);
        }
        if (data.ruc && (data.ruc.length < VALIDATION_LIMITS.RUC_MIN || data.ruc.length > VALIDATION_LIMITS.RUC_MAX)) {
          errors.push(`El RUC debe tener entre ${VALIDATION_LIMITS.RUC_MIN} y ${VALIDATION_LIMITS.RUC_MAX} caracteres`);
        }
        break;

      case CONFIG_TYPES.FISCAL:
        if (data.country && !Object.keys(COUNTRIES).includes(data.country)) {
          errors.push('País no válido');
        }
        if (data.currency && !Object.keys(CURRENCIES).includes(data.currency)) {
          errors.push('Moneda no válida');
        }
        if (data.ivaPercentage && (data.ivaPercentage < VALIDATION_LIMITS.IVA_MIN || data.ivaPercentage > VALIDATION_LIMITS.IVA_MAX)) {
          errors.push(`El IVA debe estar entre ${VALIDATION_LIMITS.IVA_MIN}% y ${VALIDATION_LIMITS.IVA_MAX}%`);
        }
        break;

      case CONFIG_TYPES.BUSINESS:
        if (data.minStock && (data.minStock < VALIDATION_LIMITS.MIN_STOCK_MIN || data.minStock > VALIDATION_LIMITS.MIN_STOCK_MAX)) {
          errors.push(`El stock mínimo debe estar entre ${VALIDATION_LIMITS.MIN_STOCK_MIN} y ${VALIDATION_LIMITS.MIN_STOCK_MAX}`);
        }
        if (data.defaultCreditDays && (data.defaultCreditDays < VALIDATION_LIMITS.CREDIT_DAYS_MIN || data.defaultCreditDays > VALIDATION_LIMITS.CREDIT_DAYS_MAX)) {
          errors.push(`Los días de crédito deben estar entre ${VALIDATION_LIMITS.CREDIT_DAYS_MIN} y ${VALIDATION_LIMITS.CREDIT_DAYS_MAX}`);
        }
        if (data.maxDiscountPercentage && (data.maxDiscountPercentage < VALIDATION_LIMITS.MAX_DISCOUNT_MIN || data.maxDiscountPercentage > VALIDATION_LIMITS.MAX_DISCOUNT_MAX)) {
          errors.push(`El descuento máximo debe estar entre ${VALIDATION_LIMITS.MAX_DISCOUNT_MIN}% y ${VALIDATION_LIMITS.MAX_DISCOUNT_MAX}%`);
        }
        break;

      case CONFIG_TYPES.BACKUP:
        if (data.frequency && !Object.values(BACKUP_FREQUENCIES).includes(data.frequency)) {
          errors.push('Frecuencia de backup no válida');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Método de clase: Obtener configuración por tipo
   * @param {string} configType - Tipo de configuración
   * @returns {Promise<Setting>}
   */
  Setting.getByType = async function(configType) {
    return await this.findOne({
      where: {
        configType,
        isActive: true
      }
    });
  };

  /**
   * Método de clase: Obtener toda la configuración del sistema
   * @returns {Promise<Object>} Objeto con todas las configuraciones
   */
  Setting.getAllConfig = async function() {
    const settings = await this.findAll({
      where: { isActive: true }
    });

    const config = {};
    settings.forEach(setting => {
      config[setting.configType] = setting.configData;
    });

    return config;
  };

  return Setting;
};