import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { AuthHelper } from './auth.helper';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let authService;
  let userRepository;
  let authHelper;

  beforeEach(async () => {
    const mockRepository = {
      findOneBy: jest.fn(),
      validPwd: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: {} },
        AuthService,
        AuthHelper,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: 'UserRepository', useClass: Repository },
        {
          provide: JwtService,
          useValue: {
            // Ici vous pouvez mocker les méthodes dont vous avez besoin
            sign: jest.fn(() => 'token'),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<Repository<User>>('UserRepository');
    authHelper = moduleRef.get<AuthHelper>(AuthHelper);
  });

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());

      await expect(
        authService.register({ email: 'test@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a new user if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(new User());
      jest.spyOn(userRepository, 'insert').mockResolvedValue(undefined);

      await expect(
        authService.register({ email: 'test@test.com' }),
      ).resolves.toBeInstanceOf(User);
    });
  });

  describe('login', () => {
    it('should throw an error if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@test.com', password: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if password is invalid', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());
      jest.spyOn(authHelper, 'validPwd').mockReturnValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a token if user exists and password is valid', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());
      jest.spyOn(authHelper, 'validPwd').mockReturnValue(true);
      jest.spyOn(authHelper, 'generateToken').mockReturnValue('token');

      await expect(
        authService.login({ email: 'test@test.com', password: 'test' }),
      ).resolves.toBe('token');
    });
  });

  describe('getOneUserByToken', () => {
    it('should throw an error if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        authService.getOneUserByToken({ user: { id: '1' } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a user if user exists', async () => {
      const user = new User();
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

      await expect(
        authService.getOneUserByToken({ user: { id: '1' } }),
      ).resolves.toBe(user);
    });
  });
});
