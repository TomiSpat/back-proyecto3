import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

/**
 * DTO para asignar un responsable a un reclamo existente
 * Este endpoint permite cambiar el responsable sin modificar el estado
 */
export class AsignarResponsableDto {
  @ApiProperty({
    description: 'ID del usuario responsable',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del responsable es obligatorio' })
  @IsString({ message: 'El ID del responsable debe ser una cadena de texto' })
  @IsMongoId({ message: 'El ID del responsable debe ser un ObjectId válido de MongoDB' })
  responsableId: string;
}
