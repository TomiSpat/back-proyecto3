# 🎫 Sistema de Creación de Reclamos Diferenciado por Roles

## 📋 Resumen

Se implementó un sistema de creación de reclamos con **lógica diferenciada según el rol del usuario**, permitiendo dos flujos diferentes:

1. **CLIENTE**: Crea reclamos básicos que quedan pendientes de asignación
2. **STAFF (Admin/Coordinador/Agente)**: Crea reclamos completos con asignaciones inmediatas

---

## 🎯 Escenarios de Uso

### ✅ Escenario 1: Cliente Crea su Propio Reclamo

**Descripción:**  
Un cliente autenticado reporta un problema/consulta sobre un proyecto.

**Campos que DEBE proporcionar:**
- `proyectoId`: ID del proyecto relacionado
- `tipoProyectoId`: ID del tipo de proyecto
- `tipo`: Tipo de reclamo (INCIDENTE, CONSULTA, MEJORA, OTRO)
- `descripcion`: Descripción detallada (mínimo 20 caracteres)

**Campos que NO puede proporcionar (se asignan automáticamente):**
- `clienteId`: Se obtiene del usuario autenticado (usuario.clienteId)
- `prioridad`: Se asigna como MEDIA automáticamente
- `criticidad`: Se asigna como MEDIA automáticamente
- `areaActual`: Queda sin asignar (null)
- `responsableActualId`: Queda sin asignar (null)
- `estadoActual`: Se asigna como PENDIENTE

**Resultado:**
- ✅ Reclamo creado en estado **PENDIENTE**
- ✅ Sin área asignada (esperando asignación por coordinador)
- ✅ Sin responsable asignado

---

### ✅ Escenario 2: Staff (Admin/Coordinador/Agente) Crea Reclamo

**Descripción:**  
Un usuario interno crea un reclamo en nombre de un cliente.

**Campos que DEBE proporcionar:**
- `clienteId`: ID del cliente afectado (**obligatorio**)
- `proyectoId`: ID del proyecto relacionado
- `tipoProyectoId`: ID del tipo de proyecto
- `tipo`: Tipo de reclamo
- `prioridad`: Prioridad (**obligatorio**)
- `criticidad`: Criticidad (**obligatorio**)
- `descripcion`: Descripción detallada

**Campos opcionales:**
- `areaInicial`: Área a la que se asigna el reclamo
- `responsableId`: Usuario responsable del reclamo

**Resultado:**
- ✅ Reclamo creado con asignaciones inmediatas
- ✅ Si tiene `areaInicial` y `responsableId` → Estado **EN_PROCESO**
- ✅ Si solo tiene `areaInicial` → Estado **EN_PROCESO**
- ✅ Si no tiene asignaciones → Estado **PENDIENTE**

---

## 📊 Flujo de Creación de Reclamos

### Diagrama de Flujo

