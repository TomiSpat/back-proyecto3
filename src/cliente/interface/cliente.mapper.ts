import { ClienteDocument } from '../entities/cliente.entity';

/**
 * DTO para listar clientes (vista simplificada)
 */
export interface ClienteListDto {
  _id: string;
  nombre: string;
  apellido: string;
  numDocumento: string;
  email: string;
  numTelefono: string;
}

/**
 * Mapper de Cliente
 * Responsabilidad: Transformar entidades de Cliente a DTOs de respuesta
 */
export class ClienteMapper {
  /**
   * Mapear un cliente a formato de lista simplificado
   * Solo incluye: nombre, apellido, DNI, email, teléfono
   */
  static toListDto(cliente: ClienteDocument): ClienteListDto {
    return {
      _id: cliente._id.toString(),
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      numDocumento: cliente.numDocumento,
      email: cliente.email,
      numTelefono: cliente.numTelefono,
    };
  }

  /**
   * Mapear múltiples clientes a formato de lista
   */
  static toListDtoArray(clientes: ClienteDocument[]): ClienteListDto[] {
    return clientes.map(cliente => this.toListDto(cliente));
  }
}
