import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReclamoService } from './reclamo.service';
import { ReclamoController } from './reclamo.controller';
import { ReclamoRepository } from './reclamo.repository';
import { Reclamo, ReclamoSchema } from './entities/reclamo.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reclamo.name, schema: ReclamoSchema }]),
  ],
  controllers: [ReclamoController],
  providers: [ReclamoService, ReclamoRepository],
  exports: [ReclamoService, ReclamoRepository],
})
export class ReclamoModule {}