```
┌─────────────────────────────────────────┐
│   Usuario autenticado crea reclamo      │
│   POST /reclamo                          │
└──────────────────┬──────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        │                     │
   ROL = CLIENTE         ROL = STAFF
        │                     │
        ↓                     ↓
┌──────────────────┐    ┌──────────────────┐
│ ESCENARIO 1      │    │ ESCENARIO 2      │
│ Cliente crea     │    │ Staff crea       │
└────────┬─────────┘    └────────┬─────────┘
         ↓                       ↓
┌─────────────────────────────────────────┐
│ Validaciones:                            │
│ - Cliente: tiene clienteId asociado?     │
│ - Staff: proporcionó clienteId?          │
│ - Staff: proporcionó prioridad?          │
│ - Staff: proporcionó criticidad?         │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Preparar datos del reclamo:              │
│                                          │
│ CLIENTE:                                 │
│ - clienteId: usuario.clienteId           │
│ - prioridad: MEDIA (auto)                │
│ - criticidad: MEDIA (auto)               │
│ - areaActual: null                       │
│ - responsableActualId: null              │
│ - estadoActual: PENDIENTE                │
│                                          │
│ STAFF:                                   │
│ - clienteId: dto.clienteId               │
│ - prioridad: dto.prioridad               │
│ - criticidad: dto.criticidad             │
│ - areaActual: dto.areaInicial (opt)      │
│ - responsableActualId: dto.responsableId │
│ - estadoActual: EN_PROCESO o PENDIENTE   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Guardar en base de datos                 │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ ✅ Reclamo creado exitosamente          │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Asignación por Coordinador

Cuando un cliente crea un reclamo, queda en estado **PENDIENTE** esperando que un coordinador lo asigne:

### Diagrama de Asignación

```
┌─────────────────────────────────────────┐
│  Cliente crea reclamo                    │
│  Estado: PENDIENTE                       │
│  Área: null                              │
│  Responsable: null                       │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Coordinador revisa reclamos pendientes  │
│  GET /reclamo?estadoActual=PENDIENTE     │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Coordinador asigna área y responsable   │
│  PATCH /reclamo/:id/asignar-pendiente    │
│  {                                       │
│    area: "SOPORTE_TECNICO",              │
│    responsableId: "...",                 │
│    prioridad: "ALTA" (opcional),         │
│    criticidad: "ALTA" (opcional)         │
│  }                                       │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Sistema valida:                         │
│  - Reclamo está en estado PENDIENTE?     │
│  - Reclamo NO tiene área asignada?       │
│  - Usuario es COORDINADOR o ADMIN?       │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Actualizar reclamo:                     │
│  - areaActual: "SOPORTE_TECNICO"         │
│  - responsableActualId: "..."            │
│  - estadoActual: EN_PROCESO              │
│  - prioridad: ALTA (si se proporcionó)   │
│  - criticidad: ALTA (si se proporcionó)  │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  ✅ Reclamo asignado y en proceso       │
└─────────────────────────────────────────┘
```

---

## 📁 Archivos Modificados

### 1. **DTO de Creación de Reclamo**

#### `src/reclamo/dto/create-reclamo.dto.ts`

**Cambios:**
- ✅ `clienteId`: Ahora es **opcional** (requerido solo para Staff)
- ✅ `prioridad`: Ahora es **opcional** (requerido solo para Staff)
- ✅ `criticidad`: Ahora es **opcional** (requerido solo para Staff)
- ✅ `areaInicial`: Campo nuevo, **opcional** (solo Staff puede asignar)
- ✅ `responsableId`: Campo nuevo, **opcional** (solo Staff puede asignar)

**Estructura:**
```typescript
export class CreateReclamoDto {
  // ===== CAMPOS COMUNES (TODOS LOS ROLES) =====
  proyectoId: string;          // ✅ Obligatorio
  tipoProyectoId: string;      // ✅ Obligatorio
  tipo: ReclamoTipo;           // ✅ Obligatorio
  descripcion: string;         // ✅ Obligatorio (min 20 chars)

  // ===== CAMPOS OPCIONALES (CLIENTE omite, STAFF proporciona) =====
  clienteId?: string;          // Opcional para Cliente, Obligatorio para Staff
  prioridad?: ReclamoPrioridad;// Opcional para Cliente, Obligatorio para Staff
  criticidad?: ReclamoCriticidad; // Opcional para Cliente, Obligatorio para Staff

