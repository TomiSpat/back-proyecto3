// import { UsersService } from './users.service';
// import { JwtService } from '../jwt/jwt.service';
// import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
// import { UserEntity } from './entities/user.entity';
// import { RoleEntity } from '../role/entities/role.entity';
// import { RegisterDTO } from '../interfaces/register.dto';
// import { LoginDTO } from '../interfaces/login.dto';
// import { HashHelper } from 'src/common/helpers/hash.helper';
// import { Test, TestingModule } from '@nestjs/testing';

// describe('UsersService', () => {
//   let service: UsersService;
//   let mockUserRepository: any;
//   let mockRoleRepository: any;
//   let mockJwtService: any;

//   beforeEach(async () => {
//     mockUserRepository = {
//       findOneByEmail: jest.fn(),
//       findOneById: jest.fn(),
//       findAll: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//     };

//     mockRoleRepository = {
//       findOneById: jest.fn(),
//     };

//     mockJwtService = {
//       generateToken: jest.fn(),
//       refreshToken: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersService,
//         { provide: 'IUserRepository', useValue: mockUserRepository },
//         { provide: 'IRoleRepository', useValue: mockRoleRepository },
//         { provide: JwtService, useValue: mockJwtService },
//       ],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('register', () => {
//     it('should successfully register a new user', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'test@test.com',
//         password: 'password123',
//         // name: 'Test User',
//       };

//       const hashedPassword = 'hashedPassword';
//       jest.spyOn(HashHelper, 'hash').mockReturnValue(hashedPassword);

//       mockUserRepository.findOneByEmail.mockResolvedValue(null);
//       mockUserRepository.create.mockResolvedValue({ id: 1, ...registerDto });

//       const result = await service.register(registerDto);

//       expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(registerDto.email);
//       expect(mockUserRepository.create).toHaveBeenCalledWith({
//         ...registerDto,
//         password: hashedPassword,
//       });
//       expect(result).toEqual({ status: 'created', idUser: 1 });
//     });

//     it('should throw error if email already exists', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'existing@test.com',
//         password: 'password123',
//         // name: 'Test User',
//       };

//       mockUserRepository.findOneByEmail.mockResolvedValue({ id: 1, email: registerDto.email });

//       await expect(service.register(registerDto)).rejects.toThrow(HttpException);
//       await expect(service.register(registerDto)).rejects.toThrow('El correo ya está registrado');
//     });

//     it('should handle repository errors during registration', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'test@test.com',
//         password: 'password123',
//         // name: 'Test User',
//       };

//       mockUserRepository.findOneByEmail.mockResolvedValue(null);
//       mockUserRepository.create.mockRejectedValue(new Error('Database error'));
//       jest.spyOn(HashHelper, 'hash').mockReturnValue('hashedPassword');

//       await expect(service.register(registerDto)).rejects.toThrow(HttpException);
//     });
//   });

//   describe('login', () => {
//     it('should successfully login a user and return tokens', async () => {
//       const loginDto: LoginDTO = {
//         email: 'test@test.com',
//         password: 'password123',
//       };

//       const user: UserEntity = {
//         id: 1,
//         email: loginDto.email,
//         password: 'hashedPassword',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       mockUserRepository.findOneByEmail.mockResolvedValue(user);
//       jest.spyOn(HashHelper, 'compare').mockReturnValue(true);
//       mockJwtService.generateToken
//         .mockReturnValueOnce('access-token')
//         .mockReturnValueOnce('refresh-token');

//       const result = await service.login(loginDto);

//       expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
//       expect(result).toEqual({
//         accessToken: 'access-token',
//         refreshToken: 'refresh-token',
//       });
//     });

//     it('should throw UnauthorizedException if user not found', async () => {
//       const loginDto: LoginDTO = {
//         email: 'nonexistent@test.com',
//         password: 'password123',
//       };

//       mockUserRepository.findOneByEmail.mockResolvedValue(null);

//       await expect(service.login(loginDto)).rejects.toThrow(HttpException);
//     });

//     it('should throw UnauthorizedException if password is incorrect', async () => {
//       const loginDto: LoginDTO = {
//         email: 'test@test.com',
//         password: 'wrongpassword',
//       };

//       const user: UserEntity = {
//         id: 1,
//         email: loginDto.email,
//         password: 'hashedPassword',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       mockUserRepository.findOneByEmail.mockResolvedValue(user);
//       jest.spyOn(HashHelper, 'compare').mockReturnValue(false);

//       await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('findByEmail', () => {
//     it('should return user when found', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       mockUserRepository.findOneByEmail.mockResolvedValue(user);

//       const result = await service.findByEmail('test@test.com');

//       expect(result).toEqual(user);
//       expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com');
//     });

//     it('should throw HttpException when user not found', async () => {
//       mockUserRepository.findOneByEmail.mockResolvedValue(null);

//       await expect(service.findByEmail('nonexistent@test.com')).rejects.toThrow(HttpException);
//       await expect(service.findByEmail('nonexistent@test.com')).rejects.toThrow(
//         'Usuario no encontrado',
//       );
//     });
//   });

