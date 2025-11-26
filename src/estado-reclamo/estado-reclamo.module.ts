import { Module } from '@nestjs/common';
import { EstadoReclamoService } from './estado-reclamo.service';
import { EstadoReclamoController } from './estado-reclamo.controller';

@Module({
  controllers: [EstadoReclamoController],
  providers: [EstadoReclamoService],
})
export class EstadoReclamoModule {}
