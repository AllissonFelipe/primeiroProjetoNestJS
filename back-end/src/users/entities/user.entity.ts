import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Role } from '../roles/role.entity';
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

  // { eager: true } faz com que as roles venham automaticamente quando buscar o usuário — ótimo para autenticação.
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  @Expose()
  refreshTokens: RefreshToken[];
}
