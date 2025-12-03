import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProyectoDocument = HydratedDocument<Proyecto>;

@Schema({
  collection: 'proyectos',
  timestamps: true, // createdAt / updatedAt
})
export class Proyecto {
  @Prop({ type: String, required: true })
  nombre: string;

  @Prop({ type: String, required: true })
  descripcion: string;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoProyecto', required: true })
  tipoProyectoId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  fechaInicio: Date;

  @Prop({ type: Date })
  fechaFin?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const ProyectoSchema = SchemaFactory.createForClass(Proyecto);
