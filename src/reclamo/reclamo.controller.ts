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
} from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reclamos')
@Controller('reclamo')
export class ReclamoController {
  constructor(private readonly reclamoService: ReclamoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo reclamo' })
  @ApiResponse({ status: 201, description: 'Reclamo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error en la creación' })
  create(@Body() createReclamoDto: CreateReclamoDto) {
    return this.reclamoService.create(createReclamoDto);
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
  @ApiOperation({ summary: 'Asignar un reclamo a un área específica' })
  @ApiParam({ name: 'id', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Área asignada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  asignarArea(@Param('id') id: string, @Body() assignDto: AssignReclamoDto) {
    return this.reclamoService.asignarArea(id, assignDto);
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
