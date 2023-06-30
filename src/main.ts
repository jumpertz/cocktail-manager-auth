import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import InitSwagger from './config/swagger.config';
import { AppModule } from './app.module';

async function initApp(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  InitSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  await app.listen(5000);
}

initApp();
