/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { PasswordService } from './password/password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  // Create User
  // Falta O hash do password
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }
  // Find One User ByID
  async findOneUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    return user;
  }
  // Find all Users
  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
  // Update User
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUser(id);
    const updatedFields: Partial<User> = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      updatedFields.password = await this.passwordService.hash(
        updateUserDto.password,
      );
    }
    Object.assign(user, updatedFields);
    return this.userRepository.save(user);
  }
  // Delete User
  async deleteUserById(id: string): Promise<void> {
    await this.findOneUser(id); // se não existir → lança erro e interrompe aqui
    await this.userRepository.delete(id);
  }
}
