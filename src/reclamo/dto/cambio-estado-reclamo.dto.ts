import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReclamoEstado } from '../reclamo.enums';

// Cambio de estado (va a usar tu patrÃ³n State por debajo)
export class ChangeEstadoReclamoDto {
  @ApiProperty({ enum: ReclamoEstado })
  @IsEnum(ReclamoEstado)
  nuevoEstado: ReclamoEstado;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  motivo?: string;
}
