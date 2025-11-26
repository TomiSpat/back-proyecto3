import { Module } from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { ReclamoController } from './reclamo.controller';

@Module({
  controllers: [ReclamoController],
  providers: [ReclamoService],
})
export class ReclamoModule {}
