import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReclamoService } from './reclamo.service';
import { ReclamoController } from './reclamo.controller';
import { ReclamoRepository } from './reclamo.repository';
import { Reclamo, ReclamoSchema } from './entities/reclamo.entity';
import { HistorialEstadoReclamo, HistorialEstadoReclamoSchema } from './entities/historial-estado-reclamo.entity';
import { ReclamoStateFactory } from './state/reclamo-state.factory';
import { EstadoReclamoController, InfoEstadosController } from 'src/estado-reclamo/estado-reclamo.controller';
import { EstadoReclamoService } from 'src/estado-reclamo/estado-reclamo.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reclamo.name, schema: ReclamoSchema },
      { name: HistorialEstadoReclamo.name, schema: HistorialEstadoReclamoSchema },
    ]),
    AuthModule, // Para usar los guards de autenticación
  ],
  controllers: [ReclamoController, EstadoReclamoController, InfoEstadosController],
  providers: [
    ReclamoService, 
    ReclamoRepository, 
    EstadoReclamoService,
    ReclamoStateFactory,
  ],
  exports: [ReclamoService, ReclamoRepository, EstadoReclamoService],
})
export class ReclamoModule {}
