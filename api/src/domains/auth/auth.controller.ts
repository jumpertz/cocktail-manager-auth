import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  public register(@Body() body: RegisterDto): Promise<User | HttpException> {
    return this.authService.register(body);
  }

  @Post('login')
  public login(@Body() body: LoginDto): Promise<string | HttpException> {
    return this.authService.login(body);
  }
}
