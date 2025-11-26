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
    expect(resq.body.message).toBe('Email ja cadastrado no sistema.');
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
  });
  // Cadastro com CPF duplicado
  it('should fail in create user with duplicate cpf', async () => {
    const userDto = createUser({ cpf: '20583109637' });
    const resq = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(409);
    expect(resq.body.message).toBe('CPF ja cadastrado no sistema.');
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
  });
  // Login com email incorreto
  it('should fail login with incorrect email', async () => {
    const userDto = loginUser({ password: '123#Asdsdsds' });
    const resq = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userDto)
      .expect(401);
    expect(resq.body.message).toBe('Invalid credentials.');
    expect(resq.body.error).toBe('Unauthorized');
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
    expect(resq.body.message.toLowerCase()).not.toContain('email');
    expect(resq.body.message.toLowerCase()).not.toContain('password');
    expect(resq.body).toMatchSnapshot();
  });
  // Login com password incorreto
  it('should fail login with incorrect password', async () => {
    const userDto = loginUser({ email: 'allissonTeste@example.com' });
    const resq = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userDto)
      .expect(401);
    expect(resq.body.message).toBe('Invalid credentials.');
    expect(resq.body.error).toBe('Unauthorized');
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
    expect(resq.body.message.toLowerCase()).not.toContain('email');
    expect(resq.body.message.toLowerCase()).not.toContain('password');
    expect(resq.body).toMatchSnapshot();
  });
  // Teste de profile acessado com success
  it('should return a profile', async () => {
    const server = app.getHttpServer();
    const userDto = createUser();
    await request(server).post('/auth/register').send(userDto).expect(201);

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: userDto.email, password: userDto.password })
      .expect(200);
    const accessToken = loginRes.body.accessToken;
    const profile = await request(server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = profile.body;
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('cpf');
    expect(body).toHaveProperty('createdAt');
    expect(body).toHaveProperty('updatedAt');
    expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(body.updatedAt).toString()).not.toBe('Invalid Date');
    expect(typeof body.id).toBe('string');
    expect(typeof body.name).toBe('string');
    expect(typeof body.email).toBe('string');
    expect(typeof body.cpf).toBe('string');
    expect(body.id).toBeDefined();
    expect(body.email).toBe(userDto.email);
    expect(body.name).toBe(userDto.name);
  });
  // Profile com token errado
  it('should fail to get profile with invalid token', async () => {
    const resq = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer INVALID_TOKEN`)
      .expect(401);
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
    expect(resq.body).not.toHaveProperty('email');
    expect(resq.body).not.toHaveProperty('id');
  });
  // Profile sem token
  it('should fail to get a profile without a token', async () => {
    const resq = await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
    expect(resq.body).toHaveProperty('statusCode');
    expect(resq.body).toHaveProperty('message');
    expect(resq.body).not.toHaveProperty('email');
    expect(resq.body).not.toHaveProperty('id');
  });
});
