require('dotenv').config();
const app = require('./app');
const db = require('./database');
const appConfig = require('./config/app');
const modulesConfig = require('./config/modules.config');
const logger = require('./utils/logger');

const PORT = appConfig.port;

/**
 * Servidor Principal - MODULAR
 * Sistema Integral de Gestión Comercial
 */

/**
 * Verificar estado de la base de datos
 */
const checkDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar a la base de datos:', error.message);
    return false;
  }
};

/**
 * Sincronizar modelos (solo en desarrollo)
 */
const syncModels = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await db.sequelize.sync({ alter: false });
    } catch (error) {
      logger.error('❌ Error al sincronizar modelos:', error.message);
      throw error;
    }
  }
};

/**
 * Mostrar información de módulos cargados
 */
// (funciones de display eliminadas - output simplificado)

/**
 * Función principal para iniciar el servidor
 */
const startServer = async () => {
  try {
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }

    await syncModels();

    const server = app.listen(PORT, () => {
      logger.success(`🚀 SmartTrade API corriendo en http://localhost:${PORT}${appConfig.apiPrefix}`);
    });

    // ============================================
    // MANEJO DE CIERRE GRACEFUL
    // ============================================

    const gracefulShutdown = async (signal) => {
      server.close(async () => {
        try {
          await db.sequelize.close();
          logger.info('👋 Servidor detenido');
          process.exit(0);
        } catch (error) {
          process.exit(1);
        }
      });
      setTimeout(() => process.exit(1), 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('');
    logger.error('═'.repeat(60));
    logger.error('  ❌ ERROR CRÍTICO AL INICIAR EL SERVIDOR');
    logger.error('═'.repeat(60));
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    logger.error('═'.repeat(60));
    logger.error('');
    process.exit(1);
  }
};

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('');
  logger.error('⚠️  UNHANDLED REJECTION DETECTADO:');
  logger.error('Promise:', promise);
  logger.error('Razón:', reason);
  logger.error('');

  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('');
  logger.error('⚠️  UNCAUGHT EXCEPTION DETECTADO:');
  logger.error('Error:', error.message);
  logger.error('Stack:', error.stack);
  logger.error('');
  process.exit(1);
});

// ============================================
// INICIAR APLICACIÓN
// ============================================

startServer();