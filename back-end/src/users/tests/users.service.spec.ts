/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { Repository } from 'typeorm';
import { createUser } from './utils/user.factory';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  // Teste para a função de criar um novo usuário
  it('should create a User', async () => {
    const user = createUser();
    const hashedPassword = 'hashedPassword';
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    const savedUser = { ...user, password: hashedPassword };
    jest.spyOn(userRepository, 'create').mockReturnValue(savedUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);
    const result = await service.createUser(user);
    expect(result).toEqual(savedUser);
    expect(passwordService.hash).toHaveBeenCalledWith(user.password);
    expect(userRepository.create).toHaveBeenCalledWith(savedUser);
    expect(userRepository.save).toHaveBeenCalledWith(savedUser);
  });
  // Teste para verificar se email ja existe
  it('should throw ConflictException if email already exist', async () => {
    const user = createUser();
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      email: user.email,
    });
    await expect(service.createUser(user)).rejects.toThrow(
      new ConflictException('Email ja cadastrado no sistema.'),
    );
  });
  // Teste para verificar se cpf ja existe
  it('should throw ConflictException if cpf already exist', async () => {
    const user = createUser();
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      cpf: user.cpf,
    });
    await expect(service.createUser(user)).rejects.toThrow(
      new ConflictException('CPF ja cadastrado no sistema.'),
    );
  });
});
