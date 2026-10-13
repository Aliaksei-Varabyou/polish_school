// Second tables for the paragraphs the first pass covered with only one to four rows (§3.2–3.5,
// 6.5, 6.7, 8.4, 8.5, 9.3, 9.4, 11.2). They are separate tables rather than rows appended to the old
// ones: appending would change the old tasks' distractors, and with them their content ids.
import { P } from "../../../curriculum/lo.ts";
import { namedTable } from "./rows.ts";

export const BONE_TISSUE = namedTable(P.motion.skeleton, [
  ["osteocyty", "osteocyty", "остеоциты", "dojrzałe komórki kostne zamknięte w jamkach istoty międzykomórkowej", "зрелые костные клетки, замурованные в полостях межклеточного вещества", 2, [], []],
  ["osteoblasty", "osteoblasty", "остеобласты", "komórki kościotwórcze wytwarzające istotę międzykomórkową kości", "костеобразующие клетки, вырабатывающие межклеточное вещество кости", 2, [], []],
  ["osteoklasty", "osteoklasty", "остеокласты", "komórki niszczące tkankę kostną, dzięki którym kość może się przebudowywać", "клетки, разрушающие костную ткань, благодаря которым кость перестраивается", 2, [], []],
  ["osteon", "osteon", "остеон", "układ blaszek kostnych ułożonych koncentrycznie wokół kanału z naczyniami krwionośnymi", "система костных пластинок, концентрически расположенных вокруг канала с кровеносными сосудами", 2, ["system Haversa"], ["гаверсова система"]],
  ["chrzastka-nasadowa", "chrząstka nasadowa", "эпифизарная пластинка", "warstwa chrząstki między trzonem a nasadą, dzięki której kość długa rośnie na długość", "слой хряща между диафизом и эпифизом, за счёт которого длинная кость растёт в длину", 2, ["chrząstka wzrostowa"], ["зона роста", "пластинка роста"]],
  ["szpik-zolty", "szpik kostny żółty", "жёлтый костный мозг", "tkanka tłuszczowa wypełniająca jamę szpikową kości długich u dorosłych", "жировая ткань, заполняющая костномозговую полость длинных костей у взрослых", 1, ["szpik żółty"], ["жёлтый мозг"]],
  ["osseina", "osseina", "оссеин", "białko kości (kolagen) nadające jej sprężystość", "белок кости (коллаген), придающий ей упругость", 2, ["kolagen kostny"], ["коллаген кости"]],
  ["sole-mineralne", "sole wapnia i fosforu", "соли кальция и фосфора", "składniki mineralne nadające kości twardość", "минеральные компоненты, придающие кости твёрдость", 1, ["sole mineralne kości", "hydroksyapatyt"], ["минеральные вещества кости", "гидроксиапатит"]],
]);

export const JOINT_TYPES = namedTable(P.motion.joints, [
  ["szwy", "szwy", "швы", "połączenia ścisłe kości czaszki za pomocą tkanki łącznej włóknistej", "неподвижные соединения костей черепа с помощью волокнистой соединительной ткани", 2, ["szew"], ["шов"]],
  ["chrzastkozrost", "chrząstkozrost", "хрящевое соединение", "połączenie kości za pomocą chrząstki, np. kręgów przez krążki międzykręgowe", "соединение костей хрящом, например позвонков межпозвонковыми дисками", 2, [], ["синхондроз"]],
  ["koscozrost", "kościozrost", "синостоз", "zrośnięcie kości tkanką kostną, np. kręgów krzyżowych w kość krzyżową", "сращение костей костной тканью, например крестцовых позвонков в крестец", 2, [], ["костное сращение"]],
  ["torebka-stawowa", "torebka stawowa", "суставная капсула", "łącznotkankowa osłona otaczająca staw i wytwarzająca maź", "соединительнотканная оболочка, окружающая сустав и выделяющая синовиальную жидкость", 1, [], ["суставная сумка"]],
  ["jama-stawowa", "jama stawowa", "суставная полость", "szczelina między powierzchniami stawowymi wypełniona mazią", "щель между суставными поверхностями, заполненная синовиальной жидкостью", 1, [], []],
  ["glowka", "główka stawowa", "суставная головка", "wypukła powierzchnia stawowa jednej z kości", "выпуклая суставная поверхность одной из костей", 1, [], []],
  ["panewka", "panewka stawowa", "суставная впадина", "wklęsła powierzchnia stawowa, w którą wchodzi główka", "вогнутая суставная поверхность, в которую входит головка", 1, ["panewka"], []],
  ["staw-kulisty", "staw kulisty", "шаровидный сустав", "staw pozwalający na ruchy we wszystkich płaszczyznach, np. ramienny i biodrowy", "сустав, допускающий движения во всех плоскостях, например плечевой и тазобедренный", 2, [], []],
  ["staw-zawiasowy", "staw zawiasowy", "блоковидный сустав", "staw pozwalający na ruch tylko w jednej płaszczyźnie, np. międzypaliczkowy", "сустав, допускающий движение только в одной плоскости, например межфаланговый", 2, [], ["блоковой сустав"]],
]);

