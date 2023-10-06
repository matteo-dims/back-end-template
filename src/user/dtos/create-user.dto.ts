import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateUserDTO {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsArray()
  @IsOptional()
  roles: string[];

  @IsString()
  @IsOptional()
  stripeCustomerId: string;
}
