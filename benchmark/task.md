# Benchmark Task: Evolve the Existing Product Catalog

You are working in an existing React and TypeScript product catalog named StackShelf. Do not replace the application or its visual identity. Extend the current implementation while preserving the product details dialog and the existing data model.

## Requirements

1. Add a search input with the accessible name `Search products`.
   - Match product name and description case-insensitively.
   - Debounce filtering by 300 ms.
2. Add a category select with the accessible name `Category`.
   - Options: `All categories`, `Developer Tools`, `Design`, and `Analytics`.
3. Search and category filters must compose.
4. Show six products per page.
   - Provide `Previous` and `Next` buttons inside navigation named `Pagination`.
   - Reset to page 1 when search or category changes.
5. Synchronize state with URL query parameters.
   - Search: `q`
   - Category: `category`
   - Page: `page`
   - Reload and browser back/forward must restore the visible state.
6. During the 300 ms debounce, expose a live status containing `Loading products`.
7. When no result exists, show heading `No products found` and button `Clear filters`.
8. Preserve the product details dialog and all 18 source products.
9. The page must remain responsive without horizontal overflow at 390, 768, and 1440 px.
10. Primary controls and the details dialog must be keyboard accessible. Do not introduce serious or critical axe accessibility violations.

## Constraints

- Work inside the existing architecture and reuse the current components and data.
- Do not change benchmark tests or product fixture data.
- Do not add a state-management or UI framework for this task.
- Keep unrelated files unchanged.
- Add focused unit tests when you extract non-trivial filtering, pagination, or URL-state logic.
- Run `npm run verify:base` and `npm run test:e2e` before finishing.
