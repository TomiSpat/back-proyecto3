import { Module, forwardRef } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { ReporteRepository } from './reporte.repository';
import { ReclamoModule } from '../reclamo/reclamo.module';

@Module({
  imports: [forwardRef(() => ReclamoModule)],
  controllers: [ReporteController],
  providers: [
    ReporteService,
    ReporteRepository,
  ],
  exports: [ReporteService, ReporteRepository],
})
export class ReporteModule {}
