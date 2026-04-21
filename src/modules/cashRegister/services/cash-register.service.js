const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const db = require('../../../database');

class CashRegisterService {
  constructor() {
    this.CashSession = db.CashSession;
    this.CashMovement = db.CashMovement;
    this.CashCount = db.CashCount;
  }

  /**
   * 1. ABRIR CAJA
   * Inicia un turno de caja para un cajero
   */
  async openCash(data) {
    try {
      // Verificar si ya hay caja abierta para este cajero/numero de caja
      const existingSession = await this.CashSession.findOne({
        where: {
          casierId: data.casierId,
          cashBoxNumber: data.cashBoxNumber,
          status: 'OPEN'
        }
      });

      if (existingSession) {
        throw new Error(`Caja ${data.cashBoxNumber} ya está abierta por este cajero`);
      }

      const session = await this.CashSession.create({
        casierId: data.casierId,
        cashBoxNumber: data.cashBoxNumber,
        baseAmount: data.baseAmount || 0,
        status: 'OPEN'
      });

      return {
        id: session.id,
        cashBoxNumber: session.cashBoxNumber,
        openedAt: session.openedAt,
        baseAmount: session.baseAmount,
        status: session.status
      };
    } catch (error) {
      throw new Error(`Error al abrir caja: ${error.message}`);
    }
  }

  /**
   * 2. REGISTRAR VENTA EN CAJA
   * Vincula una venta procesada con la caja activa
   */
  async addSaleToSession(data) {
    try {
      // Obtener sesión activa del cajero
      const session = await this.CashSession.findOne({
        where: {
          casierId: data.casierId,
          status: 'OPEN'
        },
        order: [['openedAt', 'DESC']]
      });

      if (!session) {
        throw new Error('No hay caja abierta para este cajero');
      }

      // Crear movimiento de venta
      const movement = await this.CashMovement.create({
        cashSessionId: session.id,
        type: 'SALE',
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        saleId: data.saleId,
        reference: data.reference,
        description: `Venta registrada - ${data.paymentMethod}`
      });

      return {
        id: movement.id,
        sessionId: session.id,
        type: 'SALE',
        amount: movement.amount,
        paymentMethod: movement.paymentMethod,
        createdAt: movement.createdAt
      };
    } catch (error) {
      throw new Error(`Error al registrar venta: ${error.message}`);
    }
  }

