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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
