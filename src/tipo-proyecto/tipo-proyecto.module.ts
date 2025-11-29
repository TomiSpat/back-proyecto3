import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoProyectoService } from './tipo-proyecto.service';
import { TipoProyectoController } from './tipo-proyecto.controller';
import { TipoProyectoRepository } from './tipo-proyecto.repository';
import { TipoProyecto, TipoProyectoSchema } from './entities/tipo-proyecto.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TipoProyecto.name, schema: TipoProyectoSchema }]),
  ],
  controllers: [TipoProyectoController],
  providers: [TipoProyectoService, TipoProyectoRepository],
  exports: [TipoProyectoService, TipoProyectoRepository],
})
export class TipoProyectoModule {}
