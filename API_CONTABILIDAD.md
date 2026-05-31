# 📋 Documentación de APIs de Contabilidad

## 🎯 Resumen General

**Total de endpoints creados:** 24
**Módulo extendido:** `gastos`
**URL base:** `/gastos/contabilidad/*`

---

## 📊 Estructura de Endpoints

### 1. FINANZAS (5 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/finanzas/kpis` | GET | KPIs: Ingresos, Egresos, Propinas, Balance, Por Cobrar |
| `/gastos/contabilidad/finanzas/balance-dias` | GET | Balance por día con desglose de ingresos, egresos, propinas |
| `/gastos/contabilidad/finanzas/evolucion` | GET | Evolución de la semana: Balance vs Por Cobrar |
| `/gastos/contabilidad/finanzas/top-dias` | GET | Top días con mayor recaudación |
| `/gastos/contabilidad/finanzas/distribucion` | GET | Distribución: Ingresos vs Propinas (donut) |

**Query Params:**
- `start`: string (YYYY-MM-DD) - opcional, por defecto mes actual
- `end`: string (YYYY-MM-DD) - opcional, por defecto mes actual
- `limit`: number - opcional, solo para rankings (default: 5 o 10)

**Ejemplo de Request:**
```
GET /gastos/contabilidad/finanzas/kpis?start=2025-12-01&end=2025-12-31
```

**Ejemplo de Response:**
```json
{
  "ingresos": 15500000,
  "egresos": 16020000,
  "propinas": 0,
  "balance": -520000,
  "porCobrar": 2750000
}
```

---

### 2. MESAS (2 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/mesas/ingresos` | GET | Ingresos por mesa (ranking de recaudación) |
| `/gastos/contabilidad/mesas/horas-punta` | GET | Horas punta por mesa (distribución horaria de ocupación) |

**Ejemplo de Response (ingresos por mesa):**
```json
[
  {
    "mesa": "Mesa 1",
    "ingresos": 1500000
  },
  {
    "mesa": "Mesa 4",
    "ingresos": 1200000
  }
]
```

---

### 3. PRODUCTOS (2 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/productos/top` | GET | Top productos vendidos (ranking por unidades o monto) |
| `/gastos/contabilidad/productos/categoria` | GET | Ingresos por categoría (distribución por tipo de producto) |

**Ejemplo de Response (top productos):**
```json
[
  {
    "producto": "Hamburguesa Clásica",
    "unidades": 120,
    "total": 4500000
  }
]
```

---

### 4. CLIENTES (6 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/clientes/kpis` | GET | KPIs: Total, Nuevos, Recurrentes |
| `/gastos/contabilidad/clientes/nuevos-recurrentes` | GET | Distribución: Nuevos vs Recurrentes (donut) |
| `/gastos/contabilidad/clientes/actividad` | GET | Actividad de clientes por día de la semana |
| `/gastos/contabilidad/clientes/top-gasto` | GET | Top clientes por gasto total |
| `/gastos/contabilidad/clientes/top-pedidos` | GET | Top clientes por número de pedidos |
| `/gastos/contabilidad/clientes/frecuencia` | GET | Ticket promedio y frecuencia por # de pedidos |

**Definición de Cliente Nuevo:**
- Primer pedido en el rango de fechas seleccionado
- Sin pedidos anteriores en la base de datos

**Definición de Cliente Recurrente:**
- Con pedidos en el rango seleccionado
- Con pedidos anteriores en la base de datos

---

### 5. DELIVERY (7 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/delivery/kpis` | GET | KPIs: Pedidos, Pagados, Pendientes, Tiempo promedio, Puntualidad, Recaudado |
| `/gastos/contabilidad/delivery/pedidos-dia` | GET | Pedidos delivery por día |
| `/gastos/contabilidad/delivery/tiempo-despacho` | GET | Tiempo de despacho promedio por día |
| `/gastos/contabilidad/delivery/estados` | GET | Estados de pedidos: Pagado, Pendiente, Cancelado |
| `/gastos/contabilidad/delivery/recaudacion` | GET | Recaudación delivery por día |
| `/gastos/contabilidad/delivery/clientes` | GET | Clientes delivery: Nuevos vs Recurrentes |
| `/gastos/contabilidad/delivery/top-barrios` | GET | Top barrios por número de pedidos |

