import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas no DTO
      // forbidNonWhitelisted: true, // retorna erro se vierem propriedades extras
      transform: true, // transforma payloads para os tipos definidos no DTO
    }),
  );
  app.enableCors({
    origin: 'http://localhost:5000', // Porta do Next.js
    methods: 'GET,POST,PUT,DELETE',
  });
  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
