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
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProyectoDto: CreateProyectoDto) {
    return this.proyectoService.create(createProyectoDto);
  }

  @Get()
  findAll(@Query() filter?: any) {
    return this.proyectoService.findAll(filter);
  }

  @Get('search')
  findBy(@Query() filter: any) {
    return this.proyectoService.findBy(filter);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.proyectoService.findByCliente(clienteId);
  }

  @Get('tipo-proyecto/:tipoProyectoId')
  findByTipoProyecto(@Param('tipoProyectoId') tipoProyectoId: string) {
    return this.proyectoService.findByTipoProyecto(tipoProyectoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProyectoDto: UpdateProyectoDto,
  ) {
    return this.proyectoService.update(id, updateProyectoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id') id: string) {
    return this.proyectoService.softDelete(id);
  }
}
