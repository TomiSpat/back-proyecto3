# 🔍 Sistema de Trazabilidad Completa de Reclamos

Este documento describe el sistema de trazabilidad implementado para registrar TODOS los cambios que ocurren en un reclamo.

---

## 📋 Objetivo

**Registrar y mostrar TODOS los cambios** que ocurren en un reclamo en una línea de tiempo cronológica:
- ✅ Cambios de **ESTADO**
- ✅ Cambios de **ÁREA**
- ✅ Cambios de **RESPONSABLE**

---

## 🏗️ Arquitectura

### **Entidad: HistorialEstadoReclamo**
Ubicación: `src/reclamo/entities/historial-estado-reclamo.entity.ts`

```typescript
@Schema({ collection: 'historial_estados_reclamo' })
export class HistorialEstadoReclamo {
  reclamoId: Types.ObjectId;
  
  // Tipo de cambio
  tipoCambio: TipoCambioHistorial; // ESTADO | AREA | RESPONSABLE
  
  // Cambio de ESTADO
  estadoAnterior?: ReclamoEstado;
  estadoNuevo?: ReclamoEstado;
  
  // Cambio de ÁREA
  areaAnterior?: AreaGeneralReclamo;
  areaNueva?: AreaGeneralReclamo;
  
  // Cambio de RESPONSABLE
  responsableAnteriorId?: Types.ObjectId;
  responsableNuevoId?: Types.ObjectId;
  
  // Campos comunes
  areaResponsable?: AreaGeneralReclamo;
  usuarioResponsableId?: Types.ObjectId;
  fechaCambio: Date;
  motivoCambio?: string;
  observaciones?: string;
}
```

---

## 🔄 Flujos de Trazabilidad

### **1️⃣ Cambio de Estado (con área y responsable opcionales)**

**Endpoint:** `PATCH /reclamo/:id/estado`

**Escenarios:**

#### A) Solo cambia el estado
```json
{
  "nuevoEstado": "EN_PROCESO",
  "motivoCambio": "Cliente confirmó información"
}
```
**Resultado:** 1 evento en historial
- 🔵 Cambio de Estado: `PENDIENTE → EN_PROCESO`

---

#### B) Cambia estado Y área
```json
{
  "nuevoEstado": "EN_PROCESO",
  "areaResponsable": "SOPORTE_TECNICO",
  "motivoCambio": "Reasignación"
}
```
**Resultado:** 2 eventos en historial (en orden)
1. 📍 Cambio de Área: `FACTURACION → SOPORTE_TECNICO`
2. 🔵 Cambio de Estado: `PENDIENTE → EN_PROCESO`

---

#### C) Cambia estado, área Y responsable
```json
{
  "nuevoEstado": "EN_PROCESO",
  "areaResponsable": "SOPORTE_TECNICO",
  "responsableId": "user123",
  "motivoCambio": "Reasignación completa"
}
```
**Resultado:** 3 eventos en historial (en orden)
1. 📍 Cambio de Área: `FACTURACION → SOPORTE_TECNICO`
2. 👥 Cambio de Responsable: `Juan Pérez → María García`
3. 🔵 Cambio de Estado: `PENDIENTE → EN_PROCESO`

---

### **2️⃣ Reasignación de Área (sin cambio de estado)**

**Endpoint:** `PATCH /reclamo/:id/asignar-area`

```json
{
  "area": "ADMINISTRACION",
  "responsableId": "user456"
}
```

**Resultado:** 1 o 2 eventos en historial
1. 📍 Cambio de Área: `SOPORTE_TECNICO → ADMINISTRACION`
2. 👥 Cambio de Responsable: `María García → Pedro López` (si cambió)

---

### **3️⃣ Asignación Inicial (reclamo pendiente)**

**Endpoint:** `PATCH /reclamo/:id/asignar-pendiente`

```json
{
  "area": "SOPORTE_TECNICO",
  "responsableId": "user789",
  "prioridad": "ALTA",
  "criticidad": "MEDIA"
}
```

**Resultado:** 3 eventos en historial
1. 📍 Cambio de Área: `Sin asignar → SOPORTE_TECNICO`
2. 👥 Cambio de Responsable: `Sin asignar → Carlos Ruiz`
3. 🔵 Cambio de Estado: `PENDIENTE → EN_PROCESO` (automático)

---

## ⏱️ Orden Cronológico

Los eventos se registran con fechas incrementales (100ms de diferencia) para garantizar el orden correcto en la línea de tiempo:

```typescript
const fechaBase = new Date();
let contadorMs = 0;

// Evento 1: Área (fechaBase + 0ms)
// Evento 2: Responsable (fechaBase + 100ms)
// Evento 3: Estado (fechaBase + 200ms)
```

Esto asegura que:
1. Los eventos aparezcan en el orden lógico correcto
2. MongoDB los ordene correctamente con `sort({ fechaCambio: 1 })`
3. El Frontend los muestre en secuencia correcta

---

## 🎨 Visualización en Frontend

### **Iconos y Colores:**

