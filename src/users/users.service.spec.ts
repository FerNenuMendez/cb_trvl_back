/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  // 1. Creamos el Mock del Modelo de Mongoose
  // Necesitamos simular findOne, findById, y la capacidad de crear instancias (new Model)
  const mockUserModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ id: 'new-id', ...dto }),
    })),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ id: 'new-id', ...dto }),
    })),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  // Función auxiliar para simular el .exec() de Mongoose
  const mockExec = (value: any) => ({
    exec: jest.fn().mockResolvedValue(value),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario si el email existe', async () => {
      const mockUser = { email: 'test@test.com', name: 'Fer' };
      model.findOne.mockReturnValue(mockExec(mockUser));

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('debería lanzar ConflictException si el email ya existe', async () => {
      model.findOne.mockReturnValue(mockExec({ email: 'existe@test.com' }));

      await expect(
        service.create({
          email: 'existe@test.com',
          name: 'Fer',
          password: '123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      model.findById.mockReturnValue(mockExec(null));

      await expect(service.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
