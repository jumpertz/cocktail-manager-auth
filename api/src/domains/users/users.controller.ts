import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleAdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ChangePasswordDto } from './dto/update-password.dto';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Inject(UsersService)
  private readonly userService: UsersService;

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  public getAllUsers(): Promise<User[] | HttpException> {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUser(@Param('id') id: string): Promise<User | HttpException> {
    return this.userService.getOneUser(id);
  }

  @Patch('/password')
  @UseGuards(JwtAuthGuard)
  public updatePassword(
    @Body() body: ChangePasswordDto,
  ): Promise<object | HttpException> {
    return this.userService.updatePassword(body);
  }

  @Patch('/:id/role')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  public updateRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ): Promise<object | HttpException> {
    return this.userService.updateRole(id, body.role);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  public updateProfile(
    @Body() body: UpdateUserDto,
  ): Promise<object | HttpException> {
    return this.userService.updateProfile(body);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  public deleteUser(@Param('id') id: string): Promise<object | HttpException> {
    return this.userService.deleteUser(id);
  }
}
