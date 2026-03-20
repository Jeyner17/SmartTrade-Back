/**
 * Especificación OpenAPI 3.0 - SmartTrade API
 * Sistema Integral de Gestión Comercial
 */
const swaggerSpec = {
  openapi: '3.0.0',

  // ============================================
  // INFORMACIÓN GENERAL
  // ============================================
  info: {
    title: 'SmartTrade API',
    version: '1.0.0',
    description: `
## Sistema Integral de Gestión Comercial

API REST para la gestión comercial completa con facturación electrónica SRI.

### Autenticación
Usa **JWT Bearer Token**. Para obtener tu token:
1. Llama a \`POST /auth/login\` con \`username: admin\` y \`password: Admin123\`
2. Copia el \`accessToken\` de la respuesta
3. Haz clic en **Authorize** (🔒) y pega el token

### Módulos disponibles
| Sprint | Módulo | Estado |
|--------|--------|--------|
| 1 | Settings | ✅ Activo |
| 2 | Auth | ✅ Activo |
| 2 | Roles | ✅ Activo |
| 3 | Users | ✅ Activo |
| 4 | Employees | ✅ Activo |
| 5 | Categories | ✅ Activo |
| 6 | Products | ✅ Activo |
| 7 | Inventory | ✅ Activo |
| 8 | Suppliers | ✅ Activo |
| 9 | Purchases | ✅ Activo |
    `,
    contact: {
      name: 'LionTech',
      email: 'soporte@liontech.ec'
    },
    license: {
      name: 'ISC'
    }
  },

  // ============================================
  // SERVIDORES
  // ============================================
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor de desarrollo'
    }
  ],

  // ============================================
  // SEGURIDAD GLOBAL
  // ============================================
  security: [{ bearerAuth: [] }],

  // ============================================
  // TAGS (agrupación)
  // ============================================
  tags: [
    {
      name: 'Auth',
      description: 'Autenticación, sesiones y gestión de tokens JWT'
    },
    {
      name: 'Roles',
      description: 'Consulta de roles y verificación de permisos'
    },
    {
      name: 'Settings',
      description: 'Configuración del sistema (empresa, fiscal, técnica, etc.)'
    },
    {
      name: 'Users',
      description: 'CRUD de usuarios, control de acceso y gestión de sesiones'
    },
    {
      name: 'Employees',
      description: 'CRUD de empleados, vinculación con usuarios del sistema y registro de asistencia diaria'
    },
    {
      name: 'Categories',
      description: 'Gestión de categorías jerárquicas para clasificación de productos'
    },
    {
      name: 'Products',
      description: 'Catálogo de productos con precios, costos, stock e imágenes'
    },
    {
      name: 'Inventory',
      description: 'Gestión de inventario: control de stock, movimientos, ajustes, alertas y valorización'
    },
    {
      name: 'Purchases',
      description: 'Órdenes de compra a proveedores, recepción y reportes de compras'
    }
  ],

  // ============================================
  // COMPONENTES REUTILIZABLES
  // ============================================
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en POST /auth/login'
      }
    },

    schemas: {
      // --- RESPUESTAS BASE ---
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operación exitosa' },
          data: { type: 'object' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error en la operación' },
          errors: { type: 'array', items: { type: 'object' }, nullable: true }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error de validación en los datos proporcionados' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'El formato del email es inválido' },
                value: { type: 'string', example: 'emailinvalido' }
              }
            }
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 25 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          pages: { type: 'integer', example: 3 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false }
        }
      },

      // --- AUTH ---
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin', minLength: 3, maxLength: 50 },
          password: { type: 'string', example: 'Admin123', minLength: 6 }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'admin' },
              email: { type: 'string', example: 'admin@smarttrade.ec' },
              firstName: { type: 'string', example: 'Administrador' },
              lastName: { type: 'string', example: 'Sistema' },
              fullName: { type: 'string', example: 'Administrador Sistema' },
              role: {
                type: 'object',
                properties: {
                  id: { type: 'integer', example: 1 },
                  name: { type: 'string', example: 'Administrador' },
                  description: { type: 'string', example: 'Acceso total al sistema' }
                }
              }
            }
          },
          permissions: { type: 'object', description: 'Mapa de permisos por módulo' },
          tokens: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              expiresIn: { type: 'string', example: '24h' }
            }
          }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'Admin123' },
          newPassword: { type: 'string', example: 'NuevaPass456!', minLength: 6 },
          confirmPassword: { type: 'string', example: 'NuevaPass456!' }
        }
      },
      VerifyPermissionRequest: {
        type: 'object',
        required: ['module', 'action'],
        properties: {
          module: { type: 'string', example: 'users' },
          action: { type: 'string', example: 'create', enum: ['view', 'create', 'edit', 'delete', 'export', 'print'] }
        }
      },

      // --- ROLES ---
      Role: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Administrador' },
          description: { type: 'string', example: 'Acceso total al sistema' },
          permissions: { type: 'object', description: 'Mapa de permisos JSONB' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CheckPermissionRequest: {
        type: 'object',
        required: ['module', 'action'],
        properties: {
          module: { type: 'string', example: 'users' },
          action: { type: 'string', example: 'create' }
        }
      },
      CheckMultiplePermissionsRequest: {
        type: 'object',
        required: ['permissions'],
        properties: {
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                module: { type: 'string', example: 'users' },
                action: { type: 'string', example: 'view' }
              }
            },
            example: [
              { module: 'users', action: 'view' },
              { module: 'users', action: 'create' }
            ]
          }
        }
      },

      // --- USERS ---
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          username: { type: 'string', example: 'jperez' },
          email: { type: 'string', example: 'jperez@empresa.com' },
          firstName: { type: 'string', example: 'Juan' },
          lastName: { type: 'string', example: 'Pérez' },
          roleId: { type: 'integer', example: 3 },
          role: { $ref: '#/components/schemas/RoleSummary' },
          isActive: { type: 'boolean', example: true },
          mustChangePassword: { type: 'boolean', example: false },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          loginAttempts: { type: 'integer', example: 0 },
          lockUntil: { type: 'string', format: 'date-time', nullable: true },
          createdBy: { type: 'integer', nullable: true, example: 1 },
          updatedBy: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      RoleSummary: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          name: { type: 'string', example: 'Cajero' }
        }
      },
      CreateUserRequest: {
        type: 'object',
        required: ['username', 'email', 'firstName', 'lastName', 'roleId'],
        properties: {
          username: { type: 'string', example: 'jperez', minLength: 3, maxLength: 50, description: 'Solo letras, números y guion bajo' },
          email: { type: 'string', format: 'email', example: 'jperez@empresa.com' },
          firstName: { type: 'string', example: 'Juan', minLength: 2, maxLength: 100 },
          lastName: { type: 'string', example: 'Pérez', minLength: 2, maxLength: 100 },
          roleId: { type: 'integer', example: 3 },
          password: { type: 'string', example: 'Pass123!', minLength: 6, description: 'Opcional. Si no se envía, se genera automáticamente' },
          isActive: { type: 'boolean', example: true, default: true },
          mustChangePassword: { type: 'boolean', example: true, default: true }
        }
      },
      CreateUserResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          temporaryPassword: { type: 'string', nullable: true, example: 'Xy7!kM3p', description: 'Solo presente si no se envió password en el request' },
          mustChangePassword: { type: 'boolean', example: true }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'jperez_new', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email', example: 'nuevo@empresa.com' },
          firstName: { type: 'string', example: 'Juan Carlos', minLength: 2 },
          lastName: { type: 'string', example: 'Pérez', minLength: 2 },
          roleId: { type: 'integer', example: 2 },
          isActive: { type: 'boolean', example: true }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        properties: {
          newPassword: { type: 'string', example: 'NuevoPass123!', minLength: 6, description: 'Opcional. Si no se envía, se genera automáticamente' }
        }
      },
      ChangeStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'unlock', 'lock'],
            example: 'active',
            description: 'active=activar, inactive=desactivar, unlock=desbloquear, lock=bloquear 24h'
          }
        }
      },
      CheckAvailabilityRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'jperez', description: 'Al menos uno de los dos es requerido' },
          email: { type: 'string', format: 'email', example: 'jperez@empresa.com' },
          excludeId: { type: 'integer', example: 5, description: 'ID a excluir de la búsqueda (para edición)' }
        }
      },
      UserSession: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          ipAddress: { type: 'string', example: '192.168.1.100' },
          userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', example: true }
        }
      },

      // --- EMPLOYEES ---
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstName: { type: 'string', example: 'Carlos' },
          lastName: { type: 'string', example: 'Mendoza' },
          documentType: { type: 'string', enum: ['cedula', 'pasaporte', 'ruc'], example: 'cedula' },
          documentNumber: { type: 'string', example: '0912345678' },
          birthDate: { type: 'string', format: 'date', nullable: true, example: '1990-05-15' },
          address: { type: 'string', nullable: true, example: 'Av. Principal 123' },
          phone: { type: 'string', nullable: true, example: '0991234567' },
          email: { type: 'string', format: 'email', nullable: true, example: 'carlos.mendoza@empresa.com' },
          area: { type: 'string', enum: ['administracion', 'caja', 'bodega', 'atencion', 'ventas'], example: 'caja' },
          shift: { type: 'string', enum: ['morning', 'afternoon', 'night'], example: 'morning' },
          salary: { type: 'number', format: 'float', nullable: true, example: 500.00 },
          hireDate: { type: 'string', format: 'date', nullable: true, example: '2024-01-15' },
          userId: { type: 'integer', nullable: true, example: 5, description: 'Usuario vinculado del sistema' },
          linkedUser: { $ref: '#/components/schemas/LinkedUser' },
          isActive: { type: 'boolean', example: true },
          createdBy: { type: 'integer', nullable: true, example: 1 },
          updatedBy: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      LinkedUser: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'integer', example: 5 },
          username: { type: 'string', example: 'cmendoza' },
          email: { type: 'string', example: 'cmendoza@empresa.com' }
        }
      },
      CreateEmployeeRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'documentType', 'documentNumber', 'area', 'shift'],
        properties: {
          firstName: { type: 'string', example: 'Carlos', maxLength: 100 },
          lastName: { type: 'string', example: 'Mendoza', maxLength: 100 },
          documentType: { type: 'string', enum: ['cedula', 'pasaporte', 'ruc'], example: 'cedula' },
          documentNumber: { type: 'string', example: '0912345678', maxLength: 20 },
          birthDate: { type: 'string', format: 'date', nullable: true, example: '1990-05-15' },
          address: { type: 'string', nullable: true, example: 'Av. Principal 123' },
          phone: { type: 'string', nullable: true, example: '0991234567', maxLength: 20 },
          email: { type: 'string', format: 'email', nullable: true, example: 'carlos@empresa.com' },
          area: { type: 'string', enum: ['administracion', 'caja', 'bodega', 'atencion', 'ventas'], example: 'caja' },
          shift: { type: 'string', enum: ['morning', 'afternoon', 'night'], example: 'morning' },
          salary: { type: 'number', nullable: true, example: 500.00 },
          hireDate: { type: 'string', format: 'date', nullable: true, example: '2024-01-15' },
          userId: { type: 'integer', nullable: true, example: 5, description: 'Vincular con usuario del sistema (opcional)' },
          isActive: { type: 'boolean', example: true, default: true }
        }
      },
      LinkUserRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'integer', nullable: true, example: 5, description: 'ID del usuario a vincular. null para desvincular' }
        }
      },
      AttendanceRecord: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 10 },
          employeeId: { type: 'integer', example: 1 },
          date: { type: 'string', format: 'date', example: '2026-02-22' },
          entryTime: { type: 'string', format: 'date-time', nullable: true, example: '2026-02-22T08:05:00.000Z' },
          exitTime: { type: 'string', format: 'date-time', nullable: true, example: '2026-02-22T17:10:00.000Z' },
          totalHours: { type: 'number', format: 'float', nullable: true, example: 9.08 },
          notes: { type: 'string', nullable: true, example: 'Llegó 5 minutos tarde' },
          registeredBy: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterAttendanceRequest: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['entry', 'exit'], example: 'entry', description: '"entry" para entrada, "exit" para salida' },
          notes: { type: 'string', nullable: true, example: 'Llegó 5 minutos tarde' }
        }
      },
      TodayStatus: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['absent', 'present', 'completed'], example: 'present', description: 'absent=sin registro, present=solo entrada, completed=entrada+salida' },
          nextAction: { type: 'string', enum: ['entry', 'exit'], nullable: true, example: 'exit' },
          record: { $ref: '#/components/schemas/AttendanceRecord' }
        }
      },

      // --- CATEGORIES ---
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Electrónica' },
          description: { type: 'string', nullable: true, example: 'Dispositivos electrónicos y accesorios' },
          parentId: { type: 'integer', nullable: true, example: null },
          level: { type: 'integer', example: 0 },
          isActive: { type: 'boolean', example: true },
          parent: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Categoría Padre' }
            }
          },
          children: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 5 },
                name: { type: 'string', example: 'Laptops' },
                level: { type: 'integer', example: 1 }
              }
            }
          },
          productsCount: { type: 'integer', example: 25 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 200, example: 'Electrónica' },
          description: { type: 'string', nullable: true, example: 'Dispositivos electrónicos y accesorios' },
          parentId: { type: 'integer', nullable: true, example: null }
        }
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 200, example: 'Electrónica y Tecnología' },
          description: { type: 'string', nullable: true, example: 'Descripción actualizada' },
          parentId: { type: 'integer', nullable: true, example: null }
        }
      },

      // --- PRODUCTS ---
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Laptop HP 15-DY' },
          description: { type: 'string', nullable: true, example: 'Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD' },
          sku: { type: 'string', nullable: true, example: 'LAP-HP-001' },
          barcode: { type: 'string', nullable: true, example: '7891234567890' },
          price: { type: 'number', format: 'float', example: 650.00 },
          cost: { type: 'number', format: 'float', nullable: true, example: 450.00 },
          taxPercent: { type: 'number', format: 'float', example: 15.00 },
          imageUrl: { type: 'string', nullable: true, example: '/uploads/products/laptop-hp.jpg' },
          stock: { type: 'integer', example: 15 },
          minStock: { type: 'integer', example: 5 },
          maxStock: { type: 'integer', nullable: true, example: 50 },
          location: { type: 'string', nullable: true, example: 'Bodega A-3' },
          categoryId: { type: 'integer', nullable: true, example: 2 },
          category: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 2 },
              name: { type: 'string', example: 'Laptops' }
            }
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', maxLength: 200, example: 'Laptop HP 15-DY' },
          description: { type: 'string', nullable: true, example: 'Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD' },
          sku: { type: 'string', nullable: true, maxLength: 100, example: 'LAP-HP-001' },
          barcode: { type: 'string', nullable: true, maxLength: 100, example: '7891234567890' },
          price: { type: 'number', minimum: 0, example: 650.00 },
          cost: { type: 'number', nullable: true, minimum: 0, example: 450.00 },
          taxPercent: { type: 'number', minimum: 0, maximum: 100, example: 15.00 },
          categoryId: { type: 'integer', nullable: true, example: 2 },
          minStock: { type: 'integer', minimum: 0, example: 5 },
          maxStock: { type: 'integer', nullable: true, minimum: 0, example: 50 },
          location: { type: 'string', nullable: true, maxLength: 100, example: 'Bodega A-3' },
          isActive: { type: 'boolean', example: true }
        }
      },
      UpdateProductRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 200, example: 'Laptop HP 15-DY Actualizada' },
          description: { type: 'string', nullable: true, example: 'Descripción actualizada' },
          sku: { type: 'string', nullable: true, maxLength: 100, example: 'LAP-HP-001' },
          barcode: { type: 'string', nullable: true, maxLength: 100, example: '7891234567890' },
          categoryId: { type: 'integer', nullable: true, example: 2 },
          isActive: { type: 'boolean', example: true }
        }
      },
      UpdatePriceRequest: {
        type: 'object',
        required: ['newPrice'],
        properties: {
          newPrice: { type: 'number', minimum: 0, example: 680.00 },
          reason: { type: 'string', nullable: true, maxLength: 200, example: 'Ajuste por inflación' }
        }
      },
      PriceHistory: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          productId: { type: 'integer', example: 1 },
          previousPrice: { type: 'number', example: 650.00 },
          newPrice: { type: 'number', example: 680.00 },
          reason: { type: 'string', nullable: true, example: 'Ajuste por inflación' },
          changedBy: { type: 'integer', example: 1 },
          changedByUser: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'admin' },
              fullName: { type: 'string', example: 'Administrador Sistema' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      // --- INVENTORY ---
      InventoryItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Laptop HP 15-DY' },
          sku: { type: 'string', nullable: true, example: 'LAP-HP-001' },
          barcode: { type: 'string', nullable: true, example: '7891234567890' },
          stock: { type: 'integer', example: 15 },
          minStock: { type: 'integer', example: 5 },
          maxStock: { type: 'integer', nullable: true, example: 50 },
          location: { type: 'string', nullable: true, example: 'Bodega A-3' },
          category: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 2 },
              name: { type: 'string', example: 'Electrónica' }
            }
          },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-03-05T10:30:00.000Z' }
        }
      },
      StockMovement: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 25 },
          productId: { type: 'integer', example: 1 },
          movementType: { type: 'string', enum: ['entrada', 'salida', 'ajuste', 'inicial'], example: 'entrada' },
          quantity: { type: 'integer', example: 10 },
          stockBefore: { type: 'integer', example: 15 },
          stockAfter: { type: 'integer', example: 25 },
          reason: { type: 'string', example: 'Compra a proveedor' },
          notes: { type: 'string', nullable: true, example: 'Factura #12345' },
          referenceType: { type: 'string', nullable: true, example: 'purchase' },
          referenceId: { type: 'integer', nullable: true, example: 123 },
          performedBy: { type: 'integer', example: 1 },
          performedByUser: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'admin' },
              fullName: { type: 'string', example: 'Administrador Sistema' }
            }
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-03-01T14:30:00.000Z' }
        }
      },
      RegisterMovementRequest: {
        type: 'object',
        required: ['productId', 'movementType', 'quantity', 'reason'],
        properties: {
          productId: { type: 'integer', example: 1 },
          movementType: { type: 'string', enum: ['entrada', 'salida'], example: 'entrada' },
          quantity: { type: 'integer', minimum: 1, example: 10 },
          reason: { type: 'string', maxLength: 100, example: 'Compra de mercadería' },
          notes: { type: 'string', nullable: true, maxLength: 500, example: 'Factura #12345' }
        }
      },
      UpdateStockLimitsRequest: {
        type: 'object',
        required: ['minStock'],
        properties: {
          minStock: { type: 'integer', minimum: 0, example: 5 },
          maxStock: { type: 'integer', nullable: true, minimum: 0, example: 50 },
          location: { type: 'string', nullable: true, maxLength: 100, example: 'Bodega A-3' }
        }
      },
      AdjustInventoryRequest: {
        type: 'object',
        required: ['productId', 'newStock', 'reason'],
        properties: {
          productId: { type: 'integer', example: 1 },
          newStock: { type: 'integer', minimum: 0, example: 20 },
          reason: { type: 'string', maxLength: 100, example: 'Inventario físico' },
          notes: { type: 'string', nullable: true, maxLength: 500, example: 'Se encontraron 5 unidades extras' }
        }
      },
      LowStockAlert: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          name: { type: 'string', example: 'Mouse inalámbrico' },
          sku: { type: 'string', example: 'MOU-LOC-001' },
          stock: { type: 'integer', example: 2 },
          minStock: { type: 'integer', example: 10 },
          maxStock: { type: 'integer', nullable: true, example: 50 },
          deficit: { type: 'integer', example: 8 },
          category: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 2 },
              name: { type: 'string', example: 'Accesorios' }
            }
          }
        }
      },
      InventoryValue: {
        type: 'object',
        properties: {
          totalProducts: { type: 'integer', example: 150 },
          totalItems: { type: 'integer', example: 2500 },
          totalCostValue: { type: 'number', format: 'float', example: 45000.50 },
          totalSaleValue: { type: 'number', format: 'float', example: 67500.75 },
          potentialProfit: { type: 'number', format: 'float', example: 22500.25 }
        }
      },

      // --- PURCHASES ---
      PurchaseOrder: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          orderNumber: { type: 'string', example: 'PO-20260318-0001' },
          supplierId: { type: 'integer', example: 3 },
          orderDate: { type: 'string', format: 'date', example: '2026-03-18' },
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true, example: '2026-03-25' },
          status: { type: 'string', enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'], example: 'pendiente' },
          subtotal: { type: 'number', format: 'float', example: 1250.00 },
          totalAmount: { type: 'number', format: 'float', example: 1250.00 },
          notes: { type: 'string', nullable: true, example: 'Entrega parcial permitida' },
          statusObservations: { type: 'string', nullable: true, example: 'Confirmada por proveedor' },
          receivedAt: { type: 'string', format: 'date-time', nullable: true },
          cancelledAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PurchaseOrderDetail: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 10 },
          purchaseOrderId: { type: 'integer', example: 1 },
          productId: { type: 'integer', example: 5 },
          quantityOrdered: { type: 'integer', example: 20 },
          quantityReceived: { type: 'integer', example: 18 },
          unitCost: { type: 'number', format: 'float', example: 12.50 },
          lineTotal: { type: 'number', format: 'float', example: 250.00 },
          notes: { type: 'string', nullable: true, example: 'Caja con daño menor' },
          product: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer', example: 5 },
              name: { type: 'string', example: 'Mouse inalámbrico' },
              sku: { type: 'string', example: 'MOU-001' },
              barcode: { type: 'string', example: '7891234567890' }
            }
          }
        }
      },
      PurchaseStatusHistory: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 21 },
          purchaseOrderId: { type: 'integer', example: 1 },
          previousStatus: { type: 'string', nullable: true, enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'], example: 'pendiente' },
          newStatus: { type: 'string', enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'], example: 'confirmada' },
          notes: { type: 'string', nullable: true, example: 'Proveedor confirmó stock' },
          changedBy: { type: 'integer', example: 1 },
          changedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreatePurchaseOrderRequest: {
        type: 'object',
        required: ['supplierId', 'products'],
        properties: {
          supplierId: { type: 'integer', example: 3 },
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true, example: '2026-03-25' },
          observations: { type: 'string', nullable: true, example: 'Entregar en bodega principal' },
          products: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitCost'],
              properties: {
                productId: { type: 'integer', example: 5 },
                quantity: { type: 'integer', minimum: 1, example: 20 },
                unitCost: { type: 'number', minimum: 0, example: 12.50 }
              }
            }
          }
        }
      },
      UpdatePurchaseOrderRequest: {
        type: 'object',
        properties: {
          supplierId: { type: 'integer', example: 3 },
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true, example: '2026-03-26' },
          observations: { type: 'string', nullable: true, example: 'Actualizar dirección de entrega' },
          products: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitCost'],
              properties: {
                productId: { type: 'integer', example: 5 },
                quantity: { type: 'integer', minimum: 1, example: 25 },
                unitCost: { type: 'number', minimum: 0, example: 12.50 }
              }
            }
          }
        }
      },
      ChangePurchaseStatusRequest: {
        type: 'object',
        required: ['newStatus'],
        properties: {
          newStatus: { type: 'string', enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'], example: 'confirmada' },
          observations: { type: 'string', nullable: true, example: 'Proveedor confirmó despacho' }
        }
      },
      ReceivePurchaseOrderRequest: {
        type: 'object',
        properties: {
          observations: { type: 'string', nullable: true, example: 'Faltaron 2 unidades del producto MOU-001' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantityReceived'],
              properties: {
                productId: { type: 'integer', example: 5 },
                quantityReceived: { type: 'integer', minimum: 0, example: 18 }
              }
            }
          }
        }
      },
      CancelPurchaseOrderRequest: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', maxLength: 500, example: 'Proveedor no puede cumplir tiempos de entrega' }
        }
      }
    },

    // Respuestas reutilizables
    responses: {
      Unauthorized: {
        description: 'Token inválido o no proporcionado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { success: false, message: 'Token requerido', errors: null }
          }
        }
      },
      Forbidden: {
        description: 'Sin permisos para realizar la acción',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { success: false, message: 'No tiene permisos para realizar esta acción', errors: null }
          }
        }
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { success: false, message: 'Usuario no encontrado', errors: null }
          }
        }
      },
      ValidationError: {
        description: 'Error de validación en los datos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' }
          }
        }
      },
      Conflict: {
        description: 'Conflicto - el recurso ya existe',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { success: false, message: 'El nombre de usuario ya está en uso', errors: null }
          }
        }
      }
    }
  },

  // ============================================
  // ENDPOINTS
  // ============================================
  paths: {

    // ==========================================
    // AUTH
    // ==========================================
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario y retorna tokens JWT. Máximo 5 intentos fallidos antes del bloqueo (15 min).',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { username: 'admin', password: 'Admin123' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/LoginResponse' } } }
                  ]
                }
              }
            }
          },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          403: { description: 'Cuenta bloqueada o inactiva', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar token de acceso',
        description: 'Genera un nuevo accessToken usando el refreshToken. El refresh token anterior queda invalidado.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
        },
        responses: {
          200: {
            description: 'Token renovado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' },
                            expiresIn: { type: 'string', example: '24h' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión actual',
        description: 'Invalida el refresh token de la sesión actual.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
        },
        responses: {
          200: { description: 'Sesión cerrada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar todas las sesiones',
        description: 'Invalida todos los refresh tokens del usuario autenticado.',
        responses: {
          200: {
            description: 'Todas las sesiones cerradas',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { type: 'object', properties: { sessionsRevoked: { type: 'integer', example: 3 } } } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil completo del usuario',
        description: 'Retorna los datos completos del usuario autenticado incluyendo permisos y módulos accesibles.',
        responses: {
          200: { description: 'Perfil obtenido exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Datos básicos del usuario (ligero)',
        description: 'Versión ligera de /profile. Retorna solo id, username, email y rol.',
        responses: {
          200: { description: 'Usuario autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/check': {
      get: {
        tags: ['Auth'],
        summary: 'Verificar validez del token',
        description: 'Verifica si el accessToken es válido. Útil para guards del frontend.',
        responses: {
          200: { description: 'Token válido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/verify-permission': {
      post: {
        tags: ['Auth'],
        summary: 'Verificar permiso específico',
        description: 'Verifica si el usuario autenticado tiene un permiso particular en un módulo.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPermissionRequest' } } }
        },
        responses: {
          200: {
            description: 'Verificación completada',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { type: 'object', properties: { hasPermission: { type: 'boolean' }, module: { type: 'string' }, action: { type: 'string' } } } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Cambiar contraseña propia',
        description: 'El usuario autenticado cambia su propia contraseña. Cierra todas las sesiones activas al finalizar.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } }
        },
        responses: {
          200: { description: 'Contraseña actualizada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    // ==========================================
    // ROLES
    // ==========================================
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Listar todos los roles',
        description: 'Retorna todos los roles del sistema con sus permisos.',
        responses: {
          200: {
            description: 'Lista de roles',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/roles/{roleId}': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener rol por ID',
        parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: { description: 'Rol encontrado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Role' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/roles/{roleId}/permissions': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener permisos de un rol',
        description: 'Retorna el mapa de permisos detallado del rol.',
        parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: { description: 'Permisos del rol', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/roles/{roleId}/modules': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener módulos accesibles de un rol',
        description: 'Lista los módulos a los que tiene acceso el rol.',
        parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: { description: 'Módulos accesibles', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/roles/{roleId}/check-permission': {
      post: {
        tags: ['Roles'],
        summary: 'Verificar un permiso en un rol',
        parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckPermissionRequest' } } } },
        responses: {
          200: { description: 'Resultado de verificación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/roles/{roleId}/check-multiple-permissions': {
      post: {
        tags: ['Roles'],
        summary: 'Verificar múltiples permisos en un rol',
        parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckMultiplePermissionsRequest' } } } },
        responses: {
          200: { description: 'Resultados de verificación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    // ==========================================
    // SETTINGS
    // ==========================================
    '/settings/health': {
      get: {
        tags: ['Settings'],
        summary: 'Health check del módulo de configuración',
        description: 'Verifica que el módulo de configuración esté operativo. No requiere autenticación.',
        security: [],
        responses: {
          200: { description: 'Módulo operativo', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } }
        }
      }
    },

    '/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Obtener toda la configuración',
        description: 'Retorna la configuración completa del sistema agrupada por tipo.',
        responses: {
          200: { description: 'Configuración completa', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },
      put: {
        tags: ['Settings'],
        summary: 'Actualizar configuración completa',
        description: 'Actualiza toda la configuración del sistema. Requiere permiso `settings:edit`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company: { type: 'object', description: 'Datos de la empresa' },
                  fiscal: { type: 'object', description: 'Configuración fiscal' },
                  business: { type: 'object', description: 'Parámetros de negocio' },
                  technical: { type: 'object', description: 'Configuración técnica' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Configuración actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/settings/technical/parameters': {
      get: {
        tags: ['Settings'],
        summary: 'Obtener parámetros técnicos',
        description: 'Retorna los parámetros técnicos del sistema (timeout, formatos de fecha, etc.).',
        responses: {
          200: { description: 'Parámetros técnicos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/settings/logo': {
      post: {
        tags: ['Settings'],
        summary: 'Subir logo de la empresa',
        description: 'Carga la imagen del logo de la empresa. Formatos: JPG, PNG, SVG. Máximo 2MB.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  logo: { type: 'string', format: 'binary', description: 'Imagen del logo (JPG, PNG, SVG - máx 2MB)' }
                },
                required: ['logo']
              }
            }
          }
        },
        responses: {
          200: { description: 'Logo subido exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/settings/backup/configure': {
      post: {
        tags: ['Settings'],
        summary: 'Configurar backups automáticos',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean', example: true },
                  frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'], example: 'daily' },
                  time: { type: 'string', example: '02:00', description: 'Hora en formato HH:MM' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Backup configurado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/settings/{configType}': {
      get: {
        tags: ['Settings'],
        summary: 'Obtener configuración por tipo',
        parameters: [{
          name: 'configType',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['company', 'fiscal', 'business', 'technical', 'backup', 'appearance'] },
          example: 'company'
        }],
        responses: {
          200: { description: 'Configuración del tipo especificado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      },
      put: {
        tags: ['Settings'],
        summary: 'Actualizar configuración por tipo',
        parameters: [{
          name: 'configType',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['company', 'fiscal', 'business', 'technical', 'backup', 'appearance'] }
        }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', description: 'Campos específicos del tipo de configuración' } } } },
        responses: {
          200: { description: 'Configuración actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/settings/{configType}/reset': {
      post: {
        tags: ['Settings'],
        summary: 'Resetear configuración a valores por defecto',
        description: 'Restaura los valores por defecto del tipo de configuración especificado.',
        parameters: [{
          name: 'configType',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['company', 'fiscal', 'business', 'technical', 'backup', 'appearance'] }
        }],
        responses: {
          200: { description: 'Configuración reseteada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // ==========================================
    // USERS
    // ==========================================
    '/users/check-availability': {
      post: {
        tags: ['Users'],
        summary: 'Verificar disponibilidad de username y/o email',
        description: 'Verifica si un username o email están disponibles. Útil para validación en tiempo real en formularios.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckAvailabilityRequest' },
              examples: {
                checkUsername: { summary: 'Verificar username', value: { username: 'jperez' } },
                checkEmail: { summary: 'Verificar email', value: { email: 'jperez@empresa.com' } },
                checkBoth: { summary: 'Verificar ambos (edición)', value: { username: 'jperez', email: 'jperez@empresa.com', excludeId: 5 } }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Resultado de disponibilidad',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: {
                  success: true,
                  message: 'Verificación completada',
                  data: {
                    username: { available: true, value: 'jperez' },
                    email: { available: false, value: 'jperez@empresa.com' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios',
        description: 'Retorna la lista paginada de usuarios con filtros opcionales. Requiere permiso `users:view`.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Número de página' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }, description: 'Registros por página' },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 }, description: 'Buscar por nombre, username o email' },
          { name: 'roleId', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ID de rol' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filtrar por estado activo/inactivo' }
        ],
        responses: {
          200: {
            description: 'Lista de usuarios paginada',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                            pagination: { $ref: '#/components/schemas/Pagination' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },

      post: {
        tags: ['Users'],
        summary: 'Crear nuevo usuario',
        description: 'Crea un usuario en el sistema. Si no se envía password, se genera automáticamente. Requiere permiso `users:create`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
              examples: {
                conPasswordManual: {
                  summary: 'Con contraseña definida',
                  value: { username: 'jperez', email: 'jperez@empresa.com', firstName: 'Juan', lastName: 'Pérez', roleId: 3, password: 'MiPass123!', mustChangePassword: false }
                },
                conPasswordAutomatico: {
                  summary: 'Con contraseña automática (recomendado)',
                  value: { username: 'mrodriguez', email: 'mrodriguez@empresa.com', firstName: 'María', lastName: 'Rodríguez', roleId: 4 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/CreateUserResponse' } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        description: 'Retorna los datos completos de un usuario incluyendo su rol. Requiere permiso `users:view`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        responses: {
          200: { description: 'Usuario encontrado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },

      put: {
        tags: ['Users'],
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos de un usuario. Solo envía los campos que deseas modificar. Requiere permiso `users:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } }
        },
        responses: {
          200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      },

      delete: {
        tags: ['Users'],
        summary: 'Eliminar usuario (soft delete)',
        description: 'Desactiva el usuario y lo marca como eliminado. No se borra físicamente de la BD. Cierra todas sus sesiones. Requiere permiso `users:delete`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        responses: {
          200: { description: 'Usuario eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/users/{id}/reset-password': {
      post: {
        tags: ['Users'],
        summary: 'Resetear contraseña de usuario',
        description: 'Genera una contraseña temporal para el usuario. El usuario debe cambiarla en su próximo login. **Solo Administradores.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
              examples: {
                automatica: { summary: 'Generar contraseña automática', value: {} },
                manual: { summary: 'Definir contraseña manualmente', value: { newPassword: 'Temporal123!' } }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Contraseña reseteada exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: {
                  success: true,
                  message: 'Contraseña reseteada exitosamente',
                  data: { message: 'Contraseña reseteada exitosamente', temporaryPassword: 'Xy7!kM3p', mustChangePassword: true, expiresIn: '24 horas' }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/users/{id}/status': {
      patch: {
        tags: ['Users'],
        summary: 'Cambiar estado del usuario',
        description: `Cambia el estado de la cuenta del usuario. Requiere permiso \`users:edit\`.

**Estados disponibles:**
- \`active\` — Activa la cuenta y desbloquea
- \`inactive\` — Desactiva la cuenta y cierra sesiones
- \`unlock\` — Desbloquea la cuenta (resetea intentos fallidos)
- \`lock\` — Bloquea la cuenta por 24 horas`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangeStatusRequest' },
              examples: {
                activar: { summary: 'Activar usuario', value: { status: 'active' } },
                desactivar: { summary: 'Desactivar usuario', value: { status: 'inactive' } },
                desbloquear: { summary: 'Desbloquear cuenta', value: { status: 'unlock' } },
                bloquear: { summary: 'Bloquear cuenta 24h', value: { status: 'lock' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado cambiado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/users/{id}/sessions': {
      get: {
        tags: ['Users'],
        summary: 'Ver sesiones activas del usuario',
        description: 'Lista todas las sesiones activas (tokens no expirados ni revocados) del usuario. **Solo Administradores.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        responses: {
          200: {
            description: 'Sesiones activas',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            sessions: { type: 'array', items: { $ref: '#/components/schemas/UserSession' } },
                            totalActive: { type: 'integer', example: 2 }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/users/{id}/logout-all': {
      post: {
        tags: ['Users'],
        summary: 'Cerrar todas las sesiones del usuario',
        description: 'Invalida todos los refresh tokens activos del usuario, forzando un nuevo login. **Solo Administradores.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 2 } }],
        responses: {
          200: {
            description: 'Sesiones cerradas exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: { success: true, message: 'Se cerraron 2 sesión(es) activa(s)', data: { sessionsRevoked: 2 } }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // ==========================================
    // EMPLOYEES
    // ==========================================
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Listar empleados',
        description: 'Retorna la lista paginada de empleados con filtros opcionales. Requiere permiso `employees:view`.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre, documento o email' },
          { name: 'area', in: 'query', schema: { type: 'string', enum: ['administracion', 'caja', 'bodega', 'atencion', 'ventas'] } },
          { name: 'shift', in: 'query', schema: { type: 'string', enum: ['morning', 'afternoon', 'night'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: {
            description: 'Lista de empleados paginada',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { type: 'object', properties: { employees: { type: 'array', items: { $ref: '#/components/schemas/Employee' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },

      post: {
        tags: ['Employees'],
        summary: 'Crear nuevo empleado',
        description: 'Registra un nuevo empleado en el sistema. El `documentNumber` debe ser único. Requiere permiso `employees:create`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEmployeeRequest' },
              example: {
                firstName: 'Carlos', lastName: 'Mendoza', documentType: 'cedula',
                documentNumber: '0912345678', area: 'caja', shift: 'morning',
                salary: 500.00, hireDate: '2024-01-15'
              }
            }
          }
        },
        responses: {
          201: { description: 'Empleado creado exitosamente', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Obtener empleado por ID',
        description: 'Retorna datos completos del empleado incluyendo usuario vinculado. Requiere permiso `employees:view`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: { description: 'Empleado encontrado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },

      put: {
        tags: ['Employees'],
        summary: 'Actualizar empleado',
        description: 'Actualiza los datos del empleado. Solo enviar campos a modificar. Requiere permiso `employees:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeRequest' } } }
        },
        responses: {
          200: { description: 'Empleado actualizado', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      },

      delete: {
        tags: ['Employees'],
        summary: 'Eliminar empleado (soft delete)',
        description: 'Desactiva el empleado y lo marca como eliminado. No se borra físicamente. Requiere permiso `employees:delete`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: { description: 'Empleado eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/employees/{id}/link-user': {
      patch: {
        tags: ['Employees'],
        summary: 'Vincular / desvincular usuario del sistema',
        description: 'Asocia un usuario del sistema con el empleado. Envía `userId: null` para desvincular. **Solo Administradores.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LinkUserRequest' },
              examples: {
                vincular:   { summary: 'Vincular usuario',   value: { userId: 5 } },
                desvincular: { summary: 'Desvincular usuario', value: { userId: null } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Vinculación actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    },

    '/employees/{id}/attendance/today': {
      get: {
        tags: ['Employees'],
        summary: 'Estado de asistencia de hoy',
        description: 'Retorna el estado del empleado para el día de hoy: `absent` (sin registro), `present` (solo entrada), `completed` (entrada + salida). Requiere permiso `employees:view`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        responses: {
          200: {
            description: 'Estado de asistencia',
            content: {
              'application/json': {
                schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }, { properties: { data: { $ref: '#/components/schemas/TodayStatus' } } }] },
                examples: {
                  absent:    { summary: 'Sin registro',        value: { success: true, message: 'Estado de asistencia de hoy obtenido exitosamente', data: { status: 'absent', nextAction: 'entry', record: null } } },
                  present:   { summary: 'Solo entrada',        value: { success: true, message: 'Estado de asistencia de hoy obtenido exitosamente', data: { status: 'present', nextAction: 'exit', record: { entryTime: '2026-02-22T08:05:00.000Z' } } } },
                  completed: { summary: 'Entrada y salida',    value: { success: true, message: 'Estado de asistencia de hoy obtenido exitosamente', data: { status: 'completed', nextAction: null, record: { entryTime: '2026-02-22T08:05:00.000Z', exitTime: '2026-02-22T17:10:00.000Z', totalHours: 9.08 } } } }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/employees/{id}/attendance': {
      get: {
        tags: ['Employees'],
        summary: 'Historial de asistencia',
        description: 'Retorna el historial de asistencia del empleado con paginación y filtro por rango de fechas. Incluye resumen de días trabajados y horas totales. Requiere permiso `employees:view`.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-02-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-02-28' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 31, minimum: 1, maximum: 100 } }
        ],
        responses: {
          200: {
            description: 'Historial de asistencia',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            employee: { type: 'object', properties: { id: { type: 'integer' }, fullName: { type: 'string', example: 'Carlos Mendoza' } } },
                            records: { type: 'array', items: { $ref: '#/components/schemas/AttendanceRecord' } },
                            summary: { type: 'object', properties: { totalDaysWorked: { type: 'integer', example: 20 }, totalHours: { type: 'number', example: 182.5 } } },
                            pagination: { $ref: '#/components/schemas/Pagination' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },

      post: {
        tags: ['Employees'],
        summary: 'Registrar entrada o salida',
        description: `Registra la asistencia del empleado para el día de hoy.

**Reglas:**
- \`entry\`: Crea el registro del día. Error si ya existe una entrada hoy.
- \`exit\`: Actualiza el registro con la hora de salida y calcula las horas trabajadas. Error si no hay entrada o ya se registró salida.

Requiere permiso \`employees:edit\`.`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterAttendanceRequest' },
              examples: {
                entrada: { summary: 'Marcar entrada', value: { type: 'entry' } },
                salida:  { summary: 'Marcar salida', value: { type: 'exit', notes: 'Salió por cita médica' } }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Asistencia registrada exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: { success: true, message: 'Entrada registrada exitosamente', data: { type: 'entry', timestamp: '2026-02-22T08:05:00.000Z', employee: { id: 1, fullName: 'Carlos Mendoza' }, record: { date: '2026-02-22', entryTime: '2026-02-22T08:05:00.000Z' } } }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    // ==========================================
    // CATEGORIES
    // ==========================================
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorías',
        description: `Obtiene el árbol completo de categorías con estructura jerárquica.

**Filtros:**
- \`status\`: 'active' (solo activas), 'inactive' (solo inactivas), 'all' (todas)

**Estructura:**
Las categorías raíz incluyen sus hijos en el campo \`children\`.

Requiere permiso \`categories:view\`.`,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'all'], default: 'active' }, example: 'active' }
        ],
        responses: {
          200: {
            description: 'Categorías obtenidas exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Category' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },

      post: {
        tags: ['Categories'],
        summary: 'Crear categoría',
        description: `Crea una nueva categoría raíz o subcategoría.

**Reglas:**
- Si \`parentId\` es null → Categoría raíz (level 0)
- Si \`parentId\` tiene valor → Subcategoría (level = nivel del padre + 1)
- El nombre debe ser único

Requiere permiso \`categories:create\`.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
              examples: {
                raiz: {
                  summary: 'Categoría raíz',
                  value: { name: 'Electrónica', description: 'Dispositivos electrónicos', parentId: null }
                },
                subcategoria: {
                  summary: 'Subcategoría',
                  value: { name: 'Laptops', description: 'Computadoras portátiles', parentId: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Categoría creada exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Category' } } }
                  ]
                }
              }
            }
          },
          400: { $ref: '#/components/responses/Conflict' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Obtener categoría por ID',
        description: `Obtiene los detalles de una categoría específica, incluyendo padre e hijos.

Requiere permiso \`categories:view\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Categoría obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Category' } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },

      put: {
        tags: ['Categories'],
        summary: 'Actualizar categoría',
        description: `Actualiza los datos de una categoría.

**Nota:** No se puede cambiar el padre si la categoría tiene hijos.

Requiere permiso \`categories:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCategoryRequest' },
              example: { name: 'Electrónica y Tecnología', description: 'Actualizado', parentId: null }
            }
          }
        },
        responses: {
          200: {
            description: 'Categoría actualizada exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Category' } } }
                  ]
                }
              }
            }
          },
          400: { $ref: '#/components/responses/Conflict' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/categories/{id}/status': {
      patch: {
        tags: ['Categories'],
        summary: 'Activar/desactivar categoría',
        description: `Alterna el estado activo/inactivo de una categoría.

**Comportamiento en desactivación:**
- Desactiva la categoría
- Desactiva TODAS las subcategorías hijas (cascada)

Requiere permiso \`categories:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Estado actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            category: { $ref: '#/components/schemas/Category' },
                            affectedChildren: { type: 'integer', example: 3 }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/categories/{id}/products': {
      get: {
        tags: ['Categories'],
        summary: 'Productos de una categoría',
        description: `Obtiene todos los productos asociados a una categoría específica.

Requiere permiso \`categories:view\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Productos obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            category: { $ref: '#/components/schemas/Category' },
                            products: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Product' }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    // ==========================================
    // PRODUCTS
    // ==========================================
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos',
        description: `Obtiene el listado de productos con filtros y paginación.

**Filtros disponibles:**
- \`search\`: Busca por nombre, SKU o código de barras
- \`categoryId\`: Filtra por categoría
- \`isActive\`: true (activos), false (inactivos)
- \`minPrice\` y \`maxPrice\`: Rango de precios

Requiere permiso \`products:view\`.`,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, example: 10 },
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'laptop' },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' }, example: 2 },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, example: true },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, example: 100 },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, example: 1000 }
        ],
        responses: {
          200: {
            description: 'Productos obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            products: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Product' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                total: { type: 'integer', example: 150 },
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                pages: { type: 'integer', example: 15 },
                                hasNext: { type: 'boolean', example: true },
                                hasPrev: { type: 'boolean', example: false }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      },

      post: {
        tags: ['Products'],
        summary: 'Crear producto',
        description: `Crea un nuevo producto en el catálogo.

**Reglas:**
- \`name\` y \`price\` son obligatorios
- \`sku\` y \`barcode\` deben ser únicos si se especifican
- El stock inicial se establece en 0 (se actualiza desde Inventory)

Requiere permiso \`products:create\`.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductRequest' },
              example: {
                name: 'Laptop HP 15-DY',
                description: 'Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD',
                sku: 'LAP-HP-001',
                barcode: '7891234567890',
                price: 650.00,
                cost: 450.00,
                taxPercent: 15.00,
                categoryId: 2,
                minStock: 5,
                maxStock: 50,
                location: 'Bodega A-3',
                isActive: true
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Producto creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Product' } } }
                  ]
                }
              }
            }
          },
          400: { $ref: '#/components/responses/Conflict' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Obtener producto por ID',
        description: `Obtiene los detalles completos de un producto, incluyendo categoría e historial de precios.

Requiere permiso \`products:view\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Producto obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            product: { $ref: '#/components/schemas/Product' },
                            priceHistory: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/PriceHistory' }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },

      put: {
        tags: ['Products'],
        summary: 'Actualizar producto',
        description: `Actualiza los datos generales de un producto.

**Nota:** Para actualizar el precio, use \`PATCH /products/:id/price\` que registra en historial.

Requiere permiso \`products:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductRequest' },
              example: {
                name: 'Laptop HP 15-DY Actualizada',
                description: 'Descripción actualizada',
                sku: 'LAP-HP-001',
                categoryId: 2,
                isActive: true
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Producto actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Product' } } }
                  ]
                }
              }
            }
          },
          400: { $ref: '#/components/responses/Conflict' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      },

      delete: {
        tags: ['Products'],
        summary: 'Eliminar producto (soft delete)',
        description: `Elimina lógicamente un producto (soft delete). El producto no se borra físicamente, solo se marca como eliminado.

**Restricción:** No se puede eliminar si tiene movimientos de inventario.

Requiere permiso \`products:delete\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Producto eliminado exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' }
              }
            }
          },
          400: {
            description: 'No se puede eliminar',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { success: false, message: 'No se puede eliminar el producto porque tiene movimientos de inventario', errors: null }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/products/{id}/price': {
      patch: {
        tags: ['Products'],
        summary: 'Actualizar precio',
        description: `Actualiza el precio de un producto y registra el cambio en el historial de precios.

**Características:**
- Registra precio anterior, nuevo precio y razón del cambio
- Mantiene historial completo de cambios de precio
- Registra quién realizó el cambio

Requiere permiso \`products:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePriceRequest' },
              example: {
                newPrice: 680.00,
                reason: 'Ajuste por inflación'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Precio actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            product: { $ref: '#/components/schemas/Product' },
                            priceChange: { $ref: '#/components/schemas/PriceHistory' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/products/{id}/status': {
      patch: {
        tags: ['Products'],
        summary: 'Activar/desactivar producto',
        description: `Alterna el estado activo/inactivo de un producto.

Requiere permiso \`products:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Estado actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Product' } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/products/barcode/{code}': {
      get: {
        tags: ['Products'],
        summary: 'Buscar por código de barras',
        description: `Busca un producto por su código de barras. Útil para sistemas de punto de venta con lectores de código de barras.

Requiere permiso \`products:view\`.`,
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' }, example: '7891234567890' }
        ],
        responses: {
          200: {
            description: 'Producto encontrado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { properties: { data: { $ref: '#/components/schemas/Product' } } }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Producto no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { success: false, message: 'Producto no encontrado con ese código de barras', errors: null }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // INVENTORY
    // ==========================================
    '/inventory': {
      get: {
        tags: ['Inventory'],
        summary: 'Listar inventario',
        description: `Obtiene el listado de productos con su stock actual y filtros disponibles.

**Filtros disponibles:**
- \`search\`: Busca por nombre, SKU o código de barras
- \`categoryId\`: Filtra por categoría
- \`lowStock\`: true para mostrar solo productos con stock bajo (stock <= minStock)
- \`outOfStock\`: true para mostrar solo productos sin stock

Requiere permiso \`inventory:view\`.`,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, example: 10 },
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'laptop' },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' }, example: 2 },
          { name: 'lowStock', in: 'query', schema: { type: 'boolean' }, example: false },
          { name: 'outOfStock', in: 'query', schema: { type: 'boolean' }, example: false }
        ],
        responses: {
          200: {
            description: 'Inventario obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            inventory: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/InventoryItem' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                total: { type: 'integer', example: 150 },
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                pages: { type: 'integer', example: 15 },
                                hasNext: { type: 'boolean', example: true },
                                hasPrev: { type: 'boolean', example: false }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/inventory/{id}': {
      get: {
        tags: ['Inventory'],
        summary: 'Obtener stock de un producto',
        description: `Obtiene información detallada del stock de un producto específico, incluyendo alertas si el stock está bajo o excede el máximo.

Requiere permiso \`inventory:view\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: {
            description: 'Stock del producto obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            product: { $ref: '#/components/schemas/InventoryItem' },
                            stockStatus: {
                              type: 'object',
                              properties: {
                                current: { type: 'integer', example: 15 },
                                min: { type: 'integer', example: 5 },
                                max: { type: 'integer', nullable: true, example: 50 },
                                difference: { type: 'integer', example: 10 },
                                needsRestock: { type: 'boolean', example: false }
                              }
                            },
                            alerts: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  type: { type: 'string', example: 'warning' },
                                  message: { type: 'string', example: 'Stock bajo' }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/inventory/movement': {
      post: {
        tags: ['Inventory'],
        summary: 'Registrar movimiento manual',
        description: `Registra un movimiento manual de entrada o salida de inventario.

**Tipos de movimiento:**
- \`entrada\`: Aumenta el stock (ej: compras, devoluciones de clientes)
- \`salida\`: Disminuye el stock (ej: ventas, merma, productos dañados)

**Nota:** Las compras y ventas registran movimientos automáticamente. Use este endpoint solo para ajustes manuales.

Requiere permiso \`inventory:create\`.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterMovementRequest' },
              examples: {
                entrada: {
                  summary: 'Entrada de mercadería',
                  value: {
                    productId: 1,
                    movementType: 'entrada',
                    quantity: 50,
                    reason: 'Compra a proveedor',
                    notes: 'Factura #12345'
                  }
                },
                salida: {
                  summary: 'Salida por daño',
                  value: {
                    productId: 1,
                    movementType: 'salida',
                    quantity: 3,
                    reason: 'Productos dañados',
                    notes: 'Daño durante transporte'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Movimiento registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            movement: { $ref: '#/components/schemas/StockMovement' },
                            product: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer', example: 1 },
                                name: { type: 'string', example: 'Laptop HP 15-DY' },
                                previousStock: { type: 'integer', example: 15 },
                                currentStock: { type: 'integer', example: 25 }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Stock insuficiente o datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { success: false, message: 'Stock insuficiente. Actual: 5, Solicitado: 10', errors: null }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/inventory/{id}/movements': {
      get: {
        tags: ['Inventory'],
        summary: 'Historial de movimientos',
        description: `Obtiene el historial completo de movimientos de un producto con filtros de fecha y tipo.

**Filtros disponibles:**
- \`startDate\` y \`endDate\`: Rango de fechas (formato ISO8601)
- \`movementType\`: entrada, salida, ajuste o inicial

Requiere permiso \`inventory:view\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, example: 20 },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' }, example: '2026-03-01T00:00:00Z' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' }, example: '2026-03-31T23:59:59Z' },
          { name: 'movementType', in: 'query', schema: { type: 'string', enum: ['entrada', 'salida', 'ajuste', 'inicial'] }, example: 'entrada' }
        ],
        responses: {
          200: {
            description: 'Historial obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            product: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer', example: 1 },
                                name: { type: 'string', example: 'Laptop HP 15-DY' },
                                sku: { type: 'string', example: 'LAP-HP-001' },
                                currentStock: { type: 'integer', example: 25 }
                              }
                            },
                            movements: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/StockMovement' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                total: { type: 'integer', example: 45 },
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 20 },
                                pages: { type: 'integer', example: 3 },
                                hasNext: { type: 'boolean', example: true },
                                hasPrev: { type: 'boolean', example: false }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/inventory/{id}/limits': {
      put: {
        tags: ['Inventory'],
        summary: 'Actualizar límites de stock',
        description: `Actualiza los límites mínimos y máximos de stock de un producto, así como su ubicación en bodega.

**Reglas:**
- \`minStock\`: Stock mínimo para generar alertas (requerido, >= 0)
- \`maxStock\`: Stock máximo recomendado (opcional, debe ser >= minStock)
- \`location\`: Ubicación física en bodega (opcional)

Requiere permiso \`inventory:edit\`.`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStockLimitsRequest' },
              example: {
                minStock: 10,
                maxStock: 100,
                location: 'Bodega Principal A-3'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Límites actualizados exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'Laptop HP 15-DY' },
                            stock: { type: 'integer', example: 25 },
                            minStock: { type: 'integer', example: 10 },
                            maxStock: { type: 'integer', example: 100 },
                            location: { type: 'string', example: 'Bodega Principal A-3' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { success: false, message: 'El stock máximo debe ser mayor o igual al stock mínimo', errors: null }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/inventory/alerts': {
      get: {
        tags: ['Inventory'],
        summary: 'Alertas de stock bajo',
        description: `Obtiene el listado de productos con stock bajo o sin stock.

**Criterios:**
- Productos con stock <= minStock
- Ordenados por criticidad (sin stock primero, luego por déficit)

**Resumen incluido:**
- Total de productos en alerta
- Cantidad sin stock (stock = 0)
- Cantidad crítica (stock <= 30% del mínimo)
- Cantidad en advertencia (stock > 30% del mínimo y <= mínimo)

Requiere permiso \`inventory:view\`.`,
        responses: {
          200: {
            description: 'Alertas obtenidas exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            alerts: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/LowStockAlert' }
                            },
                            summary: {
                              type: 'object',
                              properties: {
                                total: { type: 'integer', example: 12 },
                                outOfStock: { type: 'integer', example: 3 },
                                critical: { type: 'integer', example: 5 },
                                warning: { type: 'integer', example: 4 }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/inventory/adjust': {
      post: {
        tags: ['Inventory'],
        summary: 'Ajustar inventario por conteo físico',
        description: `Ajusta el stock de un producto basándose en un conteo físico (inventario real).

**Uso:**
- Corrección de diferencias entre sistema y stock físico
- Registro automático de movimiento tipo "ajuste"
- Calcula la diferencia y actualiza el stock

**Nota:** Este endpoint es para ajustes por conteo físico. Para movimientos regulares use \`POST /inventory/movement\`.

Requiere permiso \`inventory:edit\`.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdjustInventoryRequest' },
              example: {
                productId: 1,
                newStock: 20,
                reason: 'Inventario físico mensual',
                notes: 'Se encontraron 5 unidades adicionales no registradas'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Inventario ajustado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            adjustment: {
                              type: 'object',
                              properties: {
                                productId: { type: 'integer', example: 1 },
                                productName: { type: 'string', example: 'Laptop HP 15-DY' },
                                stockBefore: { type: 'integer', example: 15 },
                                stockAfter: { type: 'integer', example: 20 },
                                difference: { type: 'integer', example: 5 },
                                reason: { type: 'string', example: 'Inventario físico mensual' }
                              }
                            },
                            movement: { $ref: '#/components/schemas/StockMovement' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { $ref: '#/components/responses/Conflict' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/inventory/value': {
      get: {
        tags: ['Inventory'],
        summary: 'Valor total del inventario',
        description: `Calcula el valor total del inventario basado en costos y precios de venta.

**Información incluida:**
- Cantidad total de productos diferentes
- Cantidad total de unidades en stock
- Valor total al costo
- Valor total al precio de venta
- Ganancia potencial
- Desglose por categoría

**Filtros:**
- \`categoryId\`: Calcular solo para una categoría específica

Requiere permiso \`inventory:view\`.`,
        parameters: [
          { name: 'categoryId', in: 'query', schema: { type: 'integer' }, example: 2 }
        ],
        responses: {
          200: {
            description: 'Valor calculado exitosamente',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            summary: { $ref: '#/components/schemas/InventoryValue' },
                            byCategory: {
                              type: 'object',
                              additionalProperties: {
                                type: 'object',
                                properties: {
                                  products: { type: 'integer', example: 25 },
                                  items: { type: 'integer', example: 450 },
                                  costValue: { type: 'number', example: 12500.00 },
                                  saleValue: { type: 'number', example: 18750.00 }
                                }
                              },
                              example: {
                                'Electrónica': {
                                  products: 25,
                                  items: 450,
                                  costValue: 12500.00,
                                  saleValue: 18750.00
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // ==========================================
    // PURCHASES
    // ==========================================
    '/purchases': {
      get: {
        tags: ['Purchases'],
        summary: 'Listar órdenes de compra',
        description: 'Devuelve la lista de órdenes de compra con filtros y paginación. Requiere permiso `purchases:view`.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, example: 10 },
          { name: 'supplierId', in: 'query', schema: { type: 'integer' }, example: 3 },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'] }, example: 'pendiente' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-31' }
        ],
        responses: {
          200: { description: 'Órdenes obtenidas exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      },
      post: {
        tags: ['Purchases'],
        summary: 'Crear orden de compra',
        description: 'Registra una nueva orden de compra y genera automáticamente el número de orden. Requiere permiso `purchases:create`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePurchaseOrderRequest' },
              example: {
                supplierId: 3,
                expectedDeliveryDate: '2026-03-25',
                observations: 'Entrega en bodega principal',
                products: [
                  { productId: 5, quantity: 20, unitCost: 12.50 },
                  { productId: 8, quantity: 10, unitCost: 45.00 }
                ]
              }
            }
          }
        },
        responses: {
          201: { description: 'Orden creada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/{id}': {
      get: {
        tags: ['Purchases'],
        summary: 'Obtener orden de compra por ID',
        description: 'Retorna el detalle completo de la orden incluyendo productos e historial de estados. Requiere permiso `purchases:view`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: {
          200: { description: 'Orden obtenida exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Purchases'],
        summary: 'Actualizar orden de compra',
        description: 'Modifica una orden existente, solo si está en estado pendiente. Requiere permiso `purchases:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePurchaseOrderRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Orden actualizada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/{id}/status': {
      patch: {
        tags: ['Purchases'],
        summary: 'Cambiar estado de orden',
        description: 'Actualiza el estado de la orden (pendiente, confirmada, recibida, cancelada). Para `recibida` use `/purchases/{id}/receive`. Requiere permiso `purchases:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePurchaseStatusRequest' } } }
        },
        responses: {
          200: { description: 'Estado actualizado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/{id}/receive': {
      post: {
        tags: ['Purchases'],
        summary: 'Recibir orden de compra',
        description: 'Marca la orden como recibida y actualiza inventario según cantidades recibidas. Requiere permiso `purchases:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReceivePurchaseOrderRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Recepción confirmada y stock actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/{id}/cancel': {
      post: {
        tags: ['Purchases'],
        summary: 'Cancelar orden de compra',
        description: 'Cancela una orden de compra con motivo obligatorio. Requiere permiso `purchases:edit`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CancelPurchaseOrderRequest' },
              example: { reason: 'Proveedor no puede entregar en plazo' }
            }
          }
        },
        responses: {
          200: { description: 'Orden cancelada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/supplier/{supplierId}': {
      get: {
        tags: ['Purchases'],
        summary: 'Obtener compras por proveedor',
        description: 'Lista compras de un proveedor con filtros por fecha y paginación. Requiere permiso `purchases:view`.',
        parameters: [
          { name: 'supplierId', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-31' },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, example: 10 }
        ],
        responses: {
          200: { description: 'Compras del proveedor obtenidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },

    '/purchases/report': {
      get: {
        tags: ['Purchases'],
        summary: 'Generar reporte de compras',
        description: 'Genera estadísticas de compras por período, proveedor y estado. Requiere permiso `purchases:view`.',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-03-31' },
          { name: 'supplierId', in: 'query', schema: { type: 'integer' }, example: 3 },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pendiente', 'confirmada', 'recibida', 'cancelada'] }, example: 'recibida' }
        ],
        responses: {
          200: { description: 'Reporte generado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
