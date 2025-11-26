/* eslint-disable @typescript-eslint/no-unused-vars */

import { User } from '../../src/users/entities/user.entity';

type PartialUser = Partial<User>;

// Gera um número aleatório com X dígitos
const randomNumber = (digits: number) =>
  Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join('');
// Gera um CPF válido no formato simples (11 dígitos aleatórios)
const randomCpf = () => randomNumber(11);
// Gera email aleatório
const randomEmail = () =>
  `user_${Math.random().toString(36).substring(2, 10)}@test.com`;

export const createUser = (override: PartialUser = {}): User => {
  const user = new User();

  user.name = 'Allisson';
  user.cpf = randomCpf(); // <<<<< cpf aleatório
  console.log(user.cpf);
  user.email = randomEmail(); // <<<<< email aleatório
  console.log(user.email);
  user.password = '1A#2a345678';
  user.createdAt = new Date();
  user.updatedAt = new Date();

  return Object.assign(user, override);
};
