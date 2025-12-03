import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReclamoEstado, AreaGeneralReclamo } from '../reclamo.enums';

// Enum para tipos de cambio en el historial
export enum TipoCambioHistorial {
  ESTADO = 'ESTADO',
  AREA = 'AREA',
  RESPONSABLE = 'RESPONSABLE',
}

export type HistorialEstadoReclamoDocument = HydratedDocument<HistorialEstadoReclamo>;

@Schema({
  collection: 'historial_estados_reclamo',
  timestamps: true,
})
export class HistorialEstadoReclamo {
  @Prop({ type: Types.ObjectId, ref: 'Reclamo', required: true, index: true })
  reclamoId: Types.ObjectId;

  // Tipo de cambio: ESTADO, AREA, RESPONSABLE
  @Prop({ type: String, enum: TipoCambioHistorial, required: true, index: true })
  tipoCambio: TipoCambioHistorial;

  // ==== Campos para cambio de ESTADO ====
  @Prop({ type: String, enum: ReclamoEstado })
  estadoAnterior?: ReclamoEstado;

  @Prop({ type: String, enum: ReclamoEstado })
  estadoNuevo?: ReclamoEstado;

  // ==== Campos para cambio de AREA ====
  @Prop({ type: String, enum: AreaGeneralReclamo })
  areaAnterior?: AreaGeneralReclamo;

  @Prop({ type: String, enum: AreaGeneralReclamo })
  areaNueva?: AreaGeneralReclamo;

  // ==== Campos para cambio de RESPONSABLE ====
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  responsableAnteriorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  responsableNuevoId?: Types.ObjectId;

  // ==== Campos comunes ====
  @Prop({ type: String, enum: AreaGeneralReclamo })
  areaResponsable?: AreaGeneralReclamo; // Área actual al momento del cambio

  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  usuarioResponsableId?: Types.ObjectId; // Usuario que realizó el cambio

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
