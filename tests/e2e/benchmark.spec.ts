import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("functional requirements", () => {
  test("[F10] search filters products after a debounce", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("searchbox", { name: "Search products" });

    await search.fill("trace");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Traceboard" })).toBeVisible();
  });

  test("[F6] category filter shows only matching products", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Category" }).selectOption("Design");

    await expect(page.getByTestId("product-card")).toHaveCount(6);
    await expect(
      page.getByTestId("product-card").getByText("Developer Tools", { exact: true }),
    ).toHaveCount(0);
  });

  test("[F5] search and category filters compose", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Category" }).selectOption("Analytics");
    await page.getByRole("searchbox", { name: "Search products" }).fill("event");

    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "EventGuard" })).toBeVisible();
  });

  test("[F5] pagination renders six items and navigates", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("product-card")).toHaveCount(6);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("heading", { name: "Gridline" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Traceboard" })).toHaveCount(0);
  });

  test("[F5] filter state is stored in the URL and survives reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search products" }).fill("kit");
    await page.getByRole("combobox", { name: "Category" }).selectOption("Design");

    await expect(page).toHaveURL(/q=kit/);
    await expect(page).toHaveURL(/category=Design/);
    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Search products" })).toHaveValue("kit");
    await expect(page.getByRole("combobox", { name: "Category" })).toHaveValue("Design");
  });

  test("[F4] browser history restores the previous filter state", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("searchbox", { name: "Search products" });

    await search.fill("trace");
    await expect(page).toHaveURL(/q=trace/);
    await search.fill("grid");
    await expect(page).toHaveURL(/q=grid/);
    await page.goBack();

    await expect(search).toHaveValue("trace");
    await expect(page.getByRole("heading", { name: "Traceboard" })).toBeVisible();
  });
});

test.describe("regression safety", () => {
  test("[R6] the original catalog data remains available", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Find the right tool for the work." })).toBeVisible();

    await page.getByRole("combobox", { name: "Category" }).selectOption("Design");
    await expect(page.getByText("6 products")).toBeVisible();
  });

  test("[R6] product details dialog still opens and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View details" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Traceboard" })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("[R4] mobile layout has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test("[R4] normal usage produces no browser errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await page.getByRole("button", { name: "View details" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    expect(errors).toEqual([]);
  });
});

test.describe("resilience and accessibility", () => {
  test("[Q3] empty results provide a clear recovery action", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search products" }).fill("not-a-real-product");

    await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByTestId("product-card")).toHaveCount(6);
  });

  test("[Q2] filtering exposes a loading status", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search products" }).fill("trace");

    await expect(page.getByRole("status")).toContainText("Loading products");
    await expect(page.getByRole("heading", { name: "Traceboard" })).toBeVisible();
  });

  test("[Q2] primary controls and product details are keyboard operable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    let foundSearch = false;
    for (let index = 0; index < 6; index += 1) {
      foundSearch = await page.getByRole("searchbox", { name: "Search products" }).evaluate(
        (element) => element === document.activeElement,
      ).catch(() => false);
      if (foundSearch) break;
      await page.keyboard.press("Tab");
    }
    expect(foundSearch).toBe(true);

    await page.getByRole("button", { name: "View details" }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("[Q3] page has no serious or critical automated accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const severeViolations = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(severeViolations).toEqual([]);
  });
});
