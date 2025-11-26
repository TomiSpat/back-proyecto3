import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/,
    {
      message:
        'La contraseÃ±a debe tener mÃ­nimo 8 caracteres, incluir mayÃºsculas, minÃºsculas, un nÃºmero y un caracter especial.',
    },
  )
  password: string;
}
