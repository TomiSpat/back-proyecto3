import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión de Reclamos')
    .setDescription('API para gestión de clientes, proyectos y reclamos con patrón State')
    .setVersion('1.0')
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
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`🗄️  Base de datos: MongoDB Atlas\n`);
}
bootstrap();
