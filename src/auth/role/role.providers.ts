import { RoleRepository } from './role.repository';

export const RoleProviders = [
  {
    provide: 'IRoleRepository',
    useClass: RoleRepository,
  },
];
