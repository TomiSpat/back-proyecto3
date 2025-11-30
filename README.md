# 🚀 Sistema de Gestión de Reclamos - Backend

API REST desarrollada con **NestJS**, **MongoDB** y **TypeScript** para la gestión integral de clientes, proyectos y reclamos con implementación del **Patrón State** para control de flujo de estados.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Módulos Implementados](#-módulos-implementados)
- [Patrón State](#-patrón-state)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Endpoints Principales](#-endpoints-principales)
- [Estructura de Carpetas](#-estructura-de-carpetas)

---

## 🎯 Descripción General

Este backend implementa un sistema completo de gestión de reclamos que permite:

- **Gestión de Clientes**: CRUD completo con soft delete
- **Gestión de Proyectos**: Vinculación con clientes y tipos de proyecto
- **Gestión de Tipos de Proyecto**: Categorización de proyectos
- **Gestión de Reclamos**: Sistema avanzado con patrón State para control de flujo
- **Trazabilidad Completa**: Historial de cambios de estado con fecha, hora y área responsable
- **Validaciones Estrictas**: Reglas de negocio implementadas en cada transición de estado

### Características Clave

✅ **Patrón State** para gestión de estados de reclamos  
✅ **Soft Delete** en todas las entidades  
✅ **Validación automática** con class-validator  
✅ **Documentación Swagger** interactiva  
✅ **Mensajes de error claros** en español  
✅ **Relaciones pobladas** automáticamente con Mongoose  
✅ **Trazabilidad completa** de cambios de estado  

---

## 🛠 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.0.1 | Framework backend |
| **TypeScript** | 5.7.3 | Lenguaje de programación |
| **MongoDB** | 8.20.1 | Base de datos NoSQL |
| **Mongoose** | 8.20.1 | ODM para MongoDB |
| **class-validator** | 0.14.3 | Validación de DTOs |
| **class-transformer** | 0.5.1 | Transformación de objetos |
| **Swagger** | 11.2.3 | Documentación de API |

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue una **arquitectura en capas** con el patrón **Repository**:

```
Controller → Service → Repository → Database
     ↓          ↓          ↓
   DTOs    Business    Data Access
           Logic
```

### Capas de la Arquitectura

1. **Controller**: Maneja las peticiones HTTP y respuestas
2. **Service**: Contiene la lógica de negocio y validaciones
3. **Repository**: Abstracción de acceso a datos
4. **Entity**: Esquemas de MongoDB con Mongoose
5. **DTOs**: Validación y transformación de datos de entrada/salida
6. **Interfaces**: Contratos para repositories

---

## 📦 Módulos Implementados

### 1️⃣ **Módulo Cliente**

**Ubicación**: `src/cliente/`

Gestiona la información de los clientes del sistema.

**Entidad**:
```typescript
- nombre: string
- email: string (único)
- telefono: string
- direccion: string
- isDeleted: boolean (soft delete)
- deletedAt: Date
```

**Endpoints**:
- `POST /cliente` - Crear cliente
- `GET /cliente` - Listar todos
- `GET /cliente/:id` - Obtener por ID
- `PATCH /cliente/:id` - Actualizar
- `DELETE /cliente/:id` - Soft delete

---

### 2️⃣ **Módulo Tipo Proyecto**

**Ubicación**: `src/tipo-proyecto/`

Define los tipos de proyectos disponibles (ej: Desarrollo Web, App Móvil, etc.).

**Entidad**:
```typescript
- nombre: string
- descripcion: string
- isDeleted: boolean
- deletedAt: Date
```

**Endpoints**:
- `POST /tipo-proyecto` - Crear tipo
- `GET /tipo-proyecto` - Listar todos
- `GET /tipo-proyecto/:id` - Obtener por ID
- `PATCH /tipo-proyecto/:id` - Actualizar
- `DELETE /tipo-proyecto/:id` - Soft delete

---

### 3️⃣ **Módulo Proyecto**

**Ubicación**: `src/proyecto/`

Gestiona los proyectos asociados a clientes.

**Entidad**:
```typescript
- nombre: string
- descripcion: string
- clienteId: ObjectId (ref: Cliente)
- tipoProyectoId: ObjectId (ref: TipoProyecto)
- fechaInicio: Date
- fechaFin: Date
- estado: enum (PLANIFICACION, EN_DESARROLLO, FINALIZADO, CANCELADO)
- presupuesto: number
- isDeleted: boolean
- deletedAt: Date
```

**Endpoints**:
- `POST /proyecto` - Crear proyecto
- `GET /proyecto` - Listar todos
- `GET /proyecto/cliente/:clienteId` - Por cliente
- `GET /proyecto/tipo-proyecto/:tipoProyectoId` - Por tipo
- `GET /proyecto/:id` - Obtener por ID
- `PATCH /proyecto/:id` - Actualizar
- `DELETE /proyecto/:id` - Soft delete

---

### 4️⃣ **Módulo Reclamo** ⭐

**Ubicación**: `src/reclamo/`

El módulo más complejo del sistema. Gestiona reclamos con patrón State.

**Entidad**:
```typescript
- clienteId: ObjectId (ref: Cliente)
- proyectoId: ObjectId (ref: Proyecto)
- tipoProyectoId: ObjectId (ref: TipoProyecto)
- codigo: string (único)
- tipo: enum (INCIDENTE, CONSULTA, MEJORA, OTRO)
- prioridad: enum (BAJA, MEDIA, ALTA, URGENTE)
- criticidad: enum (BAJA, MEDIA, ALTA, CRITICA)
- descripcion: string (20-2000 caracteres)
- areaActual: enum (VENTAS, SOPORTE_TECNICO, FACTURACION)
- estadoActual: enum (PENDIENTE, EN_PROCESO, EN_REVISION, RESUELTO, CANCELADO)
- puedeModificar: boolean (controlado por estado)
- puedeReasignar: boolean (controlado por estado)
- responsableActualId: ObjectId (ref: Usuario)
- creadoPorUsuarioId: ObjectId (ref: Usuario)
- fechaResolucion: Date
- fechaCierre: Date
- resumenResolucion: string
- feedbackCliente: string
```

**Endpoints CRUD**:
- `POST /reclamo` - Crear reclamo
- `GET /reclamo` - Listar todos
- `GET /reclamo/search` - Búsqueda con filtros
- `GET /reclamo/cliente/:clienteId` - Por cliente
- `GET /reclamo/proyecto/:proyectoId` - Por proyecto
- `GET /reclamo/tipo-proyecto/:tipoProyectoId` - Por tipo de proyecto
- `GET /reclamo/area/:area` - Por área
- `GET /reclamo/:id` - Obtener por ID
- `PATCH /reclamo/:id` - Actualizar (validado por estado)
- `PATCH /reclamo/:id/asignar-area` - Asignar área
- `DELETE /reclamo/:id` - Cancelar (soft delete)

**Endpoints de Estado**:
- `POST /reclamo/:id/estado/cambiar` - Cambiar estado
- `GET /reclamo/:id/estado/historial` - Historial de cambios
- `GET /reclamo/:id/estado/puede-modificar` - Verificar permisos
- `GET /reclamo/:id/estado/puede-reasignar` - Verificar permisos
- `GET /reclamo/estados/info` - Info de todos los estados

---

## 🎭 Patrón State

### Flujo de Estados

```
PENDIENTE → EN_PROCESO → EN_REVISION → RESUELTO
    ↓           ↓            ↓
CANCELADO   CANCELADO    CANCELADO
```

### Estados Implementados

#### 1. **PENDIENTE**
- **Descripción**: Reclamo pendiente de asignación
- **Puede modificar**: ✅ Sí
- **Puede reasignar**: ✅ Sí
- **Transiciones permitidas**: EN_PROCESO, CANCELADO
- **Validación**: Requiere responsable o área para pasar a EN_PROCESO

#### 2. **EN_PROCESO**
- **Descripción**: Reclamo siendo trabajado activamente
- **Puede modificar**: ✅ Sí
- **Puede reasignar**: ✅ Sí
- **Transiciones permitidas**: EN_REVISION, PENDIENTE, CANCELADO
- **Validación**: Requiere observaciones o resumen para pasar a EN_REVISION

#### 3. **EN_REVISION**
- **Descripción**: Solución propuesta en evaluación
- **Puede modificar**: ❌ No
- **Puede reasignar**: ❌ No
- **Transiciones permitidas**: RESUELTO, EN_PROCESO, CANCELADO
- **Validación**: 
  - Requiere resumen de resolución para RESUELTO
  - Requiere motivo para volver a EN_PROCESO

#### 4. **RESUELTO**
- **Descripción**: Reclamo resuelto exitosamente
- **Puede modificar**: ❌ No
- **Puede reasignar**: ❌ No
- **Transiciones permitidas**: EN_PROCESO (reapertura)
- **Validación**: Requiere justificación detallada (mín. 20 caracteres) para reabrir

#### 5. **CANCELADO**
- **Descripción**: Reclamo cancelado (estado final)
- **Puede modificar**: ❌ No
- **Puede reasignar**: ❌ No
- **Transiciones permitidas**: Ninguna
- **Validación**: No permite ninguna transición

### Historial de Estados

**Entity**: `HistorialEstadoReclamo`

Cada cambio de estado se registra con:
- `reclamoId`: Referencia al reclamo
- `estadoAnterior`: Estado previo
- `estadoNuevo`: Estado nuevo
- `areaResponsable`: Área que tiene el reclamo
- `usuarioResponsableId`: Usuario responsable
- `fechaCambio`: Fecha y hora exacta del cambio
- `motivoCambio`: Razón del cambio
- `observaciones`: Notas adicionales

### Clases del Patrón State

```
IReclamoState (Interface)
    ↓
BaseReclamoState (Abstract)
    ↓
├── PendienteState
├── EnProcesoState
├── EnRevisionState
├── ResueltoState
└── CanceladoState
```

**ReclamoStateFactory**: Factory para crear instancias de estados y validar transiciones.

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar @nestjs/config (si no está instalado)

```bash
npm install @nestjs/config
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario1:kOhXkzdReLePj5Ku@cluster0.uwkjs0w.mongodb.net/

# Application
PORT=4000
NODE_ENV=development
```

### 5. Ejecutar la aplicación

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run start:prod
```

### 6. Acceder a la aplicación

Una vez iniciada, verás:

```
🚀 Aplicación corriendo en: http://localhost:4000
📚 Documentación Swagger: http://localhost:4000/api/docs
🗄️  Base de datos: MongoDB Atlas
```

---

## 🌐 Endpoints Principales

### Documentación Interactiva

Accede a **Swagger UI** en: `http://localhost:4000/api/docs`

Aquí encontrarás:
- Todos los endpoints disponibles
- Esquemas de request/response
- Posibilidad de probar los endpoints directamente

### Ejemplos de Uso

#### Crear un Cliente

```http
POST /cliente
Content-Type: application/json

{
  "nombre": "Empresa XYZ",
  "email": "contacto@xyz.com",
  "telefono": "+54 11 1234-5678",
  "direccion": "Av. Siempre Viva 123, CABA"
}
```

#### Crear un Reclamo

```http
POST /reclamo
Content-Type: application/json

{
  "clienteId": "507f1f77bcf86cd799439011",
  "proyectoId": "507f1f77bcf86cd799439012",
  "tipoProyectoId": "507f1f77bcf86cd799439013",
  "tipo": "INCIDENTE",
  "prioridad": "ALTA",
  "criticidad": "ALTA",
  "descripcion": "El sistema presenta errores al procesar pagos con tarjetas de crédito...",
  "areaActual": "SOPORTE_TECNICO",
  "creadoPorUsuarioId": "507f1f77bcf86cd799439014"
}
```

#### Cambiar Estado de un Reclamo

```http
POST /reclamo/507f1f77bcf86cd799439015/estado/cambiar
Content-Type: application/json

{
  "nuevoEstado": "EN_PROCESO",
  "motivoCambio": "Asignado al equipo de desarrollo",
  "areaResponsable": "SOPORTE_TECNICO",
  "responsableId": "507f1f77bcf86cd799439016",
  "observaciones": "Se requiere revisión urgente del módulo de pagos"
}
```

#### Obtener Historial de Estados

```http
GET /reclamo/507f1f77bcf86cd799439015/estado/historial
```

**Respuesta**:
```json
[
  {
    "estadoAnterior": "PENDIENTE",
    "estadoNuevo": "EN_PROCESO",
    "areaResponsable": "SOPORTE_TECNICO",
    "usuarioResponsableId": {
      "_id": "507f1f77bcf86cd799439016",
      "nombre": "Juan Pérez"
    },
    "fechaCambio": "2025-11-29T03:15:00.000Z",
    "motivoCambio": "Asignado al equipo de desarrollo",
    "observaciones": "Se requiere revisión urgente"
  }
]
```

---

## 📁 Estructura de Carpetas

```
Backend/
├── src/
│   ├── cliente/                    # Módulo Cliente
│   │   ├── dto/                    # DTOs de validación
│   │   ├── entities/               # Esquema Mongoose
│   │   ├── interface/              # Interfaces del repository
│   │   ├── cliente.controller.ts   # Controlador REST
│   │   ├── cliente.service.ts      # Lógica de negocio
│   │   ├── cliente.repository.ts   # Acceso a datos
│   │   └── cliente.module.ts       # Configuración del módulo
│   │
│   ├── tipo-proyecto/              # Módulo Tipo Proyecto
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interface/
│   │   ├── tipo-proyecto.controller.ts
│   │   ├── tipo-proyecto.service.ts
│   │   ├── tipo-proyecto.repository.ts
│   │   └── tipo-proyecto.module.ts
│   │
│   ├── proyecto/                   # Módulo Proyecto
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interface/
│   │   ├── proyecto.controller.ts
│   │   ├── proyecto.service.ts
│   │   ├── proyecto.repository.ts
│   │   └── proyecto.module.ts
│   │
│   ├── reclamo/                    # Módulo Reclamo (Principal)
│   │   ├── dto/
│   │   │   ├── create-reclamo.dto.ts
│   │   │   ├── update-reclamo.dto.ts
│   │   │   ├── asignacion-area.dto.ts
│   │   │   └── cambiar-estado-reclamo.dto.ts
│   │   ├── entities/
│   │   │   ├── reclamo.entity.ts
│   │   │   └── historial-estado-reclamo.entity.ts
│   │   ├── interface/
│   │   │   └── IReclamoRepository.ts
│   │   ├── state/                  # Patrón State
│   │   │   ├── reclamo-state.interface.ts
│   │   │   ├── base-reclamo-state.ts
│   │   │   ├── pendiente-state.ts
│   │   │   ├── en-proceso-state.ts
│   │   │   ├── en-revision-state.ts
│   │   │   ├── resuelto-state.ts
│   │   │   ├── cancelado-state.ts
│   │   │   └── reclamo-state.factory.ts
│   │   ├── services/
│   │   │   └── estado-reclamo.service.ts
│   │   ├── controllers/
│   │   │   └── estado-reclamo.controller.ts
│   │   ├── reclamo.controller.ts
│   │   ├── reclamo.service.ts
│   │   ├── reclamo.repository.ts
│   │   ├── reclamo.enums.ts
│   │   └── reclamo.module.ts
│   │
│   ├── usuario/                    # Módulo Usuario
│   ├── estado-reclamo/             # Módulo auxiliar
│   ├── evento-reclamo/             # Módulo auxiliar
│   ├── reporte/                    # Módulo auxiliar
│   │
│   ├── app.module.ts               # Módulo principal
│   └── main.ts                     # Punto de entrada
│
├── .env                            # Variables de entorno
├── package.json                    # Dependencias
├── tsconfig.json                   # Configuración TypeScript
└── README.md                       # Este archivo
```

---

## 🔍 Conceptos Clave

### Soft Delete

Todas las entidades implementan **soft delete**:
- No se eliminan físicamente de la base de datos
- Se marca con `isDeleted: true` o se cambia el estado a `CANCELADO`
- Se registra `deletedAt` o `fechaCierre`
- Las consultas filtran automáticamente los registros eliminados

### Populate Automático

Las relaciones se populan automáticamente:
```typescript
// En lugar de obtener solo IDs
{
  "clienteId": "507f1f77bcf86cd799439011"
}

// Se obtiene el objeto completo
{
  "clienteId": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Empresa XYZ",
    "email": "contacto@xyz.com"
  }
}
```

### Validaciones

Todas las validaciones se realizan con **class-validator**:
- Tipos de datos
- Longitudes mínimas/máximas
- Formatos (email, ObjectId, etc.)
- Valores permitidos (enums)
- Mensajes de error personalizados en español

### Mensajes de Error

Todos los errores retornan mensajes claros:
```json
{
  "statusCode": 400,
  "message": "El ID '123' no es un ObjectId válido de MongoDB",
  "error": "Bad Request"
}
```

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1:N
       ↓
┌─────────────┐      ┌──────────────────┐
│  Proyecto   │──────│  TipoProyecto    │
└──────┬──────┘ N:1  └──────────────────┘
       │ 1:N
       ↓
┌─────────────┐
│   Reclamo   │──────→ HistorialEstadoReclamo
└─────────────┘ 1:N
       │
       ├──→ Usuario (responsable)
       └──→ Usuario (creador)
```

---

## 🎓 Conceptos Implementados

### Patrones de Diseño

1. **Repository Pattern**: Abstracción de acceso a datos
2. **State Pattern**: Gestión de estados de reclamo
3. **Factory Pattern**: Creación de instancias de estados
4. **Dependency Injection**: Inyección de dependencias con NestJS

### Principios SOLID

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Estados intercambiables
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Dependencias de abstracciones

### Clean Architecture

- Separación de capas
- Independencia de frameworks
- Testeable
- Independiente de UI y BD

---

## 🚨 Manejo de Errores

El sistema implementa manejo de errores consistente:

| Código | Excepción | Uso |
|--------|-----------|-----|
| 400 | BadRequestException | Datos inválidos, ObjectId inválido |
| 403 | ForbiddenException | Operación no permitida por estado |
| 404 | NotFoundException | Recurso no encontrado |
| 409 | ConflictException | Duplicados (email, código) |

---

## 📝 Notas Importantes

### Validaciones del Patrón State

- **No se puede modificar** un reclamo en estado `EN_REVISION`, `RESUELTO` o `CANCELADO`
- **No se puede reasignar** un reclamo en estado `EN_REVISION`, `RESUELTO` o `CANCELADO`
- Cada transición de estado tiene **validaciones específicas**
- El sistema **registra automáticamente** cada cambio en el historial

### Base de Datos

- **MongoDB Atlas**: Base de datos en la nube
- **Colecciones**: clientes, proyectos, tipo_proyectos, reclamos, historial_estados_reclamo
- **Índices**: Optimizados para consultas frecuentes (clienteId, proyectoId, estadoActual, etc.)

### Seguridad

- **CORS habilitado**: Permite peticiones desde frontend
- **Validación global**: Todos los DTOs se validan automáticamente
- **Sanitización**: `whitelist: true` elimina propiedades no definidas

---

## 👥 Equipo

Este proyecto fue desarrollado como parte de la materia **Programación Avanzada** - UTN.

---

## 📞 Soporte

Para dudas o consultas sobre el proyecto, consultar la documentación de:
- [NestJS](https://docs.nestjs.com)
- [Mongoose](https://mongoosejs.com/docs/)
- [MongoDB](https://www.mongodb.com/docs/)

---

**¡El backend está listo para usar! 🎉**
