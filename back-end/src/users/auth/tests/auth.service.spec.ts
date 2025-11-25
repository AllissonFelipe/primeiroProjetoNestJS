import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PasswordService } from '../../password/password.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from 'src/users/dtos/createUser.dto';
import { LoginDto } from 'src/users/dtos/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  const mockUsersService = {
    createUser: jest.fn(),
    findOneUserByEmail: jest.fn(),
  };
  const mockPasswordService = {
    verify: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resgisterUser', () => {
    it('should call usersService.createUser and return a User', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Allisson',
        email: 'allisson@gmail.com',
        cpf: '044050463927',
        password: 'Allisson123#',
      };
      const user: User = { id: '1', ...createUserDto } as User;
      mockUsersService.createUser.mockResolvedValue(user);
      const result = await service.registerUser(createUserDto);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('loginUser', () => {
    const loginDto: LoginDto = {
      email: 'allisson@gmail.com',
      password: 'Allisson123#',
    };
    const user: User = {
      id: '1',
      name: 'Allisson',
      email: 'allisson@gmail.com',
      cpf: '04450463927',
    } as User;
    it('should return a token if credentials are valid', async () => {
      mockUsersService.findOneUserByEmail.mockResolvedValue(user);
      mockPasswordService.verify.mockResolvedValue(true);
      mockJwtService.sign.mockResolvedValue('token');
      const result = await service.loginUser(loginDto);
      expect(mockUsersService.findOneUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        name: user.name,
      });
      expect(result).toBe('token');
    });
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneUserByEmail.mockResolvedValue(null);
      await expect(service.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findOneUserByEmail.mockResolvedValue(user);
      mockPasswordService.verify.mockResolvedValue(false);
      await expect(service.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
