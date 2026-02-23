const { Op } = require('sequelize');
const { Employee, Attendance, User } = require('../../../database');
const logger = require('../../../utils/logger');

const ERROR = {
  NOT_FOUND:       'Empleado no encontrado',
  DOC_IN_USE:      'El número de documento ya está registrado',
  USER_NOT_FOUND:  'Usuario no encontrado',
  USER_LINKED:     'El usuario ya está vinculado a otro empleado',
  SELF_LINK_CHECK: 'No se puede verificar el usuario'
};

/**
 * Servicio de Gestión de Empleados
 * Sprint 4 - Gestión de Empleados
 */
class EmployeeService {
  /**
   * Listar empleados con paginación y filtros
   */
  async getEmployees({ page = 1, limit = 10, search, area, shift, isActive }) {
    const offset = (page - 1) * limit;
    const where  = {};

    if (search) {
      where[Op.or] = [
        { firstName:      { [Op.iLike]: `%${search}%` } },
        { lastName:       { [Op.iLike]: `%${search}%` } },
        { documentNumber: { [Op.iLike]: `%${search}%` } },
        { email:          { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (area)     where.area    = area;
    if (shift)    where.shift   = shift;
    if (isActive !== undefined) where.isActive = isActive;

    const { count, rows } = await Employee.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'linkedUser',
        attributes: ['id', 'username', 'email'],
        required: false
      }],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      limit,
      offset
    });

    return {
      employees: rows,
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
   * Obtener empleado por ID con detalle completo
   */
  async getEmployeeById(id) {
    const employee = await Employee.findByPk(id, {
      include: [{
        model: User,
        as: 'linkedUser',
        attributes: ['id', 'username', 'email', 'isActive'],
        required: false
      }]
    });

    if (!employee) throw new Error(ERROR.NOT_FOUND);

    return employee;
  }

  /**
   * Crear nuevo empleado
   */
  async createEmployee(data, createdById) {
    const {
      firstName, lastName, documentType, documentNumber,
      birthDate, address, phone, email, area, shift,
      salary, hireDate, userId, isActive = true
    } = data;

    // Verificar documento único
    const existing = await Employee.findOne({ where: { documentNumber } });
    if (existing) throw new Error(ERROR.DOC_IN_USE);

    // Verificar usuario si se provee
    if (userId) {
      await this._validateUserLink(userId, null);
    }

    const employee = await Employee.create({
      firstName, lastName, documentType, documentNumber,
      birthDate, address, phone, email, area, shift,
      salary, hireDate, userId, isActive,
      createdBy: createdById
    });

    await employee.reload({
      include: [{ model: User, as: 'linkedUser', attributes: ['id', 'username', 'email'], required: false }]
    });

    logger.success('Empleado creado', { employeeId: employee.id, createdBy: createdById });
    return employee;
  }

  /**
   * Actualizar empleado
   */
  async updateEmployee(id, data, updatedById) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error(ERROR.NOT_FOUND);

    const { documentNumber, userId } = data;

    // Verificar documento único si cambió
    if (documentNumber && documentNumber !== employee.documentNumber) {
      const existing = await Employee.findOne({
        where: { documentNumber, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error(ERROR.DOC_IN_USE);
    }

    // Verificar usuario si cambió
    if (userId !== undefined && userId !== employee.userId) {
      if (userId !== null) {
        await this._validateUserLink(userId, id);
      }
    }

    const updates = { updatedBy: updatedById };
    const fields = [
      'firstName', 'lastName', 'documentType', 'documentNumber',
      'birthDate', 'address', 'phone', 'email', 'area', 'shift',
      'salary', 'hireDate', 'isActive', 'userId'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    await employee.update(updates);

    await employee.reload({
      include: [{ model: User, as: 'linkedUser', attributes: ['id', 'username', 'email'], required: false }]
    });

    logger.info('Empleado actualizado', { employeeId: id, updatedBy: updatedById });
    return employee;
  }

  /**
   * Eliminar empleado (soft delete)
   */
  async deleteEmployee(id, deletedById) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error(ERROR.NOT_FOUND);

    await employee.update({ isActive: false, updatedBy: deletedById });
    await employee.destroy(); // paranoid soft delete

    logger.info('Empleado eliminado (soft delete)', { employeeId: id, deletedBy: deletedById });
    return { message: 'Empleado eliminado exitosamente' };
  }

  /**
   * Vincular empleado con usuario del sistema
   */
  async linkUser(employeeId, userId, updatedById) {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new Error(ERROR.NOT_FOUND);

    if (userId !== null) {
      await this._validateUserLink(userId, employeeId);
    }

    await employee.update({ userId, updatedBy: updatedById });

    await employee.reload({
      include: [{ model: User, as: 'linkedUser', attributes: ['id', 'username', 'email'], required: false }]
    });

    const message = userId
      ? 'Usuario vinculado exitosamente'
      : 'Vinculación eliminada exitosamente';

    logger.info(message, { employeeId, userId, updatedBy: updatedById });
    return { message, employee };
  }

  /**
   * Validar que un usuario existe y no está ya vinculado a otro empleado
   */
  async _validateUserLink(userId, excludeEmployeeId) {
    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) throw new Error(ERROR.USER_NOT_FOUND);

    const where = { userId };
    if (excludeEmployeeId) where.id = { [Op.ne]: excludeEmployeeId };

    const alreadyLinked = await Employee.findOne({ where });
    if (alreadyLinked) throw new Error(ERROR.USER_LINKED);
  }
}

module.exports = new EmployeeService();
