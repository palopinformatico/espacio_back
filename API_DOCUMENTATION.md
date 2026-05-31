# Documentación Completa de APIs - Sistema Espacio Back

**Versión:** 1.0
**Última actualización:** 05/02/2026
**Base URL:** `http://localhost:3000`

---

## 📋 Tabla de Contenidos

### Módulos del Sistema

1. [Users Module](#1-users-module) - Gestión de usuarios
2. [Categories Module](#2-categories-module) - Categorías de productos
3. [Products Module](#3-products-module) - Gestión de productos
4. [Orders Module](#4-orders-module) - Gestión de órdenes y ventas
5. [Customer Module](#5-customer-module) - Gestión de clientes
6. [Mesas Module](#6-mesas-module) - Gestión de mesas
7. [Gastos Module](#7-gastos-module) - Gestión de gastos y contabilidad
8. [Categoria Gasto Module](#8-categoria-gasto-module) - Categorías de gastos
9. [Auth Module](#9-auth-module) - Autenticación y autorización
10. [Products Orders Module](#10-products-orders-module) - Relación productos-órdenes
11. [Horarios Module](#11-horarios-module) - Configuración de horarios
12. [Theme Module](#12-theme-module) - Personalización de temas
13. [Costo Envío Module](#13-costo-envio-module) - Costos de envío
14. [Ticket Bar Module](#14-ticket-bar-module) - Tickets de bar
15. [ETA Module](#15-eta-module) - Cálculo de tiempos de entrega
16. [Proveedores Module](#16-proveedores-module) - Gestión de proveedores
17. [Ingresos Module](#17-ingresos-module) - Gestión de ingresos
18. [Categoría Ingresos Module](#18-categoria-ingresos-module) - Categorías de ingresos
19. [Clientes Ingresos Module](#19-clientes-ingresos-module) - Clientes de ingresos
20. [Documentos Ingreso Module](#20-documentos-ingreso-module) - Documentos de ingreso

### [Resumen General del Sistema](#resumen-general-del-sistema)
### [Códigos de Estado HTTP](#códigos-de-estado-http)
### [Autenticación y Seguridad](#autenticación-y-seguridad)

---

# 1. Users Module

Gestión completa de usuarios del sistema incluyendo autenticación, roles y perfiles.

**Base URL:** `/users`

## Endpoints

### 1.1 Crear Usuario

Crea un nuevo usuario en el sistema con carga opcional de imagen de perfil.

```http
POST /users
Content-Type: multipart/form-data
```

**Form Data:**
```
username: string (requerido)
full_name: string (requerido)
password: string (requerido)
profileImage: file (opcional)
role: string (opcional)
tipo_usuario: string (opcional)
fecha_nacimiento: date (opcional)
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "admin",
  "full_name": "Administrador",
  "profileImage": "/uploads/users/profile-123.jpg",
  "role": "admin",
  "tipo_usuario": "permanente",
  "fecha_nacimiento": "1990-01-01",
  "createdAt": "2026-02-05T10:00:00Z",
  "updatedAt": "2026-02-05T10:00:00Z"
}
```

### 1.2 Obtener Todos los Usuarios

```http
GET /users
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "username": "admin",
    "full_name": "Administrador",
    "profileImage": "/uploads/users/profile-123.jpg",
    "role": "admin",
    "tipo_usuario": "permanente",
    "createdAt": "2026-02-05T10:00:00Z"
  }
]
```

### 1.3 Obtener Usuario por ID

```http
GET /users/:id
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "admin",
  "full_name": "Administrador",
  "profileImage": "/uploads/users/profile-123.jpg",
  "role": "admin"
}
```

### 1.4 Actualizar Usuario

```http
PUT /users/:id
Content-Type: multipart/form-data
```

**Form Data:** (todos los campos opcionales)
```
username: string
full_name: string
password: string
profileImage: file
role: string
tipo_usuario: string
fecha_nacimiento: date
```

**Response:** `200 OK`

### 1.5 Eliminar Usuario

```http
DELETE /users/:id
```

**Response:** `200 OK`

## Modelo de Datos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | number | No | Identificador único |
| username | string | No | Nombre de usuario único |
| full_name | string | No | Nombre completo |
| password | string | No | Contraseña encriptada |
| profileImage | string | Sí | URL de imagen de perfil |
| role | string | Sí | Rol del usuario |
| tipo_usuario | string | Sí | Tipo de usuario |
| fecha_nacimiento | date | Sí | Fecha de nacimiento |
| createdAt | timestamp | No | Fecha de creación |
| updatedAt | timestamp | No | Fecha de última actualización |

---

# 2. Categories Module

Gestión de categorías de productos para organizar el catálogo.

**Base URL:** `/categorias`

## Endpoints

### 2.1 Buscar Categorías por Nombre

```http
GET /categorias/name?nombre=bebidas
```

**Query Parameters:**
- `nombre` (string): Término de búsqueda

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Bebidas",
    "icono": "🍹"
  }
]
```

### 2.2 Crear Categoría

```http
POST /categorias
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Bebidas",
  "icono": "🍹"
}
```

**Response:** `201 Created`

### 2.3 Obtener Todas las Categorías

```http
GET /categorias
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Bebidas",
    "icono": "🍹"
  },
  {
    "id": 2,
    "nombre": "Comidas",
    "icono": "🍔"
  }
]
```

### 2.4 Obtener Categoría por ID

```http
GET /categorias/:id
```

### 2.5 Actualizar Categoría

```http
PATCH /categorias/:id
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Bebidas Frías",
  "icono": "🥤"
}
```

### 2.6 Eliminar Categoría

```http
DELETE /categorias/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| nombre | string | Nombre de la categoría |
| icono | string | Icono o emoji de la categoría |

---

# 3. Products Module

Gestión completa del catálogo de productos con soporte para imágenes y categorización.

**Base URL:** `/products`

## Endpoints

### 3.1 Crear Producto

```http
POST /products
Content-Type: multipart/form-data
```

**Form Data:**
```
name: string (requerido)
description: string
price: number
cantidad: number
imageUrl: file
categoryIds: array<number> (requerido)
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Cerveza Artesanal",
  "description": "Cerveza artesanal de la casa",
  "price": 5000,
  "cantidad": 50,
  "imageUrl": "/uploads/products/cerveza-123.jpg",
  "categories": [
    {
      "id": 1,
      "nombre": "Bebidas",
      "icono": "🍹"
    }
  ]
}
```

### 3.2 Buscar Productos (Con Paginación)

```http
GET /products/buscar?search=cerveza&categoriaIds=1,2&page=1&limit=10
```

**Query Parameters:**
- `search` (string): Término de búsqueda
- `categoriaIds` (string): IDs de categorías separados por coma
- `page` (number): Número de página (default: 1)
- `limit` (number): Items por página (default: 10)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Cerveza Artesanal",
      "description": "Cerveza artesanal de la casa",
      "price": 5000,
      "imageUrl": "/uploads/products/cerveza-123.jpg",
      "categories": [...]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3.3 Buscar Productos (Sin Paginación)

```http
GET /products/buscars?search=cerveza&categoriaIds=1,2
```

**Response:** `200 OK` (Array de productos)

### 3.4 Obtener Todos los Productos

```http
GET /products/finds
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Cerveza Artesanal",
    "price": 5000,
    "cantidad": 50,
    "imageUrl": "/uploads/products/cerveza-123.jpg"
  }
]
```

### 3.5 Obtener Productos con Paginación

```http
GET /products/find?page=1&limit=10
```

### 3.6 Obtener Producto por ID

```http
GET /products/:id
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Cerveza Artesanal",
  "description": "Cerveza artesanal de la casa",
  "price": 5000,
  "cantidad": 50,
  "imageUrl": "/uploads/products/cerveza-123.jpg",
  "categories": [
    {
      "id": 1,
      "nombre": "Bebidas",
      "icono": "🍹"
    }
  ]
}
```

### 3.7 Actualizar Producto

```http
PUT /products/:id
Content-Type: multipart/form-data
```

**Form Data:** (todos los campos opcionales)
```
name: string
description: string
price: number
cantidad: number
imageUrl: file
categories: array<number>
```

**Response:** `200 OK`

### 3.8 Eliminar Producto

```http
DELETE /products/:id
```

**Response:** `200 OK`

**Nota:** Utiliza soft delete - el producto se marca como eliminado pero no se borra físicamente.

## Modelo de Datos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | number | No | Identificador único |
| name | string | No | Nombre del producto |
| description | text | Sí | Descripción detallada |
| price | number | No | Precio del producto |
| cantidad | number | Sí | Stock disponible |
| imageUrl | string | Sí | URL de la imagen del producto |
| deletedAt | timestamp | Sí | Fecha de eliminación (soft delete) |

---

# 4. Orders Module

Sistema completo de gestión de órdenes, ventas, mesas y delivery con análisis de ventas.

**Base URL:** `/orders`

## Endpoints Principales

### 4.1 Crear Orden

```http
POST /orders
Content-Type: application/json
```

**Body:**
```json
{
  "tableNumber": 5,
  "orderType": "local",
  "detalle_venta": "Sin cebolla",
  "propina": 1000,
  "neto": 10000,
  "status": "pendiente",
  "paymentMethod": "efectivo",
  "mesaId": 1,
  "customerId": 2,
  "products": [
    {
      "id": 1,
      "cantidad": 2
    },
    {
      "id": 3,
      "cantidad": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "numeroVenta": 1001,
  "tableNumber": 5,
  "orderType": "local",
  "total": 11000,
  "neto": 10000,
  "propina": 1000,
  "status": "pendiente",
  "estado": "activo",
  "createdAt": "2026-02-05T10:00:00Z",
  "orderProducts": [
    {
      "productId": 1,
      "cantidad": 2,
      "precioUnitario": 5000,
      "subtotal": 10000
    }
  ]
}
```

### 4.2 Obtener Todas las Órdenes

```http
GET /orders
```

**Response:** `200 OK`

### 4.3 Obtener Órdenes Pendientes

```http
GET /orders/pendientes
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "numeroVenta": 1001,
    "status": "pendiente",
    "total": 11000,
    "createdAt": "2026-02-05T10:00:00Z"
  }
]
```

### 4.4 Obtener Orden por ID

```http
GET /orders/:id
```

**Response:** `200 OK`

### 4.5 Obtener Detalle de Orden

```http
GET /orders/:id/detail
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "numeroVenta": 1001,
  "tableNumber": 5,
  "total": 11000,
  "status": "pendiente",
  "orderProducts": [
    {
      "productId": 1,
      "product": {
        "id": 1,
        "name": "Cerveza Artesanal",
        "price": 5000
      },
      "cantidad": 2,
      "precioUnitario": 5000,
      "subtotal": 10000
    }
  ],
  "customer": {
    "id": 2,
    "customerName": "Juan Pérez",
    "customerPhone": "+56912345678"
  }
}
```

### 4.6 Actualizar Orden

```http
PATCH /orders/:id
Content-Type: application/json
```

**Body:** (todos los campos opcionales)
```json
{
  "status": "completado",
  "tableNumber": 6,
  "orderType": "delivery",
  "total": 12000,
  "neto": 11000,
  "propinaTipo": "porcentaje",
  "propinaValor": 10
}
```

**Response:** `200 OK`

### 4.7 Eliminar Orden

```http
DELETE /orders/:id
```

**Response:** `200 OK`

## Endpoints de Mesa

### 4.8 Crear Orden para Mesa

```http
POST /orders/mesa/:mesaId
Content-Type: application/json
```

**Body:**
```json
{
  "orderType": "local",
  "detalle_venta": "Sin cebolla",
  "products": [
    {
      "id": 1,
      "cantidad": 2
    }
  ]
}
```

### 4.9 Obtener Órdenes por Mesa

```http
GET /orders/mesa/:mesaId
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "numeroVenta": 1001,
    "total": 10000,
    "status": "pendiente",
    "createdAt": "2026-02-05T10:00:00Z"
  }
]
```

### 4.10 Obtener Orden Específica de Mesa

```http
GET /orders/mesa/:mesaId/orden/:ordenId
```

### 4.11 Actualizar Orden de Mesa

```http
PATCH /orders/mesa/:mesaId/orden/:ordenId
Content-Type: application/json
```

### 4.12 Agregar Productos a Orden

```http
POST /orders/mesa/:mesaId/orden/:ordenId/productos
Content-Type: application/json
```

**Body:**
```json
{
  "productos": [
    {
      "productId": 2,
      "cantidad": 3
    }
  ]
}
```

### 4.13 Cancelar Producto de Orden

```http
PATCH /orders/mesa/:mesaId/orden/:ordenId/producto/:productId/cancelar
```

### 4.14 Obtener Historial por Mesa

```http
GET /orders/historial/:mesaId
```

## Endpoints de Ventas y Análisis

### 4.15 Obtener Ventas por Día

```http
GET /orders/ventas/por-dia?fecha=2026-02-05
```

**Query Parameters:**
- `fecha` (string): Fecha en formato YYYY-MM-DD

**Response:** `200 OK`
```json
{
  "fecha": "2026-02-05",
  "totalVentas": 150000,
  "cantidadOrdenes": 25,
  "promedioOrden": 6000,
  "ventasPorTipo": {
    "local": 100000,
    "delivery": 50000
  }
}
```

### 4.16 Obtener Ventas Diarias

```http
GET /orders/ventas/diarias?fechaInicio=2026-02-01&fechaFin=2026-02-05
```

**Query Parameters:**
- `fechaInicio` (string): Fecha inicial
- `fechaFin` (string): Fecha final

**Response:** `200 OK`

### 4.17 Obtener Ventas Diarias por Mesa

```http
GET /orders/ventas/diariasMesa
```

## Endpoints de Acciones

### 4.18 Aceptar Venta

```http
PATCH /orders/:id/aceptar
```

**Response:** `200 OK`

### 4.19 Marcar como Pendiente

```http
PATCH /orders/:id/pendiente
```

### 4.20 Cancelar Venta

```http
PATCH /orders/:id/cancelar
```

### 4.21 Cancelar Múltiples Ventas

```http
PATCH /orders/cancelar?ids=1,2,3
```

**Query Parameters:**
- `ids` (string): IDs separados por coma

### 4.22 Eliminar Producto de Orden

```http
DELETE /orders/:orderId/productos/:productId
```

## Endpoints de Impresión

### 4.23 Imprimir Factura

```http
POST /orders/imprimir/factura
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": 1,
  "printerName": "Impresora Principal"
}
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| numeroVenta | number | - | Número de venta correlativo |
| tableNumber | number | null | Número de mesa |
| orderType | string | - | Tipo: local, delivery, takeout |
| detalle_venta | text | null | Detalles adicionales |
| estado | string | 'activo' | Estado: activo, cancelado, anulado |
| propina | number | 0 | Propina en pesos |
| costo_delivery | number | null | Costo de delivery |
| status | string | - | Estado del pedido |
| neto | number | 0 | Monto neto |
| total | number | - | Total a pagar |
| paymentMethod | string | null | Método de pago |
| mesaId | number | null | ID de la mesa |
| createdAt | timestamp | - | Fecha de creación |
| deletedAt | timestamp | null | Fecha de eliminación (soft delete) |

---

# 5. Customer Module

Gestión de clientes del sistema (clientes de delivery, reservas, etc.).

**Base URL:** `/customer`

## Endpoints

### 5.1 Crear Cliente

```http
POST /customer
Content-Type: application/json
```

**Body:**
```json
{
  "customerName": "Juan Pérez",
  "customerPhone": "+56912345678",
  "customerEmail": "juan@email.com",
  "customerAddress": "Av. Principal 123, Santiago"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "customerName": "Juan Pérez",
  "customerPhone": "+56912345678",
  "customerEmail": "juan@email.com",
  "customerAddress": "Av. Principal 123, Santiago"
}
```

### 5.2 Obtener Todos los Clientes

```http
GET /customer
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customerName": "Juan Pérez",
    "customerPhone": "+56912345678",
    "customerEmail": "juan@email.com",
    "customerAddress": "Av. Principal 123, Santiago"
  }
]
```

### 5.3 Obtener Cliente por ID

```http
GET /customer/:id
```

### 5.4 Actualizar Cliente

```http
PATCH /customer/:id
Content-Type: application/json
```

**Body:** (todos los campos opcionales)
```json
{
  "customerName": "Juan Pérez Actualizado",
  "customerPhone": "+56987654321",
  "customerEmail": "juan.nuevo@email.com",
  "customerAddress": "Nueva Dirección 456"
}
```

### 5.5 Eliminar Cliente

```http
DELETE /customer/:id
```

## Modelo de Datos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | number | No | Identificador único |
| customerName | string | Sí | Nombre del cliente |
| customerPhone | string | Sí | Teléfono del cliente |
| customerEmail | string | Sí | Email del cliente |
| customerAddress | string | Sí | Dirección del cliente |

---

# 6. Mesas Module

Sistema de gestión de mesas para restaurant con control de estado y pedidos.

**Base URL:** `/mesas`

## Endpoints

### 6.1 Crear Mesa

```http
POST /mesas
Content-Type: application/json
```

**Body:**
```json
{
  "numero_mesa": "Mesa 1",
  "status": "disponible"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "numero_mesa": "Mesa 1",
  "status": "disponible"
}
```

### 6.2 Obtener Todas las Mesas

```http
GET /mesas
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "numero_mesa": "Mesa 1",
    "status": "disponible"
  },
  {
    "id": 2,
    "numero_mesa": "Mesa 2",
    "status": "ocupada"
  }
]
```

### 6.3 Obtener Mesa por ID

```http
GET /mesas/:id
```

### 6.4 Obtener Detalle de Mesa

```http
GET /mesas/detalle/:id
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "numero_mesa": "Mesa 1",
  "status": "ocupada",
  "orders": [
    {
      "id": 1,
      "numeroVenta": 1001,
      "total": 15000,
      "status": "pendiente",
      "createdAt": "2026-02-05T10:00:00Z"
    }
  ],
  "totalCuenta": 15000
}
```

### 6.5 Obtener Detalle Actual de Mesa

```http
GET /mesas/:id/detalle-actual
```

**Response:** `200 OK`
```json
{
  "mesa": {
    "id": 1,
    "numero_mesa": "Mesa 1",
    "status": "ocupada"
  },
  "ordenesActivas": [
    {
      "id": 1,
      "total": 15000,
      "orderProducts": [...]
    }
  ],
  "totalGeneral": 15000
}
```

### 6.6 Actualizar Mesa

```http
PUT /mesas/:id
Content-Type: application/json
```

**Body:**
```json
{
  "numero_mesa": "Mesa 1A",
  "status": "disponible"
}
```

### 6.7 Actualizar Estado de Mesa

```http
PUT /mesas/:id/estado
Content-Type: application/json
```

**Body:**
```json
{
  "status": "ocupada"
}
```

### 6.8 Marcar Mesa como Pagada

```http
PATCH /mesas/:id/pagar
```

**Response:** `200 OK`
```json
{
  "message": "Mesa marcada como pagada",
  "mesa": {
    "id": 1,
    "status": "disponible"
  }
}
```

### 6.9 Crear Nuevo Pedido en Mesa

```http
POST /mesas/:id/nuevo-pedido
Content-Type: application/json
```

**Body:**
```json
{
  "orderType": "local",
  "products": [
    {
      "id": 1,
      "cantidad": 2
    }
  ]
}
```

### 6.10 Obtener Pedidos Actuales de Mesa

```http
GET /mesas/:id/pedidos
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "numeroVenta": 1001,
    "total": 15000,
    "status": "pendiente",
    "orderProducts": [...]
  }
]
```

### 6.11 Eliminar Mesa

```http
DELETE /mesas/:id
```

## Endpoints de Historial

### 6.12 Obtener Historial de Mesas

```http
GET /mesas/historial?fecha=2026-02-05
```

**Query Parameters:**
- `fecha` (string): Fecha en formato YYYY-MM-DD

**Response:** `200 OK`

### 6.13 Obtener Detalle de Ventas de Mesa

```http
GET /mesas/ventas/detalle-mesa
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| numero_mesa | string | Nombre/número de la mesa |
| status | string | Estado: disponible, ocupada, reservada |

---

# 7. Gastos Module

Sistema completo de gestión financiera con gastos, ingresos y módulo de contabilidad avanzada.

**Base URL:** `/gastos`

## Endpoints Principales

### 7.1 Crear Gasto

```http
POST /gastos
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "amount": 50000,
  "concepto": "Compra de insumos",
  "description": "Compra mensual de insumos de cocina",
  "type": "egreso",
  "paymentMethod": "efectivo",
  "proveedorId": 1,
  "categoriaId": 2,
  "frequency": "mensual",
  "startDate": "2026-02-01",
  "endDate": "2026-12-31",
  "estado": "activo"
}
```

**Response:** `201 Created`

### 7.2 Obtener Todos los Gastos

```http
GET /gastos
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "amount": 50000,
    "concepto": "Compra de insumos",
    "type": "egreso",
    "paymentMethod": "efectivo",
    "createdAt": "2026-02-05T10:00:00Z",
    "estado": "activo",
    "categorias_gasto": {
      "id": 2,
      "nombre": "Insumos"
    },
    "proveedor": {
      "id": 1,
      "nombre": "Proveedor ABC"
    }
  }
]
```

### 7.3 Obtener Gasto por ID

```http
GET /gastos/:id
```

### 7.4 Actualizar Gasto

```http
PATCH /gastos/:id
Content-Type: application/json
Authorization: Bearer {token}
```

### 7.5 Eliminar Gasto (Soft Delete)

```http
DELETE /gastos/soft/:id
Authorization: Bearer {token}
```

### 7.6 Eliminar Gasto (Hard Delete)

```http
DELETE /gastos/:id
```

## Endpoints de Balance y Estadísticas

### 7.7 Obtener Estadísticas

```http
GET /gastos/estadisticas
```

**Response:** `200 OK`
```json
{
  "totalIngresos": 500000,
  "totalEgresos": 200000,
  "balance": 300000,
  "cantidadIngresos": 50,
  "cantidadEgresos": 30
}
```

### 7.8 Obtener Balance Mensual

```http
GET /gastos/mensual
```

### 7.9 Obtener Balance Anual

```http
GET /gastos/anual
```

### 7.10 Obtener Balance por Fecha

```http
GET /gastos/balances?fechaInicio=2026-02-01&fechaFin=2026-02-28
```

### 7.11 Obtener Balance por Año

```http
GET /gastos/balancesA?year=2026
```

### 7.12 Obtener Ventas Diarias

```http
GET /gastos/ventas-diarias
```

## Módulo de Contabilidad - Finanzas

### 7.13 KPIs Financieros

```http
GET /gastos/contabilidad/finanzas/kpis
```

**Response:** `200 OK`
```json
{
  "ingresosTotales": 1000000,
  "gastosTotales": 400000,
  "utilidadNeta": 600000,
  "margenUtilidad": 60,
  "promedioVentaDiaria": 33333,
  "ticketPromedio": 15000
}
```

### 7.14 Balance por Días

```http
GET /gastos/contabilidad/finanzas/balance-dias
```

### 7.15 Evolución Financiera

```http
GET /gastos/contabilidad/finanzas/evolucion
```

### 7.16 Top Días de Venta

```http
GET /gastos/contabilidad/finanzas/top-dias
```

### 7.17 Distribución de Pagos

```http
GET /gastos/contabilidad/finanzas/distribucion
```

## Módulo de Contabilidad - Mesas

### 7.18 Ingresos por Mesa

```http
GET /gastos/contabilidad/mesas/ingresos
```

**Response:** `200 OK`
```json
[
  {
    "mesaId": 1,
    "numero_mesa": "Mesa 1",
    "totalIngresos": 150000,
    "cantidadOrdenes": 15,
    "promedioOrden": 10000
  }
]
```

### 7.19 Horas Punta

```http
GET /gastos/contabilidad/mesas/horas-punta
```

## Módulo de Contabilidad - Productos

### 7.20 Top Productos

```http
GET /gastos/contabilidad/productos/top
```

**Response:** `200 OK`
```json
[
  {
    "productId": 1,
    "productName": "Cerveza Artesanal",
    "cantidadVendida": 150,
    "totalIngresos": 750000,
    "porcentajeVentas": 15.5
  }
]
```

### 7.21 Ventas por Categoría

```http
GET /gastos/contabilidad/productos/categoria
```

## Módulo de Contabilidad - Clientes

### 7.22 KPIs de Clientes

```http
GET /gastos/contabilidad/clientes/kpis
```

**Response:** `200 OK`
```json
{
  "totalClientes": 250,
  "clientesNuevos": 50,
  "clientesRecurrentes": 200,
  "tasaRetencion": 80,
  "valorVidaCliente": 150000
}
```

### 7.23 Clientes Nuevos vs Recurrentes

```http
GET /gastos/contabilidad/clientes/nuevos-recurrentes
```

### 7.24 Actividad de Clientes

```http
GET /gastos/contabilidad/clientes/actividad
```

### 7.25 Top Clientes por Gasto

```http
GET /gastos/contabilidad/clientes/top-gasto
```

### 7.26 Top Clientes por Pedidos

```http
GET /gastos/contabilidad/clientes/top-pedidos
```

### 7.27 Frecuencia de Compra

```http
GET /gastos/contabilidad/clientes/frecuencia
```

## Módulo de Contabilidad - Delivery

### 7.28 KPIs de Delivery

```http
GET /gastos/contabilidad/delivery/kpis
```

**Response:** `200 OK`
```json
{
  "totalPedidos": 150,
  "promedioTiempoEntrega": 35,
  "tasaExito": 95,
  "ingresosTotales": 750000,
  "costoPromedioDelivery": 2500
}
```

### 7.29 Pedidos por Día

```http
GET /gastos/contabilidad/delivery/pedidos-dia
```

### 7.30 Tiempo de Despacho

```http
GET /gastos/contabilidad/delivery/tiempo-despacho
```

### 7.31 Estados de Delivery

```http
GET /gastos/contabilidad/delivery/estados
```

### 7.32 Recaudación de Delivery

```http
GET /gastos/contabilidad/delivery/recaudacion
```

### 7.33 Clientes de Delivery

```http
GET /gastos/contabilidad/delivery/clientes
```

### 7.34 Top Barrios

```http
GET /gastos/contabilidad/delivery/top-barrios
```

## Módulo de Contabilidad - Gastos

### 7.35 KPIs de Gastos

```http
GET /gastos/contabilidad/gastos/kpis
```

**Response:** `200 OK`
```json
{
  "totalGastos": 400000,
  "promedioGastoMensual": 133333,
  "gastosPorCategoria": {
    "Insumos": 200000,
    "Servicios": 100000,
    "Otros": 100000
  }
}
```

### 7.36 Gastos por Categoría

```http
GET /gastos/contabilidad/gastos/por-categoria
```

### 7.37 Gastos por Medio de Pago

```http
GET /gastos/contabilidad/gastos/por-medio-pago
```

### 7.38 Evolución de Gastos

```http
GET /gastos/contabilidad/gastos/evolucion
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| amount | number | - | Monto del gasto/ingreso |
| description | string | null | Descripción detallada |
| concepto | string | null | Concepto del movimiento |
| type | enum | - | 'ingreso' o 'egreso' |
| paymentMethod | enum | 'efectivo' | Método de pago |
| frequency | enum | 'ninguno' | Frecuencia de recurrencia |
| startDate | date | null | Fecha de inicio (recurrente) |
| endDate | date | null | Fecha de fin (recurrente) |
| dayOfWeek | number | null | Día de la semana (recurrente) |
| dayOfMonth | number | null | Día del mes (recurrente) |
| estado | enum | 'activo' | Estado del gasto |
| createdAt | timestamp | - | Fecha de creación |
| deletedAt | timestamp | null | Fecha de eliminación (soft delete) |

---

# 8. Categoria Gasto Module

Gestión de categorías de gastos para clasificación financiera.

**Base URL:** `/categoria-gasto`

## Endpoints

### 8.1 Crear Categoría de Gasto

```http
POST /categoria-gasto
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Insumos de Cocina"
}
```

**Response:** `201 Created`

### 8.2 Obtener Todas las Categorías de Gasto

```http
GET /categoria-gasto
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Insumos de Cocina"
  },
  {
    "id": 2,
    "nombre": "Servicios Básicos"
  }
]
```

### 8.3 Obtener Categoría de Gasto por ID

```http
GET /categoria-gasto/:id
```

### 8.4 Actualizar Categoría de Gasto

```http
PATCH /categoria-gasto/:id
Content-Type: application/json
```

### 8.5 Eliminar Categoría de Gasto

```http
DELETE /categoria-gasto/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| nombre | string | Nombre de la categoría |

---

# 9. Auth Module

Sistema de autenticación y autorización con JWT.

**Base URL:** `/auth`

## Endpoints

### 9.1 Login

```http
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrador",
    "role": "admin"
  }
}
```

### 9.2 Registrar Usuario

```http
POST /auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "username": "nuevo_usuario",
  "password": "password123",
  "full_name": "Nuevo Usuario",
  "role": "user"
}
```

**Response:** `201 Created`

## Autenticación

Para endpoints protegidos, incluir el token JWT en el header:

```http
Authorization: Bearer {access_token}
```

---

# 10. Products Orders Module

Gestión de la relación muchos a muchos entre productos y órdenes.

**Base URL:** `/products-orders`

## Endpoints

### 10.1 Crear Relación

```http
POST /products-orders
Content-Type: application/json
```

### 10.2 Obtener Todas las Relaciones

```http
GET /products-orders
```

### 10.3 Obtener Relación por ID

```http
GET /products-orders/:id
```

### 10.4 Actualizar Relación

```http
PATCH /products-orders/:id
```

### 10.5 Eliminar Relación

```http
DELETE /products-orders/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| orderId | number | ID de la orden (PK compuesta) |
| productId | number | ID del producto (PK compuesta) |
| cantidad | number | Cantidad del producto |
| precioUnitario | number | Precio unitario al momento de la venta |
| subtotal | number | Subtotal (cantidad * precioUnitario) |
| deletedAt | timestamp | Fecha de eliminación (soft delete) |

---

# 11. Horarios Module

Configuración de horarios de operación del restaurant y delivery.

**Base URL:** `/horarios`

## Endpoints

### 11.1 Crear Horario

```http
POST /horarios
Content-Type: application/json
```

**Body:**
```json
{
  "seccion": "local",
  "hora_inicio": "10:00",
  "hora_fin": "22:00",
  "enabled": true
}
```

**Response:** `201 Created`

### 11.2 Obtener Todos los Horarios

```http
GET /horarios
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "seccion": "local",
    "hora_inicio": "10:00",
    "hora_fin": "22:00",
    "enabled": true
  },
  {
    "id": 2,
    "seccion": "delivery",
    "hora_inicio": "12:00",
    "hora_fin": "23:00",
    "enabled": true
  }
]
```

### 11.3 Obtener Configuración de Horarios

```http
GET /horarios/config
```

**Response:** `200 OK`
```json
{
  "local": {
    "hora_inicio": "10:00",
    "hora_fin": "22:00",
    "enabled": true
  },
  "delivery": {
    "hora_inicio": "12:00",
    "hora_fin": "23:00",
    "enabled": true
  }
}
```

### 11.4 Obtener Horario por ID

```http
GET /horarios/:id
```

### 11.5 Actualizar Horario

```http
PATCH /horarios/:id
Content-Type: application/json
```

**Body:**
```json
{
  "hora_inicio": "11:00",
  "hora_fin": "23:00",
  "enabled": false
}
```

### 11.6 Eliminar Horario

```http
DELETE /horarios/:id
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| seccion | string | - | "local" o "delivery" (único) |
| hora_inicio | string | - | Hora de inicio (formato HH:mm) |
| hora_fin | string | - | Hora de fin (formato HH:mm) |
| enabled | boolean | true | Si el horario está activo |

---

# 12. Theme Module

Personalización visual del sistema con temas customizables.

**Base URL:** `/themes`

## Endpoints

### 12.1 Crear Tema

```http
POST /themes
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Tema Oscuro",
  "primaryColor": "#1a1a1a",
  "secondaryColor": "#ffc107",
  "backgroundColor": "#000000",
  "backgroundType": "color",
  "mode": "dark",
  "borderStyle": "rounded",
  "cardShadow": "normal",
  "layoutType": "full",
  "isDefault": false
}
```

**Response:** `201 Created`

### 12.2 Obtener Todos los Temas

```http
GET /themes
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Tema Claro",
    "primaryColor": "#ff7f00",
    "secondaryColor": "#ffc107",
    "backgroundColor": "#ffffff",
    "backgroundType": "color",
    "mode": "light",
    "isDefault": true
  }
]
```

### 12.3 Obtener Tema por Defecto

```http
GET /themes/default
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Tema Claro",
  "primaryColor": "#ff7f00",
  "secondaryColor": "#ffc107",
  "backgroundColor": "#ffffff",
  "backgroundType": "color",
  "mode": "light",
  "isDefault": true
}
```

### 12.4 Obtener Tema por ID

```http
GET /themes/:id
```

### 12.5 Actualizar Tema

```http
PATCH /themes/:id
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Tema Actualizado",
  "primaryColor": "#3366ff"
}
```

### 12.6 Activar Tema

```http
PATCH /themes/:id/activate
```

**Response:** `200 OK`
```json
{
  "message": "Tema activado correctamente",
  "theme": {
    "id": 1,
    "isDefault": true
  }
}
```

### 12.7 Subir Imagen de Fondo

```http
POST /themes/:id/upload-background
Content-Type: multipart/form-data
```

**Form Data:**
```
backgroundImage: file
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "backgroundImage": "/uploads/themes/bg-123.jpg",
  "backgroundType": "image"
}
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| name | string | - | Nombre del tema |
| primaryColor | string | '#ff7f00' | Color primario (hex) |
| secondaryColor | string | '#ffc107' | Color secundario (hex) |
| backgroundColor | string | '#ffffff' | Color de fondo (hex) |
| backgroundImage | string | null | URL de imagen de fondo |
| gradient | string | null | Gradiente CSS |
| backgroundType | enum | 'color' | 'color', 'gradient', 'image' |
| mode | string | 'light' | 'light' o 'dark' |
| borderStyle | string | 'rounded' | Estilo de bordes |
| cardShadow | string | 'normal' | Sombra de tarjetas |
| layoutType | string | 'full' | Tipo de layout |
| isDefault | boolean | false | Si es el tema por defecto |

---

# 13. Costo Envio Module

Gestión de costos de envío para delivery con sistema de valor por defecto.

**Base URL:** `/costo-envio`

## Endpoints

### 13.1 Obtener Todos los Costos de Envío

```http
GET /costo-envio
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "precio_envio": 2500,
    "descripcion": "Envío estándar",
    "porDefecto": true
  },
  {
    "id": 2,
    "precio_envio": 5000,
    "descripcion": "Envío express",
    "porDefecto": false
  }
]
```

**Nota:** El costo con `porDefecto: true` aparece primero.

### 13.2 Obtener Costo de Envío por Defecto

```http
GET /costo-envio/default
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "precio_envio": 2500,
  "descripcion": "Envío estándar",
  "porDefecto": true
}
```

### 13.3 Crear Costo de Envío

```http
POST /costo-envio
Content-Type: application/json
```

**Body:**
```json
{
  "precio_envio": 3000,
  "descripcion": "Envío a regiones",
  "porDefecto": false
}
```

**Response:** `201 Created`

**Comportamiento especial:** Si se crea con `porDefecto: true`, el anterior por defecto se desmarca automáticamente.

### 13.4 Obtener Costo de Envío por ID

```http
GET /costo-envio/:id
```

### 13.5 Actualizar Costo de Envío

```http
PATCH /costo-envio/:id
Content-Type: application/json
```

**Body:**
```json
{
  "precio_envio": 2800,
  "porDefecto": true
}
```

**Comportamiento especial:** Si se actualiza a `porDefecto: true`, el anterior por defecto se desmarca automáticamente.

### 13.6 Eliminar Costo de Envío

```http
DELETE /costo-envio/:id
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| precio_envio | number | - | Precio del envío |
| descripcion | string | - | Descripción del tipo de envío |
| porDefecto | boolean | false | Si es el costo por defecto |

