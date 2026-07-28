import { useEffect, useRef } from "react";
import type { Product } from "../types";

interface ProductDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDialog({ product, onClose }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(
    function synchronizeDialogState() {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (product && !dialog.open) dialog.showModal();
      if (!product && dialog.open) dialog.close();
    },
    [product],
  );

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
    >
      {product ? (
        <div>
          <span className="category-label">{product.category}</span>
          <h2 id="dialog-title">{product.name}</h2>
          <p>{product.description}</p>
          <dl>
            <div><dt>Monthly price</dt><dd>${product.price}</dd></div>
            <div><dt>Rating</dt><dd>{product.rating.toFixed(1)} / 5</dd></div>
          </dl>
          <button type="button" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
