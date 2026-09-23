// Content table for dział 10, Układ hormonalny (LO3, zakres rozszerzony).
// One table drives several templates: gland -> hormone, hormone -> action, action -> hormone and
// hormone -> gland. Distractors are drawn from this same table, which is what makes them
// pedagogically useful (a neighbouring gland's hormone is exactly the confusion worth testing).
import type { Difficulty } from "@portal/core";
import { P } from "../../../curriculum/lo.ts";
import type { InParagraph } from "../tableTemplate.ts";

/** Biology content is authored in Polish and Russian only — see the trainer's BioLang. */
export interface Bi {
  pl: string;
  ru: string;
}

export interface HormoneEntry {
  id: string;
  /** the gland or tissue that secretes it */
  gland: Bi;
  name: Bi;
  /** main physiological effect; every entry's wording must be distinct, distractors rely on it */
  action: Bi;
  /** accepted alternative names and abbreviations, on top of `name` */
  aliases: { pl: string[]; ru: string[] };
  tier: Difficulty;
}

export const HORMONES: readonly HormoneEntry[] = [
  {
    id: "somatotropina",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "somatotropina", ru: "соматотропин" },
    action: { pl: "pobudza wzrost kości długich i syntezę białek", ru: "стимулирует рост длинных костей и синтез белка" },
    aliases: { pl: ["hormon wzrostu", "GH", "STH"], ru: ["гормон роста", "СТГ", "GH"] },
    tier: 1,
  },
  {
    id: "tyreotropina",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "tyreotropina", ru: "тиреотропин" },
    action: { pl: "pobudza tarczycę do wydzielania tyroksyny", ru: "стимулирует щитовидную железу выделять тироксин" },
    aliases: { pl: ["TSH", "hormon tyreotropowy"], ru: ["ТТГ", "TSH", "тиреотропный гормон"] },
    tier: 2,
  },
  {
    id: "kortykotropina",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "kortykotropina", ru: "кортикотропин" },
    action: { pl: "pobudza korę nadnerczy do wydzielania kortyzolu", ru: "стимулирует кору надпочечников выделять кортизол" },
    aliases: { pl: ["ACTH", "hormon adrenokortykotropowy"], ru: ["АКТГ", "ACTH", "адренокортикотропный гормон"] },
    tier: 2,
  },
  {
    id: "folikulotropina",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "folikulotropina", ru: "фолликулостимулирующий гормон" },
    action: { pl: "pobudza dojrzewanie pęcherzyków jajnikowych i spermatogenezę", ru: "стимулирует созревание фолликулов яичника и сперматогенез" },
    aliases: { pl: ["FSH", "hormon folikulotropowy"], ru: ["ФСГ", "FSH"] },
    tier: 2,
  },
  {
    id: "lutropina",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "lutropina", ru: "лютеинизирующий гормон" },
    action: { pl: "wywołuje owulację i powstanie ciałka żółtego", ru: "вызывает овуляцию и образование жёлтого тела" },
    aliases: { pl: ["LH", "hormon luteinizujący"], ru: ["ЛГ", "LH"] },
    tier: 2,
  },
  {
    id: "prolaktyna",
    gland: { pl: "przedni płat przysadki mózgowej", ru: "передняя доля гипофиза" },
    name: { pl: "prolaktyna", ru: "пролактин" },
    action: { pl: "pobudza gruczoły sutkowe do wytwarzania mleka", ru: "стимулирует выработку молока молочными железами" },
    aliases: { pl: ["PRL"], ru: ["ПРЛ", "PRL"] },
    tier: 1,
  },
  {
    id: "wazopresyna",
    gland: { pl: "tylny płat przysadki mózgowej", ru: "задняя доля гипофиза" },
    name: { pl: "wazopresyna", ru: "вазопрессин" },
    action: { pl: "zwiększa resorpcję zwrotną wody w kanalikach nerkowych", ru: "усиливает обратное всасывание воды в почечных канальцах" },
    aliases: { pl: ["ADH", "hormon antydiuretyczny"], ru: ["АДГ", "ADH", "антидиуретический гормон"] },
    tier: 2,
  },
  {
    id: "oksytocyna",
    gland: { pl: "tylny płat przysadki mózgowej", ru: "задняя доля гипофиза" },
    name: { pl: "oksytocyna", ru: "окситоцин" },
    action: { pl: "wywołuje skurcze mięśni macicy podczas porodu", ru: "вызывает сокращения мышц матки во время родов" },
    aliases: { pl: ["OXT"], ru: ["окситоцина"] },
    tier: 1,
  },
  {
    id: "tyroksyna",
    gland: { pl: "tarczyca", ru: "щитовидная железа" },
    name: { pl: "tyroksyna", ru: "тироксин" },
    action: { pl: "zwiększa tempo przemiany materii i wytwarzanie ciepła", ru: "повышает скорость обмена веществ и теплопродукцию" },
    aliases: { pl: ["T4", "tetrajodotyronina"], ru: ["Т4", "T4", "тетрайодтиронин"] },
    tier: 1,
  },
  {
    id: "kalcytonina",
    gland: { pl: "tarczyca", ru: "щитовидная железа" },
    name: { pl: "kalcytonina", ru: "кальцитонин" },
    action: { pl: "obniża poziom wapnia we krwi, hamując resorpcję kości", ru: "снижает уровень кальция в крови, подавляя резорбцию кости" },
    aliases: { pl: ["CT"], ru: ["кальцитонина"] },
    tier: 2,
  },
  {
    id: "parathormon",
    gland: { pl: "przytarczyce", ru: "паращитовидные железы" },
    name: { pl: "parathormon", ru: "паратгормон" },
    action: { pl: "podwyższa poziom wapnia we krwi, uwalniając go z kości", ru: "повышает уровень кальция в крови, высвобождая его из костей" },
    aliases: { pl: ["PTH", "hormon przytarczyc"], ru: ["ПТГ", "PTH", "паратиреоидный гормон"] },
    tier: 2,
  },
  {
    id: "kortyzol",
    gland: { pl: "kora nadnerczy", ru: "кора надпочечников" },
    name: { pl: "kortyzol", ru: "кортизол" },
    action: { pl: "podwyższa poziom glukozy z rezerw białek i tłuszczów, hamuje odczyn zapalny", ru: "повышает уровень глюкозы за счёт белков и жиров, подавляет воспаление" },
    aliases: { pl: ["hydrokortyzon"], ru: ["гидрокортизон"] },
    tier: 2,
  },
  {
    id: "aldosteron",
    gland: { pl: "kora nadnerczy", ru: "кора надпочечников" },
    name: { pl: "aldosteron", ru: "альдостерон" },
    action: { pl: "zwiększa resorpcję zwrotną sodu i wydalanie potasu w nerkach", ru: "усиливает обратное всасывание натрия и выведение калия в почках" },
    aliases: { pl: ["mineralokortykoid"], ru: ["минералокортикоид"] },
    tier: 3,
  },
  {
    id: "adrenalina",
    gland: { pl: "rdzeń nadnerczy", ru: "мозговое вещество надпочечников" },
    name: { pl: "adrenalina", ru: "адреналин" },
    action: { pl: "przyspiesza akcję serca i rozszerza oskrzela w reakcji na stres", ru: "ускоряет работу сердца и расширяет бронхи в ответ на стресс" },
    aliases: { pl: ["epinefryna"], ru: ["эпинефрин"] },
    tier: 1,
  },
  {
    id: "noradrenalina",
    gland: { pl: "rdzeń nadnerczy", ru: "мозговое вещество надпочечников" },
    name: { pl: "noradrenalina", ru: "норадреналин" },
    action: { pl: "obkurcza naczynia krwionośne i podnosi ciśnienie tętnicze", ru: "сужает кровеносные сосуды и повышает артериальное давление" },
    aliases: { pl: ["norepinefryna"], ru: ["норэпинефрин"] },
    tier: 2,
  },
  {
    id: "insulina",
    gland: { pl: "wyspy trzustkowe (komórki beta)", ru: "островки поджелудочной железы (бета-клетки)" },
    name: { pl: "insulina", ru: "инсулин" },
    action: { pl: "obniża poziom glukozy we krwi, ułatwiając jej wnikanie do komórek", ru: "снижает уровень глюкозы в крови, облегчая её вход в клетки" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "glukagon",
    gland: { pl: "wyspy trzustkowe (komórki alfa)", ru: "островки поджелудочной железы (альфа-клетки)" },
    name: { pl: "glukagon", ru: "глюкагон" },
    action: { pl: "podwyższa poziom glukozy we krwi, rozkładając glikogen w wątrobie", ru: "повышает уровень глюкозы в крови, расщепляя гликоген в печени" },
    aliases: { pl: [], ru: [] },
    tier: 1,
  },
  {
    id: "testosteron",
    gland: { pl: "jądra", ru: "семенники" },
    name: { pl: "testosteron", ru: "тестостерон" },
    action: { pl: "warunkuje rozwój męskich cech płciowych i spermatogenezę", ru: "определяет развитие мужских половых признаков и сперматогенез" },
    aliases: { pl: ["androgen"], ru: ["андроген"] },
    tier: 1,
  },
  {
    id: "estrogeny",
    gland: { pl: "jajniki", ru: "яичники" },
    // singular on purpose: every `name` is a singular nominative so questions can be phrased once
    name: { pl: "estrogen", ru: "эстроген" },
    action: { pl: "warunkuje rozwój żeńskich cech płciowych i odbudowę błony śluzowej macicy", ru: "определяет развитие женских половых признаков и восстановление слизистой матки" },
    aliases: { pl: ["estrogeny", "estradiol"], ru: ["эстрогены", "эстрадиол"] },
    tier: 2,
  },
  {
    id: "progesteron",
    gland: { pl: "ciałko żółte jajnika", ru: "жёлтое тело яичника" },
    name: { pl: "progesteron", ru: "прогестерон" },
    action: { pl: "przygotowuje błonę śluzową macicy do zagnieżdżenia zarodka i podtrzymuje ciążę", ru: "готовит слизистую матки к имплантации зародыша и поддерживает беременность" },
    aliases: { pl: [], ru: [] },
    tier: 2,
  },
  {
    id: "melatonina",
    gland: { pl: "szyszynka", ru: "эпифиз" },
    name: { pl: "melatonina", ru: "мелатонин" },
    action: { pl: "reguluje rytm dobowy i ułatwia zasypianie", ru: "регулирует суточный ритм и облегчает засыпание" },
    aliases: { pl: [], ru: ["мелатонина"] },
    tier: 2,
  },
  {
    id: "tymozyna",
    gland: { pl: "grasica", ru: "тимус" },
    name: { pl: "tymozyna", ru: "тимозин" },
    action: { pl: "steruje dojrzewaniem limfocytów T", ru: "управляет созреванием Т-лимфоцитов" },
    aliases: { pl: ["tymopoetyna"], ru: ["тимопоэтин"] },
    tier: 3,
  },
  {
    id: "erytropoetyna",
    gland: { pl: "nerki", ru: "почки" },
    name: { pl: "erytropoetyna", ru: "эритропоэтин" },
    action: { pl: "pobudza szpik kostny do wytwarzania erytrocytów", ru: "стимулирует костный мозг к образованию эритроцитов" },
    aliases: { pl: ["EPO"], ru: ["ЭПО", "EPO"] },
    tier: 3,
  },
  {
    id: "gastryna",
    gland: { pl: "błona śluzowa żołądka", ru: "слизистая оболочка желудка" },
    name: { pl: "gastryna", ru: "гастрин" },
    action: { pl: "pobudza wydzielanie kwasu solnego w żołądku", ru: "стимулирует выделение соляной кислоты в желудке" },
    aliases: { pl: [], ru: ["гастрина"] },
    tier: 3,
  },
];

