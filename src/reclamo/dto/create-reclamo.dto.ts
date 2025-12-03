import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  AreaGeneralReclamo,
  ReclamoPrioridad,
  ReclamoTipo,
  ReclamoCriticidad,
} from '../reclamo.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReclamoDto {
  @ApiProperty({ description: 'ID del cliente que realiza el reclamo' })
  @IsMongoId({ message: 'El ID del cliente debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  clienteId: string;

  @ApiProperty({ description: 'ID del proyecto relacionado con el reclamo' })
  @IsMongoId({ message: 'El ID del proyecto debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El ID del proyecto es obligatorio' })
  proyectoId: string;

  @ApiProperty({ description: 'ID del tipo de proyecto relacionado' })
  @IsMongoId({ message: 'El ID del tipo de proyecto debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El ID del tipo de proyecto es obligatorio' })
  tipoProyectoId: string;

  @ApiProperty({ enum: ReclamoTipo, description: 'Tipo de reclamo' })
  @IsEnum(ReclamoTipo, { message: 'El tipo de reclamo debe ser: INCIDENTE, CONSULTA, MEJORA u OTRO' })
  @IsNotEmpty({ message: 'El tipo de reclamo es obligatorio' })
  tipo: ReclamoTipo;

  @ApiProperty({ enum: ReclamoPrioridad, description: 'Prioridad del reclamo' })
  @IsEnum(ReclamoPrioridad, { message: 'La prioridad debe ser: BAJA, MEDIA, ALTA o URGENTE' })
  @IsNotEmpty({ message: 'La prioridad es obligatoria' })
  prioridad: ReclamoPrioridad;

  @ApiProperty({ enum: ReclamoCriticidad, description: 'Nivel de criticidad del reclamo' })
  @IsEnum(ReclamoCriticidad, { message: 'La criticidad debe ser: BAJA, MEDIA, ALTA o CRITICA' })
  @IsNotEmpty({ message: 'La criticidad es obligatoria' })
  criticidad: ReclamoCriticidad;

  @ApiProperty({ description: 'Descripción detallada del reclamo (mínimo 20 caracteres)' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres para ser clara y detallada' })
  @MaxLength(2000, { message: 'La descripción no puede exceder los 2000 caracteres' })
  descripcion: string;

  @ApiProperty({ enum: AreaGeneralReclamo, description: 'Área a la que se asigna el reclamo', required: false })
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  @IsOptional()
  areaActual?: AreaGeneralReclamo;

  @ApiProperty({ description: 'ID del usuario que crea el reclamo', required: true })
  @IsMongoId({ message: 'El ID del usuario debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  creadoPorUsuarioId: string;
}
