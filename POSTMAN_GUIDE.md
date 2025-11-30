# 📮 Guía de Uso - Colección Postman

Esta guía te ayudará a probar todas las funcionalidades del sistema usando Postman.

## 📥 Importar la Colección

### 1. Abrir Postman

Descarga e instala [Postman](https://www.postman.com/downloads/) si aún no lo tienes.

### 2. Importar Archivos

1. Abre Postman
2. Click en **"Import"** (esquina superior izquierda)
3. Arrastra o selecciona estos archivos:
   - `postman_collection.json` (la colección de endpoints)
   - `postman_environment.json` (las variables de entorno)

### 3. Seleccionar el Entorno

1. En la esquina superior derecha, selecciona **"Sistema Reclamos - Local"**
2. Verifica que `base_url` esté configurado como `http://localhost:4000`

---

## 🚀 Iniciar el Backend

Antes de probar los endpoints, asegúrate de que el backend esté corriendo:

```bash
cd Backend
npm run start:dev
```

Deberías ver:
```
🚀 Aplicación corriendo en: http://localhost:4000
📚 Documentación Swagger: http://localhost:4000/api/docs
```

---

## 📁 Estructura de la Colección

La colección está organizada en 6 carpetas principales:

### 1️⃣ **CLIENTES**
- Crear Cliente
- Listar Todos los Clientes
- Obtener Cliente por ID
- Actualizar Cliente
- Eliminar Cliente (Soft Delete)

### 2️⃣ **TIPOS DE PROYECTO**
- Crear Tipo de Proyecto
- Listar Tipos de Proyecto
- Obtener Tipo de Proyecto por ID
- Actualizar Tipo de Proyecto
- Eliminar Tipo de Proyecto

### 3️⃣ **PROYECTOS**
- Crear Proyecto
- Listar Todos los Proyectos
- Obtener Proyecto por ID
- Listar Proyectos por Cliente
- Listar Proyectos por Tipo
- Actualizar Proyecto
- Eliminar Proyecto

### 4️⃣ **RECLAMOS - CRUD**
- Crear Reclamo
- Listar Todos los Reclamos
- Obtener Reclamo por ID
- Buscar Reclamos con Filtros
- Listar Reclamos por Cliente
- Listar Reclamos por Proyecto
- Listar Reclamos por Tipo de Proyecto
- Listar Reclamos por Área
- Actualizar Reclamo
- Asignar Área a Reclamo
- Cancelar Reclamo

### 5️⃣ **RECLAMOS - GESTIÓN DE ESTADOS** ⭐
- Cambiar Estado: PENDIENTE → EN_PROCESO
- Cambiar Estado: EN_PROCESO → EN_REVISION
- Cambiar Estado: EN_REVISION → RESUELTO
- Cambiar Estado: EN_REVISION → EN_PROCESO (Rechazo)
- Cambiar Estado: RESUELTO → EN_PROCESO (Reapertura)
- Cambiar Estado: Cualquiera → CANCELADO
- Obtener Historial de Estados
- Verificar si Puede Modificar
- Verificar si Puede Reasignar
- Obtener Información de Todos los Estados

### 6️⃣ **ESCENARIOS DE PRUEBA**
- **Escenario 1**: Flujo Completo Exitoso (8 pasos)
- **Escenario 2**: Validaciones de Estado (errores esperados)

---

## 🎯 Flujo de Prueba Recomendado

### Opción A: Prueba Rápida con Escenarios

La forma más rápida de probar todo el sistema:

1. Ve a **"6. ESCENARIOS DE PRUEBA"** → **"Escenario 1: Flujo Completo Exitoso"**
2. Ejecuta los requests en orden (1 al 8)
3. Cada request guardará automáticamente los IDs necesarios para el siguiente

**Resultado**: Habrás creado un cliente, tipo de proyecto, proyecto y reclamo, y lo habrás llevado por todo el flujo de estados hasta RESUELTO.

### Opción B: Prueba Manual Paso a Paso

Si quieres entender cada paso:

#### **Paso 1: Crear las Entidades Base**

1. **Crear Cliente**
   - Carpeta: `1. CLIENTES` → `Crear Cliente`
   - Click en **Send**
   - ✅ El `cliente_id` se guarda automáticamente

2. **Crear Tipo de Proyecto**
   - Carpeta: `2. TIPOS DE PROYECTO` → `Crear Tipo de Proyecto`
   - Click en **Send**
   - ✅ El `tipo_proyecto_id` se guarda automáticamente

3. **Crear Proyecto**
   - Carpeta: `3. PROYECTOS` → `Crear Proyecto`
   - Click en **Send**
   - ✅ El `proyecto_id` se guarda automáticamente

#### **Paso 2: Crear un Reclamo**

4. **Crear Reclamo**
   - Carpeta: `4. RECLAMOS - CRUD` → `Crear Reclamo`
   - Click en **Send**
   - ✅ El `reclamo_id` se guarda automáticamente
   - ✅ El estado inicial será `PENDIENTE`

#### **Paso 3: Probar el Flujo de Estados**

5. **PENDIENTE → EN_PROCESO**
   - Carpeta: `5. RECLAMOS - GESTIÓN DE ESTADOS`
   - Request: `Cambiar Estado: PENDIENTE → EN_PROCESO`
   - Click en **Send**

6. **EN_PROCESO → EN_REVISION**
   - Request: `Cambiar Estado: EN_PROCESO → EN_REVISION`
   - Click en **Send**

7. **EN_REVISION → RESUELTO**
   - Request: `Cambiar Estado: EN_REVISION → RESUELTO`
   - Click en **Send**

8. **Ver Historial**
   - Request: `Obtener Historial de Estados`
   - Click en **Send**
   - Verás todos los cambios con fecha, hora y área

---

## 🔍 Variables de Entorno

Las siguientes variables se guardan automáticamente al crear entidades:

| Variable | Descripción | Se guarda al... |
|----------|-------------|-----------------|
| `base_url` | URL del backend | Configuración manual |
| `cliente_id` | ID del cliente creado | Crear Cliente |
| `tipo_proyecto_id` | ID del tipo de proyecto | Crear Tipo de Proyecto |
| `proyecto_id` | ID del proyecto creado | Crear Proyecto |
| `reclamo_id` | ID del reclamo creado | Crear Reclamo |
| `usuario_id` | ID del usuario (mock) | Configuración manual |

### Ver Variables

1. Click en el ícono de **ojo** 👁️ (esquina superior derecha)
2. Verás todas las variables y sus valores actuales

### Editar Variables Manualmente

Si necesitas usar IDs específicos:

1. Click en **Environments** (barra lateral izquierda)
2. Selecciona **"Sistema Reclamos - Local"**
3. Edita los valores en la columna **"Current Value"**
4. Click en **Save**

---

## 📝 Ejemplos de Uso

### Crear un Cliente

**Request:**
```http
POST http://localhost:4000/cliente
Content-Type: application/json

{
  "nombre": "Empresa Tech Solutions S.A.",
  "email": "contacto@techsolutions.com",
  "telefono": "+54 11 4567-8900",
  "direccion": "Av. Corrientes 1234, CABA, Argentina"
}
```

**Response (201 Created):**
```json
{
  "_id": "674a1234567890abcdef1234",
  "nombre": "Empresa Tech Solutions S.A.",
  "email": "contacto@techsolutions.com",
  "telefono": "+54 11 4567-8900",
  "direccion": "Av. Corrientes 1234, CABA, Argentina",
  "isDeleted": false,
  "createdAt": "2025-11-29T03:00:00.000Z",
  "updatedAt": "2025-11-29T03:00:00.000Z"
}
```

### Cambiar Estado de Reclamo

**Request:**
```http
POST http://localhost:4000/reclamo/674a5678901234abcdef5678/estado/cambiar
Content-Type: application/json

{
  "nuevoEstado": "EN_PROCESO",
  "motivoCambio": "Asignado al equipo de desarrollo",
  "areaResponsable": "SOPORTE_TECNICO",
  "responsableId": "674a1234567890abcdef1234",
  "observaciones": "Se requiere revisión urgente del módulo de pagos"
}
```

**Response (200 OK):**
```json
{
  "_id": "674a5678901234abcdef5678",
  "estadoActual": "EN_PROCESO",
  "puedeModificar": true,
  "puedeReasignar": true,
  "areaActual": "SOPORTE_TECNICO",
  "responsableActualId": {
    "_id": "674a1234567890abcdef1234",
    "nombre": "Juan Pérez"
  },
  ...
}
```

### Obtener Historial de Estados

**Request:**
```http
GET http://localhost:4000/reclamo/674a5678901234abcdef5678/estado/historial
```

**Response (200 OK):**
```json
[
  {
    "_id": "674a9999999999999999999",
    "reclamoId": "674a5678901234abcdef5678",
    "estadoAnterior": "PENDIENTE",
    "estadoNuevo": "EN_PROCESO",
    "areaResponsable": "SOPORTE_TECNICO",
    "usuarioResponsableId": {
      "_id": "674a1234567890abcdef1234",
      "nombre": "Juan Pérez"
    },
    "fechaCambio": "2025-11-29T03:15:00.000Z",
    "motivoCambio": "Asignado al equipo de desarrollo",
    "observaciones": "Se requiere revisión urgente"
  }
]
```

---

## 🎭 Flujo de Estados del Patrón State

```
PENDIENTE → EN_PROCESO → EN_REVISION → RESUELTO
    ↓           ↓            ↓
CANCELADO   CANCELADO    CANCELADO
```

### Transiciones Válidas

| Estado Actual | Estados Permitidos | Validaciones |
|--------------|-------------------|--------------|
| **PENDIENTE** | EN_PROCESO, CANCELADO | Requiere responsable o área |
| **EN_PROCESO** | EN_REVISION, PENDIENTE, CANCELADO | Requiere observaciones o resumen |
| **EN_REVISION** | RESUELTO, EN_PROCESO, CANCELADO | Requiere resumen (RESUELTO) o motivo (EN_PROCESO) |
| **RESUELTO** | EN_PROCESO | Requiere justificación detallada (mín. 20 chars) |
| **CANCELADO** | Ninguno | Estado final |

### Permisos por Estado

| Estado | Puede Modificar | Puede Reasignar |
|--------|----------------|-----------------|
| PENDIENTE | ✅ Sí | ✅ Sí |
| EN_PROCESO | ✅ Sí | ✅ Sí |
| EN_REVISION | ❌ No | ❌ No |
| RESUELTO | ❌ No | ❌ No |
| CANCELADO | ❌ No | ❌ No |

---

## 🚨 Errores Comunes y Soluciones

### Error 400: "El ID 'xxx' no es un ObjectId válido"

**Causa**: El ID proporcionado no tiene el formato correcto de MongoDB.

**Solución**: 
- Verifica que hayas ejecutado primero el request de creación
- Revisa que las variables de entorno tengan valores
- Un ObjectId válido tiene 24 caracteres hexadecimales

### Error 403: "No se puede modificar el reclamo en estado X"

**Causa**: Intentas modificar un reclamo en estado EN_REVISION, RESUELTO o CANCELADO.

**Solución**: 
- Verifica el estado actual del reclamo
- Solo puedes modificar reclamos en PENDIENTE o EN_PROCESO
- Usa el endpoint de cambio de estado si necesitas cambiar el estado

### Error 400: "No se puede cambiar de X a Y"

**Causa**: Intentas una transición de estado no permitida.

**Solución**: 
- Revisa el flujo de estados permitidos
- Usa el endpoint `GET /reclamo/estados/info` para ver las transiciones válidas

### Error 404: "No se encontró el reclamo con ID"

**Causa**: El reclamo no existe o fue eliminado.

**Solución**: 
- Verifica que el ID sea correcto
- Crea un nuevo reclamo si es necesario

---

## 🧪 Casos de Prueba

### Caso 1: Flujo Normal Exitoso ✅

1. Crear Cliente → 201 Created
2. Crear Tipo Proyecto → 201 Created
3. Crear Proyecto → 201 Created
4. Crear Reclamo → 201 Created (estado: PENDIENTE)
5. PENDIENTE → EN_PROCESO → 200 OK
6. EN_PROCESO → EN_REVISION → 200 OK
7. EN_REVISION → RESUELTO → 200 OK
8. Ver Historial → 200 OK (4 cambios registrados)

### Caso 2: Validación de Permisos ❌

1. Crear Reclamo → 201 Created
2. PENDIENTE → EN_PROCESO → 200 OK
3. EN_PROCESO → EN_REVISION → 200 OK
4. Intentar modificar descripción → **403 Forbidden** ✅
5. Intentar reasignar área → **403 Forbidden** ✅

### Caso 3: Validación de Transiciones ❌

1. Crear Reclamo → 201 Created (estado: PENDIENTE)
2. Intentar PENDIENTE → EN_REVISION → **400 Bad Request** ✅
3. Intentar PENDIENTE → RESUELTO → **400 Bad Request** ✅

### Caso 4: Reapertura de Reclamo ✅

1. Crear Reclamo y llevarlo a RESUELTO
2. RESUELTO → EN_PROCESO con justificación → 200 OK
3. Ver Historial → Debe mostrar la reapertura

---

## 📊 Endpoints por Categoría

### CRUD Básico (Todos los módulos)
- `POST /{modulo}` - Crear
- `GET /{modulo}` - Listar todos
- `GET /{modulo}/:id` - Obtener por ID
- `PATCH /{modulo}/:id` - Actualizar
- `DELETE /{modulo}/:id` - Soft delete

### Consultas Especializadas (Reclamos)
- `GET /reclamo/search?filtro=valor` - Búsqueda con filtros
- `GET /reclamo/cliente/:clienteId` - Por cliente
- `GET /reclamo/proyecto/:proyectoId` - Por proyecto
- `GET /reclamo/tipo-proyecto/:tipoProyectoId` - Por tipo
- `GET /reclamo/area/:area` - Por área

### Gestión de Estados (Patrón State)
- `POST /reclamo/:id/estado/cambiar` - Cambiar estado
- `GET /reclamo/:id/estado/historial` - Ver historial
- `GET /reclamo/:id/estado/puede-modificar` - Verificar permisos
- `GET /reclamo/:id/estado/puede-reasignar` - Verificar permisos
- `GET /reclamo/estados/info` - Info de estados

---

## 💡 Tips y Mejores Prácticas

### 1. Usa los Escenarios Predefinidos

Los escenarios en la carpeta **"6. ESCENARIOS DE PRUEBA"** están diseñados para probar todo el sistema de forma secuencial.

### 2. Verifica las Variables

Antes de ejecutar un request, verifica que las variables necesarias tengan valores:
- Click en el ícono de ojo 👁️
- Busca las variables que usa el request (ej: `{{reclamo_id}}`)

### 3. Lee las Descripciones

Cada request tiene una descripción que explica qué hace y qué esperar.

### 4. Revisa los Tests Automáticos

Algunos requests tienen tests que guardan automáticamente los IDs. Puedes verlos en la pestaña **"Tests"** de cada request.

### 5. Usa Swagger como Alternativa

Si prefieres una interfaz visual, también puedes usar Swagger:
- URL: `http://localhost:4000/api/docs`
- Ventaja: Interfaz interactiva con documentación en tiempo real

---

## 🔗 Enlaces Útiles

- **Swagger UI**: http://localhost:4000/api/docs
- **Backend**: http://localhost:4000
- **README del Proyecto**: Ver `README.md` en la raíz del backend

---

## 📞 Soporte

Si encuentras algún problema:

1. Verifica que el backend esté corriendo
2. Revisa que las variables de entorno estén configuradas
3. Consulta la sección de "Errores Comunes"
4. Revisa el README del proyecto para más detalles

---

**¡Listo para probar! 🚀**

Comienza con el **Escenario 1** en la carpeta **"6. ESCENARIOS DE PRUEBA"** para una prueba completa del sistema.
