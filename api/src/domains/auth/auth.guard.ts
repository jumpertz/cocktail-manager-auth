import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { User } from '../users/users.entity';

@Injectable()
export class JwTAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  public handleRequest<TUser = User>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request: Request = context.switchToHttp().getRequest();

    return request !== undefined;
  }
}
