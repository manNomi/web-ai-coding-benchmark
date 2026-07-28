import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  return (
    <article className="product-card" data-testid="product-card">
      <div className="card-heading">
        <span className="category-label">{product.category}</span>
        <span className="rating" aria-label={`${product.rating} out of 5 stars`}>
          {product.rating.toFixed(1)}
        </span>
      </div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div className="card-footer">
        <strong>${product.price}/mo</strong>
        <button type="button" onClick={() => onOpen(product)}>
          View details
        </button>
      </div>
    </article>
  );
}
