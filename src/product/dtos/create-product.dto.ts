import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty({
    example: 'Product name example',
    required: true
  })
  name: string;

  @ApiProperty({
    example: 'Description of a product.',
    required: true
  })
  description: string;

  @ApiProperty({
    example: '150',
    required: true
  })
  price: string;

  @ApiProperty({
    example: 'Hoodie',
    required: true
  })
  category: string;

  imgUrl?: string;
}