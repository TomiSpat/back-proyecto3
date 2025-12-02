import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AreaGeneralReclamo, ReclamoPrioridad, ReclamoCriticidad } from '../reclamo.enums';

export class AsignarReclamoPendienteDto {
  @ApiProperty({ 
    enum: AreaGeneralReclamo, 
    description: 'Área a la que se asigna el reclamo',
    example: AreaGeneralReclamo.SOPORTE_TECNICO
  })
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  @IsNotEmpty({ message: 'El área es obligatoria' })
  area: AreaGeneralReclamo;

  @ApiPropertyOptional({ 
    description: 'ID del usuario responsable del reclamo',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  responsableId?: string;

  @ApiPropertyOptional({ 
    enum: ReclamoPrioridad, 
    description: 'Actualizar la prioridad del reclamo',
    example: ReclamoPrioridad.ALTA
  })
  @IsEnum(ReclamoPrioridad, { message: 'La prioridad debe ser: BAJA, MEDIA, ALTA o URGENTE' })
  @IsOptional()
  prioridad?: ReclamoPrioridad;

  @ApiPropertyOptional({ 
    enum: ReclamoCriticidad, 
    description: 'Actualizar la criticidad del reclamo',
    example: ReclamoCriticidad.ALTA
  })
  @IsEnum(ReclamoCriticidad, { message: 'La criticidad debe ser: BAJA, MEDIA, ALTA o CRITICA' })
  @IsOptional()
  criticidad?: ReclamoCriticidad;
}
