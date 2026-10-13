// §4.2, §4.3 and §4.6: what food is made of, and how much of it a body needs.
import { P } from "../../../curriculum/lo.ts";
import { namedTable } from "./rows.ts";

// ---- §4.2 Organiczne składniki pokarmowe ----

export const ORGANIC_NUTRIENTS = namedTable(P.digestion.organic, [
  ["glukoza", "glukoza", "глюкоза", "cukier prosty, główne źródło energii dla komórek, zwłaszcza neuronów", "простой сахар, главный источник энергии для клеток, особенно нейронов", 1, ["cukier gronowy"], ["виноградный сахар"]],
  ["skrobia", "skrobia", "крахмал", "wielocukier zapasowy roślin, trawiony w przewodzie pokarmowym do glukozy", "запасной полисахарид растений, переваривается в пищеварительном тракте до глюкозы", 1, [], []],
  ["blonnik", "błonnik pokarmowy", "пищевые волокна", "nietrawione przez człowieka składniki ścian komórek roślinnych, pobudzające perystaltykę jelit", "непереваримые для человека компоненты стенок растительных клеток, усиливающие перистальтику кишечника", 1, ["błonnik"], ["клетчатка"]],
  ["glikogen", "glikogen", "гликоген", "wielocukier zapasowy zwierząt, magazynowany w wątrobie i mięśniach", "запасной полисахарид животных, хранящийся в печени и мышцах", 1, [], []],
  ["laktoza", "laktoza", "лактоза", "dwucukier mleka, rozkładany w jelicie na glukozę i galaktozę", "дисахарид молока, расщепляемый в кишечнике на глюкозу и галактозу", 2, ["cukier mlekowy"], ["молочный сахар"]],
  ["aminokwasy-egzogenne", "aminokwasy egzogenne", "незаменимые аминокислоты", "składniki białek, których organizm człowieka nie wytwarza i musi otrzymać z pożywieniem", "компоненты белков, которые организм человека не синтезирует и должен получать с пищей", 2, ["aminokwasy niezbędne"], ["эссенциальные аминокислоты"]],
  ["bialko-pelnowartosciowe", "białko pełnowartościowe", "полноценный белок", "składnik pokarmu zawierający wszystkie aminokwasy egzogenne w odpowiednich proporcjach, np. z jaj i mleka", "компонент пищи, содержащий все незаменимые аминокислоты в нужных пропорциях, например из яиц и молока", 2, [], []],
  ["tluszcze", "tłuszcze", "жиры", "estry glicerolu i wyższych kwasów karboksylowych — najbardziej kaloryczny materiał zapasowy organizmu", "сложные эфиры глицерина и высших карбоновых кислот — самый калорийный запасной материал организма", 1, ["triglicerydy", "triacyloglicerole"], ["триглицериды"]],
  ["nienasycone", "nienasycone kwasy tłuszczowe", "ненасыщенные жирные кислоты", "składniki lipidów z wiązaniami podwójnymi, obecne w olejach roślinnych i rybach, korzystne dla układu krążenia", "компоненты липидов с двойными связями из растительных масел и рыбы, полезные для кровеносной системы", 2, [], []],
  ["cholesterol", "cholesterol", "холестерин", "lipid budujący błony komórkowe i substrat do syntezy hormonów steroidowych, którego nadmiar sprzyja miażdżycy", "липид, входящий в клеточные мембраны и служащий сырьём для стероидных гормонов; его избыток способствует атеросклерозу", 1, [], ["холестерол"]],
]);

// ---- §4.3 Rola witamin. Nieorganiczne składniki pokarmowe ----

