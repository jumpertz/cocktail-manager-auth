import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @EventPattern('register')
  @UseInterceptors(ClassSerializerInterceptor)
  public register(@Payload() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @EventPattern('login')
  public login(@Payload() body: LoginDto): Promise<string> {
    return this.authService.login(body);
  }

  @EventPattern('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUserByToken(@Payload() request: Request): Promise<User> {
    return this.authService.getOneUserByToken(request);
  }
}