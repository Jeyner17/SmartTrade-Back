const rateLimit = require('express-rate-limit');
const { SECURITY } = require('../shared/constants/auth.constants');
const logger = require('../utils/logger');

/**
 * Middleware de Rate Limiting
 * Sprint 2 - Autenticación y Autorización
 */

/**
 * Rate limiter para intentos de login
 * Limita a 5 intentos por 15 minutos
 */
const loginLimiter = rateLimit({
  windowMs: SECURITY.LOCK_TIME, // 15 minutos
  max: SECURITY.MAX_LOGIN_ATTEMPTS, // 5 intentos
  skipSuccessfulRequests: true, // No contar intentos exitosos
  
  handler: (req, res) => {
    logger.warn('Rate limit excedido en login', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(429).json({
      success: false,
      message: 'Demasiados intentos de inicio de sesión. Por favor intente más tarde.',
      retryAfter: Math.ceil(SECURITY.LOCK_TIME / 1000 / 60) // minutos
    });
  },

  standardHeaders: true,
  legacyHeaders: false
  
  // NO usar keyGenerator personalizado - usar el default que maneja IPv6
});

/**
 * Rate limiter general para API
 * Limita a 100 peticiones por 15 minutos
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones
  
  handler: (req, res) => {
    logger.warn('Rate limit general excedido', {
      ip: req.ip,
      route: req.originalUrl
    });

    return res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones. Por favor intente más tarde.'
    });
  },

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => {
    // No aplicar rate limit en desarrollo si se desea
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  }
});

/**
 * Rate limiter estricto para operaciones sensibles
 * Limita a 3 intentos por hora
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos
  
  handler: (req, res) => {
    logger.warn('Rate limit estricto excedido', {
      ip: req.ip,
      userId: req.user?.id,
      route: req.originalUrl
    });

    return res.status(429).json({
      success: false,
      message: 'Ha excedido el límite de intentos para esta operación. Intente en 1 hora.'
    });
  },

  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para refresh token
 * Limita a 10 intentos por hora
 */
const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 intentos
  
  handler: (req, res) => {
    logger.warn('Rate limit excedido en refresh token', {
      ip: req.ip
    });

    return res.status(429).json({
      success: false,
      message: 'Demasiados intentos de renovación de token. Intente más tarde.'
    });
  },

  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para cambio de contraseña
 * Limita a 3 intentos por hora
 */
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos
  
  handler: (req, res) => {
    logger.warn('Rate limit excedido en cambio de contraseña', {
      userId: req.user?.id
    });

    return res.status(429).json({
      success: false,
      message: 'Demasiados intentos de cambio de contraseña. Intente en 1 hora.'
    });
  },

  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Crear rate limiter personalizado
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware de rate limit
 */
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50,
    message: 'Demasiadas peticiones. Por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false
  };

  const config = { ...defaultOptions, ...options };

  return rateLimit({
    ...config,
    handler: (req, res) => {
      logger.warn('Rate limit personalizado excedido', {
        ip: req.ip,
        userId: req.user?.id,
        route: req.originalUrl,
        limit: config.max,
        window: config.windowMs
      });

      return res.status(429).json({
        success: false,
        message: config.message
      });
    }
  });
};

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter,
  refreshTokenLimiter,
  passwordChangeLimiter,
  createCustomLimiter
};