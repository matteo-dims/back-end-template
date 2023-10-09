import { IsNumber, IsString } from "class-validator";

import { ApiProperty } from '@nestjs/swagger';

export class ItemDTO {
  @IsString()
  @ApiProperty({
    example: '652008be1af168447cb27991',
    required: true
  })
  productId: string;
  
  @IsString()
  
  @ApiProperty({
    example: 'Product name example',
    required: true
  })
  name: string;
  
  @IsString()
  
  @ApiProperty({
    example: '3',
    required: true
  })
  quantity: number;
  
  @IsString()
  
  @ApiProperty({
    example: '13',
    required: true
  })
  price: number;
}
