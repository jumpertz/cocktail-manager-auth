import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';

export type TokenRequest = {
  token: string
  user?: User
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  @Inject(AuthService)
  private readonly authService: AuthService;

  public async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req: TokenRequest = context.switchToRpc().getData();

    if (!req.token) {
      return false;
    }
    req.user = await this.authService.getOneUserByToken(req.token);
    return true;
  }
}
