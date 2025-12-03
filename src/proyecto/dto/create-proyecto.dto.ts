import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProyectoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  descripcion: string;

  @IsMongoId()
  @IsNotEmpty()
  clienteId: string;

  @IsMongoId()
  @IsNotEmpty()
  tipoProyectoId: string;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
