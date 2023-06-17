import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { AuthHelper } from '../auth/auth.helper';
import { ChangePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './users.entity';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();

    if (!users) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }

    return users;
  }

  public async getOneUser(id: string): Promise<User> {
    if (!id) {
      throw new HttpException('You must provide an id', HttpStatus.BAD_REQUEST);
    }

    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async updatePassword(body: ChangePasswordDto): Promise<object> {
    const reqUser: UserDto = <UserDto>this.request.user;

    if (!reqUser.id)
      throw new HttpException(
        'You must provide all the informations',
        HttpStatus.BAD_REQUEST,
      );

    const user: User | null = await this.userRepository.findOneBy({
      id: reqUser.id,
    });

    if (!user || !this.helper.validPwd(user, body.oldPwd)) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }

    user.password = await this.helper.hashPwd(body.newPwd);

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async updateProfile(body: UpdateUserDto): Promise<object> {
    if (!body.firstName && !body.lastName)
      throw new HttpException(
        'You must provide all the informations',
        HttpStatus.BAD_REQUEST,
      );

    const reqUser: UserDto = <UserDto>this.request.user;

    const user: User | null = await this.userRepository.findOneBy({
      id: reqUser.id,
    });

    if (!user)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);

    if (body.firstName && body.firstName?.length > 0) {
      user.firstName = body.firstName;
    }

    if (body.lastName && body.lastName?.length > 0) {
      user.lastName = body.lastName;
    }

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async updateRole(id: string, role: string): Promise<object> {
    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);

    user.isAdmin = role === 'ADMIN';

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async deleteUser(id: string): Promise<object> {
    if (!id)
      throw new HttpException(
        'You must provide all the informations',
        HttpStatus.BAD_REQUEST,
      );

    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);

    await this.userRepository.remove(user);

    return { message: 'User deleted succesfully' };
  }
}