export const SKELETON_PARTS = namedTable(P.motion.bones, [
  ["mozgoczaszka", "mózgoczaszka", "мозговой отдел черепа", "część czaszki tworząca puszkę chroniącą mózgowie", "часть черепа, образующая коробку, защищающую головной мозг", 1, [], ["мозговой череп"]],
  ["trzewioczaszka", "trzewioczaszka", "лицевой отдел черепа", "część czaszki tworząca szkielet twarzy, z jedyną ruchomą kością — żuchwą", "часть черепа, образующая скелет лица, с единственной подвижной костью — нижней челюстью", 1, ["twarzoczaszka"], ["лицевой череп"]],
  ["kregoslup", "kręgosłup", "позвоночник", "oś ciała z 33–34 kręgów, chroniąca rdzeń kręgowy", "ось тела из 33–34 позвонков, защищающая спинной мозг", 1, [], ["позвоночный столб"]],
  ["krzywizny", "krzywizny kręgosłupa", "изгибы позвоночника", "lordozy i kifozy, które amortyzują wstrząsy podczas chodzenia", "лордозы и кифозы, смягчающие толчки при ходьбе", 2, [], []],
  ["kregi-szyjne", "kręgi szyjne", "шейные позвонки", "siedem kręgów, w tym kręg szczytowy i obrotowy umożliwiające ruchy głowy", "семь позвонков, включая атлант и осевой, обеспечивающие движения головы", 2, [], []],
  ["klatka", "klatka piersiowa", "грудная клетка", "żebra, mostek i kręgi piersiowe chroniące serce i płuca", "рёбра, грудина и грудные позвонки, защищающие сердце и лёгкие", 1, [], []],
  ["mostek", "mostek", "грудина", "płaska kość z przodu klatki piersiowej, do której przyczepiają się żebra prawdziwe", "плоская кость спереди грудной клетки, к которой прикрепляются истинные рёбра", 1, [], []],
  ["obrecz-barkowa", "obręcz barkowa", "плечевой пояс", "obojczyki i łopatki łączące kończyny górne ze szkieletem osiowym", "ключицы и лопатки, соединяющие верхние конечности с осевым скелетом", 2, [], ["пояс верхних конечностей"]],
  ["obrecz-miedniczna", "obręcz miedniczna", "тазовый пояс", "kości miedniczne połączone z kością krzyżową, przenoszące ciężar ciała na kończyny dolne", "тазовые кости, соединённые с крестцом и передающие вес тела на нижние конечности", 2, ["miednica"], ["таз", "пояс нижних конечностей"]],
  ["kosc-udowa", "kość udowa", "бедренная кость", "najdłuższa i najmocniejsza kość ciała człowieka", "самая длинная и прочная кость тела человека", 1, [], []],
]);

export const MUSCLE_WORK = namedTable(P.motion.muscles, [
  ["wlokno", "włókno mięśniowe", "мышечное волокно", "wielojądrowa komórka mięśnia szkieletowego", "многоядерная клетка скелетной мышцы", 1, [], []],
  ["miofibryle", "miofibryle", "миофибриллы", "włókienka kurczliwe wypełniające włókno mięśniowe", "сократительные нити, заполняющие мышечное волокно", 2, ["włókienka kurczliwe"], []],
  ["siateczka", "siateczka sarkoplazmatyczna", "саркоплазматическая сеть", "magazyn jonów wapnia uwalnianych podczas pobudzenia włókna mięśniowego", "хранилище ионов кальция, высвобождаемых при возбуждении мышечного волокна", 3, [], ["саркоплазматический ретикулум"]],
  ["jony-wapnia", "jony wapnia", "ионы кальция", "odsłanianie na aktynie miejsc wiązania miozyny, co uruchamia skurcz", "открытие на актине мест связывания миозина, что запускает сокращение", 2, ["Ca2+"], ["Ca2+"]],
  ["fosfokreatyna", "fosfokreatyna", "креатинфосфат", "związek, który w pierwszych sekundach wysiłku szybko odtwarza ATP", "соединение, быстро восстанавливающее АТФ в первые секунды нагрузки", 3, [], ["фосфокреатин"]],
  ["izotoniczny", "skurcz izotoniczny", "изотоническое сокращение", "skurcz, w którym mięsień skraca się przy stałym napięciu", "сокращение, при котором мышца укорачивается при постоянном напряжении", 2, [], []],
  ["izometryczny", "skurcz izometryczny", "изометрическое сокращение", "skurcz, w którym rośnie napięcie mięśnia bez zmiany jego długości", "сокращение, при котором растёт напряжение мышцы без изменения её длины", 2, [], []],
  ["dlug-tlenowy", "dług tlenowy", "кислородный долг", "dodatkowa ilość tlenu pobierana po wysiłku na usunięcie mleczanu i odtworzenie zapasów ATP", "дополнительный кислород, потребляемый после нагрузки для удаления лактата и восстановления запасов АТФ", 2, [], []],
  ["plytka", "płytka nerwowo-mięśniowa", "нервно-мышечный синапс", "połączenie zakończenia neuronu ruchowego z włóknem mięśniowym", "контакт окончания двигательного нейрона с мышечным волокном", 2, ["synapsa nerwowo-mięśniowa"], ["концевая пластинка"]],
  ["skurcz-tezcowy", "skurcz tężcowy", "тетаническое сокращение", "długotrwały, silny skurcz mięśnia wywołany szybko następującymi po sobie impulsami", "длительное сильное сокращение мышцы, вызванное быстро следующими друг за другом импульсами", 3, [], ["тетанус мышцы"]],
]);