---

# 14. Ticket Bar Module

Sistema de tickets para el bar con gestión de propinas.

**Base URL:** `/ticket-bar`

## Endpoints

### 14.1 Crear Ticket

```http
POST /ticket-bar
Content-Type: application/json
```

**Body:**
```json
{
  "tipoTicket": "bar",
  "totalTicket": 15000,
  "propinaBar": 1500,
  "estadoTicket": 1,
  "idUser": 1,
  "idProduct": 5,
  "cantidad": 3
}
```

**Response:** `201 Created`

### 14.2 Obtener Todos los Tickets

```http
GET /ticket-bar
```

**Response:** `200 OK`
```json
[
  {
    "idticketBar": 1,
    "tipoTicket": "bar",
    "totalTicket": 15000,
    "propinaBar": 1500,
    "estadoTicket": 1,
    "idUser": 1,
    "idProduct": 5,
    "cantidad": 3,
    "createdAt": "2026-02-05T10:00:00Z"
  }
]
```

### 14.3 Obtener Tickets por Usuario

```http
GET /ticket-bar/user/:idUser
```

### 14.4 Obtener Tickets por Estado

```http
GET /ticket-bar/estado/:estado
```

**Parámetros:**
- `estado` (number): Estado del ticket (0, 1, 2, etc.)

