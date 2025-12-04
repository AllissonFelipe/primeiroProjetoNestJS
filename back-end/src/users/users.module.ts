/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password/password.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Role } from './roles/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.get<AuthConfig>('auth')?.jwt.secret,
        signOptions: {
          expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn,
        },
      }),
    }),
  ],
  providers: [
    PasswordService,
    UsersService,
    AuthService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class UsersModule {}
