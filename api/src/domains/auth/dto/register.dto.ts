import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsEmail, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsAlpha()
  firstname: string;

  @ApiProperty({ example: 'Doe' })
  @IsAlpha()
  lastname: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @Length(8, 64)
  password: string;
}
