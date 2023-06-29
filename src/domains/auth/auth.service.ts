import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

    body.password = await this.helper.hashPwd(body.password);

    // Créez une nouvelle instance de l'entité User pour éviter d'ajouter des propriétés non désirées
    const newUser = new User();
    newUser.firstname = body.firstname;
    newUser.lastname = body.lastname;
    newUser.email = body.email;
    newUser.password = body.password;
    newUser.role = 'USER'; // Attribuez le rôle 'USER' par défaut lors de l'inscription

    return this.usersRepository.save(newUser);
  }

  public async login(body: LoginDto): Promise<string> {
    const exists: User | null = await this.usersRepository.findOneBy({
      email: body.email,
    });

    if (!exists) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }

    const isPwdValid = this.helper.validPwd(exists, body.password);

    if (!isPwdValid) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }

    return this.helper.generateToken(exists);
  }
}
