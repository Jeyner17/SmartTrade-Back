const express = require('express');
const router  = express.Router();

// Controller
const employeeController = require('../controllers/employee.controller');

// Validators
const {
  validate,
  validateGetEmployees,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateLinkUser,
  validateRegisterAttendance,
  validateGetAttendance
} = require('../validators/employee.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const {
  requirePermission,
  requireSuperAdmin
} = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Empleados
 * Sprint 4 - Gestión de Empleados
 *
 * Prefix: /api/v1/employees
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas del módulo
router.use(authMiddleware);

// ============================================
// CRUD DE EMPLEADOS
// ============================================

/**
 * GET /api/v1/employees
 * Listar empleados con paginación y filtros
 * Query: page, limit, search, area, shift, isActive
 */
router.get(
  '/',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.VIEW),
  validateGetEmployees,
  validate,
  asyncHandler(employeeController.getEmployees)
);

/**
 * POST /api/v1/employees
 * Crear nuevo empleado
 */
router.post(
  '/',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.CREATE),
  validateCreateEmployee,
  validate,
  auditLog('CREATE_EMPLOYEE'),
  asyncHandler(employeeController.createEmployee)
);

/**
 * GET /api/v1/employees/:id
 * Obtener detalle completo de un empleado
 */
router.get(
  '/:id',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.VIEW),
  asyncHandler(employeeController.getEmployeeById)
);

/**
 * PUT /api/v1/employees/:id
 * Actualizar datos de un empleado
 */
router.put(
  '/:id',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.EDIT),
  validateUpdateEmployee,
  validate,
  auditLog('UPDATE_EMPLOYEE'),
  asyncHandler(employeeController.updateEmployee)
);

/**
 * DELETE /api/v1/employees/:id
 * Eliminar empleado (soft delete)
 */
router.delete(
  '/:id',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.DELETE),
  auditLog('DELETE_EMPLOYEE'),
  asyncHandler(employeeController.deleteEmployee)
);

// ============================================
// VINCULACIÓN CON USUARIO DEL SISTEMA
// ============================================

/**
 * PATCH /api/v1/employees/:id/link-user
 * Vincular o desvincular un usuario del sistema con el empleado
 * Body: { userId: number | null }
 * userId = null  →  desvincular
 */
router.patch(
  '/:id/link-user',
  requireSuperAdmin,
  validateLinkUser,
  validate,
  auditLog('LINK_EMPLOYEE_USER'),
  asyncHandler(employeeController.linkUser)
);

// ============================================
// ASISTENCIA
// ============================================

/**
 * GET /api/v1/employees/:id/attendance/today
 * Estado de asistencia del día (absent / present / completed)
 * IMPORTANTE: definir antes de /:id/attendance para evitar conflicto de ruta
 */
router.get(
  '/:id/attendance/today',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.VIEW),
  asyncHandler(employeeController.getTodayStatus)
);

/**
 * GET /api/v1/employees/:id/attendance
 * Historial de asistencia con paginación y filtro por fechas
 * Query: startDate, endDate, page, limit
 */
router.get(
  '/:id/attendance',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.VIEW),
  validateGetAttendance,
  validate,
  asyncHandler(employeeController.getAttendanceHistory)
);

/**
 * POST /api/v1/employees/:id/attendance
 * Registrar entrada o salida
 * Body: { type: 'entry' | 'exit', notes? }
 */
router.post(
  '/:id/attendance',
  requirePermission(MODULES.EMPLOYEES, ACTIONS.EDIT),
  validateRegisterAttendance,
  validate,
  auditLog('REGISTER_ATTENDANCE'),
  asyncHandler(employeeController.registerAttendance)
);

module.exports = router;
