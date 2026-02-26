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
    logger.success('✅ Conexión a base de datos establecida');
    logger.info(`📊 Base de datos: ${db.sequelize.config.database}`);
    logger.info(`🔧 Dialecto: ${db.sequelize.config.dialect}`);
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar a la base de datos:', error);
    return false;
  }
};

/**
 * Sincronizar modelos (solo en desarrollo)
 */
const syncModels = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      logger.info('🔄 Verificando sincronización de modelos...');
      await db.sequelize.sync({ alter: false });
      logger.success('✅ Modelos sincronizados');
    } catch (error) {
      logger.error('❌ Error al sincronizar modelos:', error);
      throw error;
    }
  }
};

/**
 * Mostrar información de módulos cargados
 */
const displayModulesInfo = () => {
  const enabledModules = modulesConfig.filter(m => m.enabled);
  const disabledModules = modulesConfig.filter(m => !m.enabled);

  logger.info('');
  logger.info('📦 MÓDULOS CARGADOS:');
  logger.info('─'.repeat(60));

  enabledModules.forEach(module => {
    logger.info(`  ✅ ${module.name.padEnd(15)} | Sprint ${module.sprint} | ${appConfig.apiPrefix}${module.route}`);
  });

  if (disabledModules.length > 0) {
    logger.info('');
    logger.info('⏸️  MÓDULOS DESHABILITADOS:');
    logger.info('─'.repeat(60));
    disabledModules.forEach(module => {
      logger.debug(`  ⏸️  ${module.name.padEnd(15)} | Sprint ${module.sprint} | ${module.description}`);
    });
  }

  logger.info('─'.repeat(60));
};

/**
 * Mostrar información del servidor
 */
const displayServerInfo = () => {
  logger.info('');
  logger.info('🌐 SERVIDOR ACTIVO:');
  logger.info('─'.repeat(60));
  logger.info(`  🔗 URL Base:          http://localhost:${PORT}`);
  logger.info(`  🔗 API Base:          http://localhost:${PORT}${appConfig.apiPrefix}`);
  logger.info(`  🏥 Health Check:      http://localhost:${PORT}/health`);
  logger.info(`  📚 Documentación:     http://localhost:${PORT}/`);
  logger.info(`  📖 Swagger UI:        http://localhost:${PORT}/api/docs`);
  logger.info(`  📦 Módulos Info:      http://localhost:${PORT}${appConfig.apiPrefix}/modules`);
  logger.info(`  📍 Entorno:           ${appConfig.env}`);
  logger.info('─'.repeat(60));
  logger.info('');
  logger.success('✨ Sistema listo para recibir peticiones');
  logger.info('💡 Presiona CTRL+C para detener el servidor');
  logger.info('');
};

/**
 * Función principal para iniciar el servidor
 */
const startServer = async () => {
  try {
    logger.info('');
    logger.info('═'.repeat(60));
    logger.info('  SISTEMA INTEGRAL DE GESTIÓN COMERCIAL');
    logger.info('  Versión 1.0.0');
    logger.info('═'.repeat(60));
    logger.info('');

    // ============================================
    // VERIFICAR CONEXIÓN A BASE DE DATOS
    // ============================================
    
    logger.info('🔍 Verificando conexión a base de datos...');
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }

    // ============================================
    // SINCRONIZAR MODELOS
    // ============================================
    
    await syncModels();

    // ============================================
    // INICIAR SERVIDOR HTTP
    // ============================================
    
    const server = app.listen(PORT, () => {
      logger.success(`🚀 Servidor HTTP iniciado en puerto ${PORT}`);
      
      // Mostrar información de módulos
      displayModulesInfo();
      // Mostrar información del servidor
      displayServerInfo();
    });

    // ============================================
    // MANEJO DE CIERRE GRACEFUL
    // ============================================
    
    const gracefulShutdown = async (signal) => {
      logger.warn('');
      logger.warn('═'.repeat(60));
      logger.warn(`  ${signal} recibido - Iniciando cierre graceful`);
      logger.warn('═'.repeat(60));
      
      server.close(async () => {
        logger.info('✅ Servidor HTTP cerrado');
        
        try {
          await db.sequelize.close();
          logger.info('✅ Conexión a base de datos cerrada');
          logger.success('✅ Sistema cerrado correctamente');
          logger.info('');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error al cerrar conexión a base de datos:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('⚠️  Tiempo de espera excedido, forzando cierre...');
        process.exit(1);
      }, 10000);
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