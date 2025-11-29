import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AreaGeneralReclamo,
  ReclamoEstado,
  ReclamoPrioridad,
  ReclamoTipo,
  ReclamoCriticidad,
} from '../reclamo.enums';

export type ReclamoDocument = HydratedDocument<Reclamo>;

@Schema({
  collection: 'reclamos',
  timestamps: true, // createdAt / updatedAt
})
export class Reclamo {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true, index: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Proyecto', required: true, index: true })
  proyectoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoProyecto', required: true, index: true })
  tipoProyectoId: Types.ObjectId;

  @Prop({ type: String, unique: true, sparse: true })
  codigo?: string;

  @Prop({ type: String, enum: ReclamoTipo, required: true })
  tipo: ReclamoTipo;

  @Prop({ type: String, enum: ReclamoPrioridad, required: true })
  prioridad: ReclamoPrioridad;

  @Prop({ type: String, enum: ReclamoCriticidad, required: true })
  criticidad: ReclamoCriticidad;

  @Prop({ type: String, required: true, minlength: 20, maxlength: 2000 })
  descripcion: string;

  // Ãrea general visible para cliente
  @Prop({
    type: String,
    enum: AreaGeneralReclamo,
    required: true,
    index: true,
  })
  areaActual: AreaGeneralReclamo;

  @Prop({
    type: String,
    enum: ReclamoEstado,
    required: true,
    default: ReclamoEstado.CREADO,
    index: true,
  })
  estadoActual: ReclamoEstado;

  // Usuario interno responsable actual
  @Prop({ type: Types.ObjectId, ref: 'Usuario', index: true })
  responsableActualId?: Types.ObjectId;

  // Usuario que creÃ³ el reclamo (puede ser cliente o agente)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  creadoPorUsuarioId: Types.ObjectId;

  // Fechas clave (ademÃ¡s de createdAt / updatedAt de timestamps)
  @Prop({ type: Date })
  fechaResolucion?: Date;

  @Prop({ type: Date })
  fechaCierre?: Date;

  // Resumen de cÃ³mo se resolviÃ³ (visible segÃºn rol)
  @Prop({ type: String })
  resumenResolucion?: string;

  // Feedback del cliente (texto libre por ahora)
  @Prop({ type: String })
  feedbackCliente?: string;
}

export const ReclamoSchema = SchemaFactory.createForClass(Reclamo);
