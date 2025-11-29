import { PartialType } from '@nestjs/mapped-types';
import { CreateReclamoDto } from './create-reclamo.dto';
import { IsMongoId, IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ReclamoEstado } from '../reclamo.enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReclamoDto extends PartialType(CreateReclamoDto) {
  @ApiProperty({ description: 'ID del responsable actual del reclamo', required: false })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  responsableActualId?: string;

  @ApiProperty({ enum: ReclamoEstado, description: 'Estado actual del reclamo', required: false })
  @IsEnum(ReclamoEstado, { message: 'El estado debe ser: CREADO, PENDIENTE, ASIGNADO, EN_PROCESO, RESUELTO, CERRADO o CANCELADO' })
  @IsOptional()
  estadoActual?: ReclamoEstado;

  @ApiProperty({ description: 'Fecha de resolución del reclamo', required: false })
  @IsDateString({}, { message: 'La fecha de resolución debe ser una fecha válida' })
  @IsOptional()
  fechaResolucion?: string;

  @ApiProperty({ description: 'Resumen de cómo se resolvió el reclamo', required: false })
  @IsString({ message: 'El resumen de resolución debe ser un texto' })
  @IsOptional()
  resumenResolucion?: string;

  @ApiProperty({ description: 'Feedback del cliente sobre la resolución', required: false })
  @IsString({ message: 'El feedback debe ser un texto' })
  @IsOptional()
  feedbackCliente?: string;
}
