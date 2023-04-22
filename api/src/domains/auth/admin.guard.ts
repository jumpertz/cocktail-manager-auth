import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class RoleAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
    return context.switchToHttp().getRequest().user.isAdmin;
  }
}