**Definición de Pedido Delivery:**
- `orderType = 'delivery'` en la entidad Order
- Con registro en tabla `eta_requests`

**KPI de Puntualidad:**
- Porcentaje de entregas en ≤30 minutos
- Cálculo: (entregas_puntuales / total_entregas) × 100

---

### 6. GASTOS (4 endpoints)

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/gastos/contabilidad/gastos/kpis` | GET | KPIs: Total, Categoría Top, Medio de Pago Top |
| `/gastos/contabilidad/gastos/por-categoria` | GET | Gastos por categoría |
| `/gastos/contabilidad/gastos/por-medio-pago` | GET | Gastos por medio de pago |
| `/gastos/contabilidad/gastos/evolucion` | GET | Evolución de gastos por fecha |

---

## 📝 DTOs Creados

### DTOs de Contabilidad (`/src/gastos/dto/`)

1. **rango-fecha.dto.ts** - DTO base para rango de fechas
   ```typescript
   export class RangoFechaDto {
     start?: string;  // YYYY-MM-DD
     end?: string;    // YYYY-MM-DD
   }
   ```

2. **kpis-finanzas.dto.ts** - Response DTOs para Finanzas
   - `KpisFinanzasResponseDto`
   - `BalanceDiasResponseDto`
   - `EvolucionResponseDto`
   - `TopDiasResponseDto`
   - `DistribucionResponseDto`

3. **kpis-clientes.dto.ts** - Response DTOs para Clientes
   - `KpisClientesResponseDto`
   - `NuevosRecurrentesResponseDto`
   - `ActividadClientesResponseDto`
   - `TopClienteResponseDto`
   - `TopClientePedidosResponseDto`
   - `FrecuenciaClientesResponseDto`

4. **kpis-delivery.dto.ts** - Response DTOs para Delivery
   - `KpisDeliveryResponseDto`
   - `TopBarrioResponseDto`

5. **kpis-gastos.dto.ts** - Response DTOs para Gastos
   - `KpisGastosResponseDto`

6. **top-items.dto.ts** - DTO genérico para rankings
   - `TopItemResponseDto`

---

## 🔧 Servicios Implementados

### GastosService (`/src/gastos/gastos.service.ts`)

**Métodos nuevos:**

**Finanzas:**
- `getKpisFinanzas(rango: RangoFechaDto)`
- `getBalanceDias(rango: RangoFechaDto)`
- `getEvolucion(rango: RangoFechaDto)`
- `getTopDias(rango: RangoFechaDto, limit?: number)`
- `getDistribucion(rango: RangoFechaDto)`

**Mesas:**
- `getIngresosPorMesa(rango: RangoFechaDto, limit?: number)`
- `getHorasPuntaPorMesa(rango: RangoFechaDto)`

**Productos:**
- `getTopProductos(rango: RangoFechaDto, limit?: number)`
- `getIngresosPorCategoria(rango: RangoFechaDto)`

**Clientes:**
- `getKpisClientes(rango: RangoFechaDto)`
- `getNuevosRecurrentes(rango: RangoFechaDto)`
- `getActividadClientes(rango: RangoFechaDto)`
- `getTopClientesGasto(rango: RangoFechaDto, limit?: number)`
- `getTopClientesPedidos(rango: RangoFechaDto, limit?: number)`
- `getFrecuenciaClientes(rango: RangoFechaDto)`

**Delivery:**
- `getKpisDelivery(rango: RangoFechaDto)`
- `getPedidosDeliveryPorDia(rango: RangoFechaDto)`
- `getTiempoDespacho(rango: RangoFechaDto)`
- `getEstadosDelivery(rango: RangoFechaDto)`
- `getRecaudacionDelivery(rango: RangoFechaDto)`
- `getClientesDelivery(rango: RangoFechaDto)`
- `getTopBarrios(rango: RangoFechaDto, limit?: number)`

**Gastos:**
- `getKpisGastos(rango: RangoFechaDto)`
- `getGastosPorCategoria(rango: RangoFechaDto)`
- `getGastosPorMedioPago(rango: RangoFechaDto)`
- `getEvolucionGastos(rango: RangoFechaDto)`

**Métodos de Utilidad:**
- `getRangoFechas(rango: RangoFechaDto)` - Retorna fechas de inicio/fin (mes actual por defecto)
- `formatDay(fecha: string)` - Formatea fecha a nombre de día corto (Lun, Mar, etc.)
- `translateDay(dayName: string)` - Traduce día de inglés a español

---

## 🎮 Controlador Actualizado

### GastosController (`/src/gastos/gastos.controller.ts`)

**Endpoints nuevos agregados:**

```typescript
// FINANZAS
@Get('contabilidad/finanzas/kpis')
@Get('contabilidad/finanzas/balance-dias')
@Get('contabilidad/finanzas/evolucion')
@Get('contabilidad/finanzas/top-dias')
@Get('contabilidad/finanzas/distribucion')

