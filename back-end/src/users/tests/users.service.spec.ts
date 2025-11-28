/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ConflictException, NotFoundException } from '@nestjs/common';

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

  afterEach(() => jest.clearAllMocks());

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
      new ConflictException('Email já cadastrado no sistema.'),
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

  // Usuário não encontrado
  it('should throw NotFoundException if user does not exist', async () => {
    // mock da verificação de email/cpf para evitar conflitos nos testes
    jest
      .spyOn(service as any, 'verifyEmailAndCpf')
      .mockResolvedValue(undefined);

    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.updateUser('123', { name: 'Novo' })).rejects.toThrow(
      new NotFoundException('Usuário não encontrado.'),
    );
  });

  // chama verifyEmailAndCpf com o DTO
  it('should call verifyEmailAndCpf with the update dto', async () => {
    // mock da verificação de email/cpf para evitar conflitos nos testes
    jest
      .spyOn(service as any, 'verifyEmailAndCpf')
      .mockResolvedValue(undefined);

    const user = createUser();
    // mock do método usado internamente
    jest.spyOn(service, 'findOneUserById').mockResolvedValue(user);
    (userRepository.findOne as jest.Mock).mockResolvedValue({ ...user });
    (userRepository.save as jest.Mock).mockResolvedValue(user);
    const spy = jest.spyOn(service as any, 'verifyEmailAndCpf');
    await service.updateUser(user.id, { email: 'new@mail.com' });
    expect(spy).toHaveBeenCalledWith({ email: 'new@mail.com' });
  });

  // Atualização de usuário simple - sem password -
  it('should update user without password', async () => {
    const user = createUser();
    const updateUser = { ...user, name: 'Update Name' };
    jest.spyOn(service, 'findOneUserById').mockResolvedValue(user);
    (userRepository.findOne as jest.Mock).mockResolvedValue({ ...user });
    (userRepository.save as jest.Mock).mockResolvedValue(updateUser);
    const result = await service.updateUser(user.id, { name: 'Update Name' });
    expect(result).toEqual(updateUser);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Update Name' }),
    );
  });

  // Atualização de usuário com password - deve gerar hash -
  it('should update a user with password', async () => {
    const user = createUser();
    const hash = '12345';

    jest.spyOn(service, 'findOneUserById').mockResolvedValue(user);
    (passwordService.hash as jest.Mock).mockResolvedValue(hash);

    (userRepository.save as jest.Mock).mockImplementation((u) => ({
      ...u,
      password: hash, // <-- retorna o hash
    }));

    const result = await service.updateUser(user.id, { password: 'abcde' });

    expect(passwordService.hash).toHaveBeenCalledWith('abcde');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: hash }),
    );
    expect(result.password).toBe(hash);
  });

  // Conflito de email no metodo Update User
  it('should thorw ConflictException when email already exist', async () => {
    const user = createUser();
    jest.spyOn(service, 'findOneUserById').mockResolvedValue(user);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    jest
      .spyOn(service as any, 'verifyEmailAndCpf')
      .mockRejectedValue(
        new ConflictException('Email já cadastrado no sistema.'),
      );

    await expect(
      service.updateUser(user.id, { email: 'test@test.com' }),
    ).rejects.toThrow(new ConflictException('Email já cadastrado no sistema.'));
  });

  // Conflito de CPF no metodo Update User
  it('should throw ConflictException when cpf already exists', async () => {
    const user = createUser();
    jest.spyOn(service, 'findOneUserById').mockResolvedValue(user);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);

    jest
      .spyOn(service as any, 'verifyEmailAndCpf')
      .mockRejectedValue(
        new ConflictException('CPF ja cadastrado no sistema.'),
      );

    await expect(
      service.updateUser(user.id, { cpf: '99999999999' }),
    ).rejects.toThrow(new ConflictException('CPF ja cadastrado no sistema.'));
  });
});
