import { IsString, IsEmail, IsEnum, IsOptional, MinLength, MaxLength, IsMongoId, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioRol } from '../usuario.enums';
import { AreaGeneralReclamo } from '../../reclamo/reclamo.enums';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido: string;

  @ApiProperty({ description: 'Email del usuario (único)', example: 'juan.perez@empresa.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario (mínimo 6 caracteres)', example: 'Password123!' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ 
    description: 'Rol del usuario', 
    enum: UsuarioRol,
    example: UsuarioRol.AGENTE 
  })
  @IsEnum(UsuarioRol, { message: 'El rol debe ser: admin, coordinador, agente o cliente' })
  rol: UsuarioRol;

  @ApiPropertyOptional({ 
    description: 'Área asignada (requerido para agentes)', 
    enum: AreaGeneralReclamo,
    example: AreaGeneralReclamo.SOPORTE_TECNICO 
  })
  @ValidateIf(o => o.rol === UsuarioRol.AGENTE)
  @IsEnum(AreaGeneralReclamo, { message: 'El área debe ser: VENTAS, SOPORTE_TECNICO o FACTURACION' })
  areaAsignada?: AreaGeneralReclamo;

}
