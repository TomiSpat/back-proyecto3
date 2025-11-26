import { Injectable } from '@nestjs/common';
import { CreateEventoReclamoDto } from './dto/create-evento-reclamo.dto';
import { UpdateEventoReclamoDto } from './dto/update-evento-reclamo.dto';

@Injectable()
export class EventoReclamoService {
  create(createEventoReclamoDto: CreateEventoReclamoDto) {
    return 'This action adds a new eventoReclamo';
  }

  findAll() {
    return `This action returns all eventoReclamo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventoReclamo`;
  }

  update(id: number, updateEventoReclamoDto: UpdateEventoReclamoDto) {
    return `This action updates a #${id} eventoReclamo`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventoReclamo`;
  }
}
