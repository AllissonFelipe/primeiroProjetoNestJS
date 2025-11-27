import { Expose } from 'class-transformer';

export class LogoutResponse {
  @Expose()
  message: string;

  constructor(partial: Partial<LogoutResponse>) {
    Object.assign(this, partial);
  }
}
