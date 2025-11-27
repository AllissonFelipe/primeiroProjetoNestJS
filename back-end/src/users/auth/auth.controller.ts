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
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { LogoutResponse } from '../utils/logout.response';

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
    const { accessToken, selector, refreshToken } =
      await this.authService.loginUser(loginDto);
    return new LoginResponse({ accessToken, selector, refreshToken });
  }
  @Post('refresh')
  @Public()
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponse> {
    const { accessToken, selector, refreshToken } =
      await this.authService.refreshToken(
        refreshTokenDto.selector,
        refreshTokenDto.oldToken,
      );
    return new LoginResponse({ accessToken, selector, refreshToken });
  }
  @Post('logout')
  @HttpCode(200)
  @Public()
  async logout(@Body('selector') selector: string) {
    const result = await this.authService.logoutUser(selector);
    return new LogoutResponse(result);
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
