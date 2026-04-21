const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashMovement = sequelize.define(
    'CashMovement',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cashSessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'cash_session_id',
        comment: 'ID de la sesión de caja'
      },
      type: {
        type: DataTypes.ENUM('SALE', 'INCOME', 'EXPENSE', 'WITHDRAWAL'),
        allowNull: false,
        comment: 'SALE: venta, INCOME: ingreso, EXPENSE: egreso, WITHDRAWAL: retiro'
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Monto del movimiento'
      },
      paymentMethod: {
        type: DataTypes.ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT'),
        allowNull: true,
        field: 'payment_method',
        comment: 'Método de pago (si es venta o ingreso)'
      },
      concept: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Concepto del movimiento (ingreso, egreso)'
      },
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'sale_id',
        comment: 'ID de venta vinculada'
      },
      relatedMovementId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_movement_id',
        comment: 'ID de movimiento relacionado (ej: retiro después de ingreso)'
      },
      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'received_by',
        comment: 'ID de usuario que recibió (para retiros a caja fuerte)'
      },
      authorizedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'authorized_by',
        comment: 'ID de supervisor que autorizó (para egresos)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del movimiento'
      },
      reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Referencia (número de venta, número de transferencia, etc)'
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      schema: 'cashRegister',
      tableName: 'cash_movements',
      timestamps: true,
      indexes: [
        { fields: ['cash_session_id'] },
        { fields: ['type'] },
        { fields: ['sale_id'] },
        { fields: ['created_at'] }
      ]
    }
  );

  return CashMovement;
};
