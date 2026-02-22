# 📖 CÓMO AGREGAR NUEVOS MÓDULOS

Este documento explica cómo agregar nuevos módulos al sistema de forma rápida y sencilla.

## 🚀 Pasos para Agregar un Nuevo Módulo

### PASO 1: Crear la Estructura del Módulo
```bash
# Crear carpeta del módulo
mkdir -p src/modules/tu-modulo/controllers
mkdir -p src/modules/tu-modulo/services
mkdir -p src/modules/tu-modulo/models
mkdir -p src/modules/tu-modulo/routes
mkdir -p src/modules/tu-modulo/validators
```

### PASO 2: Crear el Archivo de Rutas

Crear `src/modules/tu-modulo/routes/tu-modulo.routes.js`:
```javascript
const express = require('express');
const router = express.Router();

// Controllers
const tuModuloController = require('../controllers/tu-modulo.controller');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');

/**
 * Rutas de Tu Módulo
 * Sprint X - Descripción
 * 
 * Prefix: /api/v1/tu-modulo
 */

router.get(
  '/',
  authMiddleware,
  asyncHandler(tuModuloController.getAll)
);

module.exports = router;
```

### PASO 3: Registrar el Módulo

Abrir `src/config/modules.config.js` y agregar:
```javascript
{
  name: 'tu-modulo',
  route: '/tu-modulo',
  path: '../modules/tu-modulo/routes/tu-modulo.routes',
  enabled: true,
  description: 'Descripción de tu módulo',
  version: '1.0.0',
  sprint: X
}
```

### PASO 4: Reiniciar el Servidor
```bash
npm run dev
```

¡Listo! Tu módulo estará disponible en `/api/v1/tu-modulo`

## 📝 Ejemplo Completo

Para agregar el módulo de Productos (Sprint 6):

1. Crear estructura:
```bash
mkdir -p src/modules/products/{controllers,services,models,routes,validators}
```

2. Crear `src/modules/products/routes/product.routes.js`

3. Agregar a `modules.config.js`:
```javascript
{
  name: 'products',
  route: '/products',
  path: '../modules/products/routes/product.routes',
  enabled: true,
  description: 'Gestión de productos',
  version: '1.0.0',
  sprint: 6
}
```

4. Reiniciar servidor

## ✅ Ventajas de Este Sistema

- ✅ Solo editas UN archivo para agregar módulos
- ✅ Puedes habilitar/deshabilitar módulos fácilmente
- ✅ Carga automática de rutas
- ✅ Documentación automática
- ✅ Logging detallado
- ✅ Escalable y mantenible