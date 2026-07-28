import { useState } from "react";
import { ProductCard } from "./components/ProductCard";
import { ProductDialog } from "./components/ProductDialog";
import { products } from "./data/products";
import type { Product } from "./types";

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="StackShelf home">
          <span className="brand-mark" aria-hidden="true">S</span>
          StackShelf
        </a>
        <span className="header-note">Curated tools for product teams</span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Team software directory</p>
          <h1 id="page-title">Find the right tool for the work.</h1>
          <p>Compare focused products for engineering, design, and analytics teams.</p>
        </section>

        <section className="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2 id="catalog-title">All products</h2>
            </div>
            <p><strong>{products.length}</strong> products</p>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>StackShelf benchmark fixture</p>
      </footer>

      <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

export default App;
