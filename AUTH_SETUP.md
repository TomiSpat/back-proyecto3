# 🔐 Sistema de Autenticación y Autorización

## 📋 Descripción General

El sistema implementa autenticación basada en JWT (JSON Web Tokens) con control de acceso basado en roles (RBAC - Role-Based Access Control).

### Roles del Sistema

1. **ADMIN** - Administrador del sistema
   - Acceso completo a todas las funcionalidades
   - Puede gestionar usuarios, clientes, proyectos y reclamos
   - Sin restricciones

2. **COORDINADOR** - Coordinador de reclamos
   - Recibe reclamos de clientes
   - Asigna reclamos a agentes según el área
   - Cambia estado de reclamos a "EN_PROCESO"
   - Puede ver todos los reclamos

3. **AGENTE** - Agente de soporte
   - Tiene un área asignada (VENTAS, SOPORTE_TECNICO, FACTURACION)
   - Ve y gestiona reclamos de su área
   - Cambia estados de reclamos asignados
   - Actualiza información de reclamos

4. **CLIENTE** - Cliente del sistema
   - Crea reclamos
   - Ve el estado de sus propios reclamos
   - Acceso limitado solo a sus datos

---

## 🚀 Instalación

### 1. Instalar Dependencias

Ejecuta el siguiente comando en la raíz del proyecto Backend:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt @types/passport-jwt
```

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario1:kOhXkzdReLePj5Ku@cluster0.uwkjs0w.mongodb.net/

# Application
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
JWT_EXPIRATION=24h
```

**IMPORTANTE**: Cambia `JWT_SECRET` por una clave segura en producción. Puedes generar una con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Verificar la Instalación

Ejecuta el backend:

```bash
npm run start:dev
```

Deberías ver:

```
🚀 Aplicación corriendo en: http://localhost:4000
📚 Documentación Swagger: http://localhost:4000/api/docs
🗄️  Base de datos: MongoDB Atlas
```

---

## 📁 Estructura del Módulo de Autenticación

```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts    # Obtener usuario actual
│   │   ├── public.decorator.ts          # Marcar rutas públicas
│   │   └── roles.decorator.ts           # Definir roles permitidos
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            # Guard de autenticación JWT
│   │   └── roles.guard.ts               # Guard de autorización por roles
│   ├── strategies/
│   │   └── jwt.strategy.ts              # Estrategia de validación JWT
│   ├── auth.controller.ts               # Controller de autenticación
│   ├── auth.service.ts                  # Servicio de autenticación
│   └── auth.module.ts                   # Módulo de autenticación
│
└── usuario/
    ├── dto/
    │   ├── create-usuario.dto.ts        # DTO para crear usuario
    │   ├── update-usuario.dto.ts        # DTO para actualizar usuario
    │   └── login.dto.ts                 # DTO para login
    ├── entities/
    │   └── usuario.entity.ts            # Entidad Usuario con roles
    ├── interface/
    │   └── IUsuarioRepository.ts        # Interfaz del repository
    ├── usuario.controller.ts            # Controller de usuarios
    ├── usuario.service.ts               # Servicio de usuarios
    ├── usuario.repository.ts            # Repository de usuarios
    ├── usuario.enums.ts                 # Enums de roles y estados
    └── usuario.module.ts                # Módulo de usuarios
```

---

## 🔑 Flujo de Autenticación

### 1. Registro de Usuario

```http
POST /usuario
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@empresa.com",
  "password": "Password123!",
  "rol": "agente",
  "areaAsignada": "SOPORTE_TECNICO",
  "telefono": "+54 11 1234-5678",
  "cargo": "Agente de Soporte"
}
```

**Respuesta:**
```json
{
  "_id": "674a1234567890abcdef1234",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@empresa.com",
  "rol": "agente",
  "areaAsignada": "SOPORTE_TECNICO",
  "estado": "activo",
  "createdAt": "2025-11-30T03:00:00.000Z"
}
```

### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan.perez@empresa.com",
  "password": "Password123!"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674a1234567890abcdef1234",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@empresa.com",
    "rol": "agente",
    "areaAsignada": "SOPORTE_TECNICO",
    "cargo": "Agente de Soporte"
  }
}
```

### 3. Usar el Token

Para todas las peticiones protegidas, incluye el token en el header:

```http
GET /reclamo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Protección de Rutas

