import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstadoReclamoService } from './estado-reclamo.service';
import { CreateEstadoReclamoDto } from './dto/create-estado-reclamo.dto';
import { UpdateEstadoReclamoDto } from './dto/update-estado-reclamo.dto';

@Controller('estado-reclamo')
export class EstadoReclamoController {
  constructor(private readonly estadoReclamoService: EstadoReclamoService) {}

  @Post()
  create(@Body() createEstadoReclamoDto: CreateEstadoReclamoDto) {
    return this.estadoReclamoService.create(createEstadoReclamoDto);
  }

  @Get()
  findAll() {
    return this.estadoReclamoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoReclamoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEstadoReclamoDto: UpdateEstadoReclamoDto,
  ) {
    return this.estadoReclamoService.update(+id, updateEstadoReclamoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoReclamoService.remove(+id);
  }
}
