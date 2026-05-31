import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Acceder a la instancia de Express directamente
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true); // ✅ aquí funciona

  app.setGlobalPrefix("api/v1");

  app.enableCors({
    origin: ['https://espacioboulevardlinares.cl', 'http://localhost:4200','http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Authorization,Content-Type',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(3000, '0.0.0.0');


}
bootstrap();

