import { Module } from '@nestjs/common';
import { EventoReclamoService } from './evento-reclamo.service';
import { EventoReclamoController } from './evento-reclamo.controller';

@Module({
  controllers: [EventoReclamoController],
  providers: [EventoReclamoService],
})
export class EventoReclamoModule {}
