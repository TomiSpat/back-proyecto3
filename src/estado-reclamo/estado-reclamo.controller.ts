import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EstadoReclamoService } from './estado-reclamo.service';
import { CambiarEstadoReclamoDto } from 'src/reclamo/dto/cambiar-estado-reclamo.dto';


@ApiTags('Estados de Reclamo')
@Controller('reclamo/:reclamoId/estado')
export class EstadoReclamoController {
  constructor(private readonly estadoReclamoService: EstadoReclamoService) {}

  @Post('cambiar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Cambiar el estado de un reclamo',
    description: 'Cambia el estado del reclamo validando las reglas de transición del patrón State. Registra el cambio en el historial con fecha, hora y área responsable.'
  })
  @ApiParam({ name: 'reclamoId', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición no permitida o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  cambiarEstado(
    @Param('reclamoId') reclamoId: string,
    @Body() cambioEstadoDto: CambiarEstadoReclamoDto,
  ) {
    return this.estadoReclamoService.cambiarEstado(reclamoId, cambioEstadoDto);
  }

  @Get('historial')
  @ApiOperation({ 
    summary: 'Obtener historial de cambios de estado',
    description: 'Retorna el historial completo de cambios de estado del reclamo, incluyendo fechas, horas, áreas responsables y usuarios que realizaron los cambios.'
  })
  @ApiParam({ name: 'reclamoId', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  obtenerHistorial(@Param('reclamoId') reclamoId: string) {
    return this.estadoReclamoService.obtenerHistorial(reclamoId);
  }

  @Get('puede-modificar')
  @ApiOperation({ 
    summary: 'Verificar si el reclamo puede ser modificado',
    description: 'Verifica si el reclamo puede ser modificado en su estado actual según las reglas del patrón State.'
  })
  @ApiParam({ name: 'reclamoId', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Retorna true o false' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  puedeModificar(@Param('reclamoId') reclamoId: string) {
    return this.estadoReclamoService.puedeModificarReclamo(reclamoId);
  }

  @Get('puede-reasignar')
  @ApiOperation({ 
    summary: 'Verificar si el reclamo puede ser reasignado',
    description: 'Verifica si el reclamo puede ser reasignado a otra área o responsable en su estado actual.'
  })
  @ApiParam({ name: 'reclamoId', description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Retorna true o false' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  puedeReasignar(@Param('reclamoId') reclamoId: string) {
    return this.estadoReclamoService.puedeReasignarReclamo(reclamoId);
  }
}

@ApiTags('Estados de Reclamo')
@Controller('reclamo/estados')
export class InfoEstadosController {
  constructor(private readonly estadoReclamoService: EstadoReclamoService) {}

  @Get('info')
  @ApiOperation({ 
    summary: 'Obtener información de todos los estados',
    description: 'Retorna información detallada de todos los estados disponibles, sus transiciones permitidas y permisos.'
  })
  @ApiResponse({ status: 200, description: 'Información de estados obtenida' })
  obtenerInformacionEstados() {
    return this.estadoReclamoService.obtenerInformacionEstados();
  }
}
