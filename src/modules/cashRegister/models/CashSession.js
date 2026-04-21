const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashSession = sequelize.define(
    'CashSession',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cashBoxNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'cash_box_number',
        comment: 'Número de caja (Caja 1, Caja 2, etc)'
      },
      casierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'casier_id',
        comment: 'ID del cajero'
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'opened_at',
        comment: 'Fecha/hora de apertura'
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'closed_at',
        comment: 'Fecha/hora de cierre'
      },
      baseAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'base_amount',
        comment: 'Monto de base/fondo inicial'
      },
      expectedTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'expected_total',
        comment: 'Total esperado en caja'
      },
      physicalTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'physical_total',
        comment: 'Total contado físicamente'
      },
      difference: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Diferencia (sobrante/faltante)'
      },
      status: {
        type: DataTypes.ENUM('OPEN', 'COUNTED', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
        comment: 'OPEN: abierta, COUNTED: contada, CLOSED: cerrada'
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del cierre'
      },
      closedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'closed_by',
        comment: 'ID del usuario que cerró la caja'
      },
      authorizedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'authorized_by',
        comment: 'ID del supervisor que autorizó cierre'
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      schema: 'cashRegister',
      tableName: 'cash_sessions',
      timestamps: true,
      indexes: [
        { fields: ['casier_id'] },
        { fields: ['cash_box_number'] },
        { fields: ['status'] },
        { fields: ['opened_at'] }
      ]
    }
  );

  return CashSession;
};