  // ===== CAMPOS EXCLUSIVOS PARA STAFF =====
  areaInicial?: AreaGeneralReclamo;    // Solo Staff
  responsableId?: string;              // Solo Staff
}
```

---

### 2. **DTO de Asignación de Reclamo Pendiente (NUEVO)**

#### `src/reclamo/dto/asignar-reclamo-pendiente.dto.ts`

```typescript
export class AsignarReclamoPendienteDto {
  area: AreaGeneralReclamo;              // ✅ Obligatorio
  responsableId?: string;                // Opcional
  prioridad?: ReclamoPrioridad;          // Opcional (actualizar)
  criticidad?: ReclamoCriticidad;        // Opcional (actualizar)
}
```

---

### 3. **Entidad Reclamo**

#### `src/reclamo/entities/reclamo.entity.ts`

**Cambio:**
```typescript
@Prop({
  type: String,
  enum: AreaGeneralReclamo,
  required: false, // ← Cambió de true a false
  index: true,
})
areaActual?: AreaGeneralReclamo; // ← Ahora es opcional
```

**Razón:**  
Permitir que los reclamos creados por clientes no tengan área asignada inicialmente.

---

### 4. **Servicio de Reclamos**

#### `src/reclamo/reclamo.service.ts`

**Método `create` actualizado:**
```typescript
async create(createReclamoDto: CreateReclamoDto, usuario: UsuarioDocument): Promise<ReclamoDocument>
```

**Lógica:**
1. Determinar si el usuario es Cliente o Staff
2. Llamar al método privado correspondiente:
   - `prepararReclamoCliente()` para clientes
   - `prepararReclamoStaff()` para staff
3. Crear el reclamo en la base de datos

**Nuevo método `prepararReclamoCliente()`:**
- Valida que el usuario tenga `clienteId` asociado
- Asigna valores automáticos:
  - `clienteId`: del usuario autenticado
  - `prioridad`: MEDIA
  - `criticidad`: MEDIA
  - `estadoActual`: PENDIENTE
  - `areaActual`: undefined (sin asignar)
  - `responsableActualId`: undefined (sin asignar)

**Nuevo método `prepararReclamoStaff()`:**
- Valida que se proporcionen `clienteId`, `prioridad` y `criticidad`
- Permite asignar `areaInicial` y `responsableId` opcionalmente
- Asigna estado:
  - **EN_PROCESO**: si tiene área y responsable
  - **PENDIENTE**: si no tiene asignaciones

**Nuevo método `asignarReclamoPendiente()`:**
- Solo accesible por COORDINADOR y ADMIN
- Valida que el reclamo esté en estado PENDIENTE
- Valida que el reclamo NO tenga área asignada
- Actualiza:
  - `areaActual`
  - `responsableActualId` (opcional)
  - `prioridad` (opcional)
  - `criticidad` (opcional)
  - `estadoActual`: EN_PROCESO

---

### 5. **Controller de Reclamos**

#### `src/reclamo/reclamo.controller.ts`

**Endpoint `POST /reclamo` actualizado:**
```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UsuarioRol.CLIENTE, UsuarioRol.ADMIN, UsuarioRol.COORDINADOR, UsuarioRol.AGENTE)
create(
  @Body() createReclamoDto: CreateReclamoDto,
  @CurrentUser() usuario: UsuarioDocument
)
```

**Cambios:**
- ✅ Agregado `@UseGuards` para autenticación y autorización
- ✅ Agregado `@Roles` para permitir todos los roles
- ✅ Agregado `@CurrentUser()` para obtener el usuario autenticado
- ✅ Se pasa el usuario al servicio

**Nuevo endpoint `PATCH /reclamo/:id/asignar-pendiente`:**
```typescript
@Patch(':id/asignar-pendiente')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UsuarioRol.COORDINADOR, UsuarioRol.ADMIN)
asignarReclamoPendiente(
  @Param('id') id: string,
  @Body() asignarDto: AsignarReclamoPendienteDto,
  @CurrentUser() usuario: UsuarioDocument
)
```

**Características:**
- ✅ Solo COORDINADOR y ADMIN pueden acceder
- ✅ Permite asignar reclamos pendientes creados por clientes

---

### 6. **Repository de Reclamos**

#### `src/reclamo/reclamo.repository.ts`

**Método `create` actualizado:**
```typescript
async create(data: any): Promise<ReclamoDocument> {
  const reclamoData: any = {
    ...data,
    clienteId: new Types.ObjectId(data.clienteId),
    proyectoId: new Types.ObjectId(data.proyectoId),
    tipoProyectoId: new Types.ObjectId(data.tipoProyectoId),
    creadoPorUsuarioId: data.creadoPorUsuarioId 
      ? new Types.ObjectId(data.creadoPorUsuarioId) 
      : undefined,
  };

  // Solo convertir responsableActualId si está presente
  if (data.responsableActualId) {
    reclamoData.responsableActualId = new Types.ObjectId(data.responsableActualId);
  }

  const reclamo = new this.reclamoModel(reclamoData);
  return await reclamo.save();
}
```

**Cambio:**
- ✅ Maneja campos opcionales como `responsableActualId`

---

### 7. **Módulo de Reclamos**

#### `src/reclamo/reclamo.module.ts`

**Cambio:**
```typescript
imports: [
  MongooseModule.forFeature([...]),
  AuthModule, // ← Agregado para usar guards
],
```

**Razón:**  
Permitir usar `JwtAuthGuard` y `RolesGuard` en el controller.

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: Cliente Crea Reclamo

**Request:**
```http
POST /reclamo
Authorization: Bearer <token_cliente>
Content-Type: application/json

