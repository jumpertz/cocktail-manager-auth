import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String, example: 'John', description: 'firstname' })
  @IsAlpha()
  firstname?: string;
  @ApiProperty({ type: String, example: 'Doe', description: 'lastname' })
  @IsAlpha()
  lastname?: string;
}
