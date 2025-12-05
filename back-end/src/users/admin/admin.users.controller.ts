import { Controller, Get, Query, Request } from '@nestjs/common';
import { UsersService } from '../users.service';
import { Roles } from '../../decorators/roles.decorator';
import type { AuthRequest } from '../auth/auth.request';
import { User } from '../entities/user.entity';
import { FindUsersParam } from './utils/find.users.param';
import { AdminUserService } from './admin.users.service';

@Roles('ADMIN')
@Controller('admin')
export class AdminUserController {
  constructor(
    private readonly adminService: AdminUserService,
    private readonly usersService: UsersService,
  ) {}

  @Get('users')
  async getUsers(
    @Request() request: AuthRequest, // PEGA DADOS DO TOKEN
    @Query() filters: FindUsersParam, // FILTROS OPCIONAIS
  ): Promise<User[]> {
    return await this.adminService.findAllUsers(filters);
  }
}
