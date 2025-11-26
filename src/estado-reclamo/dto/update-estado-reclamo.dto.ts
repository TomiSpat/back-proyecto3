import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoReclamoDto } from './create-estado-reclamo.dto';

export class UpdateEstadoReclamoDto extends PartialType(
  CreateEstadoReclamoDto,
) {}
