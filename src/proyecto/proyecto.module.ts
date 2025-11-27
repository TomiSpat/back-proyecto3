import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { ProyectoRepository } from './proyecto.repository';
import { Proyecto, ProyectoSchema } from './entities/proyecto.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Proyecto.name, schema: ProyectoSchema }]),
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService, ProyectoRepository],
  exports: [ProyectoService, ProyectoRepository],
})
export class ProyectoModule {}
