import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReporteService } from './reporte.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { EstadisticasFiltroDto } from './dto/estadisticas-filtro.dto';

@ApiTags('Reportes y Estadísticas')
@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  create(@Body() createReporteDto: CreateReporteDto) {
    return this.reporteService.create(createReporteDto);
  }

  @Get()
  findAll() {
    return this.reporteService.findAll();
  }

  @Get('estadisticas/resumen')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de reclamos',
    description: 'Retorna total de reclamos, tasa de resolución y tasa de cancelación. Opcionalmente filtrable por rango de fechas.'
  })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalReclamos: { type: 'number', example: 150 },
        tasaResolucion: { type: 'number', example: 75, description: 'Porcentaje de reclamos resueltos' },
        tasaCancelacion: { type: 'number', example: 10, description: 'Porcentaje de reclamos cancelados' },
      }
    }
  })
  obtenerEstadisticas(@Query() filtroDto: EstadisticasFiltroDto) {
    return this.reporteService.obtenerEstadisticas(filtroDto.fechaInicio, filtroDto.fechaFin);
  }

  @Get('estadisticas/carga-trabajo')
  @ApiOperation({ 
    summary: 'Obtener carga de trabajo por área',
    description: 'Retorna la distribución de reclamos por área. Filtrable por fecha y área.'
  })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'area', required: false, enum: ['VENTAS', 'SOPORTE_TECNICO', 'FACTURACION'], description: 'Filtrar por área' })
  @ApiResponse({ status: 200, description: 'Carga de trabajo obtenida exitosamente' })
  obtenerCargaTrabajo(@Query() filtroDto: EstadisticasFiltroDto) {
    return this.reporteService.obtenerCargaTrabajo(filtroDto.fechaInicio, filtroDto.fechaFin, filtroDto.area);
  }

  @Get('estadisticas/tiempo-resolucion')
  @ApiOperation({ 
    summary: 'Obtener tiempo promedio de resolución por tipo de reclamo',
    description: 'Retorna el tiempo promedio en días que toma resolver cada tipo de reclamo.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tiempos de resolución obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string', example: 'INCIDENTE' },
          tiempoPromedioDias: { type: 'number', example: 5 },
          cantidadResueltos: { type: 'number', example: 42 },
        }
      }
    }
  })
  obtenerTiempoResolucion() {
    return this.reporteService.obtenerTiempoResolucionPorTipo();
  }

  @Get('estadisticas/por-estado')
  @ApiOperation({ 
    summary: 'Obtener distribución de reclamos por estado',
    description: 'Retorna la cantidad y porcentaje de reclamos en cada estado. Filtrable por rango de fechas.'
  })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Distribución por estado obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          estado: { type: 'string', example: 'PENDIENTE' },
          cantidad: { type: 'number', example: 25 },
          porcentaje: { type: 'number', example: 35 },
        }
      }
    }
  })
  obtenerReclamosPorEstado(@Query() filtroDto: EstadisticasFiltroDto) {
    return this.reporteService.obtenerReclamosPorEstado(filtroDto.fechaInicio, filtroDto.fechaFin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reporteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReporteDto: UpdateReporteDto) {
    return this.reporteService.update(+id, updateReporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reporteService.remove(+id);
  }
}