export interface DisorderEntry {
  id: string;
  /** the hormone whose excess or deficiency causes it */
  hormone: Bi;
  kind: "nadczynność" | "niedoczynność";
  disease: Bi;
  symptom: Bi;
  tier: Difficulty;
}

export const DISORDERS: readonly DisorderEntry[] = [
  {
    id: "gigantyzm",
    hormone: { pl: "somatotropiny", ru: "соматотропина" },
    kind: "nadczynność",
    disease: { pl: "gigantyzm", ru: "гигантизм" },
    symptom: { pl: "nadmierny wzrost kości długich przed zakończeniem dojrzewania", ru: "чрезмерный рост длинных костей до окончания полового созревания" },
    tier: 1,
  },
  {
    id: "karlowatosc",
    hormone: { pl: "somatotropiny", ru: "соматотропина" },
    kind: "niedoczynność",
    disease: { pl: "karłowatość przysadkowa", ru: "гипофизарная карликовость" },
    symptom: { pl: "znacznie niższy wzrost przy zachowanych proporcjach ciała", ru: "значительно более низкий рост при сохранённых пропорциях тела" },
    tier: 1,
  },
  {
    id: "akromegalia",
    hormone: { pl: "somatotropiny", ru: "соматотропина" },
    kind: "nadczynność",
    disease: { pl: "akromegalia", ru: "акромегалия" },
    symptom: { pl: "powiększenie dłoni, stóp i rysów twarzy u osoby dorosłej", ru: "увеличение кистей, стоп и черт лица у взрослого" },
    tier: 2,
  },
  {
    id: "choroba-gravesa",
    hormone: { pl: "tyroksyny", ru: "тироксина" },
    kind: "nadczynność",
    disease: { pl: "choroba Gravesa-Basedowa", ru: "болезнь Грейвса — Базедова" },
    symptom: { pl: "przyspieszony metabolizm, chudnięcie i wytrzeszcz oczu", ru: "ускоренный обмен веществ, похудение и пучеглазие" },
    tier: 2,
  },
  {
    id: "obrzek-sluzowaty",
    hormone: { pl: "tyroksyny", ru: "тироксина" },
    kind: "niedoczynność",
    disease: { pl: "obrzęk śluzowaty", ru: "микседема" },
    symptom: { pl: "spowolnienie metabolizmu, senność i obrzęki podskórne", ru: "замедление обмена веществ, сонливость и подкожные отёки" },
    tier: 2,
  },
  {
    id: "tezyczka",
    hormone: { pl: "parathormonu", ru: "паратгормона" },
    kind: "niedoczynność",
    disease: { pl: "tężyczka", ru: "тетания" },
    symptom: { pl: "bolesne skurcze mięśni przy zbyt niskim poziomie wapnia", ru: "болезненные мышечные судороги при слишком низком уровне кальция" },
    tier: 3,
  },
  {
    id: "cushing",
    hormone: { pl: "kortyzolu", ru: "кортизола" },
    kind: "nadczynność",
    disease: { pl: "zespół Cushinga", ru: "синдром Кушинга" },
    symptom: { pl: "otyłość tułowiowa, nadciśnienie i osłabienie mięśni", ru: "ожирение туловища, гипертония и мышечная слабость" },
    tier: 2,
  },
  {
    id: "addison",
    hormone: { pl: "kortyzolu", ru: "кортизола" },
    kind: "niedoczynność",
    disease: { pl: "choroba Addisona", ru: "болезнь Аддисона" },
    symptom: { pl: "osłabienie, spadek ciśnienia i brązowe przebarwienia skóry", ru: "слабость, падение давления и бронзовая пигментация кожи" },
    tier: 3,
  },
  {
    id: "cukrzyca",
    hormone: { pl: "insuliny", ru: "инсулина" },
    kind: "niedoczynność",
    disease: { pl: "cukrzyca", ru: "сахарный диабет" },
    symptom: { pl: "podwyższony poziom glukozy we krwi i cukier w moczu", ru: "повышенный уровень глюкозы в крови и сахар в моче" },
    tier: 1,
  },
  {
    id: "moczowka",
    hormone: { pl: "wazopresyny", ru: "вазопрессина" },
    kind: "niedoczynność",
    disease: { pl: "moczówka prosta", ru: "несахарный диабет" },
    symptom: { pl: "wydalanie ogromnych ilości rozcieńczonego moczu i silne pragnienie", ru: "выделение огромного количества разведённой мочи и сильная жажда" },
    tier: 2,
  },
];

