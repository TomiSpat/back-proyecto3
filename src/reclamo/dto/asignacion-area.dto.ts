import { ApiProperty } from '@nestjs/swagger';
import { AreaGeneralReclamo } from '../reclamo.enums';
import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';

export class AssignReclamoDto {
  @ApiProperty({ enum: AreaGeneralReclamo })
  @IsEnum(AreaGeneralReclamo)
  area: AreaGeneralReclamo;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subArea?: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  responsableId?: string;
}
