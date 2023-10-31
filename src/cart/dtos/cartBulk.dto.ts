export class CartBulkDTO {
  _id: string;
  userId: string;
  items: BulkItemDTO[];
  totalPrice: number;
  cartState: string;
}

class BulkItemDTO {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isSold: boolean;
    imgUrl: string;
  };
  quantity: number;
  subTotalPrice: number;
}