export const LYMPH_PARTS = namedTable(P.circulation.lymph, [
  ["plyn-tkankowy", "płyn tkankowy", "тканевая жидкость", "płyn przesączony z naczyń włosowatych, omywający komórki", "жидкость, отфильтрованная из капилляров и омывающая клетки", 1, ["płyn międzykomórkowy"], ["межклеточная жидкость"]],
  ["limfa", "limfa", "лимфа", "płyn powstający z płynu tkankowego, płynący naczyniami chłonnymi do żył", "жидкость, образующаяся из тканевой и оттекающая по особым сосудам к венам", 1, ["chłonka"], []],
  ["wezly", "węzły chłonne", "лимфатические узлы", "filtrowanie limfy i namnażanie się limfocytów", "фильтрация лимфы и размножение лимфоцитов", 1, ["węzły limfatyczne"], ["лимфоузлы"]],
  ["sledziona", "śledziona", "селезёнка", "usuwanie zużytych erytrocytów i namnażanie się limfocytów", "удаление старых эритроцитов и размножение лимфоцитов", 1, [], []],
  ["grasica", "grasica", "тимус", "dojrzewanie limfocytów T, najaktywniejsza w dzieciństwie", "созревание Т-лимфоцитов, наиболее активна в детстве", 2, [], ["вилочковая железа"]],
  ["migdalki", "migdałki", "миндалины", "skupiska tkanki limfatycznej w gardle, chroniące wejście do dróg oddechowych i pokarmowych", "скопления лимфоидной ткани в глотке, защищающие вход в дыхательные и пищеварительные пути", 1, [], []],
  ["przewod-piersiowy", "przewód piersiowy", "грудной проток", "największe naczynie chłonne, uchodzące do żyły w okolicy szyi", "самый крупный лимфатический сосуд, впадающий в вену в области шеи", 2, [], []],
  ["naczynie-centralne", "naczynie chłonne kosmka", "млечный сосуд", "wchłanianie strawionych tłuszczów w kosmkach jelita cienkiego", "всасывание переваренных жиров в ворсинках тонкой кишки", 2, ["naczynie chłonne centralne"], ["центральный лимфатический сосуд ворсинки"]],
]);

export const IMMUNE_CELLS = namedTable(P.circulation.immune, [
  ["antygen", "antygen", "антиген", "cząsteczka rozpoznawana przez układ odpornościowy jako obca", "молекула, которую иммунная система распознаёт как чужую", 1, [], []],
  ["przeciwciala", "przeciwciała", "антитела", "białka wytwarzane przez komórki plazmatyczne, swoiście wiążące antygen", "белки, вырабатываемые плазматическими клетками и специфически связывающие антиген", 1, ["immunoglobuliny"], ["иммуноглобулины"]],
  ["plazmatyczne", "komórki plazmatyczne", "плазматические клетки", "zróżnicowane limfocyty B wytwarzające przeciwciała", "дифференцированные В-лимфоциты, вырабатывающие антитела", 2, ["plazmocyty"], ["плазмоциты"]],
  ["pamieci", "komórki pamięci", "клетки памяти", "długowieczne limfocyty zapewniające szybką odpowiedź przy ponownym kontakcie z tym samym antygenem", "долгоживущие лимфоциты, обеспечивающие быстрый ответ при повторной встрече с тем же антигеном", 1, ["limfocyty pamięci"], ["лимфоциты памяти"]],
  ["neutrofile", "neutrofile", "нейтрофилы", "najliczniejsze granulocyty, pierwsze docierające do miejsca zakażenia i fagocytujące bakterie", "самые многочисленные гранулоциты, первыми прибывающие к очагу инфекции и поглощающие бактерии", 2, ["granulocyty obojętnochłonne"], ["нейтрофильные гранулоциты"]],
  ["tc", "limfocyty T cytotoksyczne", "цитотоксические Т-лимфоциты", "swoiste niszczenie komórek zakażonych wirusami po rozpoznaniu antygenu prezentowanego na ich powierzchni", "специфическое уничтожение заражённых вирусами клеток после распознавания антигена на их поверхности", 2, ["limfocyty Tc"], ["Т-киллеры"]],
  ["th", "limfocyty T pomocnicze", "Т-хелперы", "pobudzanie limfocytów B i innych komórek odpornościowych do działania", "активация В-лимфоцитов и других иммунных клеток", 2, ["limfocyty Th"], ["Т-помощники"]],
  ["nk", "komórki NK", "NK-клетки", "niszczenie komórek zakażonych i nowotworowych bez wcześniejszego kontaktu z antygenem", "уничтожение заражённых и опухолевых клеток без предварительной встречи с антигеном", 2, ["naturalni zabójcy"], ["естественные киллеры"]],
  ["interferony", "interferony", "интерфероны", "białka wydzielane przez komórki zakażone wirusem, chroniące komórki sąsiednie", "белки, выделяемые заражёнными вирусом клетками и защищающие соседние клетки", 2, [], []],
]);

