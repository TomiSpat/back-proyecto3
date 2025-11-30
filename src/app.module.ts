import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { ReclamoModule } from './reclamo/reclamo.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { EventoReclamoModule } from './evento-reclamo/evento-reclamo.module';
import { ReporteModule } from './reporte/reporte.module';
import { TipoProyectoModule } from './tipo-proyecto/tipo-proyecto.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: 'proyecto3_db', // Nombre de la base de datos
      }),
      inject: [ConfigService],
    }),
    
    ClienteModule,
    ProyectoModule,
    ReclamoModule,
    UsuarioModule,
    AuthModule,
    EventoReclamoModule,
    ReporteModule,
    TipoProyectoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
