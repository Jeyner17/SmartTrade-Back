const { Op } = require('sequelize');
const { Employee, Attendance } = require('../../../database');
const logger = require('../../../utils/logger');

const ERROR = {
  EMPLOYEE_NOT_FOUND: 'Empleado no encontrado',
  ENTRY_EXISTS:       'Ya existe un registro de entrada para hoy',
  NO_ENTRY:           'No hay registro de entrada para hoy. Debe marcar entrada primero',
  EXIT_EXISTS:        'La salida ya fue registrada para hoy'
};

/**
 * Servicio de Gestión de Asistencia
 * Sprint 4 - Gestión de Empleados
 */
class AttendanceService {
  /**
   * Registrar entrada o salida de un empleado
   * @param {number} employeeId
   * @param {'entry'|'exit'} type
   * @param {string|null} notes
   * @param {number} registeredById
   */
  async registerAttendance(employeeId, type, notes = null, registeredById) {
    const employee = await Employee.findByPk(employeeId, { attributes: ['id', 'firstName', 'lastName'] });
    if (!employee) throw new Error(ERROR.EMPLOYEE_NOT_FOUND);

    const today  = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now    = new Date();
    let record   = await Attendance.findOne({ where: { employeeId, date: today } });

    if (type === 'entry') {
      if (record) throw new Error(ERROR.ENTRY_EXISTS);

      record = await Attendance.create({
        employeeId,
        date:         today,
        entryTime:    now,
        notes,
        registeredBy: registeredById
      });

      logger.info('Entrada registrada', { employeeId, time: now });

    } else {
      if (!record)         throw new Error(ERROR.NO_ENTRY);
      if (record.exitTime) throw new Error(ERROR.EXIT_EXISTS);

      const totalHours = parseFloat(
        ((now - new Date(record.entryTime)) / (1000 * 60 * 60)).toFixed(2)
      );

      await record.update({
        exitTime:     now,
        totalHours,
        notes:        notes || record.notes,
        registeredBy: registeredById
      });

      logger.info('Salida registrada', { employeeId, totalHours });
    }

    return {
      record,
      employee: { id: employee.id, fullName: `${employee.firstName} ${employee.lastName}` },
      type,
      timestamp: now
    };
  }

  /**
   * Obtener historial de asistencia de un empleado con paginación
   */
  async getAttendanceHistory(employeeId, { startDate, endDate, page = 1, limit = 31 }) {
    const employee = await Employee.findByPk(employeeId, { attributes: ['id', 'firstName', 'lastName'] });
    if (!employee) throw new Error(ERROR.EMPLOYEE_NOT_FOUND);

    const where = { employeeId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate)   where.date[Op.lte] = endDate;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      order:  [['date', 'DESC']],
      limit,
      offset
    });

    const totalDaysWorked = rows.filter(r => r.entryTime).length;
    const totalHours      = rows.reduce((sum, r) => sum + (parseFloat(r.totalHours) || 0), 0);

    return {
      employee: { id: employee.id, fullName: `${employee.firstName} ${employee.lastName}` },
      records: rows,
      summary: {
        totalDaysWorked,
        totalHours: parseFloat(totalHours.toFixed(2))
      },
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Estado de asistencia de hoy para un empleado
   * Retorna: absent, present (solo entrada), completed (entrada + salida)
   */
  async getTodayStatus(employeeId) {
    const today  = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ where: { employeeId, date: today } });

    if (!record)                            return { status: 'absent',    nextAction: 'entry', record: null };
    if (record.entryTime && !record.exitTime) return { status: 'present',   nextAction: 'exit',  record };
    return                                         { status: 'completed', nextAction: null,    record };
  }
}

module.exports = new AttendanceService();
