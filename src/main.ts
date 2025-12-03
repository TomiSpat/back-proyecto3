import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS ---
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    // producción - front en Vercel
    'https://front-proyecto3-sigma.vercel.app',
  ];

  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  console.log('✅ CORS habilitado para:', allowedOrigins);

  // --- Validación global ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión de Reclamos')
    .setDescription(
      'API para gestión de clientes, proyectos y reclamos con autenticación JWT y control de roles',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación')
    .addTag('Usuarios')
    .addTag('Clientes')
    .addTag('Proyectos')
    .addTag('Tipos de Proyecto')
    .addTag('Reclamos')
    .addTag('Estados de Reclamo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`\n🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  console.log(`🗄️  Base de datos: MongoDB Atlas\n`);
}
bootstrap();