//   describe('list', () => {
//     it('should return all users', async () => {
//       const users: UserEntity[] = [
//         { id: 1, email: 'user1@test.com'} as UserEntity,
//         { id: 2, email: 'user2@test.com'} as UserEntity,
//       ];

//       mockUserRepository.findAll.mockResolvedValue(users);

//       const result = await service.list();

//       expect(result).toEqual(users);
//       expect(mockUserRepository.findAll).toHaveBeenCalled();
//     });

//     it('should handle errors when listing users', async () => {
//       mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

//       await expect(service.list()).rejects.toThrow(HttpException);
//     });
//   });

//   describe('setRole', () => {
//     it('should successfully set role to user', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       const role: RoleEntity = {
//         id: 1,
//         name: 'Admin',
//         // permissionCodes: [],
//       } as RoleEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);
//       mockRoleRepository.findOneById.mockResolvedValue(role);
//       mockUserRepository.update.mockResolvedValue({ ...user, role: [role] });

//       const result = await service.setRole({ id: 1 }, { id: 1 });

//       expect(result).toBe(HttpStatus.OK);
//       expect(mockUserRepository.findOneById).toHaveBeenCalledWith(1);
//       expect(mockRoleRepository.findOneById).toHaveBeenCalledWith(1);
//     });

//     it('should throw error if user not found', async () => {
//       mockUserRepository.findOneById.mockResolvedValue(null);

//       await expect(service.setRole({ id: 1 }, { id: 1 })).rejects.toThrow('Usuario no encontrado');
//     });

//     it('should throw error if role not found', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);
//       mockRoleRepository.findOneById.mockResolvedValue(null);

//       await expect(service.setRole({ id: 1 }, { id: 1 })).rejects.toThrow('Rol no encontrado');
//     });
//   });

//   describe('quitarRol', () => {
//     it('should successfully remove role from user', async () => {
//       const role: RoleEntity = {
//         id: 1,
//         name: 'Admin',
//         // permissionCodes: [],
//       } as RoleEntity;

//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         role: [role],
//       } as UserEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);
//       mockRoleRepository.findOneById.mockResolvedValue(role);
//       mockUserRepository.update.mockResolvedValue({ ...user, role: [] });

//       const result = await service.quitarRol(1, 1);

//       expect(result).toBe(HttpStatus.OK);
//     });

//     it('should throw error if user does not have the role', async () => {
//       const role: RoleEntity = {
//         id: 2,
//         name: 'Admin',
//         // permissionCodes: [],
//       } as RoleEntity;

//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         role: [{ id: 1, name: 'User'} as RoleEntity],
//       } as UserEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);
//       mockRoleRepository.findOneById.mockResolvedValue(role);

//       await expect(service.quitarRol(1, 2)).rejects.toThrow(
//         'El usuario no tiene este rol asignado',
//       );
//     });

//     it('should throw error if user has no roles', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         // role: [],
//       } as UserEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);

//       await expect(service.quitarRol(1, 1)).rejects.toThrow('El usuario no contiene roles');
//     });
//   });

//   describe('canDo', () => {
//     it('should return user id if user has the required permission', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         role: [
//           {
//             id: 1,
//             name: 'Admin',
//             permissionCodes: [{ id: 1, name: 'CREATE_USER' }],
//           } as RoleEntity,
//         ],
//       } as UserEntity;

//       const result = await service.canDo(user, 'CREATE_USER');

//       expect(result).toBe(1);
//     });

//     it('should throw UnauthorizedException if user lacks permission', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         role: [
//           {
//             id: 1,
//             name: 'User',
//             permissionCodes: [{ id: 2, name: 'READ_USER' }],
//           } as RoleEntity,
//         ],
//       } as UserEntity;

//       await expect(service.canDo(user, 'CREATE_USER')).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh the token', async () => {
//       const refreshToken = 'valid-refresh-token';
//       const tokens = {
//         accessToken: 'new-access-token',
//         refreshToken: 'new-refresh-token',
//       };

//       mockJwtService.refreshToken.mockResolvedValue(tokens);

//       const result = await service.refreshToken(refreshToken);

//       expect(result).toEqual(tokens);
//       expect(mockJwtService.refreshToken).toHaveBeenCalledWith(refreshToken);
//     });
//   });

//   describe('listarRolesPorUsuario', () => {
//     it('should return roles for a user', async () => {
//       const roles: RoleEntity[] = [
//         { id: 1, name: 'Admin'} as RoleEntity,
//         { id: 2, name: 'User'} as RoleEntity,
//       ];

//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         // name: 'Test User',
//         role: roles,
//       } as UserEntity;

//       mockUserRepository.findOneById.mockResolvedValue(user);

//       const result = await service.listarRolesPorUsuario(1);

//       expect(result).toEqual(roles);
//       expect(mockUserRepository.findOneById).toHaveBeenCalledWith(1);
//     });

//     it('should handle errors when listing user roles', async () => {
//       mockUserRepository.findOneById.mockRejectedValue(new Error('Database error'));

//       await expect(service.listarRolesPorUsuario(1)).rejects.toThrow(HttpException);
//     });
//   });
// });