### Rutas Públicas (sin autenticación)

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Post('login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### Rutas Protegidas (requieren autenticación)

Por defecto, todas las rutas están protegidas si aplicas el guard globalmente.

```typescript
@Get()
findAll() {
  return this.reclamoService.findAll();
}
```

### Rutas con Roles Específicos

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioRol } from '../usuario/usuario.enums';

@Roles(UsuarioRol.ADMIN, UsuarioRol.COORDINADOR)
@Post(':id/asignar')
asignarReclamo(@Param('id') id: string, @Body() dto: AsignarDto) {
  return this.reclamoService.asignar(id, dto);
}
```

### Obtener Usuario Actual

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Get('mis-reclamos')
getMisReclamos(@CurrentUser() user: any) {
  return this.reclamoService.findByUsuario(user.id);
}
```

---

## 👥 Permisos por Rol

### ADMIN
- ✅ Crear, leer, actualizar y eliminar usuarios
- ✅ Gestionar todos los clientes, proyectos y reclamos
- ✅ Cambiar cualquier estado de reclamo
- ✅ Asignar reclamos a cualquier área/agente
- ✅ Ver estadísticas y reportes completos

### COORDINADOR
- ✅ Ver todos los reclamos
- ✅ Asignar reclamos a agentes según área
- ✅ Cambiar estado de PENDIENTE a EN_PROCESO
- ✅ Ver información de clientes y proyectos
- ❌ No puede eliminar usuarios
- ❌ No puede modificar reclamos en estado RESUELTO

### AGENTE
- ✅ Ver reclamos de su área asignada
- ✅ Actualizar reclamos de su área
- ✅ Cambiar estados de reclamos asignados
- ✅ Agregar observaciones y resoluciones
- ❌ No puede ver reclamos de otras áreas
- ❌ No puede asignar reclamos
- ❌ No puede gestionar usuarios

### CLIENTE
- ✅ Crear reclamos
- ✅ Ver sus propios reclamos
- ✅ Ver historial de estados de sus reclamos
- ❌ No puede modificar reclamos
- ❌ No puede ver reclamos de otros clientes
- ❌ No puede cambiar estados

---

## 🔄 Flujo de Trabajo con Roles

### Escenario: Nuevo Reclamo

1. **CLIENTE** crea un reclamo
   ```http
   POST /reclamo
   Authorization: Bearer <token-cliente>
   
   {
     "tipo": "INCIDENTE",
     "prioridad": "ALTA",
     "descripcion": "Error en el sistema de pagos..."
   }
   ```
   - Estado inicial: `PENDIENTE`
   - `areaActual`: Determinada por el tipo de reclamo

2. **COORDINADOR** revisa y asigna el reclamo
   ```http
   POST /reclamo/:id/asignar-area
   Authorization: Bearer <token-coordinador>
   
   {
     "area": "SOPORTE_TECNICO",
     "responsableId": "<id-agente>"
   }
   ```

3. **COORDINADOR** cambia el estado a EN_PROCESO
   ```http
   POST /reclamo/:id/estado/cambiar
   Authorization: Bearer <token-coordinador>
   
   {
     "nuevoEstado": "EN_PROCESO",
     "motivoCambio": "Asignado al equipo de desarrollo",
     "areaResponsable": "SOPORTE_TECNICO"
   }
   ```

4. **AGENTE** (del área SOPORTE_TECNICO) trabaja en el reclamo
   ```http
   PATCH /reclamo/:id
   Authorization: Bearer <token-agente>
   
   {
     "descripcion": "Actualización: Se identificó el problema..."
   }
   ```

5. **AGENTE** cambia el estado a EN_REVISION
   ```http
   POST /reclamo/:id/estado/cambiar
   Authorization: Bearer <token-agente>
   
   {
     "nuevoEstado": "EN_REVISION",
     "motivoCambio": "Solución implementada",
     "resumenResolucion": "Se corrigió el error en..."
   }
   ```

6. **COORDINADOR** o **AGENTE** marca como RESUELTO
   ```http
   POST /reclamo/:id/estado/cambiar
   Authorization: Bearer <token>
   
   {
     "nuevoEstado": "RESUELTO",
     "motivoCambio": "Validación exitosa",
     "resumenResolucion": "Problema resuelto completamente"
   }
   ```

7. **CLIENTE** consulta el estado
   ```http
   GET /reclamo/:id
   Authorization: Bearer <token-cliente>
   ```

---

## 🔒 Seguridad

