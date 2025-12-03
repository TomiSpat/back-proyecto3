import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsMongoId } from 'class-validator';
import { ReclamoEstado, AreaGeneralReclamo } from '../reclamo.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoReclamoDto {
  @ApiProperty({ 
    enum: ReclamoEstado, 
    description: 'Nuevo estado al que se desea transicionar el reclamo',
    example: ReclamoEstado.EN_PROCESO
  })
  @IsEnum(ReclamoEstado, { 
    message: 'El estado debe ser uno de los siguientes: PENDIENTE, EN_PROCESO, EN_REVISION, RESUELTO, CANCELADO' 
  })
  @IsNotEmpty({ message: 'El nuevo estado es obligatorio' })
  nuevoEstado: ReclamoEstado;

  @ApiProperty({ 
    description: 'Motivo del cambio de estado', 
    required: false,
    example: 'Se asignó al equipo de soporte técnico para su resolución'
  })
  @IsString({ message: 'El motivo debe ser un texto' })
  @IsOptional()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @MaxLength(200, { message: 'El motivo no puede exceder los 200 caracteres' })
  motivoCambio?: string;

  @ApiProperty({ 
    description: 'Observaciones adicionales sobre el cambio de estado', 
    required: false,
    example: 'El cliente reportó que el problema persiste después de la primera solución propuesta'
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder los 500 caracteres' })
  observaciones?: string;

  @ApiProperty({ 
    enum: AreaGeneralReclamo, 
    description: 'Área responsable del reclamo en este estado',
    required: false,
    example: AreaGeneralReclamo.SOPORTE_TECNICO
  })
  @IsEnum(AreaGeneralReclamo, { 
    message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' 
  })
  @IsOptional()
  areaResponsable?: AreaGeneralReclamo;

  @ApiProperty({ 
    description: 'ID del usuario responsable asignado', 
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  responsableId?: string;

  @ApiProperty({ 
    description: 'Resumen de la resolución (requerido para pasar a RESUELTO)', 
    required: false,
    example: 'Se reinstalaron los componentes afectados y se verificó el correcto funcionamiento del sistema'
  })
  @IsString({ message: 'El resumen de resolución debe ser un texto' })
  @IsOptional()
  @MinLength(20, { message: 'El resumen de resolución debe tener al menos 20 caracteres' })
  @MaxLength(1000, { message: 'El resumen de resolución no puede exceder los 1000 caracteres' })
  resumenResolucion?: string;
}
