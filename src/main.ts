import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora campos que no estén en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan campos de más
      transform: true, // Convierte tipos automáticamente
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('CB Travel API')
    .setDescription('Documentación de la API de gestión de viajes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