### Contraseñas

- Las contraseñas se hashean con **bcrypt** (10 rounds)
- Nunca se retornan en las respuestas de la API
- Mínimo 6 caracteres requeridos

### Tokens JWT

- Expiran en 24 horas por defecto (configurable)
- Incluyen: `id`, `email`, `rol`, `areaAsignada`
- Se validan en cada request protegido
- Se verifica que el usuario esté activo

### Validaciones

- Email único en el sistema
- Los agentes DEBEN tener área asignada
- Los usuarios inactivos/suspendidos no pueden hacer login
- Se registra el último acceso de cada usuario

---

## 🧪 Pruebas con Postman

### 1. Crear un Admin (primera vez)

```http
POST http://localhost:4000/usuario
Content-Type: application/json

{
  "nombre": "Admin",
  "apellido": "Sistema",
  "email": "admin@sistema.com",
  "password": "Admin123!",
  "rol": "admin"
}
```

### 2. Login como Admin

```http
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "admin@sistema.com",
  "password": "Admin123!"
}
```

Copia el `access_token` de la respuesta.

### 3. Crear un Coordinador

```http
POST http://localhost:4000/usuario
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "email": "maria.gonzalez@empresa.com",
  "password": "Coord123!",
  "rol": "coordinador"
}
```

### 4. Crear un Agente

```http
POST http://localhost:4000/usuario
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "email": "carlos.rodriguez@empresa.com",
  "password": "Agent123!",
  "rol": "agente",
  "areaAsignada": "SOPORTE_TECNICO"
}
```

### 5. Crear un Cliente

```http
POST http://localhost:4000/usuario
Content-Type: application/json

{
  "nombre": "Pedro",
  "apellido": "Martínez",
  "email": "pedro.martinez@cliente.com",
  "password": "Client123!",
  "rol": "cliente",
  "clienteAsociadoId": "<id-cliente-empresa>"
}
```

---

## 📊 Diagrama de Arquitectura

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP Request + JWT Token
       ↓
┌─────────────────────────────────────┐
│         NestJS Backend              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   JwtAuthGuard               │  │
│  │   - Valida token JWT         │  │
│  │   - Extrae usuario           │  │
│  └──────────┬───────────────────┘  │
│             ↓                       │
│  ┌──────────────────────────────┐  │
│  │   RolesGuard                 │  │
│  │   - Verifica roles           │  │
│  │   - Autoriza acceso          │  │
│  └──────────┬───────────────────┘  │
│             ↓                       │
│  ┌──────────────────────────────┐  │
│  │   Controller                 │  │
│  │   - Procesa request          │  │
│  │   - Llama al servicio        │  │
│  └──────────┬───────────────────┘  │
│             ↓                       │
│  ┌──────────────────────────────┐  │
│  │   Service                    │  │
│  │   - Lógica de negocio        │  │
│  │   - Validaciones             │  │
│  └──────────┬───────────────────┘  │
│             ↓                       │
│  ┌──────────────────────────────┐  │
│  │   Repository                 │  │
│  │   - Acceso a datos           │  │
│  └──────────┬───────────────────┘  │
└─────────────┼───────────────────────┘
              ↓
       ┌─────────────┐
       │   MongoDB   │
       └─────────────┘
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'bcrypt'"

```bash
npm install bcrypt @types/bcrypt
```

### Error: "Cannot find module '@nestjs/jwt'"

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt
```

### Error: "Unauthorized" en todas las rutas

- Verifica que el token esté en el header: `Authorization: Bearer <token>`
- Verifica que el token no haya expirado
- Verifica que `JWT_SECRET` en `.env` sea el mismo que cuando se generó el token

### Error: "Forbidden" con token válido

- Verifica que el usuario tenga el rol correcto
- Verifica que el decorador `@Roles()` tenga los roles apropiados
- Verifica que `RolesGuard` esté aplicado

---

## 📝 Próximos Pasos

1. ✅ Instalar dependencias
2. ✅ Configurar variables de entorno
3. ✅ Crear usuarios de prueba (admin, coordinador, agente, cliente)
4. ✅ Probar login y obtener tokens
5. ✅ Probar endpoints protegidos con diferentes roles
6. ⏭️ Implementar refresh tokens (opcional)
7. ⏭️ Agregar rate limiting (opcional)
8. ⏭️ Implementar 2FA (opcional)

---

**¡El sistema de autenticación está listo para usar! 🎉**
