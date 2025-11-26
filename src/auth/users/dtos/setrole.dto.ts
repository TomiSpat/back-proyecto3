import { IsNumber } from 'class-validator';

export class SetRoleDto {
  @IsNumber()
  id: number;
}
