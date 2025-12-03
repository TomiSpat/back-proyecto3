import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AreaGeneralReclamo } from '../../reclamo/reclamo.enums';

export class EstadisticasFiltroDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (formato ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (formato ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por área específica',
    enum: AreaGeneralReclamo,
    example: 'SOPORTE_TECNICO',
  })
  @IsOptional()
  @IsEnum(AreaGeneralReclamo)
  area?: AreaGeneralReclamo;
}
