import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsuarioRepository } from './usuario.repository';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;
  let model: Model<UsuarioDocument>;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockUsuario = {
    _id: validObjectId,
    nombre: 'Test',
    apellido: 'User',
    email: 'test@test.com',
    password: 'hashedPassword',
    rol: 'admin',
    estado: 'activo',
    isDeleted: false,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUsuarioModel = {
    new: jest.fn().mockResolvedValue(mockUsuario),
    constructor: jest.fn().mockResolvedValue(mockUsuario),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
    populate: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioRepository,
        {
          provide: getModelToken(Usuario.name),
          useValue: {
            new: jest.fn().mockImplementation((dto) => ({
              ...dto,
              save: jest.fn().mockResolvedValue({ _id: validObjectId, ...dto }),
            })),
            find: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis(),
            findOneAndUpdate: jest.fn().mockReturnThis(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UsuarioRepository>(UsuarioRepository);
    model = module.get<Model<UsuarioDocument>>(getModelToken(Usuario.name));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a usuario', async () => {
      const createDto = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        password: 'password',
        rol: 'admin',
      };

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all usuarios', async () => {
      const mockUsuarios = [mockUsuario];
      (model.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUsuarios),
            }),
          }),
        }),
      });

      const result = await repository.findAll();

      expect(model.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(mockUsuarios);
    });

    it('should return usuarios with filter', async () => {
      const filter = { rol: 'admin' };
      const mockUsuarios = [mockUsuario];
      (model.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUsuarios),
            }),
          }),
        }),
      });

      const result = await repository.findAll(filter);

      expect(model.find).toHaveBeenCalledWith({ ...filter, isDeleted: false });
      expect(result).toEqual(mockUsuarios);
    });
  });

  describe('findOne', () => {
    it('should return a usuario by id', async () => {
      (model.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsuario),
          }),
        }),
      });

      const result = await repository.findOne(validObjectId);

      expect(model.findOne).toHaveBeenCalledWith({ _id: validObjectId, isDeleted: false });
      expect(result).toEqual(mockUsuario);
    });

    it('should return null when usuario not found', async () => {
      (model.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await repository.findOne(validObjectId);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a usuario by email', async () => {
      (model.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUsuario),
        }),
      });

      const result = await repository.findByEmail('test@test.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@test.com', isDeleted: false });
      expect(result).toEqual(mockUsuario);
    });

    it('should lowercase email for search', async () => {
      (model.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUsuario),
        }),
      });

      await repository.findByEmail('TEST@TEST.COM');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@test.com', isDeleted: false });
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return a usuario with password', async () => {
      (model.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUsuario),
        }),
      });

      const result = await repository.findByEmailWithPassword('test@test.com');

      expect(result).toEqual(mockUsuario);
    });
  });

  describe('findByRol', () => {
    it('should return usuarios by rol', async () => {
      const mockUsuarios = [mockUsuario];
      (model.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUsuarios),
            }),
          }),
        }),
      });

      const result = await repository.findByRol('admin');

      expect(model.find).toHaveBeenCalledWith({ rol: 'admin', isDeleted: false });
      expect(result).toEqual(mockUsuarios);
    });
  });

  describe('findByArea', () => {
    it('should return usuarios by area', async () => {
      const mockUsuarios = [mockUsuario];
      (model.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsuarios),
          }),
        }),
      });

      const result = await repository.findByArea('VENTAS');

      expect(model.find).toHaveBeenCalledWith({ areaAsignada: 'VENTAS', isDeleted: false });
      expect(result).toEqual(mockUsuarios);
    });
  });

  describe('findAgentesActivosByArea', () => {
    it('should return active agentes by area', async () => {
      const mockAgentes = [{ ...mockUsuario, rol: 'agente' }];
      (model.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockAgentes),
          }),
        }),
      });

      const result = await repository.findAgentesActivosByArea('SOPORTE_TECNICO');

      expect(model.find).toHaveBeenCalledWith({
        areaAsignada: 'SOPORTE_TECNICO',
        rol: 'agente',
        estado: 'activo',
        isDeleted: false,
      });
      expect(result).toEqual(mockAgentes);
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      const updateDto = { nombre: 'Updated' };
      const updatedUsuario = { ...mockUsuario, nombre: 'Updated' };

      (model.findOneAndUpdate as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(updatedUsuario),
          }),
        }),
      });

      const result = await repository.update(validObjectId, updateDto);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validObjectId, isDeleted: false },
        updateDto,
        { new: true }
      );
      expect(result).toEqual(updatedUsuario);
    });

    it('should return null when usuario not found', async () => {
      const updateDto = { nombre: 'Updated' };

      (model.findOneAndUpdate as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await repository.update(validObjectId, updateDto);

      expect(result).toBeNull();
    });
  });

  describe('updateUltimoAcceso', () => {
    it('should update ultimo acceso', async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsuario),
      });

      await repository.updateUltimoAcceso(validObjectId);

      expect(model.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a usuario', async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsuario),
      });

      await repository.softDelete(validObjectId);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        validObjectId,
        expect.objectContaining({
          isDeleted: true,
        })
      );
    });
  });
});
