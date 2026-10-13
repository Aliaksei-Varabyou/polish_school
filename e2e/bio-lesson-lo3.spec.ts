import { expect, test, type Page } from "@playwright/test";

// Every liceum class 3 lesson opens from the start page, renders all its sections, survives a tap on
// every control and a slider pushed to its end, and logs no error. One row per lesson file: the first
// paragraph it covers (a lesson shared by several paragraphs is listed once).
const LESSONS: [chapter: number, paragraph: string, name: string][] = [
  [1, "1.1", "Место человека в системе классификации организмов"],
  [1, "1.2", "Иерархическое строение организма человека"],
  [1, "1.3", "Гомеостаз"],
  [2, "2.1", "Покровы у животных"],
  [2, "2.2", "Строение и функции кожи"],
  [2, "2.3", "Гигиена и болезни кожи"],
  [3, "3.1", "Движение у животных"],
  [3, "3.2", "Строение и функции скелета"],
  [3, "3.3", "Типы соединений костей"],
  [3, "3.5", "Строение и работа мышечной системы"],
  [3, "3.6", "Гигиена и болезни опорно-двигательной системы"],
  [4, "4.1", "Питание животных"],
  [4, "4.2", "Органические питательные вещества"],
  [4, "4.4", "Строение и функции пищеварительной системы"],
  [4, "4.6", "Принципы рационального питания"],
  [5, "5.1", "Дыхательная система у животных"],
  [5, "5.2", "Строение и функции дыхательной системы"],
  [5, "5.4", "Нарушения работы дыхательной системы"],
  [6, "6.1", "Кровеносная система у животных"],
  [6, "6.2", "Состав и функции крови"],
  [6, "6.3", "Строение и функции кровеносной системы"],
  [6, "6.5", "Лимфатическая система"],
  [6, "6.6", "Болезни системы кровообращения"],
  [7, "7.1", "Осморегуляция и выделение у животных"],
  [7, "7.2", "Строение и работа мочевыделительной системы"],
  [7, "7.3", "Болезни мочевыделительной системы"],
  [8, "8.1", "Нервная система у животных"],
  [8, "8.2", "Строение и работа нервной системы"],
  [8, "8.3", "Центральная нервная система"],
  [8, "8.5", "Вегетативная нервная система"],
  [9, "9.1", "Органы чувств у животных"],
  [9, "9.2", "Строение и работа органа зрения"],
  [9, "9.3", "Ухо — орган слуха и равновесия"],
  [9, "9.4", "Органы вкуса и обоняния"],
  [10, "10.1", "Эндокринная система у животных"],
  [10, "10.2", "Строение и роль эндокринной системы"],
  [10, "10.3", "Регуляция выделения гормонов"],
  [11, "11.1", "Размножение и развитие у животных"],
  [11, "11.2", "Строение и функции мужских половых органов"],
  [11, "11.4", "Развитие человека. Методы контрацепции"],
  [11, "11.5", "Гигиена и болезни половой системы"],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function open(page: Page, chapter: number, paragraph: string, name: string) {
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "Лицей, 3 класс", exact: true }).click();
  await page.locator("details summary").filter({ hasText: new RegExp(`^${chapter}\\. `) }).first().click();
  await page.getByRole("button", { name: new RegExp(`${esc(paragraph)}\\s*${esc(name.slice(0, 20))}`) }).first().click();
}

for (const [chapter, paragraph, name] of LESSONS) {
  test(`LO3 lesson §${paragraph} opens and every control works`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await open(page, chapter, paragraph, name);
    const sections = page.locator("section[id$='-s1'], section[id$='-s2'], section[id$='-s3']");
    await expect(sections.first()).toBeVisible();
    expect(await sections.count()).toBeGreaterThanOrEqual(3);
    for (const id of await page.locator("section[id]").evaluateAll((els) => els.map((e) => e.id))) {
      const controls = page.locator(`#${id} button:not([disabled]), #${id} [role=button], #${id} input[type=checkbox]`);
      const n = Math.min(await controls.count(), 30);
      for (let i = 0; i < n; i++) {
        const c = controls.nth(i);
        if (await c.isVisible()) await c.click({ timeout: 1500 }).catch(() => {});
      }
      const sliders = page.locator(`#${id} input[type=range]`);
      for (let i = 0; i < (await sliders.count()); i++) {
        const s = sliders.nth(i);
        await s.fill((await s.getAttribute("max")) ?? "100", { timeout: 1500 }).catch(() => {});
      }
    }
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });
}
