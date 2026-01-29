require('dotenv').config();
const app = require('./app');
const db = require('./database');
const appConfig = require('./config/app');
const logger = require('./utils/logger');

const PORT = appConfig.port;

/**
 * Servidor Principal
 * Sistema Integral de Gestión Comercial
 */

/**
 * Función para iniciar el servidor
 */
const startServer = async () => {
  try {
    // ============================================
    // VERIFICAR VARIABLES DE ENTORNO
    // ============================================
    
    logger.info('='.repeat(50));
    logger.info('VERIFICANDO CONFIGURACIÓN');
    logger.info('='.repeat(50));
    logger.info(`NODE_ENV: ${appConfig.env}`);
    logger.info(`PORT: ${PORT}`);
    logger.info(`API_PREFIX: ${appConfig.apiPrefix}`);
    logger.info(`DB_HOST: ${db.sequelize.config.host}`);
    logger.info(`DB_PORT: ${db.sequelize.config.port}`);
    logger.info(`DB_NAME: ${db.sequelize.config.database}`);
    logger.info(`DB_USER: ${db.sequelize.config.username}`);
    logger.info(`DB_DIALECT: ${db.sequelize.options.dialect}`); // ← CORREGIDO
    logger.info('='.repeat(50));
    
    // ============================================
    // VERIFICAR CONEXIÓN A BASE DE DATOS
    // ============================================
    
    logger.info('Verificando conexión a base de datos...');
    
    await db.sequelize.authenticate();
    
    logger.success('✅ Conexión a base de datos establecida correctamente');
    logger.info(`📊 Base de datos: ${db.sequelize.config.database}`);
    logger.info(`🔧 Dialecto: ${db.sequelize.options.dialect}`); // ← CORREGIDO
    logger.info(`🏠 Host: ${db.sequelize.config.host}:${db.sequelize.config.port}`);
    logger.info(`👤 Usuario: ${db.sequelize.config.username}`);

    // ============================================
    // SINCRONIZAR MODELOS (solo en desarrollo)
    // ============================================
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('Verificando sincronización de modelos...');
      // alter: true actualiza las tablas sin borrar datos
      // NOTA: En producción, usar migraciones
      await db.sequelize.sync({ alter: false });
      logger.success('✅ Modelos sincronizados');
    }

    // ============================================
    // INICIAR SERVIDOR HTTP
    // ============================================
    
    const server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.success(`🚀 SERVIDOR INICIADO CORRECTAMENTE`);
      logger.info('='.repeat(50));
      logger.info(`📍 Entorno: ${appConfig.env}`);
      logger.info(`🔌 Puerto: ${PORT}`);
      logger.info(`🔗 URL Base: http://localhost:${PORT}`);
      logger.info(`🔗 API Base: http://localhost:${PORT}${appConfig.apiPrefix}`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`⚙️  Settings: http://localhost:${PORT}${appConfig.apiPrefix}/settings`);
      logger.info('='.repeat(50));
      logger.info('✨ Endpoints disponibles:');
      logger.info(`   GET  ${appConfig.apiPrefix}/settings`);
      logger.info(`   GET  ${appConfig.apiPrefix}/settings/health`);
      logger.info(`   GET  ${appConfig.apiPrefix}/settings/:configType`);
      logger.info(`   PUT  ${appConfig.apiPrefix}/settings`);
      logger.info(`   PUT  ${appConfig.apiPrefix}/settings/:configType`);
      logger.info(`   POST ${appConfig.apiPrefix}/settings/logo`);
      logger.info(`   POST ${appConfig.apiPrefix}/settings/backup/configure`);
      logger.info(`   GET  ${appConfig.apiPrefix}/settings/technical/parameters`);
      logger.info(`   POST ${appConfig.apiPrefix}/settings/:configType/reset`);
      logger.info('='.repeat(50));
      logger.info('💡 Prueba con: curl http://localhost:3000/health');
      logger.info('');
      logger.info('Presiona CTRL+C para detener el servidor');
      logger.info('');
    });

    // ============================================
    // MANEJO DE CIERRE GRACEFUL
    // ============================================
    
    const gracefulShutdown = async (signal) => {
      logger.warn(`\n${signal} recibido. Cerrando servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        
        try {
          await db.sequelize.close();
          logger.info('Conexión a base de datos cerrada');
          logger.success('✅ Servidor cerrado correctamente');
          process.exit(0);
        } catch (error) {
          logger.error('Error al cerrar conexión a base de datos:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('Forzando cierre del servidor...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    logger.error('Stack:', error.stack);
    
    // Mostrar información de debug si hay error de conexión
    if (error.name === 'SequelizeConnectionError') {
      logger.error('');
      logger.error('💡 Verifica que:');
      logger.error('   1. PostgreSQL esté corriendo');
      logger.error('   2. Las credenciales en .env sean correctas');
      logger.error('   3. La base de datos "gestion_comercial" exista');
      logger.error('');
    }
    
    process.exit(1);
  }
};

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection en:', promise);
  logger.error('Razón:', reason);
  // No cerrar el proceso en desarrollo
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Siempre cerrar el proceso en este caso
  process.exit(1);
});

// ============================================
// INICIAR APLICACIÓN
// ============================================

startServer();