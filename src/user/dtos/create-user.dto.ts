import { IsOptional, IsString } from "class-validator";

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsString()
  @ApiProperty({
    example: 'lepims',
    required: true
 })
  username: string;

  @IsString()
  
  @ApiProperty({
    example: 'email@example.com',
    required: true
 })
  email: string;

  @IsString()
  
  @ApiProperty({
    example: 'password123',
    required: true
 })
  password: string;
  
  roles: string[];

  @IsString()
  @IsOptional()
  stripeCustomerId: string;
}