export const PERIPHERAL_PARTS = namedTable(P.nervous.peripheral, [
  ["nerwy-czaszkowe", "nerwy czaszkowe", "черепные нервы", "12 par nerwów odchodzących od mózgowia", "12 пар нервов, отходящих от головного мозга", 1, [], ["черепно-мозговые нервы"]],
  ["nerwy-rdzeniowe", "nerwy rdzeniowe", "спинномозговые нервы", "31 par nerwów mieszanych odchodzących od rdzenia kręgowego", "31 пара смешанных нервов, отходящих от спинного мозга", 1, [], []],
  ["korzen-grzbietowy", "korzeń grzbietowy", "задний корешок", "część nerwu rdzeniowego z włóknami czuciowymi i zwojem rdzeniowym", "часть спинномозгового нерва с чувствительными волокнами и спинномозговым узлом", 2, ["korzeń tylny"], ["дорсальный корешок"]],
  ["korzen-brzuszny", "korzeń brzuszny", "передний корешок", "część nerwu rdzeniowego z włóknami ruchowymi", "часть спинномозгового нерва с двигательными волокнами", 2, ["korzeń przedni"], ["вентральный корешок"]],
  ["receptor", "receptor", "рецептор", "element łuku odruchowego odbierający bodziec", "звено рефлекторной дуги, воспринимающее раздражение", 1, [], []],
  ["efektor", "efektor", "эффектор", "narząd wykonawczy — mięsień lub gruczoł — reagujący na impuls nerwowy", "исполнительный орган — мышца или железа, — отвечающий на нервный импульс", 1, [], ["рабочий орган"]],
  ["neuron-czuciowy", "neuron czuciowy", "чувствительный нейрон", "przewodzenie impulsów od receptora do ośrodkowego układu nerwowego", "проведение импульсов от рецептора к центральной нервной системе", 1, ["neuron dośrodkowy", "neuron aferentny"], ["афферентный нейрон", "центростремительный нейрон"]],
  ["neuron-ruchowy", "neuron ruchowy", "двигательный нейрон", "przewodzenie impulsów z ośrodkowego układu nerwowego do efektora", "проведение импульсов от центральной нервной системы к эффектору", 1, ["neuron odśrodkowy", "motoneuron"], ["мотонейрон", "эфферентный нейрон"]],
  ["bezwarunkowy", "odruch bezwarunkowy", "безусловный рефлекс", "wrodzona, niezmienna reakcja na bodziec, np. odruch kolanowy", "врождённая неизменная реакция на раздражитель, например коленный рефлекс", 1, ["odruch wrodzony"], ["врождённый рефлекс"]],
  ["warunkowy", "odruch warunkowy", "условный рефлекс", "reakcja nabyta w ciągu życia przez skojarzenie bodźców", "реакция, приобретённая в течение жизни при сочетании раздражителей", 1, ["odruch nabyty"], ["приобретённый рефлекс"]],
]);

export const AUTONOMIC_PARTS = namedTable(P.nervous.autonomic, [
  ["somatyczny", "układ somatyczny", "соматическая нервная система", "część układu nerwowego kierująca świadomymi ruchami mięśni szkieletowych", "часть нервной системы, управляющая произвольными движениями скелетных мышц", 1, ["somatyczny układ nerwowy"], []],
  ["autonomiczny", "układ autonomiczny", "вегетативная нервная система", "część układu nerwowego regulująca niezależnie od woli pracę narządów wewnętrznych", "часть нервной системы, независимо от воли регулирующая работу внутренних органов", 1, ["autonomiczny układ nerwowy", "układ wegetatywny"], ["автономная нервная система"]],
  ["acetylocholina", "acetylocholina", "ацетилхолин", "główny neuroprzekaźnik zakończeń części przywspółczulnej", "главный медиатор окончаний парасимпатической части", 2, [], []],
  ["noradrenalina", "noradrenalina", "норадреналин", "neuroprzekaźnik zakończeń zazwojowych części współczulnej", "медиатор постганглионарных окончаний симпатической части", 2, [], []],
  ["nerw-bledny", "nerw błędny", "блуждающий нерв", "główny nerw przywspółczulny unerwiający serce, płuca i przewód pokarmowy", "главный парасимпатический нерв, иннервирующий сердце, лёгкие и пищеварительный тракт", 2, [], []],
  ["pien-wspolczulny", "pień współczulny", "симпатический ствол", "łańcuch zwojów po obu stronach kręgosłupa", "цепочка ганглиев по обе стороны позвоночника", 2, [], []],
  ["walcz-uciekaj", "reakcja „walcz lub uciekaj”", "реакция «бей или беги»", "przyspieszenie pracy serca, rozszerzenie źrenic i oskrzeli pod wpływem części współczulnej", "учащение работы сердца, расширение зрачков и бронхов под действием симпатической части", 1, ["walcz lub uciekaj"], ["бей или беги"]],
  ["podwojne-unerwienie", "podwójne unerwienie", "двойная иннервация", "unerwienie większości narządów wewnętrznych przez obie części autonomiczne o przeciwnym działaniu", "иннервация большинства внутренних органов обеими вегетативными частями с противоположным действием", 2, [], []],
]);

