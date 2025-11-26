/* eslint-disable @typescript-eslint/no-unused-expressions */
import { User } from '../../src/users/entities/user.entity';

/* eslint-disable @typescript-eslint/no-unused-vars */
type PartialUser = Partial<User>;

// Gera um número aleatório com X dígitos
const randomNumber = (digits: number) =>
  Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join('');
// Gera um CPF válido no formato simples (11 dígitos aleatórios)
const randomCpf = () => randomNumber(11);
// Gera email aleatório
const randomEmail = () =>
  `user_${Math.random().toString(36).substring(2, 10)}@test.com`;

export const loginUser = (override: PartialUser = {}): User => {
  const loginUser = new User();

  loginUser.email = randomEmail();
  loginUser.password = randomCpf();

  return Object.assign(loginUser, override);
};