| Tipo | Icono | Color de Fondo |
|------|-------|----------------|
| 🔵 Estado | Círculo | Azul claro |
| 📍 Área | Pin de ubicación | Morado claro |
| 👥 Responsable | Usuarios | Naranja claro |

### **Ejemplo de Línea de Tiempo:**

```
Timeline:
├─ 📍 Cambio de Área
│  Sin asignar → Soporte Técnico
│  Por: Coordinador
│  10/12/2024 14:30:00
│
├─ 👥 Cambio de Responsable
│  Sin asignar → Juan Pérez
│  Por: Coordinador
│  10/12/2024 14:30:00
│
├─ 🔵 Cambio de Estado
│  PENDIENTE → EN_PROCESO
│  Por: Coordinador
│  Motivo: Asignación inicial
│  10/12/2024 14:30:00
│
├─ 📍 Cambio de Área
│  Soporte Técnico → Facturación
│  Por: Admin
│  10/12/2024 15:45:00
│
└─ 🔵 Cambio de Estado
   EN_PROCESO → RESUELTO
   Por: Juan Pérez
   Motivo: Problema solucionado
   Resolución: Se actualizó la configuración del sistema
   10/12/2024 16:20:00
```

---

## 🔐 Validaciones

### **Evitar Duplicados:**

Los métodos validan que haya un cambio real antes de registrar:

```typescript
// No registra si no cambió el área
if (areaAnterior === areaNueva) {
  return;
}

// No registra si no cambió el responsable
if (responsableAnteriorId === responsableNuevoId) {
  return;
}
```

---

## 📊 Consulta del Historial

**Endpoint:** `GET /reclamo/:id/estado/historial`

**Respuesta:**
```json
[
  {
    "_id": "event1",
    "reclamoId": "reclamo123",
    "tipoCambio": "AREA",
    "areaAnterior": null,
    "areaNueva": "SOPORTE_TECNICO",
    "usuarioResponsableId": {
      "_id": "user1",
      "nombre": "Coordinador",
      "apellido": "Sistema"
    },
    "fechaCambio": "2024-12-10T14:30:00.000Z",
    "observaciones": "Asignación inicial"
  },
  {
    "_id": "event2",
    "reclamoId": "reclamo123",
    "tipoCambio": "RESPONSABLE",
    "responsableAnteriorId": null,
    "responsableNuevoId": {
      "_id": "user2",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "fechaCambio": "2024-12-10T14:30:00.100Z"
  },
  {
    "_id": "event3",
    "reclamoId": "reclamo123",
    "tipoCambio": "ESTADO",
    "estadoAnterior": "PENDIENTE",
    "estadoNuevo": "EN_PROCESO",
    "fechaCambio": "2024-12-10T14:30:00.200Z"
  }
]
```

**Características:**
- ✅ Ordenado cronológicamente (`sort({ fechaCambio: 1 })`)
- ✅ Popula usuarios involucrados
- ✅ Incluye todos los tipos de cambios
- ✅ Mantiene trazabilidad completa

---

## 🚀 Casos de Uso Reales

### **Caso 1: Cliente crea reclamo**
```
1. Cliente crea → Estado: PENDIENTE, Área: null
   Historial: (vacío, aún no hay cambios)

2. Coordinador asigna
   Historial:
   - Cambio de Área: null → SOPORTE_TECNICO
   - Cambio de Responsable: null → Juan Pérez
   - Cambio de Estado: PENDIENTE → EN_PROCESO
```

### **Caso 2: Escalamiento a otra área**
```
1. Agente escala a administración
   Historial:
   - Cambio de Área: SOPORTE_TECNICO → ADMINISTRACION
   - Cambio de Responsable: Juan Pérez → María García
```

### **Caso 3: Resolución directa**
```
1. Agente resuelve
   Historial:
   - Cambio de Estado: EN_PROCESO → RESUELTO
```

---

## 🎯 Beneficios

✅ **Trazabilidad Completa:** Cada cambio queda registrado  
✅ **Auditoría:** Saber quién hizo qué y cuándo  
✅ **Análisis:** Identificar cuellos de botella en el flujo  
✅ **Transparencia:** Cliente y staff ven el progreso completo  
✅ **Responsabilidad:** Cada acción queda asociada a un usuario  

---

## 📝 Notas Técnicas

1. **Índices:** La colección tiene índices en `reclamoId` y `tipoCambio` para consultas eficientes
2. **Population:** Se populan automáticamente usuarios anteriores y nuevos
3. **Ordenamiento:** `fechaCambio` con milisegundos garantiza orden correcto
4. **Validación:** Solo se registran cambios reales, no duplicados
5. **Frontend:** Mapea automáticamente eventos del backend a tipos de TypeScript

---

## 🔧 Mantenimiento

Para agregar nuevos tipos de cambios en el futuro:

1. Agregar nuevo valor al enum `TipoCambioHistorial`
2. Agregar campos correspondientes a la entidad
3. Crear método `registrarCambioX` en `EstadoReclamoService`
4. Integrar en los flujos existentes
5. Actualizar tipos del Frontend
6. Actualizar componente `Timeline` con nuevo icono/color

---

**Última actualización:** Diciembre 2024  
**Versión del sistema:** 2.0 - Trazabilidad Completa
