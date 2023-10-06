import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  price: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;
}