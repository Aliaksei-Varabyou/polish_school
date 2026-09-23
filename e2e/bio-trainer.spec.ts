import { expect, test, type Page } from "@playwright/test";

// Biology has no LLM: every task comes from the pool, which the Playwright web server seeds by
// running the render script before starting the API. The spec answers wrongly on purpose — the
// correct answers live in the pool and the browser cannot know them — which makes the score, the
// mistake list and the rule-based feedback all deterministic.

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return errors;
}

test("catalog → biology: 5 tasks answered wrongly → results → analysis", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");

  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("link", { name: /Биология/ }).click();
  await expect(page).toHaveURL(/\/t\/bio$/);
  await expect(page.getByRole("heading", { name: /Тренажёр по биологии/ })).toBeVisible();

  // one year of one track: no class or level picker, and all 11 działy are offered
  const boxes = page.locator("input[type=checkbox]");
  await expect(boxes).toHaveCount(11);
  await boxes.nth(9).check(); // Układ hormonalny

  await page.getByRole("radio", { name: "Ввод ответа", exact: true }).click();
  await page.locator("select").selectOption("5");
  await page.getByRole("button", { name: "Начать" }).click();

  await expect(page.getByText("Задание 1 из 5")).toBeVisible();
  // the portal hides the language switch while a session is running
  await expect(page.getByRole("radio", { name: "PL", exact: true })).toHaveCount(0);

  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`Задание ${i + 1} из 5`)).toBeVisible();
    await page.getByPlaceholder("Твой ответ").fill("na pewno nie ta odpowiedź");
    await page.getByRole("button", { name: "Проверить" }).click();
    await expect(page.getByText("Неверно").first()).toBeVisible();
    await expect(page.getByText("Правильный ответ:")).toBeVisible();
    await page.getByRole("button", { name: i === 4 ? /Результаты/ : /Дальше/ }).click();
  }

  await expect(page.getByText("0 из 5")).toBeVisible();
  await expect(page.getByText("Ошибки")).toBeVisible();

  // feedback is computed from the results, not generated — so it names the weak dział outright
  await page.getByRole("button", { name: /Разбор слабых мест/ }).click();
  await expect(page.getByText("Над чем поработать")).toBeVisible();
  await expect(page.getByText("Эндокринная система").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("biology session can be picked by cross-cutting theme instead of dział", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();

  await page.getByRole("radio", { name: "По теме", exact: true }).click();
  await expect(page.getByText("Сквозные темы")).toBeVisible();

  const themes = page.locator("input[type=checkbox]");
  const count = await themes.count();
  expect(count).toBeGreaterThan(0);
  await themes.nth(0).check(); // Гомеостаз и обратная связь

  await page.locator("select").selectOption("5");
  await page.getByRole("button", { name: "Начать" }).click();
  await expect(page.getByText("Задание 1 из 5")).toBeVisible();

  expect(errors).toEqual([]);
});
