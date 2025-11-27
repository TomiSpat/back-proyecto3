import { ApiProperty } from '@nestjs/swagger';
import { AreaGeneralReclamo } from '../reclamo.enums';
import { IsEnum, IsOptional, IsString, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignReclamoDto {
  @ApiProperty({ enum: AreaGeneralReclamo, description: 'Área a la que se asigna el reclamo' })
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  @IsNotEmpty({ message: 'El área es obligatoria para la asignación' })
  area: AreaGeneralReclamo;

  @ApiProperty({ description: 'Sub-área específica dentro del área general', required: false })
  @IsString({ message: 'La sub-área debe ser un texto' })
  @IsOptional()
  subArea?: string;

  @ApiProperty({ description: 'ID del usuario responsable asignado', required: false })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  responsableId?: string;
}
