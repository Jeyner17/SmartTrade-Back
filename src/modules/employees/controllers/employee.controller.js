const employeeService  = require('../services/employee.service');
const attendanceService = require('../services/attendance.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERR = {
  NOT_FOUND:   'Empleado no encontrado',
  DOC_IN_USE:  'El número de documento ya está registrado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_LINKED: 'El usuario ya está vinculado a otro empleado'
};

/**
 * Controller de Gestión de Empleados
 * Sprint 4 - Gestión de Empleados
 */
class EmployeeController {

  // ============================================
  // CRUD DE EMPLEADOS
  // ============================================

  /**
   * GET /api/v1/employees
   */
  async getEmployees(req, res) {
    try {
      const { page, limit, search, area, shift, isActive } = req.query;

      const result = await employeeService.getEmployees({
        page:     parseInt(page)  || 1,
        limit:    parseInt(limit) || 10,
        search:   search   || undefined,
        area:     area     || undefined,
        shift:    shift    || undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      });

      return ApiResponse.success(res, result, 'Empleados obtenidos exitosamente');

    } catch (error) {
      logger.error('Error en getEmployees:', error);
      return ApiResponse.error(res, 'Error al obtener empleados');
    }
  }

  /**
   * GET /api/v1/employees/:id
   */
  async getEmployeeById(req, res) {
    try {
      const employee = await employeeService.getEmployeeById(parseInt(req.params.id));
      return ApiResponse.success(res, employee, 'Empleado obtenido exitosamente');

    } catch (error) {
      logger.error('Error en getEmployeeById:', error);

      if (error.message === ERR.NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al obtener empleado');
    }
  }

  /**
   * POST /api/v1/employees
   */
  async createEmployee(req, res) {
    try {
      const employee = await employeeService.createEmployee(req.body, req.user.id);
      return ApiResponse.created(res, employee, 'Empleado creado exitosamente');

    } catch (error) {
      logger.error('Error en createEmployee:', error);

      if (error.message === ERR.DOC_IN_USE) {
        return ApiResponse.conflict(res, error.message);
      }

      if (error.message === ERR.USER_NOT_FOUND) {
        return ApiResponse.validationError(res, [{ field: 'userId', message: error.message }], error.message);
      }

      if (error.message === ERR.USER_LINKED) {
        return ApiResponse.conflict(res, error.message);
      }

      return ApiResponse.error(res, 'Error al crear empleado');
    }
  }

  /**
   * PUT /api/v1/employees/:id
   */
  async updateEmployee(req, res) {
    try {
      const employee = await employeeService.updateEmployee(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );

      return ApiResponse.success(res, employee, 'Empleado actualizado exitosamente');

    } catch (error) {
      logger.error('Error en updateEmployee:', error);

      if (error.message === ERR.NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message === ERR.DOC_IN_USE) {
        return ApiResponse.conflict(res, error.message);
      }

      if (error.message === ERR.USER_NOT_FOUND || error.message === ERR.USER_LINKED) {
        return ApiResponse.conflict(res, error.message);
      }

      return ApiResponse.error(res, 'Error al actualizar empleado');
    }
  }

  /**
   * DELETE /api/v1/employees/:id
   */
  async deleteEmployee(req, res) {
    try {
      const result = await employeeService.deleteEmployee(parseInt(req.params.id), req.user.id);
      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en deleteEmployee:', error);

      if (error.message === ERR.NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al eliminar empleado');
    }
  }

  // ============================================
  // VINCULACIÓN CON USUARIO
  // ============================================

  /**
   * PATCH /api/v1/employees/:id/link-user
   */
  async linkUser(req, res) {
    try {
      const result = await employeeService.linkUser(
        parseInt(req.params.id),
        req.body.userId,
        req.user.id
      );

      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en linkUser:', error);

      if (error.message === ERR.NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message === ERR.USER_NOT_FOUND) {
        return ApiResponse.validationError(res, [{ field: 'userId', message: error.message }], error.message);
      }

      if (error.message === ERR.USER_LINKED) {
        return ApiResponse.conflict(res, error.message);
      }

      return ApiResponse.error(res, 'Error al vincular usuario');
    }
  }

  // ============================================
  // ASISTENCIA
  // ============================================

  /**
   * POST /api/v1/employees/:id/attendance
   */
  async registerAttendance(req, res) {
    try {
      const result = await attendanceService.registerAttendance(
        parseInt(req.params.id),
        req.body.type,
        req.body.notes || null,
        req.user.id
      );

      return ApiResponse.created(res, result, `${result.type === 'entry' ? 'Entrada' : 'Salida'} registrada exitosamente`);

    } catch (error) {
      logger.error('Error en registerAttendance:', error);

      if (error.message === 'Empleado no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }

      if (
        error.message === 'Ya existe un registro de entrada para hoy' ||
        error.message === 'La salida ya fue registrada para hoy'
      ) {
        return ApiResponse.conflict(res, error.message);
      }

      if (error.message === 'No hay registro de entrada para hoy. Debe marcar entrada primero') {
        return ApiResponse.validationError(res, [{ message: error.message }], error.message);
      }

      return ApiResponse.error(res, 'Error al registrar asistencia');
    }
  }

  /**
   * GET /api/v1/employees/:id/attendance
   */
  async getAttendanceHistory(req, res) {
    try {
      const { startDate, endDate, page, limit } = req.query;

      const result = await attendanceService.getAttendanceHistory(
        parseInt(req.params.id),
        {
          startDate: startDate || undefined,
          endDate:   endDate   || undefined,
          page:      parseInt(page)  || 1,
          limit:     parseInt(limit) || 31
        }
      );

      return ApiResponse.success(res, result, 'Historial de asistencia obtenido exitosamente');

    } catch (error) {
      logger.error('Error en getAttendanceHistory:', error);

      if (error.message === 'Empleado no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al obtener historial de asistencia');
    }
  }

  /**
   * GET /api/v1/employees/:id/attendance/today
   */
  async getTodayStatus(req, res) {
    try {
      const status = await attendanceService.getTodayStatus(parseInt(req.params.id));
      return ApiResponse.success(res, status, 'Estado de asistencia de hoy obtenido exitosamente');

    } catch (error) {
      logger.error('Error en getTodayStatus:', error);
      return ApiResponse.error(res, 'Error al obtener estado de asistencia');
    }
  }
}

module.exports = new EmployeeController();
