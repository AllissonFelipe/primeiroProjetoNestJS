import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { FindUsersParam } from './utils/find.users.param';

@Injectable()
export class AdminUserService {
  constructor(private readonly usersService: UsersService) {}

  async findAllUsers(filters: FindUsersParam) {
    // PARA APENAS ADMINISTRADORES
    return await this.usersService.findAllUsers(filters);
  }
}