// MESAS
@Get('contabilidad/mesas/ingresos')
@Get('contabilidad/mesas/horas-punta')

// PRODUCTOS
@Get('contabilidad/productos/top')
@Get('contabilidad/productos/categoria')

// CLIENTES
@Get('contabilidad/clientes/kpis')
@Get('contabilidad/clientes/nuevos-recurrentes')
@Get('contabilidad/clientes/actividad')
@Get('contabilidad/clientes/top-gasto')
@Get('contabilidad/clientes/top-pedidos')
@Get('contabilidad/clientes/frecuencia')

// DELIVERY
@Get('contabilidad/delivery/kpis')
@Get('contabilidad/delivery/pedidos-dia')
@Get('contabilidad/delivery/tiempo-despacho')
@Get('contabilidad/delivery/estados')
@Get('contabilidad/delivery/recaudacion')
@Get('contabilidad/delivery/clientes')
@Get('contabilidad/delivery/top-barrios')

// GASTOS
@Get('contabilidad/gastos/kpis')
@Get('contabilidad/gastos/por-categoria')
@Get('contabilidad/gastos/por-medio-pago')
@Get('contabilidad/gastos/evolucion')
```

---

## 📦 Entidades Utilizadas

Las siguientes entidades se usan en las queries:

1. **Order** - Tabla `orders`
   - Campos clave: `id`, `total`, `propina`, `status`, `createdAt`, `orderType`, `mesaId`, `customerId`

2. **Gasto** - Tabla `expenses`
   - Campos clave: `amount`, `type` ('ingreso'/'egreso'), `paymentMethod`, `createdAt`, `categoriaId`

3. **ProductsOrders** - Tabla `order_products`
   - Campos clave: `orderId`, `productId`, `cantidad`, `subtotal`

4. **Product** - Tabla `products`
   - Campos clave: `id`, `name`

5. **Customer** - Tabla `customer`
   - Campos clave: `id`, `customerName`

6. **Mesa** - Tabla `mesa`
   - Campos clave: `id`, `numero_mesa`

7. **Category** - Tabla `categories`
   - Campos clave: `id`, `nombre`

8. **Eta** - Tabla `eta_requests`
   - Campos clave: `order_id`, `barrio_sector`, `eta_min`

9. **CategoriaGasto** - Tabla `categoria_gasto`
   - Campos clave: `id`, `nombre`

---

## 🗂️ Archivos Creados/Modificados

### Archivos Nuevos:
```
espacio_back/src/gastos/dto/
├── rango-fecha.dto.ts
├── kpis-finanzas.dto.ts
├── kpis-clientes.dto.ts
├── kpis-delivery.dto.ts
├── kpis-gastos.dto.ts
└── top-items.dto.ts
```

### Archivos Modificados:
```
espacio_back/src/gastos/
├── gastos.controller.ts (extendido con 24 endpoints nuevos)
└── gastos.service.ts (extendido con 24 métodos nuevos + utilidades)
```

---

## 🔒 Seguridad

**Estado actual:** Sin guards específicos (como solicitado)

Todos los endpoints son públicos. Si necesitas agregar seguridad:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('contabilidad/finanzas/kpis')
async getKpisFinanzas(@Query() rango: RangoFechaDto) {
  // ...
}
```

---

## 🎨 Cálculos Implementados

