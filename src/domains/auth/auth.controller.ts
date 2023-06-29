import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @EventPattern('registerUser')
  public register(@Payload() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @EventPattern('loginUser')
  public login(@Payload() body: LoginDto): Promise<string> {
    return this.authService.login(body);
  }
}