### 14.5 Obtener Ticket por ID

```http
GET /ticket-bar/:id
```

### 14.6 Actualizar Ticket

```http
PATCH /ticket-bar/:id
Content-Type: application/json
```

### 14.7 Eliminar Ticket

```http
DELETE /ticket-bar/:id
```

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| idticketBar | number | - | Identificador único |
| tipoTicket | string | - | Tipo de ticket |
| totalTicket | number | 0 | Total del ticket |
| propinaBar | number | 0 | Propina del bar |
| estadoTicket | number | - | Estado del ticket |
| idUser | number | null | ID del usuario |
| idProduct | number | - | ID del producto |
| cantidad | number | 1 | Cantidad de productos |
| createdAt | timestamp | - | Fecha de creación |

---

# 15. ETA Module

Cálculo de tiempo estimado de entrega con geocodificación.

**Base URL:** `/eta`

## Endpoints

### 15.1 Calcular ETA

```http
POST /eta/calculate
Content-Type: application/json
```

**Body:**
```json
{
  "direccion": "Av. Providencia 1234, Santiago",
  "order_id": 123,
  "customer_id": 45
}
```

**Response:** `200 OK`
```json
{
  "direccion": "Av. Providencia 1234, Santiago",
  "direccion_normalizada": "Avenida Providencia 1234, Providencia, Santiago, Chile",
  "lat": -33.4231,
  "lon": -70.6109,
  "distancia_km": 5.2,
  "tiempo_min": 25,
  "motor": "openrouteservice",
  "display_name": "Avenida Providencia 1234, Providencia, Región Metropolitana, Chile"
}
```

