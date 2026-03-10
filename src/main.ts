import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos el middleware de cookies
  app.use(cookieParser());

  // Configuración de CORS para que tu Front (Vite/Next.js) pueda recibir las cookies
  app.enableCors({
    origin: 'http://localhost:3000', // La URL de tu front
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