export const EAR_PARTS = namedTable(P.senses.ear, [
  ["malzowina", "małżowina uszna", "ушная раковина", "zbieranie fal dźwiękowych i kierowanie ich do przewodu słuchowego", "улавливание звуковых волн и направление их в слуховой проход", 1, [], []],
  ["przewod", "przewód słuchowy zewnętrzny", "наружный слуховой проход", "doprowadzanie dźwięku do błony bębenkowej", "проведение звука к барабанной перепонке", 1, ["przewód słuchowy"], ["слуховой проход"]],
  ["blona-bebenkowa", "błona bębenkowa", "барабанная перепонка", "zamiana fal dźwiękowych na drgania przekazywane kosteczkom słuchowym", "превращение звуковых волн в колебания, передаваемые слуховым косточкам", 1, [], []],
  ["okienko", "okienko owalne", "овальное окно", "przekazywanie drgań strzemiączka do płynu wypełniającego ślimak", "передача колебаний стремечка жидкости, заполняющей улитку", 2, [], []],
  ["komorki-rzeskowe", "komórki zmysłowe z rzęskami", "волосковые клетки", "receptory słuchu i równowagi zamieniające ruch płynu na impulsy nerwowe", "рецепторы слуха и равновесия, превращающие движение жидкости в нервные импульсы", 2, ["komórki rzęsate", "komórki włoskowate"], ["волосковые рецепторы"]],
  ["przedsionek", "przedsionek", "преддверие", "odbieranie położenia głowy względem siły ciężkości i ruchów prostoliniowych", "восприятие положения головы относительно силы тяжести и прямолинейных движений", 2, ["woreczek i łagiewka"], ["мешочек и маточка"]],
  ["otolity", "otolity", "отолиты", "kryształki węglanu wapnia uciskające komórki zmysłowe przy zmianie położenia głowy", "кристаллики карбоната кальция, давящие на рецепторы при изменении положения головы", 2, ["kamyczki błędnikowe"], ["статолиты"]],
  ["ucho-srodkowe", "ucho środkowe", "среднее ухо", "wypełniona powietrzem jama bębenkowa z kosteczkami słuchowymi", "заполненная воздухом барабанная полость со слуховыми косточками", 1, ["jama bębenkowa"], ["барабанная полость"]],
  ["nerw-sluchowy", "nerw przedsionkowo-ślimakowy", "преддверно-улитковый нерв", "przewodzenie impulsów słuchowych i równowagi do mózgowia", "проведение слуховых импульсов и импульсов равновесия к мозгу", 2, ["nerw słuchowy"], ["слуховой нерв"]],
]);

export const CHEMICAL_SENSES = namedTable(P.senses["taste-smell"], [
  ["chemoreceptory", "chemoreceptory", "хеморецепторы", "receptory pobudzane przez cząsteczki substancji chemicznych", "рецепторы, возбуждаемые молекулами химических веществ", 1, [], []],
  ["nablonek-wechowy", "nabłonek węchowy", "обонятельный эпителий", "warstwa z receptorami węchu w górnej części jamy nosowej", "слой с обонятельными рецепторами в верхней части носовой полости", 1, ["okolica węchowa"], ["обонятельная область"]],
  ["opuszka", "opuszka węchowa", "обонятельная луковица", "pierwszy ośrodek przetwarzania bodźców węchowych w mózgowiu", "первый центр обработки обонятельных сигналов в головном мозге", 2, [], []],
  ["brodawki", "brodawki językowe", "сосочки языка", "uwypuklenia błony śluzowej języka, w których leżą kubki smakowe", "выступы слизистой языка, в которых находятся вкусовые почки", 1, [], ["вкусовые сосочки"]],
  ["slodki", "smak słodki", "сладкий вкус", "smak sygnalizujący obecność cukrów — źródła energii", "вкус, сигнализирующий о сахарах — источнике энергии", 1, [], []],
  ["slony", "smak słony", "солёный вкус", "smak wywoływany przez jony sodu", "вкус, вызываемый ионами натрия", 1, [], []],
  ["kwasny", "smak kwaśny", "кислый вкус", "smak wywoływany przez jony wodoru", "вкус, вызываемый ионами водорода", 1, [], []],
  ["gorzki", "smak gorzki", "горький вкус", "smak ostrzegający przed potencjalnie trującymi substancjami", "вкус, предупреждающий о возможно ядовитых веществах", 1, [], []],
  ["umami", "umami", "умами", "smak glutaminianu, sygnalizujący pokarm bogaty w białko", "вкус глутамата, сигнализирующий о богатой белком пище", 2, ["smak umami"], ["вкус умами"]],
  ["adaptacja", "adaptacja węchowa", "обонятельная адаптация", "słabnięcie odczuwania zapachu przy długotrwałym działaniu tego samego bodźca", "ослабление ощущения запаха при длительном действии одного и того же раздражителя", 2, [], []],
]);