**Códigos de respuesta:**
- `200 OK`: Cálculo exitoso
- `400 Bad Request`: Dirección inválida o no se pudo geocodificar
- `500 Internal Server Error`: Error en el cálculo

## Modelo de Datos

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | number | - | Identificador único |
| created_at | timestamp | - | Fecha de creación |
| client_ip | string | null | IP del cliente |
| user_agent | string | null | User agent |
| address_raw | text | null | Dirección original |
| address_normalized | text | null | Dirección normalizada |
| lat | float | null | Latitud |
| lon | float | null | Longitud |
| distance_km | float | null | Distancia en km |
| eta_min | number | null | Tiempo estimado en minutos |
| motor | string | null | Motor de cálculo usado |
| geocode_source | string | 'nominatim' | Fuente de geocodificación |
| geocode_success | boolean | false | Si la geocodificación fue exitosa |
| city | string | null | Ciudad |
| state_region | string | null | Región |
| country | string | null | País |
| postcode | string | null | Código postal |
| barrio_sector | string | null | Barrio o sector |
| order_id | number | null | ID de la orden |
| customer_id | number | null | ID del cliente |

---

# 16. Proveedores Module

Gestión de proveedores del sistema.

**Base URL:** `/proveedores`

## Endpoints

### 16.1 Crear Proveedor

