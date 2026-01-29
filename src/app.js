const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const appConfig = require('./config/app');

// Middlewares globales
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { sanitizeInput, limitPayloadSize } = require('./middlewares/security.middleware');

// Importar rutas
const settingRoutes = require('./modules/settings/routes/setting.routes');

/**
 * Configuración de Express Application
 * Sistema Integral de Gestión Comercial
 */
const app = express();

// ============================================
// SEGURIDAD
// ============================================

// Helmet - Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir servir archivos estáticos
}));

// CORS - Permitir peticiones de otros dominios
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:4200', 'http://localhost:4201'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Limitar peticiones por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

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
    version: '1.0.0'
  });
});

/**
 * GET /
 * Información básica de la API
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Sistema Integral de Gestión Comercial',
    version: '1.0.0',
    description: 'API REST para gestión comercial completa',
    environment: appConfig.env,
    apiPrefix: appConfig.apiPrefix,
    endpoints: {
      health: '/health',
      settings: `${appConfig.apiPrefix}/settings`,
      // TODO: Agregar más endpoints aquí conforme se desarrollen
    }
  });
});

// ============================================
// RUTAS DE LA API
// ============================================

// Módulo: Configuración del Sistema
app.use(`${appConfig.apiPrefix}/settings`, settingRoutes);

// TODO: Agregar más rutas de módulos aquí
// app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
// app.use(`${appConfig.apiPrefix}/users`, userRoutes);
// etc...

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada (404)
app.use(notFound);

// Manejo global de errores
app.use(errorHandler);

module.exports = app;