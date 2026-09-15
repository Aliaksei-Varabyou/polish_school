import { expect, test, type Page } from "@playwright/test";

// Runs against the mock LLM provider: every task is "a + b · c".
async function currentAnswer(page: Page): Promise<number> {
  const tex = await page.locator(".katex annotation").first().textContent();
  const [a, b, c] = (tex ?? "").match(/\d+/g)!.map(Number);
  return a + b * c;
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return errors;
}

async function answerTask(page: Page, index: number, total: number, makeWrong: boolean) {
  await expect(page.getByText(`Задача ${index + 1} из ${total}`)).toBeVisible();
  const answer = await currentAnswer(page);
  const input = page.getByPlaceholder("Твой ответ");

  if (await input.count()) {
    // fraction notation exercises the answer checker
    await input.fill(makeWrong ? String(answer + 1) : `${answer * 2}/2`);
    await page.getByRole("button", { name: "Проверить" }).click();
  } else {
    const choices = page.locator("main button:has(span.rounded-full)");
    const n = await choices.count();
    for (let k = 0; k < n; k++) {
      const text = ((await choices.nth(k).locator("span").last().textContent()) ?? "").trim();
      if ((text === String(answer)) !== makeWrong) {
        await choices.nth(k).click();
        break;
      }
    }
  }

  await expect(page.getByText(makeWrong ? "Неверно" : "Верно!").first()).toBeVisible();
  await page.getByRole("button", { name: index === total - 1 ? /Результаты/ : /Дальше/ }).click();
}

test("catalog → math: 10 tasks → results → analysis → try again", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");

  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Тренажёры" })).toBeVisible();
  await page.getByRole("link", { name: /Математика/ }).click();
  await expect(page).toHaveURL(/\/t\/math$/);
  await expect(page.getByRole("heading", { name: /Тренажёр математики/ })).toBeVisible();

  await page.getByRole("radio", { name: "Liceum", exact: true }).click();
  await page.getByRole("radio", { name: "2 класс", exact: true }).click();
  await page.getByRole("radio", { name: "Расширенный", exact: true }).click();

  const boxes = page.locator("input[type=checkbox]");
  await expect(boxes).toHaveCount(10);
  await boxes.nth(0).check();
  await boxes.nth(6).check();
  await page.locator("select").selectOption("10");
  await page.getByRole("button", { name: "Сгенерировать" }).click();

  // the portal hides the language switch while a session is running
  await expect(page.getByText("Задача 1 из 10")).toBeVisible();
  await expect(page.getByRole("radio", { name: "PL", exact: true })).toHaveCount(0);

  for (let i = 0; i < 10; i++) await answerTask(page, i, 10, i < 3);

  await expect(page.getByText("7 из 10")).toBeVisible();
  await expect(page.getByText("Ошибки")).toBeVisible();

  await page.getByRole("button", { name: /Анализ слабых мест/ }).click();
  await expect(page.getByText("[mock]").first()).toBeVisible();

  await page.getByRole("button", { name: /Пройти ещё раз/ }).click();
  await expect(page.getByText("Задача 1 из 10")).toBeVisible();

  expect(errors).toEqual([]);
});

test("interface language switch keeps settings", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/math");

  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.locator("input[type=checkbox]").nth(0).check();
  await page.getByRole("radio", { name: "PL", exact: true }).click();

  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expect(page.getByText("Trener matematyki")).toBeVisible();
  await expect(page.locator("input[type=checkbox]:checked")).toHaveCount(1);

  await page.reload();
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expect(page.locator("input[type=checkbox]:checked")).toHaveCount(1);

  await page.getByRole("link", { name: /Matema/ }).click();
  await expect(page.getByRole("heading", { name: "Trenażery" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("unknown trainer and unknown page", async ({ page }) => {
  await page.goto("/t/unknown");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await expect(page.getByText("Такого тренажёра нет")).toBeVisible();

  await page.goto("/no/such/page");
  await expect(page.getByText("Страница не найдена")).toBeVisible();
  await page.getByRole("link", { name: /Все тренажёры/ }).click();
  await expect(page.getByRole("heading", { name: "Тренажёры" })).toBeVisible();
});