```http
POST /proveedores
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Proveedor ABC",
  "rut": "12.345.678-9",
  "razon_social": "ABC Distribuidora Ltda.",
  "direccion": "Av. Industrial 123",
  "telefono": "+56912345678",
  "email": "contacto@abc.cl"
}
```

**Response:** `201 Created`

### 16.2 Obtener Todos los Proveedores

```http
GET /proveedores
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Proveedor ABC",
    "rut": "12.345.678-9",
    "razon_social": "ABC Distribuidora Ltda.",
    "direccion": "Av. Industrial 123",
    "telefono": "+56912345678",
    "email": "contacto@abc.cl",
    "createdAt": "2026-02-05T10:00:00Z"
  }
]
```

### 16.3 Obtener Proveedor por ID

```http
GET /proveedores/:id
```

### 16.4 Actualizar Proveedor

```http
PATCH /proveedores/:id
Content-Type: application/json
```

### 16.5 Eliminar Proveedor

```http
DELETE /proveedores/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| nombre | string | Nombre del proveedor |
| rut | string | RUT del proveedor |
| razon_social | string | Razón social |
| direccion | string | Dirección |
| telefono | string | Teléfono de contacto |
| email | string | Email de contacto |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Fecha de actualización |

---

# 17. Ingresos Module

Gestión de ingresos con categorización y documentación.

**Base URL:** `/ingresos`

## Endpoints

### 17.1 Crear Ingreso

```http
POST /ingresos
Content-Type: application/json
```

**Body:**
```json
{
  "concepto": "Venta de servicios",
  "fecha": "2026-02-05",
  "metodo_pago": "transferencia",
  "monto": 150000,
  "categoriasIds": [1, 2],
  "clientesIds": [3],
  "documentoId": 5
}
```

**Response:** `201 Created`

### 17.2 Obtener Todos los Ingresos

```http
GET /ingresos
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "concepto": "Venta de servicios",
    "fecha": "2026-02-05",
    "metodo_pago": "transferencia",
    "monto": 150000,
    "categorias": [
      {
        "id": 1,
        "nombre_cat": "Servicios"
      }
    ],
    "clientes": [
      {
        "id": 3,
        "nombre": "Cliente XYZ"
      }
    ],
    "documento": {
      "id": 5,
      "tipo_documento": "Factura",
      "num_documento": 1001
    }
  }
]
```

### 17.3 Obtener Ingreso por ID

```http
GET /ingresos/:id
```

### 17.4 Actualizar Ingreso

```http
PATCH /ingresos/:id
Content-Type: application/json
```

### 17.5 Eliminar Ingreso

```http
DELETE /ingresos/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| concepto | string | Concepto del ingreso |
| fecha | date | Fecha del ingreso |
| monto | number | Monto del ingreso |
| metodo_pago | string | Método de pago |

