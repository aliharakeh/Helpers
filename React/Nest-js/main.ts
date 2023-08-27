import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as open from 'open';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
  await open('http://localhost:3000', { app: { name: open.apps.chrome } });
}

bootstrap();