{
  "proyectoId": "507f1f77bcf86cd799439011",
  "tipoProyectoId": "507f1f77bcf86cd799439012",
  "tipo": "INCIDENTE",
  "descripcion": "El sistema de pagos no está funcionando correctamente desde esta mañana. Los clientes no pueden completar sus transacciones."
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439999",
  "clienteId": "507f1f77bcf86cd799439013",
  "proyectoId": "507f1f77bcf86cd799439011",
  "tipoProyectoId": "507f1f77bcf86cd799439012",
  "tipo": "INCIDENTE",
  "descripcion": "El sistema de pagos no está...",
  "prioridad": "MEDIA",
  "criticidad": "MEDIA",
  "estadoActual": "PENDIENTE",
  "areaActual": null,
  "responsableActualId": null,
  "creadoPorUsuarioId": "507f1f77bcf86cd799439015",
  "createdAt": "2024-12-01T23:30:00.000Z"
}
```

---

### Ejemplo 2: Coordinador Asigna Reclamo Pendiente

**Request:**
```http
PATCH /reclamo/507f1f77bcf86cd799439999/asignar-pendiente
Authorization: Bearer <token_coordinador>
Content-Type: application/json

{
  "area": "SOPORTE_TECNICO",
  "responsableId": "507f1f77bcf86cd799439020",
  "prioridad": "ALTA",
  "criticidad": "CRITICA"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439999",
  "clienteId": "507f1f77bcf86cd799439013",
  "proyectoId": "507f1f77bcf86cd799439011",
  "tipoProyectoId": "507f1f77bcf86cd799439012",
  "tipo": "INCIDENTE",
  "descripcion": "El sistema de pagos no está...",
  "prioridad": "ALTA",
  "criticidad": "CRITICA",
  "estadoActual": "EN_PROCESO",
  "areaActual": "SOPORTE_TECNICO",
  "responsableActualId": "507f1f77bcf86cd799439020",
  "creadoPorUsuarioId": "507f1f77bcf86cd799439015",
  "createdAt": "2024-12-01T23:30:00.000Z",
  "updatedAt": "2024-12-01T23:35:00.000Z"
}
```

---

### Ejemplo 3: Admin Crea Reclamo Completo

**Request:**
```http
POST /reclamo
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "clienteId": "507f1f77bcf86cd799439013",
  "proyectoId": "507f1f77bcf86cd799439011",
  "tipoProyectoId": "507f1f77bcf86cd799439012",
  "tipo": "CONSULTA",
  "prioridad": "MEDIA",
  "criticidad": "BAJA",
  "descripcion": "El cliente solicita información sobre cómo generar reportes mensuales en el sistema.",
  "areaInicial": "SOPORTE_TECNICO",
  "responsableId": "507f1f77bcf86cd799439021"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439998",
  "clienteId": "507f1f77bcf86cd799439013",
  "proyectoId": "507f1f77bcf86cd799439011",
  "tipoProyectoId": "507f1f77bcf86cd799439012",
  "tipo": "CONSULTA",
  "descripcion": "El cliente solicita información...",
  "prioridad": "MEDIA",
  "criticidad": "BAJA",
  "estadoActual": "EN_PROCESO",
  "areaActual": "SOPORTE_TECNICO",
  "responsableActualId": "507f1f77bcf86cd799439021",
  "creadoPorUsuarioId": "507f1f77bcf86cd799439030",
  "createdAt": "2024-12-01T23:40:00.000Z"
}
```

---

## 🔐 Permisos y Autorizaciones

### Crear Reclamo (`POST /reclamo`)
- ✅ **CLIENTE**: Puede crear reclamos básicos
- ✅ **AGENTE**: Puede crear reclamos completos
- ✅ **COORDINADOR**: Puede crear reclamos completos
- ✅ **ADMIN**: Puede crear reclamos completos

### Asignar Reclamo Pendiente (`PATCH /reclamo/:id/asignar-pendiente`)
- ❌ **CLIENTE**: No tiene acceso
- ❌ **AGENTE**: No tiene acceso
- ✅ **COORDINADOR**: Puede asignar reclamos pendientes
- ✅ **ADMIN**: Puede asignar reclamos pendientes

---

## ✅ Validaciones Implementadas

### Al Crear Reclamo (Cliente)
1. ✅ El usuario debe tener `clienteId` asociado
2. ✅ `proyectoId`, `tipoProyectoId`, `tipo` y `descripcion` son obligatorios
3. ✅ La descripción debe tener mínimo 20 caracteres
4. ✅ El usuario NO puede especificar `clienteId`, `prioridad`, `criticidad`, `areaInicial` o `responsableId`

### Al Crear Reclamo (Staff)
1. ✅ `clienteId` es obligatorio
2. ✅ `prioridad` es obligatorio
3. ✅ `criticidad` es obligatorio
4. ✅ `proyectoId`, `tipoProyectoId`, `tipo` y `descripcion` son obligatorios
5. ✅ `areaInicial` y `responsableId` son opcionales

### Al Asignar Reclamo Pendiente (Coordinador)
1. ✅ El usuario debe ser COORDINADOR o ADMIN
2. ✅ El reclamo debe estar en estado PENDIENTE
3. ✅ El reclamo NO debe tener área asignada
4. ✅ `area` es obligatorio
5. ✅ `responsableId`, `prioridad` y `criticidad` son opcionales

---

## 📈 Estados del Reclamo

```
PENDIENTE → EN_PROCESO → EN_REVISION → RESUELTO
                                     ↓
                                 CANCELADO
