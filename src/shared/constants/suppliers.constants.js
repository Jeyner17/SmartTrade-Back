/**
 * Constantes del módulo de Proveedores
 * Sprint 8 - Gestión de Proveedores
 */

// ─── Mensajes de error ───────────────────────────────────────────────────────
const SUPPLIER_ERRORS = {
    NOT_FOUND: 'Proveedor no encontrado',
    RUC_IN_USE: 'El RUC ya está registrado por otro proveedor',
    HAS_PURCHASES: 'No se puede eliminar el proveedor porque tiene compras asociadas',
    CONTACT_NOT_FOUND: 'Contacto no encontrado'
};

// ─── Estados del proveedor ───────────────────────────────────────────────────
const SUPPLIER_STATUS = ['active', 'inactive', 'suspended'];

// ─── Formas de pago ──────────────────────────────────────────────────────────
const PAYMENT_TERMS = ['transferencia', 'cheque', 'efectivo'];

module.exports = {
    SUPPLIER_ERRORS,
    SUPPLIER_STATUS,
    PAYMENT_TERMS
};
