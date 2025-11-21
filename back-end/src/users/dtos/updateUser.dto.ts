import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'CPF must be 11 character' })
  cpf?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'password must be at least 8 character' })
  password?: string;
}