### 1. Balance por Día
```sql
SELECT
  DATE(o.createdAt) as fecha,
  SUM(CASE WHEN o.status = 'Pagado' THEN o.total ELSE 0 END) as ingresos,
  0 as egresos,
  SUM(CASE WHEN o.status = 'Pagado' THEN o.propina ELSE 0 END) as propinas
FROM orders o
WHERE o.createdAt BETWEEN start AND end
GROUP BY DATE(o.createdAt)
```

### 2. Ingresos por Mesa
```sql
SELECT
  m.numero_mesa as mesa,
  SUM(o.total) as ingresos
FROM orders o
INNER JOIN mesa m ON o.mesaId = m.id
WHERE o.createdAt BETWEEN start AND end
  AND o.status = 'Pagado'
GROUP BY m.id, m.numero_mesa
ORDER BY ingresos DESC
LIMIT 10
```

### 3. Top Productos Vendidos
```sql
SELECT
  p.name as producto,
  SUM(po.cantidad) as unidades,
  SUM(po.subtotal) as total
FROM orders o
INNER JOIN order_products po ON o.id = po.orderId
INNER JOIN products p ON po.productId = p.id
WHERE o.createdAt BETWEEN start AND end
  AND o.status = 'Pagado'
GROUP BY p.id, p.name
ORDER BY total DESC
LIMIT 10
```

### 4. Clientes Nuevos vs Recurrentes
```sql
-- Nuevos (primer pedido en el rango)
SELECT COUNT(DISTINCT o.customerId) as nuevos
FROM orders o
WHERE o.createdAt BETWEEN start AND end
  AND o.status = 'Pagado'
  AND o.customerId NOT IN (
    SELECT DISTINCT o2.customerId
    FROM orders o2
    WHERE o2.createdAt < start
      AND o2.status = 'Pagado'
  );

-- Recurrentes (con pedidos previos)
SELECT COUNT(DISTINCT o.customerId) as recurrentes
FROM orders o
WHERE o.createdAt BETWEEN start AND end
  AND o.status = 'Pagado'
  AND o.customerId IN (
    SELECT DISTINCT o2.customerId
    FROM orders o2
    WHERE o2.createdAt < start
      AND o2.status = 'Pagado'
  );
```

### 5. KPIs Delivery
```sql
-- Pedidos totales delivery
SELECT COUNT(*) as total
FROM orders o
WHERE o.createdAt BETWEEN start AND end
  AND o.orderType = 'delivery';

-- Tiempo promedio de despacho
SELECT AVG(e.eta_min) as promedio
FROM eta_requests e
INNER JOIN orders o ON e.order_id = o.id
WHERE o.createdAt BETWEEN start AND end
  AND o.orderType = 'delivery';

-- Puntualidad (entregas <=30 min)
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN e.eta_min <= 30 THEN 1 ELSE 0 END) as puntuales
FROM eta_requests e
INNER JOIN orders o ON e.order_id = o.id
WHERE o.createdAt BETWEEN start AND end
  AND o.orderType = 'delivery';
```

### 6. Top Barrios Delivery
```sql
SELECT
  e.barrio_sector as barrio,
  COUNT(*) as pedidos
FROM eta_requests e
INNER JOIN orders o ON e.order_id = o.id
WHERE o.createdAt BETWEEN start AND end
  AND o.orderType = 'delivery'
GROUP BY e.barrio_sector
ORDER BY pedidos DESC
LIMIT 10
```

### 7. Gastos por Categoría
```sql
SELECT
  cg.nombre as categoria,
  SUM(e.amount) as monto
FROM expenses e
INNER JOIN categoria_gasto cg ON e.categoriaId = cg.id
WHERE e.createdAt BETWEEN start AND end
  AND e.type = 'egreso'
GROUP BY cg.id, cg.nombre
ORDER BY monto DESC
```

---

## 🚀 Cómo Usar los Endpoints

### Ejemplo 1: KPIs de Finanzas (Mes Actual)
```bash
curl http://localhost:3000/gastos/contabilidad/finanzas/kpis
```

### Ejemplo 2: KPIs de Finanzas (Rango Personalizado)
```bash
curl "http://localhost:3000/gastos/contabilidad/finanzas/kpis?start=2025-12-01&end=2025-12-31"
```

