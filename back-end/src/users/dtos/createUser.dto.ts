import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'CPF must be 11 character' })
  cpf: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Senha tem que possuir 8 caracteres.' })
  @Matches(/[A-Z]/, {
    message: 'Senha tem que possuir 1 letra maiuscula.',
  })
  @Matches(/[0-9]/, { message: 'Senha tem que possuir um número' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Senha tem que possuir 1 caractere especial.',
  })
  password: string;
}