---

# 18. Categoria Ingresos Module

Gestión de categorías de ingresos.

**Base URL:** `/categoria-ingresos`

## Endpoints

### 18.1 Crear Categoría de Ingreso

```http
POST /categoria-ingresos
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_cat": "Servicios Profesionales"
}
```

**Response:** `201 Created`

### 18.2 Obtener Todas las Categorías de Ingreso

```http
GET /categoria-ingresos
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre_cat": "Servicios Profesionales"
  },
  {
    "id": 2,
    "nombre_cat": "Productos"
  }
]
```

### 18.3 Obtener Categoría de Ingreso por ID

```http
GET /categoria-ingresos/:id
```

### 18.4 Actualizar Categoría de Ingreso

```http
PATCH /categoria-ingresos/:id
```

### 18.5 Eliminar Categoría de Ingreso

```http
DELETE /categoria-ingresos/:id
```

## Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| nombre_cat | string | Nombre de la categoría |

---

# 19. Clientes Ingresos Module

Gestión de clientes relacionados con ingresos.

**Base URL:** `/clientes-ingresos`

## Endpoints

### 19.1 Crear Cliente de Ingreso

```http
POST /clientes-ingresos
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Empresa XYZ",
  "rut": "76.543.210-K",
  "telefono": 912345678,
  "email": "contacto@xyz.cl"
}
```

