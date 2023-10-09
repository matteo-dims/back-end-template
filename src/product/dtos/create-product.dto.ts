import { IsNumber, IsOptional, IsString } from "class-validator";

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty({
    example: 'Product name example',
    required: true
  })
  @IsString()
  name: string;

  @IsString()

  @ApiProperty({
    example: 'Description of a product.',
    required: true
  })
  description: string;

  @IsString()

  @ApiProperty({
    example: '150',
    required: true
  })
  price: string;

  @ApiProperty({
    example: 'Hoodie',
    required: true
  })

  @IsString()
  category: string;

  @IsString()
  @IsOptional()

  imgUrl?: string;
}