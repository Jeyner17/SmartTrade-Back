# Sequelize ORM - Guía de Uso Completa

## 📖 Índice

1. [¿Qué es Sequelize?](#qué-es-sequelize)
2. [Instalación](#instalación)
3. [Comandos de Migraciones](#comandos-de-migraciones)
4. [Comandos de Seeders](#comandos-de-seeders)
5. [Solución de Problemas Comunes](#solución-de-problemas-comunes)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## ¿Qué es Sequelize?

Sequelize es un ORM (Object-Relational Mapping) para Node.js que facilita la interacción con bases de datos SQL (PostgreSQL, MySQL, SQLite, MSSQL).

### Ventajas:
- ✅ Escribe código JavaScript en lugar de SQL directo
- ✅ Migraciones versionadas de base de datos
- ✅ Seeders para datos iniciales
- ✅ Validaciones automáticas
- ✅ Relaciones entre modelos

---

## Instalación
```bash
# Instalar Sequelize y Sequelize CLI
npm install sequelize
npm install --save-dev sequelize-cli

# Instalar driver de PostgreSQL
npm install pg pg-hstore
```

---

## Comandos de Migraciones

### 🔹 ¿Qué son las Migraciones?

Las migraciones son archivos que **crean**, **modifican** o **eliminan** tablas/columnas en la base de datos. Son como un **control de versiones para tu base de datos**.

### 📝 Crear una Nueva Migración
```bash
# Generar archivo de migración
npx sequelize-cli migration:generate --name nombre-de-la-migracion

# Ejemplo: Crear tabla de usuarios
npx sequelize-cli migration:generate --name create-users-table
```

Esto crea un archivo en `src/database/migrations/` con este formato:
```
20250128123456-create-users-table.js
```

### ▶️ Ejecutar Migraciones (Aplicar Cambios)
```bash
# Ejecutar TODAS las migraciones pendientes
npm run migrate

# O de forma explícita:
npx sequelize-cli db:migrate
```

**¿Qué hace?**
- Lee todos los archivos en `src/database/migrations/`
- Ejecuta solo las migraciones que **NO** se han aplicado
- Registra en la tabla `SequelizeMeta` cuáles ya se ejecutaron

### ↩️ Deshacer Migraciones
```bash
# Deshacer la ÚLTIMA migración ejecutada
npm run migrate:undo

# Deshacer TODAS las migraciones (¡CUIDADO! Borra todo)
npm run migrate:undo:all

# Deshacer hasta una migración específica
npx sequelize-cli db:migrate:undo:all --to 20250128123456-create-users-table.js
```

### 🔍 Ver Estado de Migraciones
```bash
# Ver qué migraciones ya se ejecutaron
npx sequelize-cli db:migrate:status
```

**Resultado:**
```
up   20250127000001-create-settings-table.js
up   20250128000001-create-auth-roles-table.js
down 20250128000002-create-auth-users-table.js  ← Esta NO se ha ejecutado
```

### 📋 Estructura de una Migración
```javascript
'use strict';

module.exports = {
  // SUBIR (aplicar cambios)
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  // BAJAR (revertir cambios)
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

---

## Comandos de Seeders

### 🔹 ¿Qué son los Seeders?

Los seeders son archivos que **insertan datos iniciales** en la base de datos (usuarios de prueba, roles, configuración inicial, etc.).

### 📝 Crear un Nuevo Seeder
```bash
# Generar archivo de seeder
npx sequelize-cli seed:generate --name nombre-del-seeder

# Ejemplo: Insertar roles iniciales
npx sequelize-cli seed:generate --name seed-auth-roles
```

Crea un archivo en `src/database/seeders/`:
```
20250128123456-seed-auth-roles.js
```

### ▶️ Ejecutar Seeders
```bash
# Ejecutar TODOS los seeders
npm run seed

# Ejecutar UN seeder específico
npx sequelize-cli db:seed --seed 20250128123456-seed-auth-roles.js

# Ejecutar seeders en orden específico
npx sequelize-cli db:seed --seed 20250128000001-seed-roles.js
npx sequelize-cli db:seed --seed 20250128000002-seed-admin-user.js
```

### ↩️ Deshacer Seeders
```bash
# Deshacer el ÚLTIMO seeder ejecutado
npm run seed:undo

# Deshacer TODOS los seeders
npm run seed:undo:all

# Deshacer un seeder específico
npx sequelize-cli db:seed:undo --seed 20250128123456-seed-auth-roles.js
```

### 🔍 Ver Estado de Seeders
```bash
# Ver qué seeders ya se ejecutaron
npx sequelize-cli db:seed:status
```

### 📋 Estructura de un Seeder
```javascript
'use strict';

module.exports = {
  // SUBIR (insertar datos)
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'Administrador',
        description: 'Acceso total',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cajero',
        description: 'Acceso a ventas',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  // BAJAR (eliminar datos)
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
```

---

## Solución de Problemas Comunes

### ❌ Error: "llave duplicada viola restricción de unicidad"

**Causa:** Intentas ejecutar un seeder que ya insertó datos anteriormente.

**Soluciones:**

#### Opción 1: Deshacer el seeder duplicado
```bash
# Deshacer el último seeder
npm run seed:undo

# Volver a ejecutar
npm run seed
```

#### Opción 2: Ejecutar solo seeders específicos
```bash
# Ver qué seeders ya se ejecutaron
npx sequelize-cli db:seed:status

# Ejecutar SOLO los seeders pendientes manualmente
npx sequelize-cli db:seed --seed 20250128-seed-auth-roles.js
npx sequelize-cli db:seed --seed 20250128-seed-admin-user.js
```

#### Opción 3: Limpiar TODO y empezar de nuevo
```bash
# 1. Deshacer TODOS los seeders
npm run seed:undo:all

# 2. Deshacer TODAS las migraciones (¡CUIDADO!)
npm run migrate:undo:all

# 3. Ejecutar migraciones nuevamente
npm run migrate

# 4. Ejecutar seeders nuevamente
npm run seed
```

---

### ❌ Error: "relation does not exist"

**Causa:** Intentas ejecutar un seeder antes de crear la tabla con la migración.

**Solución:**
```bash
# PRIMERO ejecutar migraciones
npm run migrate

# DESPUÉS ejecutar seeders
npm run seed
```

---

### ❌ Error: "column does not exist"

**Causa:** El modelo tiene un campo que no existe en la tabla (la migración no se ejecutó o está desactualizada).

**Solución:**
```bash
# 1. Verificar estado de migraciones
npx sequelize-cli db:migrate:status

# 2. Ejecutar migraciones pendientes
npm run migrate

# 3. Si persiste, crear nueva migración para agregar la columna
npx sequelize-cli migration:generate --name add-missing-column
```

---

### ❌ Error: "No migrations were executed, database schema is up to date"

**No es un error.** Significa que todas las migraciones ya se ejecutaron.

---

### ❌ Error: "Cannot find module 'sequelize'"

**Causa:** No has instalado Sequelize.

**Solución:**
```bash
npm install sequelize pg pg-hstore
npm install --save-dev sequelize-cli
```

---

## Buenas Prácticas

### ✅ 1. Orden de Ejecución

**SIEMPRE sigue este orden:**
```bash
1. Migraciones primero → npm run migrate
2. Seeders después → npm run seed
```

### ✅ 2. Nombrar Archivos Descriptivamente
```bash
# ❌ MAL
npx sequelize-cli migration:generate --name migration1

# ✅ BIEN
npx sequelize-cli migration:generate --name create-users-table
npx sequelize-cli migration:generate --name add-email-to-users
npx sequelize-cli migration:generate --name create-roles-table
```

### ✅ 3. Nunca Modificar Migraciones Ejecutadas

**❌ NO HAGAS ESTO:**
```javascript
// Modificar un archivo de migración que ya se ejecutó
// Esto NO actualizará la base de datos
```

**✅ HAZ ESTO:**
```bash
# Crear NUEVA migración para modificar
npx sequelize-cli migration:generate --name modify-users-add-phone
```

### ✅ 4. Usar Transacciones en Seeders Grandes
```javascript
up: async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    await queryInterface.bulkInsert('users', [...], { transaction });
    await queryInterface.bulkInsert('roles', [...], { transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### ✅ 5. Mantener el Método `down` Actualizado
```javascript
// El método down DEBE revertir exactamente lo que hace up
up: async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('users', 'phone', {
    type: Sequelize.STRING
  });
},

down: async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('users', 'phone');
}
```

---

## Ejemplos Prácticos

### 🔧 Escenario 1: Empezar un Proyecto Nuevo
```bash
# 1. Instalar dependencias
npm install sequelize pg pg-hstore
npm install --save-dev sequelize-cli

# 2. Crear estructura de Sequelize
npx sequelize-cli init

# 3. Configurar database.js
# (Editar src/config/database.js con tus credenciales)

# 4. Crear esquema en PostgreSQL
psql -U postgres
CREATE DATABASE mi_base_de_datos;
\q

# 5. Crear primera migración
npx sequelize-cli migration:generate --name create-users-table

# 6. Editar el archivo de migración
# (Agregar columnas, tipos, etc.)

# 7. Ejecutar migración
npm run migrate

# 8. Crear seeder
npx sequelize-cli seed:generate --name seed-default-users

# 9. Editar el seeder
# (Agregar datos iniciales)

# 10. Ejecutar seeder
npm run seed
```

---

### 🔧 Escenario 2: Ya Ejecuté un Seeder por Error
```bash
# Situación: Ejecutaste npm run seed y ahora tienes datos duplicados

# Solución:
# 1. Ver qué seeders se ejecutaron
npx sequelize-cli db:seed:status

# 2. Deshacer el último seeder
npm run seed:undo

# 3. Verificar en la base de datos que se eliminaron los datos
psql -U postgres -d mi_base_de_datos
SELECT * FROM users;
\q

# 4. Volver a ejecutar el seeder correctamente
npm run seed
```

---

### 🔧 Escenario 3: Necesito Agregar una Columna a una Tabla Existente
```bash
# 1. Crear nueva migración
npx sequelize-cli migration:generate --name add-phone-to-users

# 2. Editar el archivo generado:
```
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'phone');
  }
};
```
```bash
# 3. Ejecutar migración
npm run migrate

# 4. Verificar en PostgreSQL
psql -U postgres -d mi_base_de_datos
\d users
\q
```

---

### 🔧 Escenario 4: Resetear Base de Datos Completamente
```bash
# ⚠️ CUIDADO: Esto BORRA TODOS LOS DATOS

# 1. Deshacer todos los seeders
npm run seed:undo:all

# 2. Deshacer todas las migraciones
npm run migrate:undo:all

# 3. Ejecutar migraciones desde cero
npm run migrate

# 4. Ejecutar seeders desde cero
npm run seed
```

**Comando todo-en-uno:**
```bash
# Agregado en package.json
npm run db:reset
```

---

### 🔧 Escenario 5: Ejecutar Solo Seeders de un Módulo Específico
```bash
# Situación: Tienes seeders de settings Y auth, pero solo quieres ejecutar auth

# Ver todos los seeders
ls src/database/seeders/

# Resultado:
# 20250127-seed-initial-settings.js      ← Ya ejecutado
# 20250128-seed-auth-roles.js            ← Pendiente
# 20250128-seed-auth-admin-user.js       ← Pendiente

# Ejecutar solo los de auth
npx sequelize-cli db:seed --seed src/database/seeders/20250128-seed-auth-roles.js
npx sequelize-cli db:seed --seed src/database/seeders/20250128-seed-auth-admin-user.js
```

---

## 🚀 Scripts Útiles para package.json

Agrega estos scripts a tu `package.json`:
```json
{
  "scripts": {
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "migrate:undo:all": "sequelize-cli db:migrate:undo:all",
    "migrate:status": "sequelize-cli db:migrate:status",
    
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo",
    "seed:undo:all": "sequelize-cli db:seed:undo:all",
    "seed:status": "sequelize-cli db:seed:status",
    
    "db:reset": "npm run seed:undo:all && npm run migrate:undo:all && npm run migrate && npm run seed",
    "db:fresh": "npm run migrate:undo:all && npm run migrate"
  }
}
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial de Sequelize](https://sequelize.org/)
- [Sequelize CLI - GitHub](https://github.com/sequelize/cli)
- [Migraciones - Guía Oficial](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Seeders - Guía Oficial](https://sequelize.org/docs/v6/other-topics/migrations/#creating-the-first-seed)

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras un error que no está en esta guía:

1. **Ver logs detallados:**
```bash
   npx sequelize-cli db:migrate --debug
```

2. **Verificar conexión a base de datos:**
```bash
   psql -U postgres -d gestion_comercial
   \conninfo
   \q
```

3. **Ver estado actual:**
```bash
   npm run migrate:status
   npm run seed:status
```

---

**Autor:** Sistema de Gestión Comercial  
**Versión:** 1.0.0  
**Fecha:** Enero 2026