**Response:** `201 Created`

### 19.2 Obtener Todos los Clientes de Ingreso

```http
GET /clientes-ingresos
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Empresa XYZ",
    "rut": "76.543.210-K",
    "telefono": 912345678,
    "email": "contacto@xyz.cl"
  }
]
```

### 19.3 Obtener Cliente de Ingreso por ID

```http
GET /clientes-ingresos/:id
```

### 19.4 Actualizar Cliente de Ingreso

```http
PATCH /clientes-ingresos/:id
```

### 19.5 Eliminar Cliente de Ingreso

```http
DELETE /clientes-ingresos/:id
```

## Modelo de Datos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | number | No | Identificador único |
| nombre | string | No | Nombre del cliente |
| rut | string | No | RUT del cliente |
| telefono | number | Sí | Teléfono |
| email | string | Sí | Email |

---

# 20. Documentos Ingreso Module

Gestión de documentos asociados a ingresos (facturas, boletas, etc.).

**Base URL:** `/documentos-ingreso`

## Endpoints

### 20.1 Crear Documento de Ingreso

```http
POST /documentos-ingreso
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_documento": "Factura",
  "num_documento": 1001,
  "ingresoId": 5
}
```

**Response:** `201 Created`

### 20.2 Obtener Todos los Documentos de Ingreso

