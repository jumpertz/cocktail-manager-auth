import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDto } from '../users/dto/user.dto';
import { Request } from 'express';
import { NotFoundError } from 'src/exceptions';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async register(body: RegisterDto): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({
      email: body.email,
    });

    if (user) throw new BadRequestException('Email already exists');

    const newUser: User = this.usersRepository.create(body);

    this.usersRepository.insert(newUser);

    return newUser;
  }

  public async login(body: LoginDto): Promise<string> {
    const exists: User | null = await this.usersRepository.findOneBy({
      email: body.email,
    });

    if (!exists) {
      throw NotFoundError('user', body.email);
    }

    const isPwdValid = this.helper.validPwd(exists, body.password);

    if (!isPwdValid) {
      throw NotFoundError('user', body.email);
    }

    return this.helper.generateToken(exists);
  }

  public async getOneUserByToken(request: Request): Promise<User> {
    const reqUser: UserDto = <UserDto>request.user;

    const user: User | null = await this.usersRepository.findOneBy({
      id: reqUser.id,
    });

    if (!user) {
      throw new NotFoundException('Could not find user');
    }

    return user;
  }
}
