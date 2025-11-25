import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class LoginResponse {
  constructor(private readonly partial?: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }
  @Expose()
  @IsString()
  accessToken: string;
}
