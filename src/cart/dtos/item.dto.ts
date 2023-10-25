import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

import { ApiProperty } from '@nestjs/swagger';
import { Product } from "src/product/schemas/product.schema";

export class ItemDTO {
  @IsString()
  @ApiProperty({
    example: '652008be1af168447cb27991',
    required: true
  })
  productId: string;

  @IsString()
  @ApiProperty({
    example: '3',
    required: true
  })
  quantity: number;
}
