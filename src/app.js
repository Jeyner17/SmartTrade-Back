const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Configuraciones
const appConfig = require('./config/app');
const modulesConfig = require('./config/modules.config');
const swaggerSpec = require('./config/swagger');

// Middlewares globales
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { sanitizeInput, limitPayloadSize } = require('./middlewares/security.middleware');
const { apiLimiter } = require('./middlewares/rate-limit.middleware');

// Loaders
const RoutesLoader = require('./loaders/routes.loader');

// Logger
const logger = require('./utils/logger');

/**
 * Configuración de Express Application - MODULAR
 * Sistema Integral de Gestión Comercial
 */
const app = express();

// ============================================
// SEGURIDAD
// ============================================

// Helmet - Headers de seguridad
// CSP desactivado globalmente para permitir Swagger UI (assets inline)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS - Permitir peticiones de otros dominios
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting general
app.use(apiLimiter);

// Limitar tamaño del payload
app.use(limitPayloadSize(10 * 1024 * 1024)); // 10MB

// ============================================
// PARSERS
// ============================================

// Body parser - JSON
app.use(express.json({ limit: '10mb' }));

// Body parser - URL encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitizar inputs
app.use(sanitizeInput);

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================

// Servir archivos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// DOCUMENTACIÓN SWAGGER UI
// ============================================

/**
 * GET /api/docs
 * Documentación interactiva de la API (Swagger UI)
 */
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SmartTrade API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #1a1a2e; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #1a1a2e; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 2
  }
}));

/**
 * GET /api/docs.json
 * Spec OpenAPI en formato JSON (para importar en Postman, Insomnia, etc.)
 */
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ============================================
// RUTAS DE SALUD Y INFO
// ============================================

/**
 * GET /health
 * Health check general de la aplicación
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.env,
    version: '1.0.0',
    database: 'Connected'
  });
});

/**
 * GET /
 * Información básica de la API y documentación
 */
app.get('/', (req, res) => {
  const modulesInfo = RoutesLoader.getModulesInfo(modulesConfig, appConfig.apiPrefix);
  const endpointsDocs = RoutesLoader.generateEndpointsDoc(modulesConfig, appConfig.apiPrefix);

  res.json({
    name: 'Sistema Integral de Gestión Comercial',
    version: '1.0.0',
    description: 'API REST para gestión comercial completa',
    environment: appConfig.env,
    apiPrefix: appConfig.apiPrefix,

    modules: {
      total: modulesInfo.length,
      loaded: modulesInfo
    },

    endpoints: {
      health: '/health',
      documentation: '/api/docs',
      openApiSpec: '/api/docs.json',
      api: appConfig.apiPrefix
    },

    documentation: endpointsDocs,

    quickStart: {
      login: {
        method: 'POST',
        url: `${appConfig.apiPrefix}/auth/login`,
        body: {
          username: 'admin',
          password: 'Admin123'
        }
      },
      getProfile: {
        method: 'GET',
        url: `${appConfig.apiPrefix}/auth/profile`,
        headers: {
          Authorization: 'Bearer <token>'
        }
      }
    }
  });
});

/**
 * GET /api/v1/modules
 * Listar todos los módulos disponibles
 */
app.get(`${appConfig.apiPrefix}/modules`, (req, res) => {
  const modulesInfo = RoutesLoader.getModulesInfo(modulesConfig, appConfig.apiPrefix);

  res.json({
    success: true,
    data: {
      total: modulesInfo.length,
      modules: modulesInfo
    }
  });
});

// ============================================
// CARGAR RUTAS DE MÓDULOS AUTOMÁTICAMENTE
// ============================================

// Cargar todas las rutas de módulos
const loadResult = RoutesLoader.loadModuleRoutes(
  app,
  modulesConfig,
  appConfig.apiPrefix
);

if (loadResult.errors > 0) {
  logger.warn(`⚠️  Se encontraron ${loadResult.errors} errores al cargar módulos`);
}

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada (404)
app.use(notFound);

// Manejo global de errores
app.use(errorHandler);

module.exports = app;