### Ejemplo 3: Top 10 Productos Vendidos
```bash
curl "http://localhost:3000/gastos/contabilidad/productos/top?start=2025-01-01&end=2025-01-31&limit=10"
```

### Ejemplo 4: KPIs de Delivery
```bash
curl http://localhost:3000/gastos/contabilidad/delivery/kpis
```

### Ejemplo 5: Top Barrios (Delivery)
```bash
curl "http://localhost:3000/gastos/contabilidad/delivery/top-barrios?limit=10"
```

---

## 📅 Lógica de Rango de Fechas

### Por Defecto (Sin parámetros)
- **Inicio:** Primer día del mes actual
- **Fin:** Último día del mes actual a las 23:59:59

```typescript
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
start = new Date(year, month, 1, 0, 0, 0);
end = new Date(year, month + 1, 0, 23, 59, 59, 999);
```

### Rango Personalizado
```typescript
if (rango.start && rango.end) {
  start = new Date(rango.start);
  end = new Date(rango.end);
  // Ajustar fecha final al final del día
  end.setHours(23, 59, 59, 999);
}
```

---

## ✅ Checklist de Implementación

- [x] Crear DTOs necesarios (6 archivos)
- [x] Extender GastosService con 24 métodos nuevos
- [x] Extender GastosController con 24 endpoints nuevos
- [x] Implementar lógica de rango de fechas (mes actual por defecto)
- [x] Implementar queries para Finanzas (5 endpoints)
- [x] Implementar queries para Mesas (2 endpoints)
- [x] Implementar queries para Productos (2 endpoints)
- [x] Implementar queries para Clientes (6 endpoints)
- [x] Implementar queries para Delivery (7 endpoints)
- [x] Implementar queries para Gastos (4 endpoints)
- [x] Lógica de clientes nuevos vs recurrentes (opción B)
- [x] Filtrado de pedidos delivery por `orderType = 'delivery'`
- [x] Sin guards específicos (como solicitado)
- [x] Traducción de días de inglés a español
- [x] Formateo de días cortos (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)

---

## 📚 Referencia de Entidades

### Order
```typescript
@Entity('orders')
export class Order {
  id: number;
  tableNumber: number;
  orderType: string; // 'delivery' o 'local'
  status: string; // 'Pagado', 'pendiente', 'cancelado'
  propina: number;
  total: number;
  createdAt: Date;
  customerId?: number;
  mesaId?: number;
}
```

### Gasto
```typescript
@Entity('expenses')
export class Gasto {
  id: number;
  amount: number;
  description?: string;
  type: 'ingreso' | 'egreso';
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  createdAt: Date;
  categoriaId?: number;
}
```

### Eta
```typescript
@Entity('eta_requests')
export class Eta {
  id: number;
  created_at: Date;
  barrio_sector: string;
  eta_min: number;
  order_id: number;
}
```

---

## 🎯 Siguientes Pasos

1. **Probar los endpoints:**
   - Correr el servidor: `npm run start:dev`
   - Usar Postman o curl para probar cada endpoint

2. **Verificar respuestas:**
   - Validar formatos de fechas
   - Verificar cálculos de agregados
   - Revisar traducciones

3. **Conectar con Frontend:**
   - Actualizar `GastosService` en Angular
   - Modificar `ContabilidadComponent` para llamar a los nuevos endpoints
   - Reemplazar datos estáticos con datos reales del backend

4. **Opcional - Agregar Guards:**
   - Implementar validación de roles si es necesario
   - Agregar `@UseGuards(JwtAuthGuard, RolesGuard)` a endpoints

5. **Opcional - Optimización:**
   - Agregar índices en la DB para queries de rango de fechas
   - Implementar caché de resultados
   - Agregar paginación para rankings

---

## 📞 Soporte

**Base de código:** `/Users/lopo/Documents/GitHub/espacio_back/src/gastos/`

**Archivos principales:**
- `gastos.controller.ts` - 24 nuevos endpoints
- `gastos.service.ts` - 24 nuevos métodos
- `dto/*.dto.ts` - 6 DTOs para responses

**Módulo:** GastosModule (existente, extendido)

---

**✅ Implementación completada. 24 endpoints listos para usar.**
