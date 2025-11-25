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
  @MinLength(8, { message: 'password must be at least 8 character' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least 1 uppercase letter.',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least 1 number.' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain ate least 1 special character.',
  })
  password: string;
}
