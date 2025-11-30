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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reclamo.name, schema: ReclamoSchema },
      { name: HistorialEstadoReclamo.name, schema: HistorialEstadoReclamoSchema },
    ]),
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
