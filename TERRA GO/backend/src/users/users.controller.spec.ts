import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            getAllUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        nombre: 'Test User',
        rol: 'productor',
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await controller.getProfile('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          nombre: 'User 1',
          rol: 'productor',
        },
        {
          id: 2,
          email: 'user2@example.com',
          nombre: 'User 2',
          rol: 'inversor',
        },
      ];

      jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(usersService.getAllUsers).toHaveBeenCalled();
    });
  });
});