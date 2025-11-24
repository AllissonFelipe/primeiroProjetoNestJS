import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const password = 'senha123';
    const hash = await service.hash(password);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
  });

  it('should verify a correct password', async () => {
    const password = 'senha123';
    const hash = await service.hash(password);
    const result = await service.verify(password, hash);
    expect(result).toBe(true);
  });

  it('should verify a incorrect password', async () => {
    const password = 'senha123';
    const hash = await service.hash(password);
    const result = await service.verify('senha_errada', hash);
    expect(result).toBe(false);
  });
});
