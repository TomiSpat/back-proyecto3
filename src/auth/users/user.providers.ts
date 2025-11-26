import { UsersRepository } from './users.repository';

export const UserProviders = [
  {
    provide: 'IUserRepository',
    useClass: UsersRepository,
  },
];
