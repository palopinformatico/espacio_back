# API de Costo de Envío

Documentación completa de los endpoints del módulo de Costo de Envío.

**Base URL:** `http://localhost:3000/costo-envio`

---

## Tabla de Contenidos

- [Obtener todos los costos de envío](#1-obtener-todos-los-costos-de-envío)
- [Obtener costo de envío por defecto](#2-obtener-costo-de-envío-por-defecto)
- [Crear costo de envío](#3-crear-costo-de-envío)
- [Obtener costo de envío por ID](#4-obtener-costo-de-envío-por-id)
- [Actualizar costo de envío](#5-actualizar-costo-de-envío)
- [Eliminar costo de envío](#6-eliminar-costo-de-envío)
- [Modelo de datos](#modelo-de-datos)

---

## 1. Obtener todos los costos de envío

Obtiene la lista completa de costos de envío. El costo marcado como por defecto aparece primero.

### Request

```http
GET /costo-envio
```

### Response

**Status Code:** `200 OK`

```json
[
  {
    "id": 1,
    "precio_envio": 50,
    "descripcion": "Envío estándar",
    "porDefecto": true
  },
  {
    "id": 2,
    "precio_envio": 100,
    "descripcion": "Envío express",
    "porDefecto": false
  },
  {
    "id": 3,
    "precio_envio": 0,
    "descripcion": "Retiro en local",
    "porDefecto": false
  }
]
```

### Notas
- Los resultados están ordenados por `porDefecto: DESC` (el por defecto primero) y luego por `id: ASC`
- Retorna un array vacío si no hay registros

---

## 2. Obtener costo de envío por defecto

Obtiene únicamente el costo de envío marcado como predeterminado.

### Request

```http
GET /costo-envio/default
```

### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "precio_envio": 50,
  "descripcion": "Envío estándar",
  "porDefecto": true
}
```

### Posibles respuestas

| Status Code | Descripción |
|------------|-------------|
| `200 OK` | Retorna el costo de envío por defecto |
| `200 OK` (null) | No hay ningún costo marcado como por defecto |

### Notas
- Si no hay ningún registro marcado como `porDefecto: true`, retorna `null`
- Solo puede haber un costo de envío marcado como por defecto a la vez

---

## 3. Crear costo de envío

Crea un nuevo registro de costo de envío.

### Request

```http
POST /costo-envio
Content-Type: application/json
```

**Body:**

```json
{
  "precio_envio": 75,
  "descripcion": "Envío a domicilio",
  "porDefecto": false
}
```

### Campos del Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `precio_envio` | number | Sí | Precio del envío (puede ser 0) |
| `descripcion` | string | Sí | Descripción del tipo de envío |
| `porDefecto` | boolean | No | Si es `true`, este será el costo por defecto. Default: `false` |

### Response

**Status Code:** `201 Created`

```json
{
  "id": 4,
  "precio_envio": 75,
  "descripcion": "Envío a domicilio",
  "porDefecto": false
}
```

### Comportamiento especial

- Si se crea un registro con `porDefecto: true`, automáticamente se desmarca el anterior costo por defecto
- Solo puede haber un costo de envío marcado como por defecto a la vez

### Ejemplo: Crear costo por defecto

**Request:**
```json
{
  "precio_envio": 50,
  "descripcion": "Envío estándar",
  "porDefecto": true
}
```

**Resultado:**
- Se crea el nuevo registro con `porDefecto: true`
- Todos los demás registros se actualizan automáticamente a `porDefecto: false`

### Posibles errores

| Status Code | Descripción |
|------------|-------------|
| `400 Bad Request` | Datos de entrada inválidos (ej: falta un campo requerido) |
| `500 Internal Server Error` | Error del servidor |

---

## 4. Obtener costo de envío por ID

Obtiene un costo de envío específico por su ID.

### Request

```http
GET /costo-envio/:id
```

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del costo de envío |

### Ejemplo

```http
GET /costo-envio/1
```

### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "precio_envio": 50,
  "descripcion": "Envío estándar",
  "porDefecto": true
}
```

### Posibles respuestas

| Status Code | Descripción |
|------------|-------------|
| `200 OK` | Retorna el costo de envío solicitado |
| `200 OK` (null) | No existe un costo de envío con ese ID |

---

## 5. Actualizar costo de envío

Actualiza un costo de envío existente.

### Request

```http
PATCH /costo-envio/:id
Content-Type: application/json
```

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del costo de envío a actualizar |

**Body:**

```json
{
  "precio_envio": 60,
  "descripcion": "Envío estándar actualizado",
  "porDefecto": true
}
```

### Campos del Body

Todos los campos son opcionales. Solo se actualizan los campos enviados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `precio_envio` | number | Nuevo precio del envío |
| `descripcion` | string | Nueva descripción |
| `porDefecto` | boolean | Marcar/desmarcar como por defecto |

### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "precio_envio": 60,
  "descripcion": "Envío estándar actualizado",
  "porDefecto": true
}
```

### Comportamiento especial

- Si se actualiza un registro con `porDefecto: true`, automáticamente se desmarca el anterior costo por defecto
- Solo puede haber un costo de envío marcado como por defecto a la vez
- Si el registro actualizado ya era el por defecto y se envía `porDefecto: true`, no se hacen cambios adicionales

### Ejemplos de uso

**Ejemplo 1: Solo actualizar el precio**
```json
{
  "precio_envio": 55
}
```

**Ejemplo 2: Marcar como por defecto**
```json
{
  "porDefecto": true
}
```
*Nota: Esto desmarcará automáticamente el anterior costo por defecto*

**Ejemplo 3: Actualizar múltiples campos**
```json
{
  "precio_envio": 80,
  "descripcion": "Envío premium",
  "porDefecto": true
}
```

### Posibles errores

| Status Code | Descripción |
|------------|-------------|
| `400 Bad Request` | Datos de entrada inválidos |
| `404 Not Found` | No existe un costo de envío con ese ID |
| `500 Internal Server Error` | Error del servidor |

---

## 6. Eliminar costo de envío

Elimina un costo de envío por su ID.

### Request

```http
DELETE /costo-envio/:id
```

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del costo de envío a eliminar |

### Ejemplo

```http
DELETE /costo-envio/3
```

### Response

**Status Code:** `200 OK`

```json
{
  "message": "Costo de envío con ID 3 eliminado correctamente"
}
```

### Posibles errores

| Status Code | Descripción |
|------------|-------------|
| `404 Not Found` | No existe un costo de envío con ese ID |
| `500 Internal Server Error` | Error del servidor |

### Notas importantes
- Si se elimina el costo de envío que está marcado como por defecto, no se asigna automáticamente otro como por defecto
- Se recomienda verificar si el costo a eliminar es el por defecto antes de eliminarlo

---

## Modelo de Datos

### Entidad: CostoEnvio

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | number | No | Auto-generado | Identificador único (Primary Key) |
| `precio_envio` | number | No | - | Precio del costo de envío |
| `descripcion` | string | No | - | Descripción del tipo de envío |
| `porDefecto` | boolean | No | `false` | Indica si es el costo de envío por defecto |

### Restricciones y reglas de negocio

1. **Único por defecto**: Solo puede existir un registro con `porDefecto: true` a la vez
2. **Auto-gestión del por defecto**: Al marcar un registro como por defecto, el sistema automáticamente desmarca el anterior
3. **Ordenamiento**: En `GET /costo-envio`, el registro por defecto siempre aparece primero
4. **Precio**: El campo `precio_envio` acepta valores decimales y puede ser 0 (ej: retiro en local)

---

## Ejemplos de Uso Completos

### Caso 1: Configuración inicial

**Paso 1: Crear primer costo de envío (por defecto)**
```bash
curl -X POST http://localhost:3000/costo-envio \
  -H "Content-Type: application/json" \
  -d '{
    "precio_envio": 50,
    "descripcion": "Envío estándar",
    "porDefecto": true
  }'
```

**Paso 2: Agregar opciones adicionales**
```bash
curl -X POST http://localhost:3000/costo-envio \
  -H "Content-Type: application/json" \
  -d '{
    "precio_envio": 100,
    "descripcion": "Envío express",
    "porDefecto": false
  }'

curl -X POST http://localhost:3000/costo-envio \
  -H "Content-Type: application/json" \
  -d '{
    "precio_envio": 0,
    "descripcion": "Retiro en local",
    "porDefecto": false
  }'
```

### Caso 2: Cambiar el costo por defecto

```bash
# Marcar el envío express (ID 2) como por defecto
curl -X PATCH http://localhost:3000/costo-envio/2 \
  -H "Content-Type: application/json" \
  -d '{
    "porDefecto": true
  }'
```
*Resultado: El envío express ahora es por defecto, y el anterior se desmarca automáticamente*

### Caso 3: Obtener el costo por defecto para mostrar en checkout

```bash
curl -X GET http://localhost:3000/costo-envio/default
```

**Response:**
```json
{
  "id": 2,
  "precio_envio": 100,
  "descripcion": "Envío express",
  "porDefecto": true
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200 OK` | Petición exitosa (GET, PATCH, DELETE) |
| `201 Created` | Recurso creado exitosamente (POST) |
| `400 Bad Request` | Error en la validación de datos |
| `404 Not Found` | Recurso no encontrado |
| `500 Internal Server Error` | Error interno del servidor |

---

## Notas Técnicas

### Base de Datos
- **Tabla:** `costo_envio`
- **Motor:** MySQL
- **ORM:** TypeORM
- **Sincronización:** El esquema se sincroniza automáticamente con `synchronize: true`

### Validación
- Los DTOs utilizan `class-validator` para validación de datos
- Campos requeridos se validan automáticamente
- Los tipos de datos se validan antes de procesar la petición

### Ordenamiento por defecto
```sql
SELECT * FROM costo_envio
ORDER BY porDefecto DESC, id ASC;
```

---

## Contacto y Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

**Última actualización:** 05/02/2026
