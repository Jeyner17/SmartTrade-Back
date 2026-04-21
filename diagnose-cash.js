/**
 * Script de diagnóstico para el módulo cashRegister
 * Ejecutar desde la raíz del proyecto: node diagnose-cash.js
 */

try {
  console.log('1. Intentando cargar database/index...');
  const db = require('./src/database/index');
  console.log('✅ database/index cargado. Modelos disponibles:', Object.keys(db).join(', '));
} catch (e) {
  console.error('❌ Error al cargar database/index:', e.message);
  console.error(e.stack);
  process.exit(1);
}

try {
  console.log('\n2. Intentando cargar cash-register.service...');
  const svc = require('./src/modules/cashRegister/services/cash-register.service');
  console.log('✅ Service cargado:', typeof svc);
} catch (e) {
  console.error('❌ Error al cargar cash-register.service:', e.message);
  console.error(e.stack);
  process.exit(1);
}

try {
  console.log('\n3. Intentando cargar cash-register.controller...');
  const ctrl = require('./src/modules/cashRegister/controllers/cash-register.controller');
  console.log('✅ Controller cargado:', typeof ctrl);
} catch (e) {
  console.error('❌ Error al cargar cash-register.controller:', e.message);
  console.error(e.stack);
  process.exit(1);
}

try {
  console.log('\n4. Intentando cargar cash-register.routes...');
  const routes = require('./src/modules/cashRegister/routes/cash-register.routes');
  console.log('✅ Routes cargado:', typeof routes, routes.constructor?.name);
} catch (e) {
  console.error('❌ Error al cargar cash-register.routes:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('\n✅ Todo cargado correctamente.');
process.exit(0);
