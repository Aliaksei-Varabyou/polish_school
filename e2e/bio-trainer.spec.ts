import { expect, test, type Page } from "@playwright/test";

// Biology has no LLM: every task comes from the pool, which the API fills from the templates on the
// first session (the Playwright server starts on an empty in-memory pool, like a fresh deploy). The
// spec answers wrongly on purpose — the correct answers live in the pool and the browser cannot
// know them — which makes the score, the mistake list and the rule-based feedback deterministic.

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
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();

  // the LO3 book's 11 chapters are listed, their paragraphs folded away until a chapter is opened
  await expect(page.getByRole("checkbox")).toHaveCount(11);

  // a chapter's own checkbox takes all of its paragraphs that have tasks (10.2, 10.3, 10.4)
  const hormones = page.getByRole("checkbox", { name: "10. Эндокринная система" });
  await hormones.check();
  await expect(page.getByText("Выбрано параграфов: 3")).toBeVisible();
  await hormones.uncheck();
  await expect(page.getByText("Выбрано параграфов: 0")).toBeVisible();

  // open a chapter and pick paragraphs one by one; one without tasks cannot be picked
  await page.getByText("3. Опорно-двигательная система").click();
  await expect(page.getByRole("checkbox", { name: /Движение у животных/ })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Типы соединений костей/ }).check();
  await page.getByRole("checkbox", { name: /Строение и работа мышечной системы/ }).check();
  await expect(page.getByText("Выбрано параграфов: 2")).toBeVisible();
  await expect(page.getByText("2/4")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "3. Опорно-двигательная система" })).not.toBeChecked();

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

  // feedback is computed from the results, not generated: it names the chapter and its paragraphs
  await page.getByRole("button", { name: /Разбор слабых мест/ }).click();
  await expect(page.getByText("Над чем поработать")).toBeVisible();
  await expect(page.getByText(/Повтори «Опорно-двигательная система» \(§3\.[35]/)).toBeVisible();

  expect(errors).toEqual([]);
});

test("biology session can be picked by cross-cutting theme instead of by paragraph", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();

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

test("a finished paragraph comes back as repeats instead of an empty session", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();

  // §3.4 has only two tasks, so the first session uses it up
  await page.getByText("3. Опорно-двигательная система").click();
  await page.getByRole("checkbox", { name: /Элементы скелета/ }).check();
  await page.locator("select").selectOption("5");

  for (const round of [1, 2]) {
    await page.getByRole("button", { name: "Начать" }).click();
    await expect(page.getByText("Задание 1 из 2")).toBeVisible();
    await expect(page.getByText("Подготовлено 2 из 5 заданий.")).toBeVisible();
    const notice = page.getByText(/Новые задания в выбранных параграфах закончились — 2 из них повторяются/);
    await expect(notice).toHaveCount(round === 1 ? 0 : 1);
    await page.getByRole("button", { name: "Выйти", exact: true }).click(); // the confirm is accepted by collectErrors
  }

  expect(errors).toEqual([]);
});


test("class 6 has its own book: five chapters of zoology, and a session from one of them", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();

  // class 6 is the default for a first visit; its book replaces the LO3 one in the tree
  await expect(page.getByRole("radio", { name: "6 класс", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(5);
  await expect(page.getByRole("checkbox", { name: "1. Мир животных" })).toBeVisible();
  // no cross-cutting theme reaches class 6, so the theme mode is not offered
  await expect(page.getByRole("radio", { name: "По теме", exact: true })).toHaveCount(0);

  await page.getByRole("checkbox", { name: "4. Холоднокровные позвоночные" }).check();
  await expect(page.getByText("Выбрано параграфов: 6")).toBeVisible();

  // each class keeps its own choice: pick something in LO3, then come back to class 6
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();
  await page.getByRole("checkbox", { name: "10. Эндокринная система" }).check();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();
  await expect(page.getByText("Выбрано параграфов: 6")).toBeVisible();

  await page.locator("select").selectOption("5");
  await page.getByRole("button", { name: "Начать" }).click();
  await expect(page.getByText("Задание 1 из 5")).toBeVisible();

  // starting a class 6 session must not wipe what was chosen for LO3
  await page.getByRole("button", { name: "Выйти", exact: true }).click();
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();
  await expect(page.getByText("Выбрано параграфов: 3")).toBeVisible();

  expect(errors).toEqual([]);
});