  /**
   * 3. REGISTRAR INGRESO ADICIONAL
   * Registra dinero que entra a caja (pagos de crédito, otros ingresos)
   */
  async addIncome(data) {
    try {
      const session = await this.CashSession.findByPk(data.sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      if (session.status !== 'OPEN') {
        throw new Error('Solo se puede registrar ingresos en cajas abiertas');
      }

      const movement = await this.CashMovement.create({
        cashSessionId: data.sessionId,
        type: 'INCOME',
        amount: data.amount,
        concept: data.concept,
        paymentMethod: data.paymentMethod,
        description: data.description,
        reference: data.reference
      });

      return {
        id: movement.id,
        type: 'INCOME',
        amount: movement.amount,
        concept: movement.concept,
        createdAt: movement.createdAt
      };
    } catch (error) {
      throw new Error(`Error al registrar ingreso: ${error.message}`);
    }
  }

  /**
   * 4. REGISTRAR EGRESO
   * Registra dinero que sale de caja (gastos menores, retiros)
   */
  async addExpense(data) {
    try {
      const session = await this.CashSession.findByPk(data.sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      if (session.status !== 'OPEN') {
        throw new Error('Solo se puede registrar egresos en cajas abiertas');
      }

      const movement = await this.CashMovement.create({
        cashSessionId: data.sessionId,
        type: 'EXPENSE',
        amount: data.amount,
        concept: data.concept,
        description: data.description,
        authorizedBy: data.authorizedBy,
        reference: data.reference
      });

      return {
        id: movement.id,
        type: 'EXPENSE',
        amount: movement.amount,
        concept: movement.concept,
        createdAt: movement.createdAt
      };
    } catch (error) {
      throw new Error(`Error al registrar egreso: ${error.message}`);
    }
  }

  /**
   * 5. RETIRO DE EFECTIVO
   * Retira dinero de la caja para enviar a caja fuerte
   */
  async withdrawCash(data) {
    try {
      const session = await this.CashSession.findByPk(data.sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      if (session.status !== 'OPEN') {
        throw new Error('Solo se puede registrar retiros en cajas abiertas');
      }

      // Verificar que hay suficiente dinero
      const cashStatus = await this.getCashStatus(data.sessionId);
      const availableCash = cashStatus.currentTotal;

      if (availableCash < data.amount) {
        throw new Error(`Monto insuficiente. Disponible: ${availableCash}`);
      }

      const movement = await this.CashMovement.create({
        cashSessionId: data.sessionId,
        type: 'WITHDRAWAL',
        amount: data.amount,
        concept: 'Retiro a caja fuerte',
        receivedBy: data.receivedBy,
        description: data.description,
        reference: data.reference
      });

      return {
        id: movement.id,
        type: 'WITHDRAWAL',
        amount: movement.amount,
        receivedBy: movement.receivedBy,
        createdAt: movement.createdAt
      };
    } catch (error) {
      throw new Error(`Error al realizar retiro: ${error.message}`);
    }
  }

  /**
   * 6. OBTENER ESTADO DE CAJA
   * Devuelve el resumen de la caja en un momento dado
   */
  async getCashStatus(sessionId) {
    try {
      const session = await this.CashSession.findByPk(sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      const movements = await this.CashMovement.findAll({
        where: { cashSessionId: sessionId },
        raw: true
      });

      // Desglosar por tipo
      const sales = movements.filter(m => m.type === 'SALE');
      const incomes = movements.filter(m => m.type === 'INCOME');
      const expenses = movements.filter(m => m.type === 'EXPENSE');
      const withdrawals = movements.filter(m => m.type === 'WITHDRAWAL');

      // Totales por método de pago (ventas e ingresos)
      const salesByMethod = {
        CASH: 0,
        CARD: 0,
        TRANSFER: 0,
        CREDIT: 0
      };

      const incomesByMethod = {
        CASH: 0,
        CARD: 0,
        TRANSFER: 0,
        CREDIT: 0
      };

      sales.forEach(sale => {
        if (sale.paymentMethod) {
          salesByMethod[sale.paymentMethod] = (salesByMethod[sale.paymentMethod] || 0) + parseFloat(sale.amount);
        }
      });

      incomes.forEach(income => {
        if (income.paymentMethod) {
          incomesByMethod[income.paymentMethod] = (incomesByMethod[income.paymentMethod] || 0) + parseFloat(income.amount);
        }
      });

      const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      const totalIncomes = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalWithdrawals = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);

      // Total esperado
      const expectedTotal = parseFloat(session.baseAmount) + totalSales + totalIncomes - totalExpenses - totalWithdrawals;

      return {
        sessionId: session.id,
        cashBoxNumber: session.cashBoxNumber,
        openedAt: session.openedAt,
        baseAmount: parseFloat(session.baseAmount),
        sales: {
          total: totalSales,
          byMethod: salesByMethod
        },
        incomes: {
          total: totalIncomes,
          count: incomes.length,
          byMethod: incomesByMethod
        },
        expenses: {
          total: totalExpenses,
          count: expenses.length
        },
        withdrawals: {
          total: totalWithdrawals,
          count: withdrawals.length
        },
        currentTotal: expectedTotal,
        movementCount: movements.length,
        lastMovements: movements
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6)
          .map((m) => ({
            id: m.id,
            sessionId: m.cashSessionId,
            type: m.type,
            amount: parseFloat(m.amount),
            paymentMethod: m.paymentMethod,
            concept: m.concept,
            reference: m.reference,
            createdAt: m.createdAt,
            authorizedBy: m.authorizedBy
          }))
      };
    } catch (error) {
      throw new Error(`Error al obtener estado de caja: ${error.message}`);
    }
  }

  /**
   * 7. CALCULAR ARQUEO
   * Calcula el balance esperado de la caja (pre-cierre)
   */
  async calculateExamination(sessionId) {
    try {
      const session = await this.CashSession.findByPk(sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      const movements = await this.CashMovement.findAll({
        where: { cashSessionId: sessionId },
        raw: true,
        order: [['createdAt', 'ASC']]
      });

      // Agrupar movimientos
      const breakdown = {
        baseAmount: parseFloat(session.baseAmount),
        sales: [],
        incomes: [],
        expenses: [],
        withdrawals: []
      };

      let totalSales = 0;
      let totalIncomes = 0;
      let totalExpenses = 0;
      let totalWithdrawals = 0;

      movements.forEach(m => {
        const amount = parseFloat(m.amount);
        switch (m.type) {
          case 'SALE':
            breakdown.sales.push({
              id: m.id,
              amount,
              paymentMethod: m.paymentMethod,
              reference: m.reference,
              createdAt: m.createdAt
            });
            totalSales += amount;
            break;
          case 'INCOME':
            breakdown.incomes.push({
              id: m.id,
              amount,
              concept: m.concept,
              paymentMethod: m.paymentMethod,
              reference: m.reference,
              createdAt: m.createdAt
            });
            totalIncomes += amount;
            break;
          case 'EXPENSE':
            breakdown.expenses.push({
              id: m.id,
              amount,
              concept: m.concept,
              createdAt: m.createdAt
            });
            totalExpenses += amount;
            break;
          case 'WITHDRAWAL':
            breakdown.withdrawals.push({
              id: m.id,
              amount,
              receivedBy: m.receivedBy,
              createdAt: m.createdAt
            });
            totalWithdrawals += amount;
            break;
        }
      });

      const expectedTotal = parseFloat(session.baseAmount) + totalSales + totalIncomes - totalExpenses - totalWithdrawals;

      return {
        sessionId,
        cashBoxNumber: session.cashBoxNumber,
        openedAt: session.openedAt,
        breakdown,
        totals: {
          baseAmount: parseFloat(session.baseAmount),
          sales: totalSales,
          incomes: totalIncomes,
          expenses: totalExpenses,
          withdrawals: totalWithdrawals
        },
        expectedTotal,
        denominationGuide: {
          note_1000: 0,
          note_500: 0,
          note_200: 0,
          note_100: 0,
          note_50: 0,
          note_20: 0,
          note_10: 0,
          coin_5: 0,
          coin_2: 0,
          coin_1: 0
        }
      };
    } catch (error) {
      throw new Error(`Error al calcular arqueo: ${error.message}`);
    }
  }

  /**
   * 8. CERRAR CAJA
   * Finaliza el turno de caja y registra conteo final
   */
  async closeCash(data) {
    try {
      const session = await this.CashSession.findByPk(data.sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      if (session.status !== 'OPEN') {
        throw new Error('Solo se puede cerrar cajas abiertas');
      }

      // Obtener estado actual para calcular totales esperados
      const status = await this.getCashStatus(data.sessionId);
      const expectedTotal = status.currentTotal;

      // Calcular total contado
      let physicalTotal = 0;
      if (data.countData && typeof data.countData === 'object') {
        Object.entries(data.countData).forEach(([denomination, quantity]) => {
          const denominationValue = this._parseDenomination(denomination);
          physicalTotal += denominationValue * quantity;
        });
      }

      // Calcular diferencia
      const difference = physicalTotal - expectedTotal;
      const differencePercentage = expectedTotal > 0 ? (difference / expectedTotal) * 100 : 0;

      // Crear registro de conteo
      const count = await this.CashCount.create({
        cashSessionId: data.sessionId,
        countData: data.countData || {},
        totalCounted: physicalTotal,
        expectedAmount: expectedTotal,
        difference: difference,
        differencePercentage: differencePercentage.toFixed(2),
        countedBy: data.countedBy,
        verifiedBy: data.verifiedBy,
        observations: data.observations
      });

      // Actualizar sesión
      await session.update({
        closedAt: new Date(),
        expectedTotal: expectedTotal,
        physicalTotal: physicalTotal,
        difference: difference,
        status: 'CLOSED',
        closedBy: data.countedBy,
        authorizedBy: data.verifiedBy,
        observations: data.observations
      });

      return {
        id: count.id,
        sessionId: data.sessionId,
        baseAmount: parseFloat(session.baseAmount),
        expectedTotal: expectedTotal,
        physicalTotal: physicalTotal,
        difference: difference,
        differencePercentage: differencePercentage.toFixed(2),
        status: difference === 0 ? 'BALANCED' : (difference > 0 ? 'SURPLUS' : 'SHORTAGE'),
        closedAt: session.closedAt
      };
    } catch (error) {
      throw new Error(`Error al cerrar caja: ${error.message}`);
    }
  }

  /**
   * 9. OBTENER HISTORIAL DE CAJA
   * Lista todas las sesiones de caja
   */
  async listCashSessions(filters = {}) {
    try {
      const where = {};

      if (filters.casierId) where.casierId = filters.casierId;
      if (filters.cashBoxNumber) where.cashBoxNumber = filters.cashBoxNumber;
      if (filters.status) where.status = filters.status;

      if (filters.startDate || filters.endDate) {
        where.openedAt = {};
        if (filters.startDate) {
          where.openedAt[require('sequelize').Op.gte] = new Date(`${filters.startDate}T00:00:00.000`);
        }
        if (filters.endDate) {
          where.openedAt[require('sequelize').Op.lte] = new Date(`${filters.endDate}T23:59:59.999`);
        }
      }

      const sessions = await this.CashSession.findAll({
        where,
        order: [['openedAt', 'DESC']],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        raw: true
      });

      return sessions.map(session => ({
        id: session.id,
        cashBoxNumber: session.cashBoxNumber,
        casierId: session.casierId,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        baseAmount: parseFloat(session.baseAmount),
        expectedTotal: session.expectedTotal ? parseFloat(session.expectedTotal) : null,
        physicalTotal: session.physicalTotal ? parseFloat(session.physicalTotal) : null,
        difference: session.difference ? parseFloat(session.difference) : null,
        status: session.status
      }));
    } catch (error) {
      throw new Error(`Error al listar sesiones de caja: ${error.message}`);
    }
  }

  /**
   * 10. OBTENER DETALLE DE SESIÓN DE CAJA
   * Devuelve información completa de una sesión
   */
  async getCashSessionDetail(sessionId) {
    try {
      const session = await this.CashSession.findByPk(sessionId);

      if (!session) {
        throw new Error('Sesión de caja no encontrada');
      }

      const movements = await this.CashMovement.findAll({
        where: { cashSessionId: sessionId },
        raw: true,
        order: [['createdAt', 'ASC']]
      });

      const count = await this.CashCount.findOne({
        where: { cashSessionId: sessionId },
        raw: true
      });

      // Calcular status
      let differenceStatus = 'OPEN';
      if (session.status === 'CLOSED' && count) {
        if (count.difference === 0) {
          differenceStatus = 'BALANCED';
        } else if (count.difference > 0) {
          differenceStatus = 'SURPLUS';
        } else {
          differenceStatus = 'SHORTAGE';
        }
      }

      return {
        session: {
          id: session.id,
          cashBoxNumber: session.cashBoxNumber,
          casierId: session.casierId,
          openedAt: session.openedAt,
          closedAt: session.closedAt,
          baseAmount: parseFloat(session.baseAmount),
          status: session.status,
          observations: session.observations,
          closedBy: session.closedBy,
          authorizedBy: session.authorizedBy
        },
        movements: movements.map(m => ({
          id: m.id,
          type: m.type,
          amount: parseFloat(m.amount),
          paymentMethod: m.paymentMethod,
          concept: m.concept,
          reference: m.reference,
          createdAt: m.createdAt
        })),
        count: count ? {
          id: count.id,
          totalCounted: parseFloat(count.totalCounted),
          expectedAmount: parseFloat(count.expectedAmount),
          difference: parseFloat(count.difference),
          differencePercentage: parseFloat(count.differencePercentage),
          differenceStatus,
          countedAt: count.countedAt,
          observations: count.observations
        } : null
      };
    } catch (error) {
      throw new Error(`Error al obtener detalle de sesión: ${error.message}`);
    }
  }

  /**
   * 11. GENERAR REPORTE DE CAJA (PDF)
   * Genera el reporte oficial de cierre de caja
   */
  async generateReport(sessionId) {
    try {
      const detail = await this.getCashSessionDetail(sessionId);

      // Crear documento PDF
      const doc = new PDFDocument();

      // Encabezado
      doc.fontSize(14).font('Helvetica-Bold').text('REPORTE DE CIERRE DE CAJA', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Caja: ${detail.session.cashBoxNumber}`, { align: 'center' });
      doc.text(`Fecha: ${dayjs(detail.session.closedAt).format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
      doc.moveDown();

      // Información general
      doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN GENERAL');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Monto Base: $${detail.session.baseAmount.toFixed(2)}`);
      doc.text(`Abierta: ${dayjs(detail.session.openedAt).format('DD/MM/YYYY HH:mm')}`);
      doc.text(`Cerrada: ${dayjs(detail.session.closedAt).format('DD/MM/YYYY HH:mm')}`);
      doc.moveDown();

      // Resumen de movimientos
      if (detail.count) {
        doc.fontSize(11).font('Helvetica-Bold').text('RESUMEN DE CIERRE');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total Esperado: $${detail.count.expectedAmount.toFixed(2)}`);
        doc.text(`Total Contado: $${detail.count.totalCounted.toFixed(2)}`);
        doc.text(`Diferencia: $${detail.count.difference.toFixed(2)} (${detail.count.differenceStatus})`);
        doc.text(`Porcentaje: ${detail.count.differencePercentage}%`);
        doc.moveDown();
      }

      // Detalle de movimientos
      doc.fontSize(11).font('Helvetica-Bold').text('MOVIMIENTOS DEL DÍA');
      doc.fontSize(10).font('Helvetica');

      const typeLabels = {
        SALE: 'Venta',
        INCOME: 'Ingreso',
        EXPENSE: 'Egreso',
        WITHDRAWAL: 'Retiro'
      };

      detail.movements.forEach(m => {
        doc.text(`${typeLabels[m.type]}: $${m.amount.toFixed(2)} - ${m.concept || m.paymentMethod || 'N/A'}`);
      });

      if (detail.session.observations) {
        doc.moveDown();
        doc.fontSize(11).font('Helvetica-Bold').text('OBSERVACIONES');
        doc.fontSize(10).font('Helvetica').text(detail.session.observations);
      }

      return doc;
    } catch (error) {
      throw new Error(`Error al generar reporte: ${error.message}`);
    }
  }

  /**
   * HELPER: Parsear denominación
   */
  _parseDenomination(denomination) {
    const denominationMap = {
      note_1000: 1000,
      note_500: 500,
      note_200: 200,
      note_100: 100,
      note_50: 50,
      note_20: 20,
      note_10: 10,
      coin_5: 5,
      coin_2: 2,
      coin_1: 1
    };
    return denominationMap[denomination] || 0;
  }
}

module.exports = new CashRegisterService();
