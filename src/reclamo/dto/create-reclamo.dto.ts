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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReclamoDto {
  // ============ CAMPOS COMUNES (TODOS LOS ROLES) ============

  @ApiProperty({ 
    description: 'ID del proyecto relacionado con el reclamo',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId({ message: 'El ID del proyecto debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El ID del proyecto es obligatorio' })
  proyectoId: string;

  @ApiProperty({ 
    description: 'ID del tipo de proyecto relacionado',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId({ message: 'El ID del tipo de proyecto debe ser un ObjectId válido de MongoDB' })
  @IsNotEmpty({ message: 'El ID del tipo de proyecto es obligatorio' })
  tipoProyectoId: string;

  @ApiProperty({ 
    enum: ReclamoTipo, 
    description: 'Tipo de reclamo',
    example: ReclamoTipo.INCIDENTE
  })
  @IsEnum(ReclamoTipo, { message: 'El tipo de reclamo debe ser: INCIDENTE, CONSULTA, MEJORA u OTRO' })
  @IsNotEmpty({ message: 'El tipo de reclamo es obligatorio' })
  tipo: ReclamoTipo;

  @ApiProperty({ 
    description: 'Descripción detallada del reclamo (mínimo 20 caracteres)',
    example: 'El sistema no permite procesar los pagos correctamente desde hace 2 días'
  })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres para ser clara y detallada' })
  @MaxLength(2000, { message: 'La descripción no puede exceder los 2000 caracteres' })
  descripcion: string;

  // ============ CAMPOS OPCIONALES (CLIENTE puede omitir, STAFF debe proporcionar) ============

  @ApiPropertyOptional({ 
    description: 'ID del cliente afectado. Obligatorio para Admin/Agente/Coordinador. Opcional para Cliente (se detecta automáticamente)',
    example: '507f1f77bcf86cd799439013'
  })
  @IsMongoId({ message: 'El ID del cliente debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  clienteId?: string;

  @ApiPropertyOptional({ 
    enum: ReclamoPrioridad, 
    description: 'Prioridad del reclamo. Obligatorio para Admin/Agente/Coordinador. Opcional para Cliente (se asigna MEDIA por defecto)',
    example: ReclamoPrioridad.ALTA,
    default: ReclamoPrioridad.MEDIA
  })
  @IsEnum(ReclamoPrioridad, { message: 'La prioridad debe ser: BAJA, MEDIA, ALTA o URGENTE' })
  @IsOptional()
  prioridad?: ReclamoPrioridad;

  @ApiPropertyOptional({ 
    enum: ReclamoCriticidad, 
    description: 'Nivel de criticidad del reclamo. Obligatorio para Admin/Agente/Coordinador. Opcional para Cliente (se asigna MEDIA por defecto)',
    example: ReclamoCriticidad.ALTA,
    default: ReclamoCriticidad.MEDIA
  })
  @IsEnum(ReclamoCriticidad, { message: 'La criticidad debe ser: BAJA, MEDIA, ALTA o CRITICA' })
  @IsOptional()
  criticidad?: ReclamoCriticidad;

  // ============ CAMPOS EXCLUSIVOS PARA STAFF (Admin/Agente/Coordinador) ============

  @ApiPropertyOptional({ 
    enum: AreaGeneralReclamo, 
    description: 'Área a la que se asigna el reclamo. Solo puede ser asignado por Admin/Agente/Coordinador',
    example: AreaGeneralReclamo.SOPORTE_TECNICO
  })
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  @IsOptional()
  areaInicial?: AreaGeneralReclamo;

  @ApiPropertyOptional({ 
    description: 'ID del usuario responsable. Solo puede ser asignado por Admin/Coordinador',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  @IsOptional()
  responsableId?: string;
}
