import { ApiProperty } from '@nestjs/swagger';

export class ItemDTO {
  @ApiProperty({
    example: '652008be1af168447cb27991',
    required: true
  })
  productId: string;
  
  @ApiProperty({
    example: 'Product name example',
    required: true
  })
  name: string;
  
  @ApiProperty({
    example: '3',
    required: true
  })
  quantity: number;
  
  @ApiProperty({
    example: '13',
    required: true
  })
  price: number;
}
