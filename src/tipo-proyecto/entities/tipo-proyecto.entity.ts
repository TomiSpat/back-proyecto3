import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoProyectoDocument = HydratedDocument<TipoProyecto>;

@Schema({
  collection: 'tipos_proyecto',
  timestamps: true, // createdAt / updatedAt
})
export class TipoProyecto {
  @Prop({ type: String, required: true, unique: true })
  nombre: string;

  @Prop({ type: String, required: true })
  descripcion: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const TipoProyectoSchema = SchemaFactory.createForClass(TipoProyecto);
