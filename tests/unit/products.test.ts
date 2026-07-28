import { describe, expect, it } from "vitest";
import { products } from "../../src/data/products";

describe("product fixture", () => {
  it("keeps a stable 18-product data set", () => {
    expect(products).toHaveLength(18);
    expect(new Set(products.map((product) => product.id)).size).toBe(18);
  });

  it("contains six products in each benchmark category", () => {
    const counts = products.reduce<Record<string, number>>((result, product) => {
      result[product.category] = (result[product.category] ?? 0) + 1;
      return result;
    }, {});

    expect(counts["Developer Tools"]).toBe(6);
    expect(counts.Design).toBe(6);
    expect(counts.Analytics).toBe(6);
  });
});
