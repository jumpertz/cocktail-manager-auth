import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class RoleAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const reqUser: UserDto = <UserDto>request.user;

    return reqUser.role === 'ADMIN';
  }
}
