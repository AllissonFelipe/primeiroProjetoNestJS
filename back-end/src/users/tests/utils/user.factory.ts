import { User } from '../../entities/user.entity';

type PartialUser = Partial<User>;

export const createUser = (override: PartialUser = {}): User => {
  const user = new User();

  user.name = 'Allisson';
  user.cpf = '04450463927';
  user.email = 'allisson-teste@gmail.com';
  user.password = '12345678';
  user.createdAt = new Date();
  user.updatedAt = new Date();

  return Object.assign(user, override);
};
