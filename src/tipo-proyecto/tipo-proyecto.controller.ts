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
import { TipoProyectoService } from './tipo-proyecto.service';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

@Controller('tipo-proyecto')
export class TipoProyectoController {
  constructor(private readonly tipoProyectoService: TipoProyectoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTipoProyectoDto: CreateTipoProyectoDto) {
    return this.tipoProyectoService.create(createTipoProyectoDto);
  }

  @Get()
  findAll(@Query() filter?: any) {
    return this.tipoProyectoService.findAll(filter);
  }

  @Get('search')
  findBy(@Query() filter: any) {
    return this.tipoProyectoService.findBy(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoProyectoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoProyectoDto: UpdateTipoProyectoDto) {
    return this.tipoProyectoService.update(id, updateTipoProyectoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id') id: string) {
    return this.tipoProyectoService.softDelete(id);
  }
}
