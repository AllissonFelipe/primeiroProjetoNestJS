import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create User
  // Falta O hash do password
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }
  // Find One User
  async findOneUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    return user;
  }
  // Find all Users
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
  // Update User
  // Falta O hash do password
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUser(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
  // Delete User
  async deleteUserById(id: string): Promise<void> {
    await this.findOneUser(id); // se não existir → lança erro e interrompe aqui
    await this.userRepository.delete(id);
  }
}
