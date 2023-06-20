import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from '../auth/auth.helper';
import { HttpException, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      validPwd: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: JwtService, useValue: {} },
        AuthHelper,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: REQUEST, useValue: { user: { id: '12345' } } },
      ],
    }).compile();

    usersService = await moduleRef.resolve<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const result = [
        {
          id: '12345',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'hashedPassword',
          isAdmin: false,
        },
      ];
      jest.spyOn(userRepository, 'find').mockResolvedValue(result);

      expect(await usersService.getAllUsers()).toBe(result);
    });

    it('should throw an HttpException when no users found', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(null);

      await expect(usersService.getAllUsers()).rejects.toThrow(
        new HttpException('No users found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getOneUser', () => {
    it('should return a user', async () => {
      const result = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(result);

      expect(await usersService.getOneUser('12345')).toBe(result);
    });

    it('should throw an error if no id is provided', async () => {
      try {
        await usersService.getOneUser(undefined);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      try {
        await usersService.getOneUser('12345');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updatePassword', () => {
    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      try {
        await usersService.getOneUser('12345');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error if reqUser.id is not provided', async () => {
      const changePasswordDto = {
        oldPwd: 'oldPassword',
        newPwd: 'newPassword',
      };

      // Simuler l'objet de demande sans user id
      const request = {
        user: {},
      };

      const mockRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
      };

      const mockHelper = {
        validPwd: jest.fn(),
        hashPwd: jest.fn(),
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
          { provide: AuthHelper, useValue: mockHelper },
          { provide: REQUEST, useValue: request },
        ],
      }).compile();

      usersService = await moduleRef.resolve<UsersService>(UsersService);

      try {
        await usersService.updatePassword(changePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error if user does not exist or old password is invalid', async () => {
      const userDto = {
        id: '12345',
      };
      const changePasswordDto = {
        oldPwd: 'oldPassword',
        newPwd: 'newPassword',
      };

      // Simuler l'objet de demande
      const request = {
        user: userDto,
      };

      const mockRepository = {
        // Simuler un utilisateur qui n'existe pas
        findOneBy: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };

      const mockHelper = {
        // Simuler un mot de passe invalide
        validPwd: jest.fn().mockReturnValue(false),
        hashPwd: jest.fn(),
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
          { provide: AuthHelper, useValue: mockHelper },
          { provide: REQUEST, useValue: request },
        ],
      }).compile();

      usersService = await moduleRef.resolve<UsersService>(UsersService);

      try {
        await usersService.updatePassword(changePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should successfully update password', async () => {
      const result = { message: 'User updated succesfully' };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'oldHashedPassword',
        isAdmin: false,
      };
      const userDto = {
        id: '12345',
      };
      const changePasswordDto = {
        oldPwd: 'oldPassword',
        newPwd: 'newPassword',
      };

      // Simuler l'objet de demande
      const request = {
        user: userDto,
      };

      const mockRepository = {
        findOneBy: jest.fn().mockResolvedValue(user),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockHelper = {
        validPwd: jest.fn().mockReturnValue(true),
        hashPwd: jest.fn().mockResolvedValue('newHashedPassword'),
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: getRepositoryToken(User), useValue: mockRepository },
          { provide: AuthHelper, useValue: mockHelper },
          { provide: REQUEST, useValue: request },
        ],
      }).compile();

      usersService = await moduleRef.resolve<UsersService>(UsersService);

      expect(await usersService.updatePassword(changePasswordDto)).toEqual(
        result,
      );
      expect(user.password).toEqual('newHashedPassword');
    });
  });

  describe('updateProfile', () => {
    it('should throw an error if firstName and lastName are not provided', async () => {
      const body = {};

      try {
        await usersService.updateProfile(body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      try {
        await usersService.getOneUser('12345');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should update firstName if provided', async () => {
      const body = { firstName: 'New Name' };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      const result = await usersService.updateProfile(body);

      expect(user.firstName).toEqual('New Name');
      expect(result).toEqual({ message: 'User updated succesfully' });
    });

    it('should update lastName if provided', async () => {
      const body = { lastName: 'New Last Name' };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      const result = await usersService.updateProfile(body);

      expect(user.lastName).toEqual('New Last Name');
      expect(result).toEqual({ message: 'User updated succesfully' });
    });

    it('should return success message when user update is successful', async () => {
      const body = {
        firstName: 'New Name',
        lastName: 'New Last Name',
      };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      const result = await usersService.updateProfile(body);

      expect(result).toEqual({ message: 'User updated succesfully' });
    });
  });

  describe('updateRole', () => {
    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      try {
        await usersService.updateRole('12345', 'ADMIN');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should update user role to admin if provided', async () => {
      const body = { isAdmin: 'true' };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'oldHashedPassword',
        isAdmin: false,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      const result = await usersService.updateRole(
        user.id,
        body.isAdmin === 'true' ? 'ADMIN' : 'USER',
      );

      expect(user.isAdmin).toEqual(true);
      expect(result).toEqual({ message: 'User updated succesfully' });
    });

    it('should update user role to user if provided', async () => {
      const body = { isAdmin: 'false' };
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'oldHashedPassword',
        isAdmin: false,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      const result = await usersService.updateRole(
        user.id,
        body.isAdmin === 'true' ? 'ADMIN' : 'USER',
      );

      expect(user.isAdmin).toEqual(false);
      expect(result).toEqual({ message: 'User updated succesfully' });
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if id is not provided', async () => {
      try {
        await usersService.deleteUser('');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      try {
        await usersService.deleteUser('12345');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should delete user if id is valid and user exists', async () => {
      const user = {
        id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      const mockRemove = jest
        .spyOn(userRepository, 'remove')
        .mockResolvedValue(undefined);

      const result = await usersService.deleteUser(user.id);

      expect(mockRemove).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'User deleted succesfully' });
    });
  });
});
