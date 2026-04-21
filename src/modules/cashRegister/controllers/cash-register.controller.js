const CashRegisterService = require('../services/cash-register.service');

class CashRegisterController {
  constructor() {
    this.service = CashRegisterService;
  }

  /**
   * 1. ABRIR CAJA
   */
  async openCash(req, res) {
    try {
      const data = {
        casierId: req.body.casierId,
        cashBoxNumber: req.body.cashBoxNumber,
        baseAmount: req.body.baseAmount || 0
      };

      const result = await this.service.openCash(data);

      res.status(201).json({
        success: true,
        message: 'Caja abierta correctamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 2. REGISTRAR VENTA EN CAJA
   */
  async addSaleToSession(req, res) {
    try {
      const data = {
        casierId: req.user.id,
        saleId: req.body.saleId,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        reference: req.body.reference
      };

      const result = await this.service.addSaleToSession(data);

      res.status(201).json({
        success: true,
        message: 'Venta registrada en caja',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 3. REGISTRAR INGRESO ADICIONAL
   */
  async addIncome(req, res) {
    try {
      const data = {
        sessionId: req.body.sessionId,
        amount: req.body.amount,
        concept: req.body.concept,
        paymentMethod: req.body.paymentMethod,
        description: req.body.description,
        reference: req.body.reference
      };

      const result = await this.service.addIncome(data);

      res.status(201).json({
        success: true,
        message: 'Ingreso registrado',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 4. REGISTRAR EGRESO
   */
  async addExpense(req, res) {
    try {
      const data = {
        sessionId: req.body.sessionId,
        amount: req.body.amount,
        concept: req.body.concept,
        description: req.body.description,
        authorizedBy: req.body.authorizedBy,
        reference: req.body.reference
      };

      const result = await this.service.addExpense(data);

      res.status(201).json({
        success: true,
        message: 'Egreso registrado',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 5. RETIRO DE EFECTIVO
   */
  async withdrawCash(req, res) {
    try {
      const data = {
        sessionId: req.body.sessionId,
        amount: req.body.amount,
        receivedBy: req.body.receivedBy,
        description: req.body.description,
        reference: req.body.reference
      };

      const result = await this.service.withdrawCash(data);

      res.status(201).json({
        success: true,
        message: 'Retiro registrado',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 6. OBTENER ESTADO DE CAJA
   */
  async getCashStatus(req, res) {
    try {
      const result = await this.service.getCashStatus(req.params.sessionId);

      res.status(200).json({
        success: true,
        message: 'Estado de caja obtenido',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 7. CALCULAR ARQUEO
   */
  async calculateExamination(req, res) {
    try {
      const result = await this.service.calculateExamination(req.params.sessionId);

      res.status(200).json({
        success: true,
        message: 'Arqueo calculado',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 8. CERRAR CAJA
   */
  async closeCash(req, res) {
    try {
      const data = {
        sessionId: req.body.sessionId,
        countData: req.body.countData,
        countedBy: req.body.countedBy,
        verifiedBy: req.body.verifiedBy,
        observations: req.body.observations
      };

      const result = await this.service.closeCash(data);

      res.status(200).json({
        success: true,
        message: 'Caja cerrada correctamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 9. OBTENER HISTORIAL DE CAJA
   */
  async listCashSessions(req, res) {
    try {
      const filters = {
        casierId: req.query.casierId,
        cashBoxNumber: req.query.cashBoxNumber,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await this.service.listCashSessions(filters);

      res.status(200).json({
        success: true,
        message: 'Sesiones de caja obtenidas',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 10. OBTENER DETALLE DE SESIÓN
   */
  async getCashSessionDetail(req, res) {
    try {
      const result = await this.service.getCashSessionDetail(req.params.sessionId);

      res.status(200).json({
        success: true,
        message: 'Detalle de sesión obtenido',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }

  /**
   * 11. GENERAR REPORTE DE CAJA (PDF)
   */
  async generateReport(req, res) {
    try {
      const doc = await this.service.generateReport(req.params.sessionId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte-caja.pdf"');

      doc.pipe(res);
      doc.end();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: null
      });
    }
  }
}

module.exports = CashRegisterController;
