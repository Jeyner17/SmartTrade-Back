const logger = require('../utils/logger');

/**
 * Loader de Rutas Modular
 * Sistema Integral de Gestión Comercial
 * 
 * Carga automáticamente todas las rutas de los módulos habilitados
 */
class RoutesLoader {
  /**
   * Cargar todas las rutas de módulos
   * @param {Express} app - Aplicación Express
   * @param {Array} modules - Configuración de módulos
   * @param {string} apiPrefix - Prefijo de la API
   */
  static loadModuleRoutes(app, modules, apiPrefix) {
    logger.info('🔄 Iniciando carga de módulos...');

    let loadedCount = 0;
    let disabledCount = 0;
    let errorCount = 0;

    modules.forEach(module => {
      // Verificar si el módulo está habilitado
      if (!module.enabled) {
        logger.debug(`⏸️  Módulo deshabilitado: ${module.name}`, {
          sprint: module.sprint,
          version: module.version
        });
        disabledCount++;
        return;
      }

      try {
        // Cargar el archivo de rutas
        const routes = require(module.path);

        // Registrar las rutas con el prefijo
        const fullRoute = `${apiPrefix}${module.route}`;
        app.use(fullRoute, routes);

        logger.success(`✅ Módulo cargado: ${module.name}`, {
          route: fullRoute,
          description: module.description,
          sprint: module.sprint,
          version: module.version,
          public: module.public || false
        });

        loadedCount++;

      } catch (error) {
        logger.error(`❌ Error al cargar módulo: ${module.name}`, {
          error: error.message,
          path: module.path
        });
        errorCount++;
      }
    });

    // Resumen de carga
    logger.info('📊 Resumen de carga de módulos:', {
      total: modules.length,
      cargados: loadedCount,
      deshabilitados: disabledCount,
      errores: errorCount
    });

    return {
      total: modules.length,
      loaded: loadedCount,
      disabled: disabledCount,
      errors: errorCount
    };
  }

  /**
   * Obtener información de módulos cargados
   * @param {Array} modules - Configuración de módulos
   * @param {string} apiPrefix - Prefijo de la API
   * @returns {Array} Lista de módulos habilitados
   */
  static getModulesInfo(modules, apiPrefix) {
    return modules
      .filter(m => m.enabled)
      .map(m => ({
        name: m.name,
        route: `${apiPrefix}${m.route}`,
        description: m.description,
        version: m.version,
        sprint: m.sprint,
        public: m.public || false
      }));
  }

  /**
   * Generar documentación automática de endpoints
   * @param {Array} modules - Configuración de módulos
   * @param {string} apiPrefix - Prefijo de la API
   * @returns {Object} Documentación de endpoints
   */
  static generateEndpointsDoc(modules, apiPrefix) {
    const docs = {};

    modules
      .filter(m => m.enabled)
      .forEach(m => {
        docs[m.name] = {
          baseRoute: `${apiPrefix}${m.route}`,
          description: m.description,
          version: m.version,
          sprint: m.sprint,
          documentation: `Ver endpoints disponibles en ${apiPrefix}${m.route}`
        };
      });

    return docs;
  }
}

module.exports = RoutesLoader;