import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      // Mock implementations of the UsersService methods
      getAllUsers: jest.fn(),
      getOneUser: jest.fn(),
      updatePassword: jest.fn(),
      updateRole: jest.fn(),
      updateProfile: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should get all users', async () => {
    const users = []; // substitute with an array of users
    jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(users);
    expect(await usersController.getAllUsers()).toBe(users);
  });

  it('should get one user', async () => {
    const user = {
      id: '12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword',
      isAdmin: false,
    };

    jest.spyOn(usersService, 'getOneUser').mockResolvedValue(user);

    expect(await usersController.getOneUser('12345')).toBe(user);
  });

  it('should update a user password', async () => {
    const body = {
      oldPwd: 'oldPassword',
      newPwd: 'newPassword',
    };
    const result = { message: 'User updated succesfully' };

    jest.spyOn(usersService, 'updatePassword').mockResolvedValue(result);

    expect(await usersController.updatePassword(body)).toBe(result);
    expect(usersService.updatePassword).toHaveBeenCalledWith(body);
  });

  it('should update a user role', async () => {
    const id = '12345';
    const body: UpdateUserRoleDto = {
      role: 'ADMIN',
    };
    const result = { message: 'User role updated succesfully' };

    jest.spyOn(usersService, 'updateRole').mockResolvedValue(result);

    expect(await usersController.updateRole(id, body)).toBe(result);
    expect(usersService.updateRole).toHaveBeenCalledWith(id, body.role);
  });

  it('should update a user profile', async () => {
    const body: UpdateUserDto = {
      firstName: 'New Name',
      lastName: 'New Last Name',
    };
    const result = { message: 'User updated succesfully' };

    jest.spyOn(usersService, 'updateProfile').mockResolvedValue(result);

    expect(await usersController.updateProfile(body)).toBe(result);
    expect(usersService.updateProfile).toHaveBeenCalledWith(body);
  });

  it('should delete a user', async () => {
    const result = { message: 'User deleted successfully' };
    jest.spyOn(usersService, 'deleteUser').mockResolvedValue(result);
    expect(await usersController.deleteUser('12345')).toBe(result);
  });
});
