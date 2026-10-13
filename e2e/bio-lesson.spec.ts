import { expect, test, type Page } from "@playwright/test";

// The interactive explanation for §3.3 (insects): opened from the start page, every block answers
// a tap, and the lesson ends in an ordinary test session on the same paragraph.

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("class 6 lesson on insects: explore, label, key, mouthparts, metamorphosis → test", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();

  // the lesson is listed above the paragraph tree
  await expect(page.getByRole("heading", { name: /Объяснения/ })).toBeVisible();
  await page.getByRole("button", { name: /3\.3\s*Насекомые/ }).click();
  await expect(page.getByRole("heading", { name: "Насекомые — членистоногие, способные летать" })).toBeVisible();

  // 1. body map: a tapped part explains itself; the spiracles reveal the tracheae
  const drawing = page.getByRole("img", { name: "Строение насекомого" });
  await drawing.scrollIntoViewIfNeeded();
  const box = (await drawing.boundingBox())!;
  await page.mouse.click(box.x + box.width * (200 / 400), box.y + box.height * (100 / 460)); // the head
  await expect(page.getByText(/Первый отдел тела/)).toBeVisible();
  // the parts are keyboard-reachable too
  await page.locator('[data-part="antennae"][role="button"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Одна пара усиков — органы осязания/)).toBeVisible();
  await page.getByRole("button", { name: "Дыхальца и трахеи", exact: true }).last().click();
  await expect(page.getByText(/Лёгких у насекомого нет/)).toBeVisible();

  // ... and "label it" checks the pin a label goes to
  await page.getByRole("radio", { name: "Подпиши сам" }).click();
  await page.getByRole("button", { name: "Брюшко", exact: true }).click();
  await page.getByRole("button", { name: "Метка 1", exact: true }).click();
  await expect(page.getByText(/эта метка указывает на другую часть/)).toBeVisible();
  await page.getByRole("button", { name: "Метка 3", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Верно!" }).first()).toBeVisible();

  // 2. the key: a wrong count shows a hint, the right path names the group
  const key = page.locator("#insects-s2");
  await key.getByRole("button", { name: "Да", exact: true }).click();
  await key.getByRole("button", { name: "4 пары", exact: true }).click();
  await expect(key.getByText(/Посчитай ноги на одной стороне тела/)).toBeVisible();
  await key.getByRole("button", { name: "3 пары", exact: true }).click();
  await key.getByRole("button", { name: "1 пара", exact: true }).click();
  await expect(key.getByText("Насекомое", { exact: true })).toBeVisible();
  await key.getByRole("button", { name: /Дальше/ }).click();
  await expect(key.getByText("Паук-крестовик")).toBeVisible();

  // 3. mouthparts: the first food is a cabbage leaf
  const lab = page.locator("#insects-s3");
  await lab.getByRole("button", { name: "сосущий", exact: true }).click();
  await expect(lab.getByText(/этот аппарат здесь не подходит/)).toBeVisible();
  await lab.getByRole("button", { name: "грызущий", exact: true }).click();
  await expect(lab.getByText(/саранча и кузнечик/)).toBeVisible();

  // 4. metamorphosis: the third stage is where the two ways part
  const dev = page.locator("#insects-s4");
  await dev.getByRole("slider").fill("2");
  await expect(dev.getByText(/Вот в чём разница/)).toBeVisible();
  await expect(dev.getByRole("img", { name: "Куколка" })).toBeVisible();

  // the lesson hands over to an ordinary session on its paragraph
  await page.getByRole("button", { name: "Начать тест по теме" }).click();
  await expect(page.getByText(/Задание 1 из \d+/)).toBeVisible();

  expect(errors).toEqual([]);
});

test("lesson is reachable from the paragraph tree and leads back to the start page", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();

  await page.getByText("3. Членистоногие и моллюски").click();
  await page.getByRole("button", { name: /Объяснение: Насекомые/ }).click();
  await expect(page.getByRole("heading", { name: "Как устроено насекомое" })).toBeVisible();

  await page.getByRole("button", { name: /К выбору тем/ }).click();
  await expect(page.getByRole("heading", { name: /Главы и параграфы/ })).toBeVisible();
  expect(errors).toEqual([]);
});
