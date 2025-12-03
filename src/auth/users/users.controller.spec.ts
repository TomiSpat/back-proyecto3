// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { RegisterDTO } from '../interfaces/register.dto';
// import { LoginDTO } from '../interfaces/login.dto';
// import { UserEntity } from './entities/user.entity';
// import { RoleEntity } from '../role/entities/role.entity';
// import { Response } from 'express';
// import { UnauthorizedException } from '@nestjs/common';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         {
//           provide: UsersService,
//           useValue: {
//             register: jest.fn(),
//             login: jest.fn(),
//             list: jest.fn(),
//             setRole: jest.fn(),
//             quitarRol: jest.fn(),
//             listarRolesPorUsuario: jest.fn(),
//             refreshToken: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('register', () => {
//     it('should register a new user', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'test@test.com',
//         password: 'password123',
//       };

//       const expectedResult = { status: 'created', idUser: 1 };
//       jest.spyOn(service, 'register').mockResolvedValue(expectedResult);

//       const result = await controller.register(registerDto);

//       expect(result).toEqual(expectedResult);
//       expect(service.register).toHaveBeenCalledWith(registerDto);
//     });
//   });

//   describe('list', () => {
//     it('should return all users', async () => {
//       const users: UserEntity[] = [
//         { id: 1, email: 'user1@test.com', password: 'pass1', role: [] } as unknown as UserEntity,
//         { id: 2, email: 'user2@test.com', password: 'pass2', role: [] } as unknown as UserEntity,
//       ];

//       jest.spyOn(service, 'list').mockResolvedValue(users);

//       const result = await controller.list();

//       expect(result).toEqual(users);
//       expect(service.list).toHaveBeenCalled();
//     });
//   });

//   describe('me', () => {
//     it('should return current user info', () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         password: 'testpass',
//         role: [{ id: 1, name: 'Admin' } as RoleEntity],
//       } as unknown as UserEntity;

//       const req: any = { user };

//       const result = controller.me(req);

//       expect(result).toEqual({
//         id: user.id,
//         role: user.role,
//       });
//     });
//   });

//   describe('logout', () => {
//     it('should clear cookies and return logout message', () => {
//       const mockResponse = {
//         clearCookie: jest.fn(),
//       } as unknown as Response;

//       const result = controller.logout(mockResponse);

//       expect(result).toEqual({ message: 'Logout exitoso' });
//       expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
//     });
//   });

//   describe('login', () => {
//     it('should login user and set cookies', async () => {
//       const loginDto: LoginDTO = {
//         email: 'test@test.com',
//         password: 'password123',
//       };

//       const tokens = {
//         accessToken: 'access-token',
//         refreshToken: 'refresh-token',
//       };

//       jest.spyOn(service, 'login').mockResolvedValue(tokens);

//       const mockResponse = {
//         cookie: jest.fn(),
//       } as unknown as Response;

//       const result = await controller.login(mockResponse, loginDto);

//       expect(service.login).toHaveBeenCalledWith(loginDto);
//       expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
//       expect(result).toHaveProperty('message', 'Login exitoso');
//       expect(result).toHaveProperty('accessTokenExpiresAt');
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh token and set new cookies', async () => {
//       const mockRequest = {
//         cookies: {
//           refresh_token: 'valid-refresh-token',
//         },
//       } as any;

//       const mockResponse = {
//         cookie: jest.fn(),
//         send: jest.fn(),
//       } as unknown as Response;

//       const tokens = {
//         accessToken: 'new-access-token',
//         refreshToken: 'new-refresh-token',
//         expirationTime: 780000,
//       };

//       jest.spyOn(service, 'refreshToken').mockResolvedValue(tokens);

//       await controller.refreshToken(mockRequest, mockResponse);

//       expect(service.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
//       expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
//       expect(mockResponse.send).toHaveBeenCalled();
//     });

//     it('should throw UnauthorizedException if no refresh token provided', async () => {
//       const mockRequest = {
//         cookies: {},
//       } as any;

//       const mockResponse = {} as Response;

//       await expect(controller.refreshToken(mockRequest, mockResponse)).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });
//   });

//   describe('setRole', () => {
//     it('should set role for a user', async () => {
//       const roleDto = { id: 1 };
//       const userId = 1;

//       jest.spyOn(service, 'setRole').mockResolvedValue(200);

//       const result = await controller.setRole(roleDto, userId);

//       expect(result).toBe(200);
//       expect(service.setRole).toHaveBeenCalledWith({ id: userId }, roleDto);
//     });
//   });

//   describe('quitarRol', () => {
//     it('should remove role from a user', async () => {
//       const userId = 1;
//       const roleId = 2;

//       jest.spyOn(service, 'quitarRol').mockResolvedValue(200);

//       const result = await controller.quitarRol(userId, roleId);

//       expect(result).toBe(200);
//       expect(service.quitarRol).toHaveBeenCalledWith(userId, roleId);
//     });
//   });

//   describe('listarRolesPorUsuario', () => {
//     it('should return roles for a user', async () => {
//       const userId = 1;
//       const roles: RoleEntity[] = [
//         { id: 1, name: 'Admin' } as RoleEntity,
//         { id: 2, name: 'User' } as RoleEntity,
//       ];

//       jest.spyOn(service, 'listarRolesPorUsuario').mockResolvedValue(roles);

//       const result = await controller.listarRolesPorUsuario(userId);

//       expect(result).toEqual(roles);
//       expect(service.listarRolesPorUsuario).toHaveBeenCalledWith(userId);
//     });
//   });
// });
