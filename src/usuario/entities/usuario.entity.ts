import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UsuarioRol, UsuarioEstado } from '../usuario.enums';
import { AreaGeneralReclamo } from '../../reclamo/reclamo.enums';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({
  collection: 'usuarios',
  timestamps: true,
})
export class Usuario {
  @Prop({ type: String, required: true, minlength: 2, maxlength: 20 })
  nombre: string;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 40 })
  apellido: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, enum: UsuarioRol, required: true, index: true })
  rol: UsuarioRol;

  @Prop({ 
    type: String, 
    enum: AreaGeneralReclamo,
    required: function() {
      return this.rol === UsuarioRol.AGENTE;
    }
  })
  areaAsignada?: AreaGeneralReclamo;

  @Prop({ type: String, enum: UsuarioEstado, default: UsuarioEstado.ACTIVO })
  estado: UsuarioEstado;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', default: null })
  clienteId?: Types.ObjectId;

  @Prop({ type: Date })
  ultimoAcceso?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Índices compuestos
UsuarioSchema.index({ email: 1, isDeleted: 1 });
UsuarioSchema.index({ rol: 1, estado: 1 });
UsuarioSchema.index({ areaAsignada: 1, rol: 1 });
