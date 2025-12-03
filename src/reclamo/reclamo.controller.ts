import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { AsignarReclamoPendienteDto } from './dto/asignar-reclamo-pendiente.dto';
import { AsignarResponsableDto } from './dto/asignar-responsable.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UsuarioRol } from '../usuario/usuario.enums';

@ApiTags('Reclamos')
@Controller('reclamo')
export class ReclamoController {
  constructor(private readonly reclamoService: ReclamoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.CLIENTE, UsuarioRol.ADMIN, UsuarioRol.COORDINADOR, UsuarioRol.AGENTE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo reclamo',
    description: `
      CLIENTE: Crea un reclamo básico. Solo debe proporcionar: proyectoId, tipoProyectoId, tipo, descripcion.
      El clienteId se detecta automáticamente. Prioridad y criticidad se asignan como MEDIA.
      
      ADMIN/COORDINADOR/AGENTE: Crea un reclamo completo. Debe proporcionar: clienteId, proyectoId, 
      tipoProyectoId, tipo, prioridad, criticidad, descripcion. Opcionalmente puede asignar área y responsable.
    `
  })
  @ApiResponse({ status: 201, description: 'Reclamo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error en la creación' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol insuficiente)' })
  create(
    @Body() createReclamoDto: CreateReclamoDto,
    @CurrentUser() usuario: JwtUser
  ) {
    return this.reclamoService.create(createReclamoDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los reclamos' })
  @ApiResponse({ status: 200, description: 'Lista de reclamos obtenida exitosamente' })
  findAll(@Query() filter?: any) {
    return this.reclamoService.findAll(filter);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar reclamos con filtros personalizados' })
  @ApiResponse({ status: 200, description: 'Reclamos encontrados' })
  findBy(@Query() filter: any) {
    return this.reclamoService.findBy(filter);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Obtener reclamos de un cliente específico' })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Reclamos del cliente obtenidos' })
  @ApiResponse({ status: 400, description: 'ID de cliente inválido' })
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.reclamoService.findByCliente(clienteId);
  }

  @Get('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener reclamos de un proyecto específico' })
  @ApiParam({ name: 'proyectoId', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Reclamos del proyecto obtenidos' })
  @ApiResponse({ status: 400, description: 'ID de proyecto inválido' })
  findByProyecto(@Param('proyectoId') proyectoId: string) {
    return this.reclamoService.findByProyecto(proyectoId);
  }

  @Get('tipo-proyecto/:tipoProyectoId')
  @ApiOperation({ summary: 'Obtener reclamos por tipo de proyecto' })
  @ApiParam({ name: 'tipoProyectoId', description: 'ID del tipo de proyecto' })
  @ApiResponse({ status: 200, description: 'Reclamos del tipo de proyecto obtenidos' })
  @ApiResponse({ status: 400, description: 'ID de tipo de proyecto inválido' })
  findByTipoProyecto(@Param('tipoProyectoId') tipoProyectoId: string) {
    return this.reclamoService.findByTipoProyecto(tipoProyectoId);
  }

  @Get('area/:area')
  @ApiOperation({ summary: 'Obtener reclamos de un área específica' })
  @ApiParam({ name: 'area', description: 'Área del reclamo (VENTAS, SOPORTE_TECNICO, FACTURACION)' })
  @ApiResponse({ status: 200, description: 'Reclamos del área obtenidos' })
  findByArea(@Param('area') area: string) {
    return this.reclamoService.findByArea(area);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un reclamo por ID' })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Reclamo encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.reclamoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un reclamo' })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Reclamo actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  update(@Param('id') id: string, @Body() updateReclamoDto: UpdateReclamoDto) {
    return this.reclamoService.update(id, updateReclamoDto);
  }

  @Patch(':id/asignar-area')
  @ApiOperation({ 
    summary: 'Asignar o cambiar el área de un reclamo',
    description: `
      Permite cambiar el área de un reclamo. 
      IMPORTANTE: Al cambiar de área, es OBLIGATORIO asignar un agente de esa área.
      El responsable debe ser un agente activo que pertenezca al área seleccionada.
      
      Para obtener los agentes disponibles de un área, use: GET /usuario/agentes/area/{area}
    `
  })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Área y responsable asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos, ID inválido, o responsable no pertenece al área' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  asignarArea(@Param('id') id: string, @Body() assignDto: AssignReclamoDto) {
    return this.reclamoService.asignarArea(id, assignDto);
  }

  @Patch(':id/asignar-responsable')
  @ApiOperation({ 
    summary: 'Asignar o cambiar el responsable de un reclamo',
    description: 'Permite cambiar el responsable de un reclamo sin modificar su estado ni área.'
  })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Responsable asignado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos, ID inválido o responsable ya asignado' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  asignarResponsable(@Param('id') id: string, @Body() asignarDto: AsignarResponsableDto) {
    return this.reclamoService.asignarResponsable(id, asignarDto);
  }

  @Patch(':id/asignar-pendiente')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.COORDINADOR, UsuarioRol.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Asignar un reclamo PENDIENTE (Coordinador)',
    description: `
      Este endpoint es usado por coordinadores para asignar reclamos creados por clientes.
      El reclamo debe estar en estado PENDIENTE y sin área asignada.
      Al asignar, el estado cambia a EN_PROCESO.
    `
  })
  @ApiParam({ name: 'id', description: 'ID del reclamo pendiente' })
  @ApiResponse({ status: 200, description: 'Reclamo asignado exitosamente' })
  @ApiResponse({ status: 400, description: 'El reclamo no está pendiente o ya fue asignado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo Coordinador y Admin)' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  asignarReclamoPendiente(
    @Param('id') id: string, 
    @Body() asignarDto: AsignarReclamoPendienteDto,
    @CurrentUser() usuario: JwtUser
  ) {
    return this.reclamoService.asignarReclamoPendiente(id, asignarDto, usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar un reclamo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 204, description: 'Reclamo cancelado exitosamente' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  softDelete(@Param('id') id: string) {
    return this.reclamoService.softDelete(id);
  }
}
