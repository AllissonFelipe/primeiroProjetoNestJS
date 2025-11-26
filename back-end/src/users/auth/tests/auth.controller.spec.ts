/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { UsersService } from '../../users.service';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from 'src/users/dtos/createUser.dto';
import { LoginDto } from 'src/users/dtos/login.dto';
import { NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loginUser: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findOneUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('resister', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: 'test@gmail.com',
        password: '123456',
      };
      const mockUser = { id: '1', email: 'test@gmail.com' };
      (usersService.createUser as jest.Mock).mockResolvedValue(mockUser);
      const result = await authController.register(dto);
      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should return accessToken', async () => {
      const dto: LoginDto = { email: 'allisson@gmail.com', password: '123456' };
      const token = 'token-value';
      (authService.loginUser as jest.Mock).mockResolvedValue(token);
      const result = await authService.loginUser(dto);
      expect(authService.loginUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(token);
    });
  });
  describe('profile', () => {
    it('should return user if exist', async () => {
      const dto: User = { id: '1', email: 'allisson@gmail.com' };
      (usersService.findOneUserById as jest.Mock).mockResolvedValue(dto);
      const request = { user: { sub: '1' } } as any;
      const result = await authController.profileUser(request);
      expect(usersService.findOneUserById).toHaveBeenCalledWith('1');
      expect(result).toEqual(dto);
    });
    it('should throw NotFoundException if user not found', async () => {
      (usersService.findOneUserById as jest.Mock).mockResolvedValue(null);
      const request = { user: { sub: '1' } } as any;
      await expect(authController.profileUser(request)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
