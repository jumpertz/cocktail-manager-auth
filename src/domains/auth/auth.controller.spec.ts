import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwTAuthGuard } from './auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(true),
            login: jest.fn().mockResolvedValue('jwt_token_mock'),
            getOneUserByToken: jest
              .fn()
              .mockResolvedValue({ id: 'test_user_id' }),
          },
        },
        JwTAuthGuard,
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should register a new user', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: 'test',
    };
    expect(await authController.register(dto)).toBeTruthy();
  });

  it('should login a user', async () => {
    const dto = { email: 'test@test.com', password: 'test' };
    expect(await authController.login(dto)).toEqual('jwt_token_mock');
  });

  it('should get a user by token', async () => {
    const req = { user: { id: 'test_user_id' } } as any;
    expect(await authController.getOneUserByToken(req)).toEqual({
      id: 'test_user_id',
    });
  });
});
