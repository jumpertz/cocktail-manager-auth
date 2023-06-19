import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from '../auth/auth.helper';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: JwtService, useValue: {} },
        AuthHelper,
        { provide: getRepositoryToken(User), useValue: mockRepository },
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
});
