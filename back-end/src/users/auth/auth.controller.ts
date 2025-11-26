import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { AuthService } from './auth.service';
import { Public } from '../../decorators/public.decorator';
import { CreateUserDto } from '../dtos/createUser.dto';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponse } from '../utils/login.response';
import type { AuthRequest } from './auth.request';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.loginUser(loginDto);
    return new LoginResponse({ accessToken });
  }

  @Get('profile')
  async profileUser(@Request() request: AuthRequest): Promise<User> {
    const user = await this.usersService.findOneUserById(request.user.sub);
    if (user) {
      return user;
    }
    throw new NotFoundException();
  }
}
