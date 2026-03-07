import { expect, test } from "@playwright/test";

async function gotoDocsSection(page: import("@playwright/test").Page, id: string) {
  await page.goto(`/en/docs/underverse#${id}`);
  const section = page.locator(`section#${id}`);
  await expect(section).toBeVisible();
  await section.scrollIntoViewIfNeeded();
  return section;
}

test.describe("Docs E2E", () => {
  test("DataTable section paginates on the docs page", async ({ page }) => {
    const section = await gotoDocsSection(page, "data-table");

    await expect(section.getByRole("tab", { name: /preview/i })).toHaveAttribute("aria-selected", "true");
    await expect(section.getByText("Delete (0)")).toBeVisible();
    await expect(section.getByText(/^User 1$/)).toBeVisible();

    await section.getByRole("button", { name: "2" }).click();

    await expect(section.getByText(/^User 21$/)).toBeVisible();
    await expect(section.getByText(/^User 1$/)).not.toBeVisible();
  });

  test("CalendarTimeline section opens the built-in create sheet and creates an event", async ({ page }) => {
    const section = await gotoDocsSection(page, "calendar-timeline");

    await expect(section.getByRole("button", { name: "Create: Click (custom)" })).toBeVisible();
    await section.getByRole("button", { name: "Create: Click (custom)" }).click();
    await section.getByRole("button", { name: /^New event$/i }).click();

    await expect(page.getByText("Create event")).toBeVisible();
    await page.getByRole("button", { name: "Create", exact: true }).click();

    await expect(page.getByText("Create event")).not.toBeVisible();
    await expect(section.getByLabel("New event")).toBeVisible();
  });

  test("UEditor section updates editor content on the docs page", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Initial E2E coverage is chromium-only.");

    const section = await gotoDocsSection(page, "ueditor");
    const editor = section.locator(".ProseMirror").first();
    const uniqueText = "PWCHECK";

    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.type(uniqueText);

    await expect(editor).toContainText(uniqueText);
    await expect(section.locator("div").filter({ hasText: "Raw HTML from the editor" }).first()).toContainText(uniqueText);
  });
});
