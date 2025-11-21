import { validate } from 'class-validator';
import { createUser } from './utils/user.factory';

describe('User Entity', () => {
  // Validando com dados corretos
  it('should validate a correct user', async () => {
    const user = createUser();
    const errors = await validate(user);
    expect(errors.length).toBe(0); // nenhuma validação falhou
  });
  it('should validate mocked dates', async () => {
    const user = createUser();
    // console.log(user.createdAt);
    // console.log(user.updatedAt);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
  // Testando com nome vazio
  it('should fail in empty name', async () => {
    const user = createUser({ name: '' });
    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });
  it('should fail in empyt email', async () => {
    const user = createUser({ email: '' });
    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });
  it('shoul fail in password less than 8 characteres', async () => {
    const user = createUser({ password: '1234567' });
    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });
});