/** Homeostatic loops taught as "co się stanie, gdy…" — the core of ujemne sprzężenie zwrotne. */
export interface LoopEntry extends InParagraph {
  id: string;
  /** the disturbance the body detects */
  stimulus: Bi;
  /** the hormone released in response */
  hormone: Bi;
  /** what that hormone does about it */
  response: Bi;
  tier: Difficulty;
}

export const LOOPS: readonly LoopEntry[] = [
  {
    id: "glukoza-wzrost",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom glukozy we krwi rośnie po posiłku", ru: "уровень глюкозы в крови растёт после еды" },
    hormone: { pl: "insulina", ru: "инсулин" },
    response: { pl: "glukoza wnika do komórek i jest magazynowana jako glikogen", ru: "глюкоза поступает в клетки и запасается в виде гликогена" },
    tier: 1,
  },
  {
    id: "glukoza-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom glukozy we krwi spada między posiłkami", ru: "уровень глюкозы в крови падает между приёмами пищи" },
    hormone: { pl: "glukagon", ru: "глюкагон" },
    response: { pl: "glikogen wątroby jest rozkładany do glukozy", ru: "гликоген печени расщепляется до глюкозы" },
    tier: 1,
  },
  {
    id: "wapn-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom wapnia we krwi spada", ru: "уровень кальция в крови падает" },
    hormone: { pl: "parathormon", ru: "паратгормон" },
    response: { pl: "wapń jest uwalniany z kości i silniej wchłaniany w jelicie", ru: "кальций высвобождается из костей и сильнее всасывается в кишечнике" },
    tier: 2,
  },
  {
    id: "wapn-wzrost",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom wapnia we krwi rośnie", ru: "уровень кальция в крови растёт" },
    hormone: { pl: "kalcytonina", ru: "кальцитонин" },
    response: { pl: "wapń jest odkładany w kościach, a jego stężenie we krwi spada", ru: "кальций откладывается в костях, и его концентрация в крови падает" },
    tier: 2,
  },
  {
    id: "woda-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "organizm traci wodę i osmolarność krwi rośnie", ru: "организм теряет воду и осмолярность крови растёт" },
    hormone: { pl: "wazopresyna", ru: "вазопрессин" },
    response: { pl: "nerki zagęszczają mocz, oddając mniej wody", ru: "почки концентрируют мочу, отдавая меньше воды" },
    tier: 2,
  },
  {
    id: "sod-spadek",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "poziom sodu we krwi spada, a wraz z nim ciśnienie", ru: "уровень натрия в крови падает, а вместе с ним давление" },
    hormone: { pl: "aldosteron", ru: "альдостерон" },
    response: { pl: "nerki zatrzymują sód, a za nim wodę", ru: "почки задерживают натрий, а вслед за ним воду" },
    tier: 3,
  },
  {
    id: "stres",
    paragraph: P.hormones.disorders,
    stimulus: { pl: "organizm reaguje na nagłe zagrożenie", ru: "организм реагирует на внезапную угрозу" },
    hormone: { pl: "adrenalina", ru: "адреналин" },
    response: { pl: "serce bije szybciej, a do krwi trafia dodatkowa glukoza", ru: "сердце бьётся чаще, а в кровь поступает дополнительная глюкоза" },
    tier: 1,
  },
  {
    id: "zimno",
    paragraph: P.hormones.regulation,
    stimulus: { pl: "temperatura otoczenia spada i organizm się wychładza", ru: "температура среды падает и организм охлаждается" },
    hormone: { pl: "tyroksyna", ru: "тироксин" },
    response: { pl: "tempo przemiany materii rośnie i wytwarza się więcej ciepła", ru: "скорость обмена веществ растёт и вырабатывается больше тепла" },
    tier: 2,
  },
];
