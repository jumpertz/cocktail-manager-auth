import { Test, TestingModule } from '@nestjs/testing';
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
  let jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthHelper,
          useFactory: () => ({
            validPwd: jest.fn().mockReturnValue(true),
            generateToken: jest.fn().mockReturnValue('token'),
            decodeToken: jest.fn(),
            hashPwd: jest.fn(),
          }),
        },
        {
          provide: getRepositoryToken(User),
          useFactory: () => ({
            findOneBy: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
          }),
        },
        {
          provide: JwtService,
          useFactory: () => ({
            decode: jest.fn().mockReturnValue({ id: 'id', email: 'email' }),
          }),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    authHelper = module.get<AuthHelper>(AuthHelper);
  });

  it('doit être défini', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it("doit retourner une exception si l'email existe déjà", async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(userData);

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already exists',
      );
    });

    it("doit créer un nouvel utilisateur si l'email n'existe pas", async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);
      userRepository.create = jest.fn().mockReturnValueOnce(userData);
      userRepository.insert = jest.fn();

      const result = await authService.register(userData);

      expect(result).toEqual(userData);
    });
  });

  describe('login', () => {
    it("should throw an error if user doesn'nt exists", async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);

      await expect(authService.login(userData)).rejects.toThrow(
        `Could not find user ${userData.email}`,
      );
    });

    it('doit retourner une exception si le mot de passe est invalide', async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(userData);
      authHelper.validPwd = jest.fn().mockReturnValueOnce(false);

      await expect(authService.login(userData)).rejects.toThrow(
        'Invalid password',
      );
    });

    it("doit retourner un jeton si l'email et le mot de passe sont valides", async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      const token = 'token';
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(userData);
      authHelper.validPwd = jest.fn().mockReturnValueOnce(true);
      authHelper.generateToken = jest.fn().mockReturnValueOnce(token);

      const result = await authService.login(userData);

      expect(result).toEqual(token);
    });
  });

  describe('getOneUserByToken', () => {
    describe('getOneUserByToken', () => {
      it("doit retourner une exception si l'utilisateur n'existe pas", async () => {
        const token = 'token';
        const decodedToken = { id: '1', email: 'test@test.com' };
        jwtService.decode = jest.fn().mockReturnValueOnce(decodedToken);
        userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);
        await expect(authService.getOneUserByToken(token)).rejects.toThrow(
          'Could not find user',
        );
      });

      it('doit retourner un utilisateur si le jeton est valide', async () => {
        const token = 'token';
        const decodedToken = { id: '1', email: 'test@test.com' };
        const user = { id: '1', email: 'test@test.com', password: 'password' };
        jwtService.decode = jest.fn().mockReturnValueOnce(decodedToken);
        userRepository.findOneBy = jest.fn().mockResolvedValueOnce(user);

        const result = await authService.getOneUserByToken(token);

        expect(result).toEqual(user);
      });
    });
  });
});
