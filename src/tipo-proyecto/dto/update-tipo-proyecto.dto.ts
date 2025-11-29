import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProyectoDto } from './create-tipo-proyecto.dto';

export class UpdateTipoProyectoDto extends PartialType(CreateTipoProyectoDto) {}
