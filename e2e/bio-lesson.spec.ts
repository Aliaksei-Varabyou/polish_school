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

test("class 6 lesson on amphibians: frog parts, tadpole stages, water/land sort, cold blood", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();
  await page.getByRole("button", { name: /4\.3\s*Земноводные/ }).click();
  await expect(page.getByRole("heading", { name: "Как устроена лягушка" })).toBeVisible();

  const frog = page.locator("#amphibians-s1");
  await frog.locator('[data-part="web"]').focus();
  await page.keyboard.press("Enter");
  await expect(frog.getByText(/Работает как ласт/)).toBeVisible();
  await frog.getByRole("button", { name: "Лёгкие", exact: true }).click();
  await expect(frog.getByText(/мешковидные лёгкие/)).toBeVisible();

  // the trait table marks what changed between stages
  const growth = page.locator("#amphibians-s2");
  await growth.getByRole("slider").fill("4");
  await expect(growth.getByRole("heading", { name: "Головастик с четырьмя ногами" })).toBeVisible();
  await expect(growth.getByText("жабрами и лёгкими")).toBeVisible();
  await expect(growth.getByText("изменилось").first()).toBeVisible();

  const sort = page.locator("#amphibians-s3");
  const row = sort.getByRole("listitem").filter({ hasText: "лёгкие" });
  await row.getByRole("button", { name: "к воде" }).click();
  await expect(row.getByText(/Пока нет/)).toBeVisible();
  await row.getByRole("button", { name: "к суше" }).click();
  await expect(row.getByText(/позволяют дышать воздухом/)).toBeVisible();

  const cold = page.locator("#amphibians-s4");
  await expect(cold.getByText(/Зимняя спячка/)).toBeVisible();
  await cold.getByRole("slider").fill("6");
  await expect(cold.getByText(/Тепло\. Лягушка активна/)).toBeVisible();

  expect(errors).toEqual([]);
});

test("class 6 lesson on birds: inner organs, flight builder, beaks, egg", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();
  await page.getByRole("button", { name: /5\.1\s*Птицы/ }).click();
  await expect(page.getByRole("heading", { name: "Как устроена птица" })).toBeVisible();

  const body = page.locator("#birds-s1");
  await body.getByRole("button", { name: "Киль", exact: true }).click();
  await expect(body.getByText(/крепятся мощные грудные мышцы/)).toBeVisible();
  await body.getByRole("radio", { name: "Подпиши сам" }).click();
  await body.getByRole("button", { name: "Клюв", exact: true }).click();
  await body.getByRole("button", { name: "Метка 1", exact: true }).click();
  await expect(body.getByRole("button", { name: "Клюв", exact: true })).toHaveCount(1); // the placed label on the drawing

  const flight = page.locator("#birds-s2");
  for (const sw of await flight.getByRole("switch").all()) await sw.click();
  await expect(flight.getByText(/птица взлетает/)).toBeVisible();

  const beaks = page.locator("#birds-s3");
  await beaks.getByRole("button", { name: /конусовидный/ }).click();
  await expect(beaks.getByText(/таким клювом это трудно съесть/)).toBeVisible();
  await beaks.getByRole("button", { name: /крючковатый/ }).click();
  await expect(beaks.getByText(/канюк, орёл и сова/)).toBeVisible();

  const egg = page.locator("#birds-s4");
  await egg.getByRole("button", { name: "Зародышевый диск", exact: true }).last().click();
  await expect(egg.getByText(/именно из него развивается зародыш/)).toBeVisible();
  const chick = egg.getByRole("listitem").filter({ hasText: "домашняя курица" });
  await chick.getByRole("button", { name: "выводковая" }).click();
  await expect(chick.getByText(/птенцы в пуху/)).toBeVisible();

  await page.getByRole("button", { name: "Начать тест по теме" }).click();
  await expect(page.getByText(/Задание 1 из \d+/)).toBeVisible();
  expect(errors).toEqual([]);
});

async function openLesson(page: Page, name: RegExp) {
  await page.goto("/t/bio");
  await page.getByRole("radio", { name: "RU", exact: true }).click();
  await page.getByRole("radio", { name: "6 класс", exact: true }).click();
  await page.getByRole("button", { name }).click();
}

