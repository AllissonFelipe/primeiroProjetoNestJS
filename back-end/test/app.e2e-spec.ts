/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { createUser } from './utils/user.factory';
import { loginUser } from './utils/login.factory';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close(); // <<< fecha a aplicação e libera recursos
  });
  // Registro com email e senha corretos
  it('auth/register (POST) - register success', async () => {
    const user = createUser();
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).not.toHaveProperty('password');
    expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(res.body.updatedAt).toString()).not.toBe('Invalid Date');
  });
  // Login com email e password corretos
  it('auth/login (POST) - login success', async () => {
    const login = loginUser({
      email: 'allissonTeste@example.com',
      password: 'JaquesFreud123#',
    });
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(login)
      .expect(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.split('.').length).toBe(3);
  });
  // Cadastro com email duplicado
  it('should fail in create user with duplicate email', async () => {
    const userDto = createUser({ email: 'allissonTeste@example.com' });
    const resq = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(409);
  });
});
