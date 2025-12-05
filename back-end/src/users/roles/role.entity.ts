import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../entities/user.entity';
import { Expose } from 'class-transformer';
import { RoleName } from './role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({
    type: 'enum',
    enum: RoleName,
    unique: true,
  })
  @Expose()
  name: RoleName;

  @ManyToMany(() => User, (user) => user.roles)
  @Expose()
  users: User[];
}