test("class 6 lesson on tissues serves both tissue paragraphs", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /1\.3\s*Соединительная ткань/);
  await expect(page.getByRole("heading", { name: "Соединительная ткань" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ткани под микроскопом" })).toBeVisible();

  const scope = page.locator("#tissues-s1");
  await scope.getByRole("button", { name: "Хрящевая ткань" }).click();
  await expect(scope.getByRole("img", { name: /Хрящевая ткань/ })).toBeVisible();
  await expect(scope.getByText(/уменьшает трение в суставах/)).toBeVisible();

  const neuron = page.locator("#tissues-s2");
  await neuron.getByRole("button", { name: "Аксон", exact: true }).last().click();
  await expect(neuron.getByText(/Один длинный отросток/)).toBeVisible();
  await neuron.getByRole("button", { name: /Отправить импульс/ }).click();

  const blood = page.locator("#tissues-s3");
  await blood.getByRole("button", { name: "Тромбоциты", exact: true }).last().click();
  await expect(blood.getByText(/помогают крови свернуться/)).toBeVisible();

  const quiz = page.locator("#tissues-s4");
  await quiz.getByRole("button", { name: "мышечная", exact: true }).click();
  await expect(quiz.getByText(/не она/)).toBeVisible();
  await quiz.getByRole("button", { name: "эпителиальная", exact: true }).click();
  await expect(quiz.getByText(/Это эпителиальная ткань/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on fish: gills, swim bladder, organ quiz", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /4\.1\s*Рыбы/);
  const map = page.locator("#fish-s1");
  await map.getByRole("button", { name: "Плавательный пузырь", exact: true }).last().click();
  await expect(map.getByText(/Тонкостенный мешок с газом/)).toBeVisible();

  const bladder = page.locator("#fish-s3");
  await bladder.getByRole("slider").fill("10");
  await expect(bladder.getByText(/опускается ко дну/)).toBeVisible();
  await bladder.getByRole("slider").fill("90");
  await expect(bladder.getByText(/всплывает к поверхности/)).toBeVisible();

  const quiz = page.locator("#fish-s4");
  await quiz.getByRole("button", { name: "хвостовой плавник", exact: true }).click();
  await expect(quiz.getByText(/главный двигатель/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on reptiles: autotomy, amphibian or reptile, the drying test, species", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /4\.5\s*Пресмыкающиеся/);
  const map = page.locator("#reptiles-s1");
  await map.getByRole("button", { name: "Хвост (автотомия)", exact: true }).last().click();
  await expect(map.getByText(/отбросить — это автотомия/)).toBeVisible();

  const sort = page.locator("#reptiles-s2");
  const row = sort.getByRole("listitem").filter({ hasText: "наружное оплодотворение" });
  await row.getByRole("button", { name: "земноводное" }).click();
  await expect(row.getByText(/вне тела самки/)).toBeVisible();

  const dry = page.locator("#reptiles-s3");
  await dry.getByRole("slider").fill("8");
  await expect(dry.getByText(/Икра высохла/)).toBeVisible();

  const quiz = page.locator("#reptiles-s4");
  await quiz.getByRole("button", { name: "обыкновенная гадюка", exact: true }).click();
  await expect(quiz.getByText(/спокойно отойди/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on mammals: hidden features, teeth, 37 degrees, how they are born", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /5\.3\s*Млекопитающие/);
  const map = page.locator("#mammals-s1");
  await map.getByRole("button", { name: "Молочные железы", exact: true }).last().click();
  await expect(map.getByText(/Главный признак млекопитающих/)).toBeVisible();

  const teeth = page.locator("#mammals-s2");
  await teeth.getByRole("radio", { name: /Бобр/ }).click();
  await expect(teeth.getByText(/растёт всю жизнь/)).toBeVisible();

  const warm = page.locator("#mammals-s3");
  await expect(warm.getByText(/Мышцы дрожат/)).toBeVisible();
  await warm.getByRole("slider").fill("34");
  await expect(warm.getByText(/испаряя воду с языка/)).toBeVisible();

  const quiz = page.locator("#mammals-s4");
  await quiz.getByRole("button", { name: /однопроходные/ }).click();
  await expect(quiz.getByText(/Утконос откладывает яйца/)).toBeVisible();

  await page.getByRole("button", { name: "Начать тест по теме" }).click();
  await expect(page.getByText(/Задание 1 из \d+/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on cnidarians: hydra, stinging cell, polyp or medusa, symmetry", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /2\.1\s*Кишечнополостные/);
  const map = page.locator("#cnidarians-s1");
  await map.getByRole("button", { name: "Почка", exact: true }).last().click();
  await expect(map.getByText(/Это почкование/)).toBeVisible();

  const stinger = page.locator("#cnidarians-s2");
  await stinger.getByRole("button", { name: /Задеть чувствительный волосок/ }).click();
  await expect(stinger.getByRole("button", { name: /Заново/ })).toBeVisible();

  const sort = page.locator("#cnidarians-s3");
  const row = sort.getByRole("listitem").filter({ hasText: "гидра" });
  await row.getByRole("button", { name: "полип" }).click();
  await expect(row.getByText(/полип живёт прикреплённым/)).toBeVisible();

  const sym = page.locator("#cnidarians-s4");
  await sym.getByRole("slider").first().fill("60");
  await expect(sym.getByText(/Это плоскость симметрии/).first()).toBeVisible();
  await sym.getByRole("slider").last().fill("60");
  await expect(sym.getByText(/Половинки не одинаковы/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on flatworms: planarian, tapeworm, life cycle with where to break it", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /2\.2\s*Плоские черви/);
  await page.locator("#flatworms-s1").getByRole("button", { name: "Ветвистый кишечник", exact: true }).last().click();
  await expect(page.locator("#flatworms-s1").getByText(/только одно отверстие/)).toBeVisible();

  const tw = page.locator("#flatworms-s2");
  await tw.getByRole("radio", { name: "Бычий цепень" }).click();
  await expect(tw.getByText(/только четыре присоски/)).toBeVisible();

  const cycle = page.locator("#flatworms-s3");
  await cycle.getByRole("button", { name: /Этап 4/ }).click();
  await expect(cycle.getByRole("heading", { name: /Финны в мышцах свиньи/ })).toBeVisible();
  await cycle.getByLabel(/где можно разорвать цикл/).check();
  await expect(cycle.getByText(/Ветеринар проверяет мясо/)).toBeVisible();
  await cycle.getByRole("button", { name: /Дальше/ }).click();
  await expect(cycle.getByText(/Хорошо проваривай/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on roundworms: ascaris, its cycle, the detective quiz, habits", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /2\.3\s*Круглые черви/);
  await page.locator("#roundworms-s1").getByRole("button", { name: "Пищеварительная трубка", exact: true }).last().click();
  await expect(page.locator("#roundworms-s1").getByText(/здесь их два/)).toBeVisible();

  const quiz = page.locator("#roundworms-s3");
  await quiz.getByRole("button", { name: "острица", exact: true }).click();
  await expect(quiz.getByText(/другим путём/)).toBeVisible();
  await quiz.getByRole("button", { name: "человеческая аскарида", exact: true }).click();
  await expect(quiz.getByText(/яйца аскариды/)).toBeVisible();

  const habits = page.locator("#roundworms-s4");
  const row = habits.getByRole("listitem").filter({ hasText: "грызть ногти" });
  await row.getByRole("button", { name: "опасно" }).click();
  await expect(row.getByText(/попадают в рот/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("class 6 lesson on annelids: earthworm, crawling, soil, quiz → test", async ({ page }) => {
  const errors = collectErrors(page);
  await openLesson(page, /2\.4\s*Кольчатые черви/);
  await page.locator("#annelids-s1").getByRole("button", { name: "Кожно-мускульный мешок", exact: true }).last().click();
  await expect(page.locator("#annelids-s1").getByText(/кольцевые и продольные/)).toBeVisible();
  await page.locator("#annelids-s2").getByRole("button", { name: /Ползи/ }).click();
  await expect(page.locator("#annelids-s2").getByRole("button", { name: /Стоп/ })).toBeVisible();
  await page.locator("#annelids-s3").getByRole("radio", { name: "С червями" }).click();
  await expect(page.locator("#annelids-s3").getByText(/друзья садоводов/)).toBeVisible();
  const quiz = page.locator("#annelids-s4");
  await quiz.getByRole("button", { name: "дождевой червь", exact: true }).click();
  await expect(quiz.getByText(/рыхлит почву и создаёт гумус/)).toBeVisible();

  await page.getByRole("button", { name: "Начать тест по теме" }).click();
  await expect(page.getByText(/Задание 1 из \d+/)).toBeVisible();
  expect(errors).toEqual([]);
});
