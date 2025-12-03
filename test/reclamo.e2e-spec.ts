import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ReclamoEstado, ReclamoPrioridad, ReclamoCriticidad, ReclamoTipo, AreaGeneralReclamo } from '../src/reclamo/reclamo.enums';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

describe('Reclamo Module (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let clienteId: string;
  let proyectoId: string;
  let tipoProyectoId: string;
  let reclamoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Aplicar ValidationPipe como en la aplicación real
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    // Limpiar SOLO los datos de prueba creados durante los tests
    // NO borrar toda la base de datos para evitar perder datos de producción
    if (connection) {
      try {
        // Solo eliminar los documentos creados durante los tests
        const db = connection.db;
        
        if (db) {
          // Eliminar reclamos de prueba (los que tienen descripciones de test)
          await db.collection('reclamos').deleteMany({
            descripcion: { $regex: /^(Error crítico|Reclamo para|Test |Descripción)/ }
          });
          
          // Eliminar proyectos de prueba
          await db.collection('proyectos').deleteMany({
            nombre: 'Proyecto Test E2E'
          });
          
          // Eliminar tipos de proyecto de prueba
          await db.collection('tipoproyectos').deleteMany({
            nombre: 'Tipo Proyecto Test'
          });
          
          // Eliminar clientes de prueba
          await db.collection('clientes').deleteMany({
            email: 'test@cliente.com'
          });
          
          console.log('✅ Datos de prueba eliminados correctamente');
        }
      } catch (error: any) {
        console.error('⚠️ Error al limpiar datos de prueba:', error.message);
      }
      
      await connection.close();
    }
    await app.close();
  });

  describe('Setup: Create test data', () => {
    it('should create a cliente for testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/cliente')
        .send({
          nombre: 'Juan',
          apellido: 'Pérez',
          numDocumento: '12345678',
          fechaNacimiento: '1990-01-01',
          numTelefono: '1123456789',
          email: 'test@cliente.com',
        })
        .expect(201);

      clienteId = response.body._id;
      expect(clienteId).toBeDefined();
    });

    it('should create a tipo proyecto for testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/tipo-proyecto')
        .send({
          nombre: 'Tipo Proyecto Test',
          descripcion: 'Tipo para pruebas E2E',
        })
        .expect(201);

      tipoProyectoId = response.body._id;
      expect(tipoProyectoId).toBeDefined();
    });

    it('should create a proyecto for testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/proyecto')
        .send({
          nombre: 'Proyecto Test E2E',
          descripcion: 'Proyecto para pruebas de integración end to end',
          clienteId: clienteId,
          tipoProyectoId: tipoProyectoId,
          fechaInicio: '2024-01-01',
          presupuesto: 100000,
        })
        .expect(201);

      proyectoId = response.body._id;
      expect(proyectoId).toBeDefined();
    });
  });

  describe('POST /reclamo - Create', () => {
    it('should create a new reclamo successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Error crítico en el sistema',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.INCIDENTE,
          prioridad: ReclamoPrioridad.ALTA,
          criticidad: ReclamoCriticidad.ALTA,
          creadoPorUsuarioId: '679a4c5b6d7e8f9a0b1c2d3e',
        })
        // .expect((res) => console.log(res.body))
        .expect(201);

      reclamoId = response.body._id;
      expect(response.body).toHaveProperty('_id');
      expect(response.body.descripcion).toBe('Error crítico en el sistema');
      expect(response.body.estadoActual).toBe(ReclamoEstado.PENDIENTE);
      expect(response.body.tipo).toBe(ReclamoTipo.INCIDENTE);
      expect(response.body.prioridad).toBe(ReclamoPrioridad.ALTA);
      expect(response.body.criticidad).toBe(ReclamoCriticidad.ALTA);
      expect(response.body.puedeModificar).toBe(true);
      expect(response.body.puedeReasignar).toBe(true);
    });

    it('should fail to create reclamo with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo incompleto sin campos requeridos',
        })
        .expect(400);
    });

    it('should fail to create reclamo with invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo con ID inválido',
          clienteId: 'invalid-id',
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.INCIDENTE,
          prioridad: ReclamoPrioridad.ALTA,
          criticidad: ReclamoCriticidad.ALTA,
        })
        .expect(400);
    });
  });

  describe('GET /reclamo - Find All', () => {
    it('should return all reclamos', async () => {
      const response = await request(app.getHttpServer())
        .get('/reclamo')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should return reclamos with filter by estado', async () => {
      const response = await request(app.getHttpServer())
        .get('/reclamo')
        .query({ estadoActual: ReclamoEstado.PENDIENTE })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((reclamo: any) => {
        expect(reclamo.estadoActual).toBe(ReclamoEstado.PENDIENTE);
      });
    });
  });

  describe('GET /reclamo/:id - Find One', () => {
    it('should return a reclamo by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/${reclamoId}`)
        .expect(200);

      expect(response.body._id).toBe(reclamoId);
      expect(response.body.descripcion).toBe('Error crítico en el sistema');
    });

    it('should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .get('/reclamo/invalid-id')
        .expect(400);
    });

    it('should return 404 for non-existent reclamo', async () => {
      await request(app.getHttpServer())
        .get('/reclamo/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('GET /reclamo/cliente/:clienteId - Find By Cliente', () => {
    it('should return reclamos by cliente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/cliente/${clienteId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid cliente ObjectId', async () => {
      await request(app.getHttpServer())
        .get('/reclamo/cliente/invalid-id')
        .expect(400);
    });
  });

  describe('GET /reclamo/proyecto/:proyectoId - Find By Proyecto', () => {
    it('should return reclamos by proyecto', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/proyecto/${proyectoId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /reclamo/tipo-proyecto/:tipoProyectoId - Find By Tipo Proyecto', () => {
    it('should return reclamos by tipo proyecto', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/tipo-proyecto/${tipoProyectoId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /reclamo/:id - Update', () => {
    it('should update reclamo when in PENDIENTE estado', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reclamo/${reclamoId}`)
        .send({
          descripcion: 'Descripción actualizada',
          prioridad: ReclamoPrioridad.URGENTE,
        })
        .expect(200);

      expect(response.body.descripcion).toBe('Descripción actualizada');
      expect(response.body.prioridad).toBe(ReclamoPrioridad.URGENTE);
    });

    it('should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .patch('/reclamo/invalid-id')
        .send({ descripcion: 'Test de actualización con ID inválido' })
        .expect(400);
    });

    it('should return 404 for non-existent reclamo', async () => {
      await request(app.getHttpServer())
        .patch('/reclamo/507f1f77bcf86cd799439999')
        .send({ descripcion: 'Test de actualización inexistente' })
        .expect(404);
    });
  });

  describe('PATCH /reclamo/:id/asignar-area - Assign Area', () => {
    it('should assign area to reclamo', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reclamo/${reclamoId}/asignar-area`)
        .send({
          area: AreaGeneralReclamo.SOPORTE_TECNICO,
        })
        .expect(200);

      expect(response.body.areaActual).toBe(AreaGeneralReclamo.SOPORTE_TECNICO);
    });

    it('should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .patch('/reclamo/invalid-id/asignar-area')
        .send({ area: AreaGeneralReclamo.VENTAS })
        .expect(400);
    });
  });

  describe('Estado Transitions - Complete Workflow', () => {
    let workflowReclamoId: string;

    beforeAll(async () => {
      // Crear un nuevo reclamo para el workflow completo
      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo para workflow completo',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.MEDIA,
          criticidad: ReclamoCriticidad.MEDIA,
        })
        .expect(201);

      workflowReclamoId = response.body._id;
    });

    it('should transition from PENDIENTE to EN_PROCESO', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reclamo/${workflowReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.SOPORTE_TECNICO,
          motivoCambio: 'Iniciando análisis del caso',
          observaciones: 'Se asigna a técnico especializado',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.EN_PROCESO);
      expect(response.body.puedeModificar).toBe(true);
      expect(response.body.puedeReasignar).toBe(true);
    });

    it('should reject invalid transition from PENDIENTE to RESUELTO', async () => {
      // Crear otro reclamo para probar transición inválida
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo para transición inválida',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.OTRO,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.RESUELTO,
        })
        .expect(400);
    });

    it('should transition from EN_PROCESO to EN_REVISION', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reclamo/${workflowReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
          observaciones: 'Solución implementada, esperando aprobación',
          resumenResolucion: 'Se configuró correctamente el sistema',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.EN_REVISION);
      expect(response.body.puedeModificar).toBe(false);
      expect(response.body.puedeReasignar).toBe(false);
    });

    it('should not allow modification in EN_REVISION estado', async () => {
      await request(app.getHttpServer())
        .patch(`/reclamo/${workflowReclamoId}`)
        .send({ descripcion: 'Intento de modificación' })
        .expect(403);
    });

    it('should transition from EN_REVISION to RESUELTO', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reclamo/${workflowReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.RESUELTO,
          resumenResolucion: 'Caso resuelto exitosamente. Cliente satisfecho.',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.RESUELTO);
      expect(response.body.puedeModificar).toBe(false);
      expect(response.body.puedeReasignar).toBe(false);
      expect(response.body.fechaResolucion).toBeDefined();
    });

    it('should allow reopening from RESUELTO to EN_PROCESO with proper justification', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reclamo/${workflowReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          motivoCambio: 'Cliente reportó que el problema persiste',
          observaciones: 'Se requiere nueva revisión ya que el problema no está completamente resuelto',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.EN_PROCESO);
    });

    it('should reject reopening without proper justification', async () => {
      // Crear y resolver otro reclamo
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo para test de reapertura',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.MEJORA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.VENTAS,
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
          observaciones: 'Revisión',
          resumenResolucion: 'Implementado',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.RESUELTO,
          resumenResolucion: 'Completado',
        })
        .expect(200);

      // Intentar reabrir sin justificación suficiente
      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          motivoCambio: 'Reabrir',
          observaciones: 'Corto', // Menos de 20 caracteres
        })
        .expect(400);
    });
  });

  describe('Estado Transitions - CANCELADO workflow', () => {
    let cancelReclamoId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo para cancelar',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.OTRO,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      cancelReclamoId = response.body._id;
    });

    it('should transition from PENDIENTE to CANCELADO', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reclamo/${cancelReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.CANCELADO,
          motivoCambio: 'Cliente solicitó cancelación',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.CANCELADO);
      expect(response.body.puedeModificar).toBe(false);
      expect(response.body.puedeReasignar).toBe(false);
      expect(response.body.fechaCierre).toBeDefined();
    });

    it('should not allow any transition from CANCELADO', async () => {
      await request(app.getHttpServer())
        .post(`/reclamo/${cancelReclamoId}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.PENDIENTE,
        })
        .expect(400);
    });

    it('should not allow modification in CANCELADO estado', async () => {
      await request(app.getHttpServer())
        .patch(`/reclamo/${cancelReclamoId}`)
        .send({ descripcion: 'Intento de modificación' })
        .expect(403);
    });
  });

  describe('GET /reclamo/:reclamoId/estado/historial - Estado History', () => {
    it('should return estado change history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/${reclamoId}/estado/historial`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .get('/reclamo/invalid-id/estado/historial')
        .expect(400);
    });
  });

  describe('GET /reclamo/:reclamoId/estado/puede-modificar', () => {
    it('should return permission to modify', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/${reclamoId}/estado/puede-modificar`)
        .expect(200);

      expect(typeof response.body).toBe('boolean');
    });
  });

  describe('GET /reclamo/:reclamoId/estado/puede-reasignar', () => {
    it('should return permission to reassign', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/${reclamoId}/estado/puede-reasignar`)
        .expect(200);

      expect(typeof response.body).toBe('boolean');
    });
  });

  describe('GET /reclamo/estados/info - Estado Information', () => {
    it('should return information about all estados', async () => {
      const response = await request(app.getHttpServer())
        .get('/reclamo/estados/info')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(5);

      response.body.forEach((estado: any) => {
        expect(estado).toHaveProperty('estado');
        expect(estado).toHaveProperty('descripcion');
        expect(estado).toHaveProperty('estadosPermitidos');
        expect(estado).toHaveProperty('puedeModificar');
        expect(estado).toHaveProperty('puedeReasignar');
      });
    });
  });

  describe('DELETE /reclamo/:id - Soft Delete', () => {
    it('should soft delete a reclamo', async () => {
      // Crear un reclamo para eliminar
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Reclamo para eliminar',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.OTRO,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/reclamo/${testReclamo.body._id}`)
        .expect(204);
    });

    it('should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .delete('/reclamo/invalid-id')
        .expect(400);
    });

    it('should return 404 for non-existent reclamo', async () => {
      await request(app.getHttpServer())
        .delete('/reclamo/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('GET /reclamo/search - Search with filters', () => {
    it('should search reclamos with custom filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/reclamo/search')
        .query({ prioridad: ReclamoPrioridad.ALTA })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /reclamo/area/:area - Find by area', () => {
    it('should return reclamos by area', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reclamo/area/${AreaGeneralReclamo.SOPORTE_TECNICO}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should reject changing to same estado', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test de cambio al mismo estado actual',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.PENDIENTE,
        })
        .expect(400);
    });

    it('should reject transition to EN_PROCESO without responsable or area', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test transición sin responsable',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
        })
        .expect(400);
    });

    it('should reject transition to EN_REVISION without observaciones', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test transición sin observaciones',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.VENTAS,
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
        })
        .expect(400);
    });

    it('should reject transition to RESUELTO without resumenResolucion', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test transición sin resumen',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.VENTAS,
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
          observaciones: 'Test',
          resumenResolucion: 'Test',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.RESUELTO,
        })
        .expect(400);
    });
  });

  describe('Complex Workflow - Return from EN_REVISION to EN_PROCESO', () => {
    it('should allow returning from EN_REVISION to EN_PROCESO with motivo', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test devolución de revisión',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.INCIDENTE,
          prioridad: ReclamoPrioridad.MEDIA,
          criticidad: ReclamoCriticidad.MEDIA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.SOPORTE_TECNICO,
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
          observaciones: 'Solución propuesta',
          resumenResolucion: 'Configuración aplicada',
        })
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          motivoCambio: 'La solución propuesta no es satisfactoria',
        })
        .expect(200);

      expect(response.body.estadoActual).toBe(ReclamoEstado.EN_PROCESO);
    });

    it('should reject return from EN_REVISION to EN_PROCESO without motivo', async () => {
      const testReclamo = await request(app.getHttpServer())
        .post('/reclamo')
        .send({
          descripcion: 'Test devolución sin motivo',
          clienteId: clienteId,
          proyectoId: proyectoId,
          tipoProyectoId: tipoProyectoId,
          tipo: ReclamoTipo.CONSULTA,
          prioridad: ReclamoPrioridad.BAJA,
          criticidad: ReclamoCriticidad.BAJA,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
          areaResponsable: AreaGeneralReclamo.VENTAS,
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_REVISION,
          observaciones: 'Test',
          resumenResolucion: 'Test',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/reclamo/${testReclamo.body._id}/estado/cambiar`)
        .send({
          nuevoEstado: ReclamoEstado.EN_PROCESO,
        })
        .expect(400);
    });
  });
});
