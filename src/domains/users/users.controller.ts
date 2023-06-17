import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoleAdminGuard } from '../auth/admin.guard';
import { JwTAuthGuard } from '../auth/auth.guard';
import { ChangePasswordDto } from './dto/update-password.dto';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Inject(UsersService)
  private readonly userService: UsersService;

  @Get()
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwTAuthGuard, RoleAdminGuard)
  public getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  @HttpCode(200)
  @UseGuards(JwTAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<User> {
    return this.userService.getOneUser(id);
  }

  @Patch('/password')
  @HttpCode(200)
  @UseGuards(JwTAuthGuard)
  public updatePassword(@Body() body: ChangePasswordDto): Promise<object> {
    return this.userService.updatePassword(body);
  }

  @Patch('/:id/role')
  @HttpCode(200)
  @UseGuards(JwTAuthGuard, RoleAdminGuard)
  public updateRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserRoleDto,
  ): Promise<object> {
    return this.userService.updateRole(id, body.role);
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(JwTAuthGuard)
  public updateProfile(@Body() body: UpdateUserDto): Promise<object> {
    return this.userService.updateProfile(body);
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwTAuthGuard, RoleAdminGuard)
  public deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<object> {
    return this.userService.deleteUser(id);
  }
}
