import { PermissionRepository } from './permission.repository';

export const PermissionProviders = [
  {
    provide: 'IPermissionRepository',
    useClass: PermissionRepository,
  },
];
