export interface GetCartBulkDTO {
    cart: Cart[];
}

interface Cart {
    _id:        string;
    items:      Item[];
    totalPrice: number;
    cartState:  string;
}

interface Item {
    product:       Object;
    quantity:      number;
    subTotalPrice: number;
}

interface Product {
    _id:         string;
    name:        string;
    description: string;
    price:       number;
    category:    string;
    isSold:      boolean;
}