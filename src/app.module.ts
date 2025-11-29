import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { ReclamoModule } from './reclamo/reclamo.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EstadoReclamoModule } from './estado-reclamo/estado-reclamo.module';
import { CambioEstadoReclamoModule } from './cambio-estado-reclamo/cambio-estado-reclamo.module';
import { EventoReclamoModule } from './evento-reclamo/evento-reclamo.module';
import { ReporteModule } from './reporte/reporte.module';
import { AuthModule } from './auth/auth.module';
import { TipoProyectoModule } from './tipo-proyecto/tipo-proyecto.module';

@Module({
  imports: [
    ClienteModule,
    ProyectoModule,
    ReclamoModule,
    UsuarioModule,
    EstadoReclamoModule,
    CambioEstadoReclamoModule,
    EventoReclamoModule,
    ReporteModule,
    AuthModule,
    TipoProyectoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
