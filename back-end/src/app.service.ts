import { Injectable } from '@nestjs/common';
import { TypedConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: TypedConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
