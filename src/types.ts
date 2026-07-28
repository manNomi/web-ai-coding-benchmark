export type ProductCategory = "Developer Tools" | "Design" | "Analytics";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  rating: number;
}
