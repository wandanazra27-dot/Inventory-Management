import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors(); // Optional but good for frontend
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
