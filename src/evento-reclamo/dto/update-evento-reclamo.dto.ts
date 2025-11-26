import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoReclamoDto } from './create-evento-reclamo.dto';

export class UpdateEventoReclamoDto extends PartialType(
  CreateEventoReclamoDto,
) {}
