import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @Expose()
  selector: string;

  @IsString()
  @Expose()
  oldToken: string;
}