```

**Estados:**
- **PENDIENTE**: Reclamo creado por cliente, esperando asignación
- **EN_PROCESO**: Reclamo asignado a un área y/o responsable
- **EN_REVISION**: Reclamo en revisión final
- **RESUELTO**: Reclamo completado
- **CANCELADO**: Reclamo cancelado

---

## 🚀 Próximos Pasos

### Mejoras Sugeridas

1. **Notificaciones**
   - Email al cliente cuando se crea el reclamo
   - Email al coordinador cuando hay reclamos pendientes
   - Email al responsable cuando se le asigna un reclamo

2. **Dashboard**
   - Vista de reclamos pendientes para coordinadores
   - Métricas de tiempo de asignación
   - Estadísticas por área

3. **Historial**
   - Registrar quién asignó el reclamo
   - Registrar cambios de prioridad/criticidad
   - Auditoría completa de cambios

4. **Validaciones Adicionales**
   - Verificar que el proyecto pertenece al cliente
   - Verificar que el responsable pertenece al área asignada
   - Límite de reclamos pendientes por cliente

---

## 📝 Resumen de Responsabilidades

### CLIENTE
- ✅ Crea reclamos básicos sobre sus proyectos
- ✅ Proporciona: proyecto, tipo, descripción
- ❌ NO puede asignar prioridad, criticidad, área o responsable

### COORDINADOR
- ✅ Revisa reclamos pendientes
- ✅ Asigna área y responsable a reclamos pendientes
- ✅ Puede actualizar prioridad y criticidad
- ✅ Puede crear reclamos completos en nombre de clientes

### AGENTE
- ✅ Puede crear reclamos completos en nombre de clientes
- ✅ Trabaja en reclamos asignados a su área
- ❌ NO puede asignar reclamos pendientes (solo coordinador)

### ADMIN
- ✅ Puede hacer todo lo que hace Coordinador y Agente
- ✅ Acceso completo al sistema

---

**Sistema de Creación de Reclamos implementado exitosamente! 🎉**