export const MALE_PARTS = namedTable(P.reproduction.male, [
  ["kanaliki-nasienne", "kanaliki nasienne", "семенные канальцы", "miejsce powstawania plemników w jądrach", "место образования сперматозоидов в семенниках", 2, ["kanaliki nasienne kręte"], ["извитые семенные канальцы"]],
  ["leydig", "komórki Leydiga", "клетки Лейдига", "wydzielanie testosteronu w jądrach", "выделение тестостерона в семенниках", 3, ["komórki śródmiąższowe"], ["интерстициальные клетки"]],
  ["sertoli", "komórki Sertolego", "клетки Сертоли", "odżywianie i ochrona rozwijających się plemników", "питание и защита развивающихся сперматозоидов", 3, [], []],
  ["moszna", "moszna", "мошонка", "utrzymywanie jąder w temperaturze o 2–3 °C niższej niż temperatura ciała", "поддержание семенников при температуре на 2–3 °C ниже температуры тела", 1, [], []],
  ["nasieniowod", "nasieniowody", "семявыносящие протоки", "przewodzenie plemników z najądrzy do cewki moczowej", "проведение сперматозоидов из придатков к мочеиспускательному каналу", 2, ["nasieniowód"], ["семявыносящий проток"]],
  ["pecherzyki-nasienne", "pęcherzyki nasienne", "семенные пузырьки", "wydzielanie płynu bogatego we fruktozę — źródło energii dla plemników", "выделение жидкости, богатой фруктозой, — источника энергии для сперматозоидов", 2, [], []],
  ["prostata", "gruczoł krokowy", "предстательная железа", "wydzielanie płynu z enzymami i cynkiem, który wchodzi w skład nasienia i pobudza ruch plemników", "выделение жидкости с ферментами и цинком, входящей в состав спермы и активирующей сперматозоиды", 1, ["prostata"], ["простата"]],
  ["plemnik", "plemnik", "сперматозоид", "męska gameta z główką, wstawką pełną mitochondriów i witką", "мужская гамета с головкой, средней частью с митохондриями и жгутиком", 1, [], []],
  ["akrosom", "akrosom", "акросома", "pęcherzyk z enzymami rozpuszczającymi osłonki komórki jajowej", "пузырёк с ферментами, растворяющими оболочки яйцеклетки", 2, [], []],
  ["testosteron", "testosteron", "тестостерон", "męski hormon płciowy, warunkujący rozwój drugorzędowych cech płciowych", "мужской половой гормон, обеспечивающий развитие вторичных половых признаков", 1, [], []],
]);

export const NEURON_WORK = namedTable(P.nervous.structure, [
  ["neuroprzekaznik", "neuroprzekaźnik", "нейромедиатор", "substancja uwalniana z zakończenia aksonu do szczeliny synaptycznej, przenosząca sygnał na kolejną komórkę", "вещество, выделяемое из окончания аксона в синаптическую щель и передающее сигнал следующей клетке", 1, ["neurotransmiter", "mediator"], ["нейротрансмиттер", "медиатор"]],
  ["szczelina", "szczelina synaptyczna", "синаптическая щель", "wąska przestrzeń między błoną presynaptyczną a postsynaptyczną", "узкое пространство между пресинаптической и постсинаптической мембранами", 1, [], []],
  ["pompa", "pompa sodowo-potasowa", "натрий-калиевый насос", "białko błony wypompowujące z komórki 3 jony Na⁺ i wprowadzające 2 jony K⁺ kosztem ATP", "белок мембраны, выкачивающий из клетки 3 иона Na⁺ и закачивающий 2 иона K⁺ за счёт АТФ", 2, ["ATP-aza sodowo-potasowa", "pompa Na⁺/K⁺"], ["Na/K-насос", "натрий-калиевая АТФаза"]],
  ["depolaryzacja", "depolaryzacja", "деполяризация", "zmniejszenie różnicy potencjałów po obu stronach błony neuronu wskutek napływu jonów sodu", "уменьшение разности потенциалов по обе стороны мембраны нейрона из-за входа ионов натрия", 2, [], []],
  ["repolaryzacja", "repolaryzacja", "реполяризация", "powrót potencjału błony do wartości spoczynkowej dzięki wypływowi jonów potasu", "возврат мембранного потенциала к уровню покоя благодаря выходу ионов калия", 2, [], []],
  ["skokowe", "przewodzenie skokowe", "сальтаторное проведение", "przeskakiwanie impulsu między przewężeniami w aksonach otoczonych osłonką mielinową", "перескакивание импульса между перехватами в аксонах с миелиновой оболочкой", 2, [], ["скачкообразное проведение"]],
  ["ranvier", "przewężenia Ranviera", "перехваты Ранвье", "krótkie odcinki aksonu pozbawione osłonki mielinowej", "короткие участки аксона без миелиновой оболочки", 2, ["przewężenie Ranviera"], ["перехват Ранвье"]],
  ["refrakcja", "okres refrakcji", "рефрактерный период", "krótki czas po impulsie, w którym neuron nie reaguje na kolejny bodziec lub reaguje tylko na bodziec silniejszy niż zwykle", "короткое время после импульса, когда нейрон не отвечает на новое раздражение или отвечает лишь на более сильное", 2, ["refrakcja"], ["рефрактерность"]],
  ["wszystko-albo-nic", "zasada „wszystko albo nic”", "закон «всё или ничего»", "impuls powstaje z pełną siłą tylko po przekroczeniu progu pobudliwości, a słabszy bodziec go nie wywołuje", "импульс возникает в полную силу только при превышении порога возбудимости, а более слабый раздражитель его не вызывает", 2, ["wszystko albo nic", "prawo wszystko albo nic"], ["всё или ничего"]],
  ["glej", "komórki glejowe", "глиальные клетки", "komórki tkanki nerwowej odżywiające, chroniące i izolujące neurony", "клетки нервной ткани, питающие, защищающие и изолирующие нейроны", 1, ["glej", "neuroglej"], ["глия", "нейроглия"]],
]);

