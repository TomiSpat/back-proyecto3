// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UsersRepository } from './users.repository';
// import { UserEntity } from './entities/user.entity';
// import { RegisterDTO } from '../interfaces/register.dto';
// import { HttpException } from '@nestjs/common';

// describe('UsersRepository', () => {
//   let repository: UsersRepository;
//   let mockRepository: Partial<Repository<UserEntity>>;

//   beforeEach(async () => {
//     mockRepository = {
//       find: jest.fn(),
//       findOneBy: jest.fn(),
//       findOne: jest.fn(),
//       create: jest.fn(),
//       save: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersRepository,
//         {
//           provide: getRepositoryToken(UserEntity),
//           useValue: mockRepository,
//         },
//       ],
//     }).compile();

//     repository = module.get<UsersRepository>(UsersRepository);
//   });

//   it('should be defined', () => {
//     expect(repository).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return all users', async () => {
//       const users: UserEntity[] = [
//         { id: 1, email: 'user1@test.com', password: 'pass1', role: [] } as unknown as UserEntity,
//         { id: 2, email: 'user2@test.com', password: 'pass2', role: [] } as unknown as UserEntity,
//       ];

//       (mockRepository.find as jest.Mock).mockResolvedValue(users);

//       const result = await repository.findAll();

//       expect(result).toEqual(users);
//       expect(mockRepository.find).toHaveBeenCalled();
//     });

//     it('should handle errors when finding users', async () => {
//       const error = new Error('Database error');
//       (error as any).status = 500;
//       (mockRepository.find as jest.Mock).mockRejectedValue(error);

//       await expect(repository.findAll()).rejects.toThrow(HttpException);
//     });
//   });

//   describe('findOneByEmail', () => {
//     it('should return user when found by email', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         password: 'testpass',
//         role: [],
//       } as unknown as UserEntity;

//       (mockRepository.findOneBy as jest.Mock).mockResolvedValue(user);

//       const result = await repository.findOneByEmail('test@test.com');

//       expect(result).toEqual(user);
//       expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@test.com' });
//     });

//     it('should return null when user not found', async () => {
//       (mockRepository.findOneBy as jest.Mock).mockResolvedValue(null);

//       const result = await repository.findOneByEmail('nonexistent@test.com');

//       expect(result).toBeNull();
//     });

//     it('should handle errors when finding user by email', async () => {
//       const error = new Error('Database error');
//       (error as any).status = 500;
//       (mockRepository.findOneBy as jest.Mock).mockRejectedValue(error);

//       await expect(repository.findOneByEmail('test@test.com')).rejects.toThrow(HttpException);
//     });
//   });

//   describe('findOneById', () => {
//     it('should return user when found by id with roles', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'test@test.com',
//         password: 'testpass',
//         role: [],
//       } as unknown as UserEntity;

//       (mockRepository.findOne as jest.Mock).mockResolvedValue(user);

//       const result = await repository.findOneById(1);

//       expect(result).toEqual(user);
//       expect(mockRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         relations: ['role'],
//       });
//     });

//     it('should return null when user not found by id', async () => {
//       (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

//       const result = await repository.findOneById(999);

//       expect(result).toBeNull();
//     });

//     it('should handle errors when finding user by id', async () => {
//       const error = new Error('Database error');
//       (error as any).status = 500;
//       (mockRepository.findOne as jest.Mock).mockRejectedValue(error);

//       await expect(repository.findOneById(1)).rejects.toThrow(HttpException);
//     });
//   });

//   describe('create', () => {
//     it('should create and save a new user', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'newuser@test.com',
//         password: 'hashedPassword',
//       };

//       const userEntity: UserEntity = {
//         id: 1,
//         ...registerDto,
//       } as UserEntity;

//       (mockRepository.create as jest.Mock).mockReturnValue(userEntity);
//       (mockRepository.save as jest.Mock).mockResolvedValue(userEntity);

//       const result = await repository.create(registerDto);

//       expect(result).toEqual(userEntity);
//       expect(mockRepository.create).toHaveBeenCalledWith(registerDto);
//       expect(mockRepository.save).toHaveBeenCalledWith(userEntity);
//     });

//     it('should handle errors when creating user', async () => {
//       const registerDto: RegisterDTO = {
//         email: 'newuser@test.com',
//         password: 'hashedPassword',
//       };

//       const userEntity: UserEntity = {
//         id: 1,
//         ...registerDto,
//       } as UserEntity;

//       const error = new Error('Database error');
//       (error as any).status = 500;
//       (mockRepository.create as jest.Mock).mockReturnValue(userEntity);
//       (mockRepository.save as jest.Mock).mockRejectedValue(error);

//       await expect(repository.create(registerDto)).rejects.toThrow(HttpException);
//     });
//   });

//   describe('update', () => {
//     it('should update and save user entity', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'updated@test.com',
//         password: 'updatedpass',
//         role: [],
//       } as unknown as UserEntity;

//       (mockRepository.save as jest.Mock).mockResolvedValue(user);

//       const result = await repository.update(user);

//       expect(result).toEqual(user);
//       expect(mockRepository.save).toHaveBeenCalledWith(user);
//     });

//     it('should handle errors when updating user', async () => {
//       const user: UserEntity = {
//         id: 1,
//         email: 'updated@test.com',
//         password: 'updatedpass',
//         role: [],
//       } as unknown as UserEntity;

//       const error = new Error('Database error');
//       (error as any).status = 500;
//       (mockRepository.save as jest.Mock).mockRejectedValue(error);

//       await expect(repository.update(user)).rejects.toThrow(HttpException);
//     });
//   });
// });
