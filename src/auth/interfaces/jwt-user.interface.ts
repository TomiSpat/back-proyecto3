/**
 * Representa el usuario extraído del JWT token.
 * Este es el objeto que se adjunta a req.user después de la autenticación.
 */
export interface JwtUser {
  id: string;
  email: string;
  rol: string;
  areaAsignada?: string;
  nombre: string;
  apellido: string;
  clienteId?: string;
}
