import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthHelper } from '../auth/auth.helper';

describe('UsersService', () => {
  let usersService;
  let userRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: () => ({
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          }),
        },
        {
          provide: AuthHelper,
          useFactory: () => ({
            // Vous pouvez ajouter ici les méthodes que vous souhaitez simuler
          }),
        },
      ],
    }).compile();

    usersService = await module.resolve<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('getAllUsers', () => {
    it('doit retourner tous les utilisateurs', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      userRepository.find.mockResolvedValue(users);

      const result = await usersService.getAllUsers();

      expect(result).toEqual(users);
    });

    it("doit lancer une exception si aucun utilisateur n'est trouvé", async () => {
      userRepository.find.mockResolvedValue(null);

      await expect(usersService.getAllUsers()).rejects.toThrow(
        'No users found',
      );
    });
  });

  describe('getOneUser', () => {
    it('doit retourner un utilisateur', async () => {
      const user = { id: '123' };
      userRepository.findOneBy.mockResolvedValueOnce(user);

      const result = await usersService.getOneUser(user.id);

      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    });

    it("doit lancer une exception si aucun id n'est fourni", async () => {
      await expect(usersService.getOneUser(null)).rejects.toThrow(
        'You must provide an id',
      );
    });

    it("doit lancer une exception si aucun utilisateur n'est trouvé", async () => {
      const id = '123';
      userRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getOneUser(id)).rejects.toThrow(
        'Could not find user',
      );
    });
  });
});