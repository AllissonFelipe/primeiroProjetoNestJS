import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class RefreshResponse {
  @IsString()
  @Expose()
  selector: string;

  @IsString()
  @Expose()
  refreshToken: string;
}
