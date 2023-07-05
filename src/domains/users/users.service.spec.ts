import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthHelper } from '../auth/auth.helper';

describe('UsersService', () => {
  let usersService;
  let userRepository;
  let authHelper;
  let request;

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
            save: jest.fn(),
          }),
        },
        {
          provide: AuthHelper,
          useFactory: () => ({
            validPwd: jest.fn().mockReturnValue(true),
            generateToken: jest.fn().mockReturnValue('token'),
            decodeToken: jest.fn(),
            hashPwd: jest.fn(),
          }),
        },
      ],
    }).compile();

    usersService = await module.resolve<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    authHelper = module.get<AuthHelper>(AuthHelper);
    request = { user: { id: '123' } };

    jest.spyOn(usersService, 'getRequest').mockReturnValue(request);
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
  describe('updatePassword', () => {
    let request;
    beforeEach(async () => {
      request = { user: { id: '123' } };
      usersService = await module.resolve<UsersService>(UsersService);
    });

    it('doit lancer une exception si les informations ne sont pas fournies', async () => {
      const dto = { oldPwd: '', newPwd: '' };

      await expect(usersService.updatePassword(dto)).rejects.toThrow(
        'You must provide all the informations',
      );
    });

    it("doit lancer une exception si l'id utilisateur n'est pas trouvé", async () => {
      const dto = { oldPwd: 'oldPwd', newPwd: 'newPwd' };
      userRepository.findOne.mockResolvedValue(null);

      await expect(usersService.updatePassword(dto)).rejects.toThrow(
        'Could not find user',
      );
    });

    it("doit lancer une exception si l'ancien mot de passe est invalide", async () => {
      const dto = { oldPwd: 'oldPwd', newPwd: 'newPwd' };
      const user = { id: '123', password: 'hashedPwd' };
      userRepository.findOne.mockResolvedValue(user);
      authHelper.validPwd.mockReturnValue(false);

      await expect(usersService.updatePassword(dto)).rejects.toThrow(
        'Could not find user',
      );
    });

    it("doit mettre à jour le mot de passe de l'utilisateur", async () => {
      const dto = { oldPwd: 'oldPwd', newPwd: 'newPwd' };
      const user = { id: '123', password: 'hashedPwd' };
      userRepository.findOne.mockResolvedValue(user);
      authHelper.validPwd.mockReturnValue(true);
      authHelper.hashPwd.mockResolvedValue('newHashedPwd');

      const result = await usersService.updatePassword(dto);

      expect(result).toEqual({ message: 'User updated succesfully' });
      expect(user.password).toBe('newHashedPwd');
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });
});
