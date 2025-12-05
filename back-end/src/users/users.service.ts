/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { PasswordService } from './password/password.service';
import { FindUsersParam } from './admin/utils/find.users.param';
import { Role } from './roles/role.entity';
import { RoleName } from './roles/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly passwordService: PasswordService,
  ) {}

  // ------------------------------------
  // CREATE A USER - ROLE DEFAULT('USER')
  // ------------------------------------
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // FUNÇÃO PARA VERIFICAR SE HÁ EMAIL OU CPF IGUAL NO BANCO DE DADOS
    await this.verifyEmailAndCpf(createUserDto);
    // CRIANDO O HASH DO PASSWORD
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );
    // BUSCANDO A ROLE DEFAULT USER
    const defaultRole = await this.roleRepository.findOne({
      where: { name: RoleName.USER },
    });
    // ✅ CORREÇÃO: Verificação adicionada!
    if (!defaultRole) {
      throw new NotFoundException('Default Role USER não encontrado!');
    }
    // CRIANDO NOVO USER COM PASSOWORD HASHED E COM DEFAULT ROLE
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: [defaultRole],
    });
    // SALVANDO USER NO BANCO DE DADOS E O RETORNANDO PARA CONTROLLER
    return await this.userRepository.save(newUser);
  }
  // ---------------------
  // Find One User ByID
  // ---------------------
  async findOneUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }
  // Find One User ByEmail
  async findOneUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }
  // Find One User ByCpf
  async findOneUserByCpf(cpf: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ cpf });
  }

  // UPDATE USER
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUserById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.verifyEmailAndCpf(updateUserDto);

    const updatedFields: Partial<User> = {
      ...updateUserDto,
    };

    // SE HOUVE ALTERAÇÃO DE SENHA - HASH
    if (updateUserDto.password) {
      updatedFields.password = await this.passwordService.hash(
        updateUserDto.password,
      );
    }

    // // VARIÁVEL RECEBENDO CAMPOS QUE REALMENTE FORAM ALTERADOS
    // const changedFields = this.getChangedFields(user, updatedFields);

    // if (Object.keys(changedFields).length === 0) {
    //   // NAO HOUVE NENHUMA ALTERAÇÃO, RETORNANDO USUÁRIO SEM SALVAR NO BANCO DE DADOS
    //   return user;
    // }

    Object.assign(user, updatedFields);
    return await this.userRepository.save(user);
  }

  // ---------------------------------------------
  // ACHAR USUARIOS POR PARAMETROS - SOMENTE ADMIN
  // ---------------------------------------------
  async findAllUsers(filters: FindUsersParam): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');
    if (filters.name) {
      queryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }
    return queryBuilder.getMany();
  }
  // ------------------------------------------------
  // DELETE USER - SOMENTE ADMIN
  // ------------------------------------------------
  async deleteUserById(id: string): Promise<void> {
    await this.findOneUserById(id); // se não existir → lança erro e interrompe aqui
    await this.userRepository.delete(id);
  }

  // -------------------------
  // FUNÇÕES AUXILIARES
  // -------------------------
  // Função para ver se email ou cpf ja está existente no banco de dados.
  private async verifyEmailAndCpf(
    dto: CreateUserDto | UpdateUserDto,
  ): Promise<void> {
    const { email, cpf } = dto;
    if (!email && !cpf) return;
    const where: any[] = [];
    if (email) where.push({ email });
    if (cpf) where.push({ cpf });
    const exist = await this.userRepository.findOne({
      where,
    });
    if (exist && exist.email === email) {
      throw new ConflictException('Email já cadastrado no sistema.');
    }
    if (exist && exist.cpf === cpf) {
      throw new ConflictException('CPF ja cadastrado no sistema.');
    }
  }
  /**
   * Retorna apenas os campos que foram alterados no DTO em relação ao objeto original
   */
  private getChangedFields<T extends Record<string, any>>(
    original: T,
    updated: Partial<T>,
  ): Partial<T> {
    const changed: Partial<T> = {};

    Object.keys(updated).forEach((key) => {
      const k = key as keyof T;

      // Se o valor mudou (incluindo undefined), adiciona ao resultado
      if (updated[k] !== undefined && updated[k] !== original[k]) {
        changed[k] = updated[k];
      }
    });

    return changed;
  }
}
