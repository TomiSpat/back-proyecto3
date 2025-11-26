import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetPermissionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
