export enum ReclamoEstado {
  CREADO = 'CREADO',
  PENDIENTE = 'PENDIENTE',
  ASIGNADO = 'ASIGNADO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
  CANCELADO = 'CANCELADO',
}

export enum ReclamoPrioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum ReclamoCriticidad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum ReclamoTipo {
  INCIDENTE = 'INCIDENTE',
  CONSULTA = 'CONSULTA',
  MEJORA = 'MEJORA',
  OTRO = 'OTRO',
}

export enum AreaGeneralReclamo {
  VENTAS = 'VENTAS',
  SOPORTE_TECNICO = 'SOPORTE_TECNICO',
  FACTURACION = 'FACTURACION',
}
