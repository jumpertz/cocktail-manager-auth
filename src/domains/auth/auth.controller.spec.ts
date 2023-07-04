import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';
import { JwtAuthGuard, TokenRequest } from './auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(new User()),
            login: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('doit être défini', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('doit enregistrer un utilisateur', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'john',
        lastName: 'Doe',
      };
      const user = await authController.register(dto);

      expect(user).toBeInstanceOf(User);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('doit renvoyer un token', async () => {
      const dto = { email: 'test@test.com', password: 'password' };
      const result = await authController.login(dto);

      expect(result).toEqual({
        token: 'token',
        status: '200',
      });
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('getOneUserByToken', () => {
    it('doit renvoyer un utilisateur', async () => {
      const req: TokenRequest = { token: 'token', user: new User() };
      const user = authController.getOneUserByToken(req);

      expect(user).toBeInstanceOf(User);
    });
  });
});