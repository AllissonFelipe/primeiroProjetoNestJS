import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class LoginResponse {
  constructor(private readonly partial?: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }
  @Expose()
  @IsString()
  @IsOptional()
  accessToken?: string;

  @Expose()
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @Expose()
  @IsString()
  @IsOptional()
  selector?: string;
}