export const VITAMINS_MINERALS = namedTable(P.digestion.vitamins, [
  ["wit-a", "witamina A", "витамин A", "składnik barwnika wzrokowego w pręcikach; jej niedobór powoduje kurzą ślepotę", "компонент зрительного пигмента в палочках; её недостаток вызывает куриную слепоту", 1, ["retinol"], ["ретинол", "витамин А"]],
  ["wit-d", "witamina D", "витамин D", "regulacja wchłaniania wapnia i fosforu; jej niedobór powoduje u dzieci krzywicę", "регуляция всасывания кальция и фосфора; её недостаток вызывает у детей рахит", 1, ["kalcyferol", "cholekalcyferol"], ["кальциферол", "холекальциферол"]],
  ["wit-k", "witamina K", "витамин K", "udział w wytwarzaniu czynników krzepnięcia krwi; wytwarzają ją też bakterie jelitowe", "участие в образовании факторов свёртывания крови; её также синтезируют кишечные бактерии", 2, ["filochinon"], ["филлохинон", "витамин К"]],
  ["wit-e", "witamina E", "витамин E", "ochrona błon komórkowych przed utlenianiem — silny przeciwutleniacz", "защита клеточных мембран от окисления — сильный антиоксидант", 2, ["tokoferol"], ["токоферол", "витамин Е"]],
  ["wit-c", "witamina C", "витамин C", "udział w wytwarzaniu kolagenu i ochronie antyoksydacyjnej; jej niedobór powoduje szkorbut", "участие в синтезе коллагена и антиоксидантной защите; её недостаток вызывает цингу", 1, ["kwas askorbinowy"], ["аскорбиновая кислота", "витамин С"]],
  ["wit-b12", "witamina B12", "витамин B12", "udział w wytwarzaniu krwinek czerwonych; jej niedobór powoduje niedokrwistość złośliwą", "участие в образовании эритроцитов; её недостаток вызывает злокачественное малокровие", 2, ["kobalamina"], ["кобаламин", "витамин В12"]],
  ["kwas-foliowy", "kwas foliowy", "фолиевая кислота", "udział w podziałach komórek; jego niedobór u ciężarnej grozi wadami cewy nerwowej płodu", "участие в делении клеток; её недостаток у беременной грозит пороками нервной трубки плода", 2, ["witamina B9", "foliany"], ["витамин B9", "фолаты"]],
  ["wapn", "wapń", "кальций", "budowa kości i zębów oraz udział w skurczu mięśni i krzepnięciu krwi", "построение костей и зубов, участие в сокращении мышц и свёртывании крови", 1, ["Ca"], ["Ca"]],
  ["zelazo", "żelazo", "железо", "składnik hemoglobiny przenoszącej tlen; jego niedobór powoduje anemię", "компонент гемоглобина, переносящего кислород; его недостаток вызывает анемию", 1, ["Fe"], ["Fe"]],
  ["jod", "jod", "йод", "składnik hormonów tarczycy; jego niedobór powoduje wole", "компонент гормонов щитовидной железы; его недостаток вызывает зоб", 1, ["I"], []],
  ["fluor", "fluor", "фтор", "wzmacnianie szkliwa zębów i ochrona przed próchnicą", "укрепление зубной эмали и защита от кариеса", 2, ["F"], []],
  ["potas", "potas", "калий", "główny kation wnętrza komórek, niezbędny do przewodzenia impulsów nerwowych i pracy serca", "главный катион внутри клеток, необходимый для проведения нервных импульсов и работы сердца", 2, ["K"], []],
]);

// ---- §4.6 Zasady racjonalnego odżywiania się ----

export const DIET_TERMS = namedTable(P.digestion.diet, [
  ["bmi", "wskaźnik masy ciała", "индекс массы тела", "iloraz masy ciała w kilogramach i kwadratu wzrostu w metrach, służący do oceny prawidłowości masy ciała", "отношение массы тела в килограммах к квадрату роста в метрах, позволяющее оценить, нормальна ли масса", 1, ["BMI"], ["ИМТ", "BMI"]],
  ["ppm", "podstawowa przemiana materii", "основной обмен", "najmniejsza ilość energii potrzebna do podtrzymania funkcji życiowych w spoczynku i na czczo", "наименьшее количество энергии, нужное для поддержания жизненных функций в покое и натощак", 2, ["PPM"], ["основной обмен веществ"]],
  ["cpm", "całkowita przemiana materii", "общий обмен", "podstawowa przemiana materii powiększona o energię zużywaną na aktywność fizyczną i trawienie", "основной обмен плюс энергия, затрачиваемая на физическую активность и пищеварение", 2, ["CPM"], ["общий обмен веществ"]],
  ["wartosc-energetyczna", "wartość energetyczna pokarmu", "энергетическая ценность пищи", "ilość energii uwalnianej z pokarmu w organizmie, podawana w kilokaloriach lub kilodżulach", "количество энергии, освобождающейся из пищи в организме, в килокалориях или килоджоулях", 1, ["kaloryczność", "wartość energetyczna"], ["калорийность", "энергетическая ценность"]],
  ["bilans-dodatni", "dodatni bilans energetyczny", "положительный энергетический баланс", "sytuacja, gdy z pokarmem dostarczamy więcej energii, niż zużywamy, co prowadzi do przyrostu masy ciała", "ситуация, когда с пищей поступает больше энергии, чем тратится, что ведёт к росту массы тела", 2, [], []],
  ["bilans-ujemny", "ujemny bilans energetyczny", "отрицательный энергетический баланс", "sytuacja, gdy z pokarmem dostarczamy mniej energii, niż zużywamy, co prowadzi do spadku masy ciała", "ситуация, когда с пищей поступает меньше энергии, чем тратится, что ведёт к снижению массы тела", 2, [], []],
  ["piramida", "piramida zdrowego żywienia", "пирамида питания", "graficzny schemat proporcji grup produktów w diecie, z aktywnością fizyczną oraz warzywami i owocami u podstawy", "графическая схема пропорций групп продуктов в рационе, в основании которой физическая активность, овощи и фрукты", 1, ["piramida żywieniowa"], ["пищевая пирамида"]],
  ["indeks-glikemiczny", "indeks glikemiczny", "гликемический индекс", "miara tego, jak szybko po zjedzeniu produktu rośnie stężenie glukozy we krwi", "мера того, как быстро после еды растёт уровень глюкозы в крови", 2, ["IG"], ["ГИ"]],
  ["dieta-zbilansowana", "dieta zbilansowana", "сбалансированное питание", "sposób odżywiania dostarczający wszystkich składników pokarmowych w odpowiednich ilościach i proporcjach", "питание, обеспечивающее все питательные вещества в нужном количестве и соотношении", 1, ["zbilansowana dieta"], ["сбалансированная диета"]],
]);
