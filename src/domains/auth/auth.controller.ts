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
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwTAuthGuard } from './auth.guard';
import { Request } from 'express';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Post('register')
  @HttpCode(201)
  @UseInterceptors(ClassSerializerInterceptor)
  public register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(201)
  public async login(
    @Body() body: LoginDto,
  ): Promise<{ token: string; status: number }> {
    const token = await this.authService.login(body);
    return { token: token, status: 201 };
  }

  @Get('me')
  @HttpCode(200)
  @UseGuards(JwTAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUserByToken(@Req() request: Request): Promise<User> {
    return this.authService.getOneUserByToken(request);
  }
}
