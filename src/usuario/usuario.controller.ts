import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get('rol/:rol')
  @ApiOperation({ summary: 'Listar usuarios por rol' })
  @ApiParam({ name: 'rol', description: 'Rol del usuario', example: 'agente' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios por rol obtenida exitosamente' })
  findByRol(@Param('rol') rol: string) {
    return this.usuarioService.findByRol(rol);
  }

  @Get('area/:area')
  @ApiOperation({ summary: 'Listar usuarios por área' })
  @ApiParam({ name: 'area', description: 'Área asignada', example: 'SOPORTE_TECNICO' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios por área obtenida exitosamente' })
  findByArea(@Param('area') area: string) {
    return this.usuarioService.findByArea(area);
  }

  @Get('agentes/area/:area')
  @ApiOperation({ 
    summary: 'Listar agentes activos por área',
    description: 'Obtiene solo los agentes activos de un área específica. Útil para asignar responsables a reclamos.'
  })
  @ApiParam({ 
    name: 'area', 
    description: 'Área del agente', 
    example: 'SOPORTE_TECNICO',
    enum: ['VENTAS', 'SOPORTE_TECNICO', 'FACTURACION']
  })
  @ApiResponse({ status: 200, description: 'Lista de agentes activos del área obtenida exitosamente' })
  findAgentesActivosByArea(@Param('area') area: string) {
    return this.usuarioService.findAgentesActivosByArea(area);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.usuarioService.softDelete(id);
  }
}
