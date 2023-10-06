import { IsNumber, IsString } from "class-validator";

export class ItemDTO {
  @IsString()
  productId: string;
  
  @IsString()
  name: string;
  
  @IsString()
  quantity: number;
  
  @IsString()
  price: number;
}