export const BRAIN_PARTS = namedTable(P.nervous.central, [
  ["cialo-modzelowate", "ciało modzelowate", "мозолистое тело", "pasmo włókien nerwowych łączące obie półkule mózgu", "пучок нервных волокон, соединяющий оба полушария", 2, [], []],
  ["plat-czolowy", "płat czołowy", "лобная доля", "planowanie, podejmowanie decyzji i ośrodek ruchowy kory", "планирование, принятие решений и двигательный центр коры", 2, [], []],
  ["plat-ciemieniowy", "płat ciemieniowy", "теменная доля", "ośrodek czucia dotyku, bólu i temperatury z powierzchni ciała", "центр осязания, боли и температуры с поверхности тела", 2, [], []],
  ["plat-skroniowy", "płat skroniowy", "височная доля", "ośrodek słuchu i rozumienia mowy", "центр слуха и понимания речи", 2, [], []],
  ["plat-potyliczny", "płat potyliczny", "затылочная доля", "ośrodek wzroku", "центр зрения", 1, [], []],
  ["wzgorze", "wzgórze", "таламус", "stacja przekaźnikowa kierująca impulsy czuciowe do kory mózgu", "переключательная станция, направляющая чувствительные импульсы в кору", 2, [], ["зрительный бугор"]],
  ["srodmozgowie", "śródmózgowie", "средний мозг", "ośrodki odruchów wzrokowych i słuchowych, np. zwężania źrenicy", "центры зрительных и слуховых рефлексов, например сужения зрачка", 2, [], []],
  ["most", "most", "мост", "droga łącząca móżdżek z resztą mózgowia, współudział w regulacji oddychania", "путь, связывающий мозжечок с остальным мозгом, участие в регуляции дыхания", 2, ["most Varola"], ["варолиев мост"]],
  ["opony", "opony mózgowo-rdzeniowe", "мозговые оболочки", "trzy błony z tkanki łącznej chroniące mózgowie i rdzeń kręgowy", "три соединительнотканные оболочки, защищающие головной и спинной мозг", 1, ["opony"], ["оболочки мозга"]],
  ["plyn-mozgowo-rdzeniowy", "płyn mózgowo-rdzeniowy", "спинномозговая жидкость", "płyn amortyzujący wstrząsy i odżywiający tkankę nerwową, wypełniający komory mózgu", "жидкость, смягчающая толчки и питающая нервную ткань, заполняющая желудочки мозга", 2, [], ["ликвор", "цереброспинальная жидкость"]],
  ["istota-szara", "istota szara", "серое вещество", "skupiska ciał neuronów: w rdzeniu kręgowym wewnątrz, w mózgu na powierzchni jako kora", "скопления тел нейронов: в спинном мозге внутри, в головном на поверхности в виде коры", 1, [], []],
  ["istota-biala", "istota biała", "белое вещество", "skupiska aksonów otoczonych osłonkami mielinowymi, tworzące drogi nerwowe", "скопления покрытых миелином аксонов, образующие проводящие пути", 1, [], []],
]);

