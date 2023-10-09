import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    example: 'lepims',
    required: true
 })
  username: string;
  
  @ApiProperty({
    example: 'email@example.com',
    required: true
 })
  email: string;
  
  @ApiProperty({
    example: 'password123',
    required: true
 })
  password: string;
  
  @ApiProperty({
    example: ["admin", "user"],
    required: true
 })
  roles: string[];
  
  stripeCustomerId: string;
}
