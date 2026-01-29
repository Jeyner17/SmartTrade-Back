'use strict';

const { DB_SCHEMAS } = require('../../shared/constants/schemas');
const {
  CONFIG_TYPES,
  DEFAULT_VALUES
} = require('../../shared/constants/settings.constants');

/**
 * Seeder: Configuración inicial del sistema
 * Sprint 1 - Configuración del Sistema
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'settings', schema: DB_SCHEMAS.SETTINGS },
      [
        // Configuración de Empresa
        {
          config_type: CONFIG_TYPES.COMPANY,
          config_data: JSON.stringify({
            name: DEFAULT_VALUES.COMPANY_NAME,
            ruc: DEFAULT_VALUES.COMPANY_RUC,
            address: DEFAULT_VALUES.COMPANY_ADDRESS,
            phone: DEFAULT_VALUES.COMPANY_PHONE,
            email: DEFAULT_VALUES.COMPANY_EMAIL,
            logo: DEFAULT_VALUES.COMPANY_LOGO
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        
        // Configuración Fiscal
        {
          config_type: CONFIG_TYPES.FISCAL,
          config_data: JSON.stringify({
            country: DEFAULT_VALUES.COUNTRY,
            currency: DEFAULT_VALUES.CURRENCY,
            taxRegime: DEFAULT_VALUES.TAX_REGIME,
            ivaPercentage: DEFAULT_VALUES.IVA_PERCENTAGE
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        
        // Parámetros de Negocio
        {
          config_type: CONFIG_TYPES.BUSINESS,
          config_data: JSON.stringify({
            minStock: DEFAULT_VALUES.MIN_STOCK,
            defaultCreditDays: DEFAULT_VALUES.DEFAULT_CREDIT_DAYS,
            maxDiscountPercentage: DEFAULT_VALUES.MAX_DISCOUNT_PERCENTAGE
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        
        // Configuración Técnica
        {
          config_type: CONFIG_TYPES.TECHNICAL,
          config_data: JSON.stringify({
            sessionTimeoutMinutes: DEFAULT_VALUES.SESSION_TIMEOUT_MINUTES,
            logRetentionDays: DEFAULT_VALUES.LOG_RETENTION_DAYS,
            dateFormat: DEFAULT_VALUES.DATE_FORMAT,
            timeFormat: DEFAULT_VALUES.TIME_FORMAT
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        
        // Configuración de Backups
        {
          config_type: CONFIG_TYPES.BACKUP,
          config_data: JSON.stringify({
            enabled: DEFAULT_VALUES.BACKUP_ENABLED,
            frequency: DEFAULT_VALUES.BACKUP_FREQUENCY,
            time: DEFAULT_VALUES.BACKUP_TIME,
            nextBackup: null
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'settings', schema: DB_SCHEMAS.SETTINGS },
      null,
      {}
    );
  }
};