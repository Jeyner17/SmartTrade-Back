const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashCount = sequelize.define(
    'CashCount',
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
      countData: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'count_data',
        comment: 'Conteo por denominación: {500: 5, 200: 3, 100: 10, ...}'
      },
      totalCounted: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_counted',
        comment: 'Total del dinero contado'
      },
      expectedAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'expected_amount',
        comment: 'Monto esperado según movimientos'
      },
      difference: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Diferencia (positivo: sobrante, negativo: faltante)'
      },
      differencePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'difference_percentage',
        comment: 'Porcentaje de diferencia'
      },
      countedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'counted_at',
        comment: 'Fecha/hora del conteo'
      },
      countedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'counted_by',
        comment: 'ID del usuario que contó'
      },
      verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'verified_by',
        comment: 'ID del supervisor que verificó'
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del conteo'
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      schema: 'cashRegister',
      tableName: 'cash_counts',
      timestamps: true,
      indexes: [
        { fields: ['cash_session_id'] },
        { fields: ['counted_at'] }
      ]
    }
  );

  return CashCount;
};