```http
GET /documentos-ingreso
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "tipo_documento": "Factura",
    "num_documento": 1001,
    "ingresoId": 5
  },
  {
    "id": 2,
    "tipo_documento": "Boleta",
    "num_documento": 2001,
    "ingresoId": null
  }
]
```

### 20.3 Obtener Documento de Ingreso por ID

```http
GET /documentos-ingreso/:id
```

### 20.4 Actualizar Documento de Ingreso

```http
PATCH /documentos-ingreso/:id
Content-Type: application/json
```

### 20.5 Eliminar Documento de Ingreso

```http
DELETE /documentos-ingreso/:id
```

## Modelo de Datos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | number | No | Identificador único |
| tipo_documento | string | No | Tipo de documento (Factura, Boleta, etc.) |
| num_documento | number | No | Número del documento |
| ingresoId | number | Sí | ID del ingreso asociado |

---

# Resumen General del Sistema

## Estadísticas del Sistema

- **Total de Módulos:** 20 (21 incluyendo Mail Module)
- **Total de Endpoints:** 160+
- **Total de Entidades:** 21
- **Base de Datos:** MySQL
- **ORM:** TypeORM
- **Framework:** NestJS

## Características del Sistema

### Seguridad
- **Autenticación:** JWT (JSON Web Tokens)
- **Guards:** JWT Auth Guard, Roles Guard
- **Módulos protegidos:** Users, Orders, Mesas, Gastos

### Funcionalidades Avanzadas

#### 1. Sistema de Archivos
- Carga de imágenes para usuarios, productos y temas
- Almacenamiento en `/uploads`
- Soporte para archivos múltiples

#### 2. Soft Delete
- Productos
- Órdenes
- Relaciones productos-órdenes
- Gastos

#### 3. Paginación
- Implementada en módulo de productos
- Soporta page y limit parameters

#### 4. Análisis y Reportes
- KPIs financieros completos
- Análisis de clientes
- Métricas de delivery
- Análisis de productos
- Reportes de ventas

#### 5. Sistema de Mesas
- Control de estado (disponible, ocupada, reservada)
- Gestión de pedidos por mesa
- Cálculo de cuenta total
- Historial de mesas

#### 6. Sistema de Delivery
- Cálculo de ETA con geocodificación
- Múltiples costos de envío
- Tracking de pedidos
- Análisis de barrios

#### 7. Personalización
- Temas customizables
- Configuración de horarios
- Múltiples métodos de pago

### Relaciones Complejas

- **ManyToMany:**
  - Categories ↔ Products
  - Gastos ↔ Users
  - Ingresos ↔ Categorías
  - Ingresos ↔ Clientes

- **OneToMany:**
  - User → Orders
  - Customer → Orders
  - Mesa → Orders
  - Order → ProductsOrders

---

# Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 OK | Petición exitosa | GET, PATCH, DELETE |
| 201 Created | Recurso creado | POST |
| 400 Bad Request | Error de validación | Datos inválidos |
| 401 Unauthorized | No autenticado | Sin token o token inválido |
| 403 Forbidden | Sin permisos | Token válido pero sin permisos |
| 404 Not Found | Recurso no encontrado | ID inexistente |
| 500 Internal Server Error | Error del servidor | Errores internos |

---

# Autenticación y Seguridad

## Obtener Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

## Usar Token en Requests

```bash
curl -X GET http://localhost:3000/gastos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Endpoints Protegidos

Los siguientes endpoints requieren autenticación:

- `/gastos` (POST, PATCH, DELETE)
- Endpoints de contabilidad en `/gastos/contabilidad/*`
- Otros según configuración del sistema

---

## Notas Técnicas

### Configuración de Base de Datos

```typescript
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'prd_espacio-bl',
  synchronize: true
}
```

**⚠️ Advertencia:** `synchronize: true` está habilitado, lo que sincroniza automáticamente el esquema. En producción se recomienda usar migraciones.

### Validación de Datos

Todos los DTOs utilizan `class-validator` para validación automática:

- `@IsString()` - Valida strings
- `@IsNumber()` - Valida números
- `@IsEmail()` - Valida emails
- `@IsOptional()` - Campo opcional
- `@IsBoolean()` - Valida booleanos
- `@IsDate()` - Valida fechas

### Carga de Archivos

Los endpoints con carga de archivos usan `FileInterceptor` de NestJS:

```typescript
@UseInterceptors(FileInterceptor('fieldName'))
```

---

## Contacto y Soporte

Para reportar problemas, solicitar nuevas funcionalidades o contribuir al proyecto, contactar al equipo de desarrollo.

**Documentación generada:** 05/02/2026
**Versión del Sistema:** 1.0
**API Base URL:** http://localhost:3000

---

*Esta documentación cubre todos los módulos activos del sistema Espacio Back. Para información detallada sobre implementación, consultar el código fuente o contactar al equipo de desarrollo.*
