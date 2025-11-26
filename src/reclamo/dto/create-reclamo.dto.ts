// reclamo.dto.ts
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  AreaGeneralReclamo,
  ReclamoPrioridad,
  ReclamoTipo,
} from '../reclamo.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReclamoDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  proyectoId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  clienteId: string;

  @ApiProperty({ enum: ReclamoTipo })
  @IsEnum(ReclamoTipo)
  tipo: ReclamoTipo;

  @ApiProperty({ enum: ReclamoPrioridad })
  @IsEnum(ReclamoPrioridad)
  prioridad: ReclamoPrioridad;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion: string;

  @ApiProperty({ enum: AreaGeneralReclamo, required: false })
  @IsEnum(AreaGeneralReclamo)
  @IsOptional()
  areaInicial?: AreaGeneralReclamo;
}
