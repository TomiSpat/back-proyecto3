import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReclamoEstado, AreaGeneralReclamo } from '../reclamo.enums';

export type HistorialEstadoReclamoDocument = HydratedDocument<HistorialEstadoReclamo>;

@Schema({
  collection: 'historial_estados_reclamo',
  timestamps: true,
})
export class HistorialEstadoReclamo {
  @Prop({ type: Types.ObjectId, ref: 'Reclamo', required: true, index: true })
  reclamoId: Types.ObjectId;

  @Prop({ type: String, enum: ReclamoEstado, required: true })
  estadoAnterior: ReclamoEstado;

  @Prop({ type: String, enum: ReclamoEstado, required: true })
  estadoNuevo: ReclamoEstado;

  @Prop({ type: String, enum: AreaGeneralReclamo, required: true })
  areaResponsable: AreaGeneralReclamo;

  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  usuarioResponsableId?: Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  fechaCambio: Date;

  @Prop({ type: String, maxlength: 500 })
  observaciones?: string;

  @Prop({ type: String, maxlength: 200 })
  motivoCambio?: string;
}

export const HistorialEstadoReclamoSchema = SchemaFactory.createForClass(HistorialEstadoReclamo);

// Índice compuesto para consultas eficientes
HistorialEstadoReclamoSchema.index({ reclamoId: 1, fechaCambio: -1 });
