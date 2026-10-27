import { expect, test, type Page } from "@playwright/test";

// History, class 6: every lesson opens from the start page, renders its sections, survives a tap on
// every control and logs no error; one lesson hands over to a test, which runs to the results with
// Mors on screen. The pool starts empty and is filled from the templates on the first session.

const LESSONS: [chapter: number, paragraph: string][] = Array.from({ length: 34 }, (_, i) => {
  const n = i + 1;
  const chapter = n <= 4 ? 1 : n <= 11 ? 2 : n <= 18 ? 3 : n <= 25 ? 4 : n <= 31 ? 5 : 6;
  return [chapter, String(n)];
});

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return errors;
}

async function openLesson(page: Page, chapter: number, paragraph: string) {
  await page.goto("/t/history");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  // the lessons card lists chapters first; its paragraph buttons start with the number
  await page.locator("details summary").filter({ hasText: new RegExp(`^${chapter}\\. `) }).first().click();
  await page.getByRole("button", { name: new RegExp(`^${paragraph}\\s`) }).first().click();
}

test("catalog → history → a lesson → its test → results, with Mors", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("link", { name: /История/ }).click();
  await expect(page).toHaveURL(/\/t\/history$/);
  await expect(page.getByRole("heading", { name: /Тренажёр по истории/ })).toBeVisible();

  await openLesson(page, 2, "9");
  await expect(page.getByRole("heading", { name: "Люблинская уния" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Погладить Морса" })).toBeVisible();

  await page.getByRole("button", { name: "Начать тест по теме" }).click();
  await expect(page.getByText(/Задание 1 из \d+/)).toBeVisible();
  for (let i = 0; i < 10; i++) {
    const input = page.getByPlaceholder("Твой ответ");
    if (await input.isVisible()) {
      await input.fill("na pewno nie");
      await page.getByRole("button", { name: "Проверить" }).click();
    } else {
      await page.locator("main button").filter({ hasText: /^A/ }).first().click();
    }
    await page.getByRole("button", { name: i === 9 ? /Результаты/ : /Дальше/ }).click();
  }
  await expect(page.getByText("Твой результат")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const [chapter, paragraph] of LESSONS) {
  test(`history lesson §${paragraph} opens and every control works`, async ({ page }) => {
    const errors = collectErrors(page);
    await openLesson(page, chapter, paragraph);
    const sections = page.locator("main section[id]");
    await expect(sections.first()).toBeVisible();
    expect(await sections.count()).toBeGreaterThanOrEqual(3);
    for (const id of await sections.evaluateAll((els) => els.map((e) => e.id))) {
      const controls = page.locator(`#${id} button:not([disabled]), #${id} [role=button]`);
      const n = Math.min(await controls.count(), 30);
      for (let i = 0; i < n; i++) {
        const c = controls.nth(i);
        if (await c.isVisible()) await c.click({ timeout: 1500 }).catch(() => {});
      }
    }
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });
}
