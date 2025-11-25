import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @Column({ length: 11 })
  @IsString()
  @IsNotEmpty()
  @Expose()
  cpf: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  // @Expose() - Senha não sera retornada pelos controllers
  password: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