export const DEVELOPMENT_STAGES = namedTable(P.reproduction.development, [
  ["blastocysta", "blastocysta", "бластоциста", "pęcherzyk zarodkowy, który zagnieżdża się w błonie śluzowej macicy", "зародышевый пузырёк, который внедряется в слизистую оболочку матки", 2, [], []],
  ["implantacja", "implantacja", "имплантация", "zagnieżdżenie się zarodka w błonie śluzowej macicy ok. tydzień po zapłodnieniu", "внедрение зародыша в слизистую оболочку матки примерно через неделю после оплодотворения", 2, ["zagnieżdżenie"], []],
  ["gastrulacja", "gastrulacja", "гаструляция", "etap rozwoju zarodkowego, w którym powstają listki zarodkowe", "этап зародышевого развития, на котором образуются зародышевые листки", 2, [], []],
  ["organogeneza", "organogeneza", "органогенез", "powstawanie zawiązków narządów z listków zarodkowych, w zasadzie do końca 8. tygodnia rozwoju (licząc od zapłodnienia)", "образование зачатков органов из зародышевых листков, в основном до конца 8-й недели развития (от оплодотворения)", 2, [], []],
  ["okres-plodowy", "okres płodowy", "плодный период", "czas od 9. tygodnia rozwoju do porodu, w którym narządy rosną i dojrzewają", "время от 9-й недели развития до родов, когда органы растут и созревают", 2, [], ["фетальный период"]],
  ["owodnia", "owodnia", "амнион", "błona płodowa tworząca pęcherz z płynem, który chroni zarodek przed wstrząsami i wysychaniem", "зародышевая оболочка, образующая пузырь с жидкостью, защищающей зародыш от толчков и высыхания", 1, [], ["водная оболочка"]],
  ["kosmowka", "kosmówka", "хорион", "zewnętrzna błona płodowa, której kosmki tworzą płodową część łożyska", "наружная зародышевая оболочка, ворсинки которой образуют плодную часть плаценты", 2, [], ["ворсинчатая оболочка"]],
  ["pepowina", "pępowina", "пуповина", "sznur z naczyniami krwionośnymi łączący płód z łożyskiem", "тяж с кровеносными сосудами, соединяющий плод с плацентой", 1, [], []],
  ["porod", "poród", "роды", "wydalenie płodu z macicy dzięki skurczom, które nasila oksytocyna", "изгнание плода из матки благодаря схваткам, которые усиливает окситоцин", 1, [], []],
  ["pokwitanie", "pokwitanie", "половое созревание", "okres dojrzewania płciowego, w którym pojawiają się drugorzędowe cechy płciowe", "период полового созревания, когда появляются вторичные половые признаки", 1, ["dojrzewanie płciowe"], ["пубертат"]],
  ["antykoncepcja-hormonalna", "antykoncepcja hormonalna", "гормональная контрацепция", "metoda zapobiegania ciąży polegająca na hamowaniu owulacji przez syntetyczne hormony", "метод предупреждения беременности, основанный на подавлении овуляции синтетическими гормонами", 2, ["tabletki antykoncepcyjne"], ["противозачаточные таблетки"]],
  ["prezerwatywa", "prezerwatywa", "презерватив", "mechaniczna metoda antykoncepcji, która chroni też przed chorobami przenoszonymi drogą płciową", "барьерный метод контрацепции, защищающий также от болезней, передающихся половым путём", 1, [], []],
]);

export const IMMUNITY_MECHANISMS = namedTable(P.circulation.immunity, [
  ["szczepionka", "szczepionka", "вакцина", "preparat z osłabionych lub zabitych drobnoustrojów albo ich antygenów, wywołujący odporność czynną", "препарат из ослабленных или убитых микробов либо их антигенов, вызывающий активный иммунитет", 1, [], []],
  ["surowica", "surowica odpornościowa", "лечебная сыворотка", "preparat z gotowymi przeciwciałami, dający natychmiastową, ale krótkotrwałą odporność bierną", "препарат с готовыми антителами, дающий немедленный, но кратковременный пассивный иммунитет", 1, ["surowica"], ["иммунная сыворотка"]],
  ["humoralna", "odpowiedź humoralna", "гуморальный иммунный ответ", "odpowiedź swoista z udziałem przeciwciał wytwarzanych przez komórki plazmatyczne", "специфический ответ с участием антител, вырабатываемых плазматическими клетками", 2, ["odporność humoralna"], ["гуморальный иммунитет"]],
  ["komorkowa", "odpowiedź komórkowa", "клеточный иммунный ответ", "odpowiedź swoista, w której limfocyty T bezpośrednio niszczą zakażone komórki", "специфический ответ, при котором Т-лимфоциты непосредственно уничтожают заражённые клетки", 2, ["odporność komórkowa"], ["клеточный иммунитет"]],
  ["fagocytoza", "fagocytoza", "фагоцитоз", "pochłanianie i trawienie drobnoustrojów przez makrofagi i neutrofile", "поглощение и переваривание микробов макрофагами и нейтрофилами", 1, [], []],
  ["zapalenie", "stan zapalny", "воспаление", "miejscowa reakcja obronna z zaczerwienieniem, obrzękiem, bólem i ociepleniem tkanki", "местная защитная реакция с покраснением, отёком, болью и повышением температуры ткани", 1, ["zapalenie"], ["воспалительная реакция"]],
  ["goraczka", "gorączka", "лихорадка", "podwyższenie temperatury ciała, które hamuje namnażanie się drobnoustrojów", "повышение температуры тела, тормозящее размножение микробов", 1, [], ["жар"]],
  ["odpowiedz-wtorna", "odpowiedź wtórna", "вторичный иммунный ответ", "szybsza i silniejsza reakcja przy ponownym kontakcie z antygenem dzięki komórkom pamięci", "более быстрая и сильная реакция при повторной встрече с антигеном благодаря клеткам памяти", 2, ["wtórna odpowiedź immunologiczna"], ["вторичный ответ"]],
  ["odpornosc-zbiorowiskowa", "odporność populacyjna", "коллективный иммунитет", "ochrona osób niezaszczepionych dzięki zaszczepieniu większości populacji", "защита непривитых людей благодаря вакцинации большинства населения", 2, ["odporność zbiorowiskowa", "odporność stadna"], ["популяционный иммунитет"]],
]);
