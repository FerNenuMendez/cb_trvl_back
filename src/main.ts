import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora campos que no estén en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan campos de más
      transform: true, // Convierte tipos automáticamente
    }),
  );

  app.use(cookieParser());

  // =========================================================
  // ---> CONFIGURACIÓN DE CORS MEJORADA <---
  // =========================================================
  // Traemos la URL del frontend de las variables de entorno, o usamos un fallback
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'; // Asumo puerto 5173 (Vite/React), cambialo si usás otro

  app.enableCors({
    // Permitimos múltiples orígenes: tu frontend local, tu frontend en prod, y el mismo localhost de Nest
    origin: ['http://localhost:3000', 'http://localhost:5173', frontendUrl],
    credentials: true, // Fundamental para que pasen las cookies del JWT
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // =========================================================
  // ---> CONFIGURACIÓN DE SWAGGER PARA VERCEL <---
  // =========================================================
  const config = new DocumentBuilder()
    .setTitle('Login Gen API')
    .setDescription('Documentación de la API de Login Gen')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // El truco mágico: cargar estáticos de Swagger desde un CDN
  SwaggerModule.setup('api', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js',
    ],
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`API running on port: ${port}`);
}
void bootstrap();
