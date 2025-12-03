import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AreaGeneralReclamo } from '../reclamo.enums';
import { IsEnum, IsOptional, IsString, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignReclamoDto {
  @ApiProperty({ 
    enum: AreaGeneralReclamo, 
    description: 'Área a la que se asigna el reclamo',
    example: 'SOPORTE_TECNICO'
  })
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  @IsNotEmpty({ message: 'El área es obligatoria para la asignación' })
  area: AreaGeneralReclamo;

  @ApiPropertyOptional({ description: 'Sub-área específica dentro del área general' })
  @IsString({ message: 'La sub-área debe ser un texto' })
  @IsOptional()
  subArea?: string;

  @ApiProperty({ 
    description: 'ID del agente responsable asignado. Debe ser un agente activo del área seleccionada.',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El responsable es obligatorio al cambiar de área' })
  responsableId: string;
}
