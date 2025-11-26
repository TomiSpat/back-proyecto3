import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventoReclamoService } from './evento-reclamo.service';
import { CreateEventoReclamoDto } from './dto/create-evento-reclamo.dto';
import { UpdateEventoReclamoDto } from './dto/update-evento-reclamo.dto';

@Controller('evento-reclamo')
export class EventoReclamoController {
  constructor(private readonly eventoReclamoService: EventoReclamoService) {}

  @Post()
  create(@Body() createEventoReclamoDto: CreateEventoReclamoDto) {
    return this.eventoReclamoService.create(createEventoReclamoDto);
  }

  @Get()
  findAll() {
    return this.eventoReclamoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoReclamoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventoReclamoDto: UpdateEventoReclamoDto,
  ) {
    return this.eventoReclamoService.update(+id, updateEventoReclamoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoReclamoService.remove(+id);
  }
}
