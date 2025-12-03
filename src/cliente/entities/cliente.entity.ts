import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema({
  collection: 'clientes',
  timestamps: true, // createdAt / updatedAt
})
export class Cliente {
  @Prop({ type: String, required: true, minlength: 2, maxlength: 15 })
  nombre: string;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 40  })
  apellido: string;

  @Prop({ type: String, required: true, unique: true })
  numDocumento: string;

  @Prop({ type: Date, required: true })
  fechaNacimiento: Date;

  @Prop({ type: String, required: true })
  numTelefono: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', default: null })
  usuarioId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
