// §1.1 and the opening "… u zwierząt" paragraph of every dział (3.1–11.1): the human body set
// against the rest of the animal kingdom. Each table is filed under its own paragraph.
import { P } from "../../../curriculum/lo.ts";
import { namedTable } from "./rows.ts";

// ---- §1.1 Miejsce człowieka w systemie klasyfikacji organizmów ----

export const CLASSIFICATION = namedTable(P.organism.classification, [
  ["strunowce", "strunowce", "хордовые", "typ zwierząt, które w rozwoju mają strunę grzbietową, grzbietową cewkę nerwową i szczeliny skrzelowe w gardzieli", "тип животных, у которых в развитии есть хорда, спинная нервная трубка и жаберные щели в глотке", 1, ["Chordata"], ["Chordata"]],
  ["kregowce", "kręgowce", "позвоночные", "podtyp strunowców, u których strunę grzbietową zastępuje kręgosłup, a mózgowie chroni czaszka", "подтип хордовых, у которых хорду заменяет позвоночник, а головной мозг защищает череп", 1, ["Vertebrata"], ["Vertebrata"]],
  ["ssaki", "ssaki", "млекопитающие", "gromada stałocieplnych kręgowców z włosami i przeponą, karmiących młode mlekiem", "класс теплокровных позвоночных с волосяным покровом и диафрагмой, выкармливающих детёнышей молоком", 1, ["Mammalia"], ["Mammalia"]],
  ["lozyskowce", "łożyskowce", "плацентарные", "ssaki, których młode przed urodzeniem rozwijają się w macicy, odżywiane przez matkę za pośrednictwem specjalnego narządu", "млекопитающие, чьи детёныши до рождения развиваются в матке и получают питание от матери через особый орган", 2, ["ssaki łożyskowe"], ["плацентарные млекопитающие"]],
  ["naczelne", "naczelne", "приматы", "rząd ssaków z chwytnymi dłońmi, przeciwstawnym kciukiem, paznokciami i widzeniem przestrzennym", "отряд млекопитающих с хватательными кистями, противопоставленным большим пальцем, ногтями и объёмным зрением", 1, ["Primates"], ["Primates"]],
  ["czlowiekowate", "człowiekowate", "гоминиды", "rodzina naczelnych obejmująca ludzi oraz orangutany, goryle i szympansy", "семейство приматов, к которому относятся люди, а также орангутаны, гориллы и шимпанзе", 2, ["Hominidae", "hominidy"], ["Hominidae"]],
  ["homo-sapiens", "człowiek rozumny", "человек разумный", "jedyny żyjący gatunek z rodzaju Homo, o dwunożnym chodzie i największym względem ciała mózgowiu", "единственный ныне живущий вид рода Homo, с прямохождением и самым крупным относительно тела мозгом", 1, ["Homo sapiens"], ["Homo sapiens"]],
  ["dwunoznosc", "dwunożność", "прямохождение", "poruszanie się na dwóch kończynach, z którym wiążą się esowato wygięty kręgosłup i wysklepiona stopa", "передвижение на двух конечностях, с которым связаны S-образный позвоночник и сводчатая стопа", 2, ["bipedalizm"], ["двуногость", "бипедализм"]],
  ["kciuk", "przeciwstawny kciuk", "противопоставленный большой палец", "cecha ręki naczelnych umożliwiająca precyzyjny chwyt i posługiwanie się narzędziami", "особенность кисти приматов, позволяющая точный захват и работу с орудиями", 2, ["kciuk przeciwstawny"], []],
  ["binominalne", "nazewnictwo binominalne", "биноминальная номенклатура", "dwuczłonowa łacińska nazwa gatunku: nazwa rodzaju i epitet gatunkowy, np. Homo sapiens", "двойное латинское название вида: название рода и видовой эпитет, например Homo sapiens", 2, ["nomenklatura binominalna", "nazewnictwo dwuimienne"], ["бинарная номенклатура"]],
]);

// ---- §3.1 Ruch u zwierząt ----

export const ANIMAL_MOTION = namedTable(P.motion.animals, [
  ["hydroszkielet", "szkielet hydrostatyczny", "гидростатический скелет", "płyn wypełniający jamę ciała pod ciśnieniem, o który opierają się kurczące się mięśnie, np. u dżdżownicy", "жидкость под давлением в полости тела, на которую опираются сокращающиеся мышцы, например у дождевого червя", 2, ["hydroszkielet"], ["гидроскелет"]],
  ["egzoszkielet", "szkielet zewnętrzny", "наружный скелет", "chitynowy pancerz na powierzchni ciała stawonogów, do którego od wewnątrz przyczepione są mięśnie", "хитиновый панцирь на поверхности тела членистоногих, к которому изнутри прикреплены мышцы", 1, ["egzoszkielet", "pancerz chitynowy"], ["экзоскелет"]],
  ["endoszkielet", "szkielet wewnętrzny", "внутренний скелет", "rusztowanie z kości i chrząstek wewnątrz ciała kręgowców, rosnące razem z organizmem", "каркас из костей и хрящей внутри тела позвоночных, растущий вместе с организмом", 1, ["endoszkielet"], ["эндоскелет"]],
  ["linienie", "linienie", "линька", "zrzucanie zbyt ciasnego oskórka, które umożliwia stawonogom wzrost", "сбрасывание ставшей тесной кутикулы, позволяющее членистоногим расти", 1, [], []],
  ["wor", "wór powłokowo-mięśniowy", "кожно-мускульный мешок", "nabłonek zrośnięty z warstwami mięśni okrężnych i podłużnych, poruszający ciałem robaków", "эпителий, сросшийся со слоями кольцевых и продольных мышц, который двигает тело червей", 2, [], []],
  ["pelzakowaty", "ruch pełzakowaty", "амебоидное движение", "przemieszczanie się dzięki nibynóżkom powstającym przez przelewanie się cytoplazmy, np. u leukocytów", "передвижение с помощью ложноножек, возникающих при перетекании цитоплазмы, например у лейкоцитов", 2, ["ruch ameboidalny"], ["амёбоидное движение"]],
  ["rzeskowy", "ruch rzęskowy", "ресничное движение", "przemieszczanie się dzięki zsynchronizowanemu biciu licznych rzęsek, np. u wypławka", "передвижение благодаря согласованному биению многочисленных ресничек, например у планарии", 2, [], ["мерцательное движение"]],
  ["odrzutowy", "ruch odrzutowy", "реактивное движение", "wyrzucanie wody z jamy płaszczowej przez lejek, stosowane przez głowonogi", "выталкивание воды из мантийной полости через воронку, которым пользуются головоногие", 2, [], []],
  ["struna", "struna grzbietowa", "хорда", "elastyczny pręt podporowy wzdłuż grzbietu lancetnika i zarodków strunowców", "упругий опорный стержень вдоль спины ланцетника и зародышей хордовых", 2, ["chorda"], ["спинная струна"]],
]);

// ---- §4.1 Odżywianie się zwierząt ----

export const ANIMAL_FEEDING = namedTable(P.digestion.animals, [
  ["roslinozercy", "roślinożercy", "растительноядные", "zwierzęta zjadające rośliny, z długim jelitem, często z mikroorganizmami rozkładającymi celulozę", "животные, поедающие растения, с длинным кишечником, часто с микроорганизмами, расщепляющими целлюлозу", 1, ["fitofagi"], ["фитофаги"]],
  ["miesozercy", "mięsożercy", "плотоядные", "zwierzęta zjadające inne zwierzęta, z ostrymi kłami i stosunkowo krótkim jelitem", "животные, поедающие других животных, с острыми клыками и сравнительно коротким кишечником", 1, [], ["хищники"]],
  ["wszystkozercy", "wszystkożercy", "всеядные", "zwierzęta jedzące pokarm roślinny i zwierzęcy, o uzębieniu z cechami pośrednimi", "животные, питающиеся растительной и животной пищей, с зубами промежуточного типа", 1, [], []],
  ["filtratory", "filtratory", "фильтраторы", "zwierzęta odcedzające drobne cząstki pokarmu z wody, np. małże i fiszbinowce", "животные, отцеживающие мелкие частицы пищи из воды, например двустворчатые моллюски и усатые киты", 2, [], []],
  ["zoladek-przezuwaczy", "żołądek wielokomorowy", "многокамерный желудок", "żołądek przeżuwaczy, w którego żwaczu mikroorganizmy rozkładają celulozę", "желудок жвачных, в рубце которого микроорганизмы расщепляют целлюлозу", 2, ["żołądek przeżuwaczy"], ["желудок жвачных"]],
  ["wole", "wole", "зоб", "rozszerzenie przełyku ptaków, w którym pokarm jest gromadzony i rozmiękczany", "расширение пищевода птиц, где пища накапливается и размягчается", 2, [], []],
  ["zoladek-miesniowy", "żołądek mięśniowy", "мускульный желудок", "część żołądka ptaków, która rozciera pokarm z pomocą połkniętych kamyków", "отдел желудка птиц, перетирающий пищу с помощью проглоченных камешков", 2, [], []],
  ["jama-chlonaco-trawiaca", "jama chłonąco-trawiąca", "гастральная полость", "worek z jednym otworem, w którym trawią pokarm parzydełkowce", "мешок с одним отверстием, в котором переваривают пищу кишечнополостные", 2, ["jama gastralna"], ["кишечная полость"]],
  ["trawienie-wewnatrzkomorkowe", "trawienie wewnątrzkomórkowe", "внутриклеточное пищеварение", "rozkładanie pokarmu w wodniczkach trawiennych wewnątrz komórek, np. u gąbek", "расщепление пищи в пищеварительных вакуолях внутри клеток, например у губок", 2, [], []],
  ["heterodontyzm", "uzębienie zróżnicowane", "дифференцированные зубы", "zęby różnego kształtu — siekacze, kły, przedtrzonowce i trzonowce — typowe dla ssaków", "зубы разной формы — резцы, клыки, малые и большие коренные — характерные для млекопитающих", 2, ["heterodontyzm", "uzębienie heterodontyczne"], ["гетеродонтная зубная система", "гетеродонтизм"]],
]);

// ---- §5.1 Układ oddechowy u zwierząt ----

export const ANIMAL_BREATHING = namedTable(P.respiration.animals, [
  ["skrzela", "skrzela", "жабры", "cienkościenne, silnie ukrwione wyrostki ciała służące do wymiany gazowej w wodzie", "тонкостенные, обильно снабжённые кровью выросты тела для газообмена в воде", 1, [], []],
  ["tchawki", "tchawki", "трахеи насекомых", "system rurek doprowadzających powietrze bezpośrednio do komórek ciała owadów", "система трубочек, подводящих воздух прямо к клеткам тела насекомых", 1, [], ["трахеи", "трахейная система"]],
  ["przetchlinki", "przetchlinki", "дыхальца", "otwory na bokach ciała owadów, przez które powietrze wnika do tchawek", "отверстия по бокам тела насекомых, через которые воздух попадает в трахеи", 1, [], ["стигмы"]],
  ["plucotchawki", "płucotchawki", "лёгочные мешки", "narządy oddechowe pajęczaków zbudowane z blaszek ułożonych jak kartki książki", "органы дыхания паукообразных из пластинок, сложенных как страницы книги", 2, [], ["лёгкие паукообразных"]],
  ["przeciwprad", "wymiana przeciwprądowa", "противоточный обмен", "przepływ krwi w blaszkach skrzelowych w kierunku przeciwnym do wody, który zwiększa pobieranie tlenu", "ток крови в жаберных лепестках навстречу воде, повышающий поглощение кислорода", 3, ["przeciwprąd"], ["противоток"]],
  ["pokrywa-skrzelowa", "pokrywa skrzelowa", "жаберная крышка", "kostna płytka ryb kostnoszkieletowych chroniąca skrzela i wspomagająca przepływ wody", "костная пластинка костных рыб, защищающая жабры и помогающая прокачивать воду", 1, ["wieczko skrzelowe"], []],
  ["oddychanie-skorne", "oddychanie skórne", "кожное дыхание", "pobieranie tlenu przez wilgotną, silnie ukrwioną skórę, ważne u płazów i dżdżownic", "поглощение кислорода через влажную, богатую сосудами кожу, важное у земноводных и дождевых червей", 1, [], []],
  ["worki-powietrzne", "worki powietrzne", "воздушные мешки", "cienkościenne uchyłki płuc ptaków zapewniające jednokierunkowy przepływ powietrza przez płuca", "тонкостенные выросты лёгких птиц, обеспечивающие односторонний ток воздуха через лёгкие", 2, [], []],
  ["podwojne-oddychanie", "podwójne oddychanie", "двойное дыхание", "wymiana gazowa w płucach ptaka zarówno podczas wdechu, jak i podczas wydechu", "газообмен в лёгких птицы как при вдохе, так и при выдохе", 2, [], []],
]);

// ---- §6.1 Układ krążenia u zwierząt ----

export const ANIMAL_CIRCULATION = namedTable(P.circulation.animals, [
  ["otwarty", "otwarty układ krwionośny", "незамкнутая кровеносная система", "układ, w którym płyn ustrojowy wylewa się z naczyń do jamy ciała i omywa narządy, np. u owadów", "система, в которой жидкость изливается из сосудов в полость тела и омывает органы, например у насекомых", 1, ["układ otwarty"], ["открытая кровеносная система"]],
  ["zamkniety", "zamknięty układ krwionośny", "замкнутая кровеносная система", "układ, w którym krew płynie cały czas w naczyniach, np. u pierścienic i kręgowców", "система, в которой кровь всё время течёт по сосудам, например у кольчатых червей и позвоночных", 1, ["układ zamknięty"], ["закрытая кровеносная система"]],
  ["hemolimfa", "hemolimfa", "гемолимфа", "płyn ustrojowy zwierząt z otwartym układem krwionośnym, pełniący rolę krwi i limfy", "жидкость тела животных с незамкнутой кровеносной системой, выполняющая роль крови и лимфы", 2, [], []],
  ["serce-dwujamowe", "serce dwujamowe", "двухкамерное сердце", "serce ryb z jednym przedsionkiem i jedną komorą, przez które płynie tylko krew odtlenowana", "сердце рыб с одним предсердием и одним желудочком, через которое течёт только венозная кровь", 1, [], []],
  ["serce-trojjamowe", "serce trójjamowe", "трёхкамерное сердце", "serce płazów z dwoma przedsionkami i jedną komorą, w której krew częściowo się miesza", "сердце земноводных с двумя предсердиями и одним желудочком, в котором кровь частично смешивается", 1, [], []],
  ["serce-czterojamowe", "serce czterojamowe", "четырёхкамерное сердце", "serce ptaków i ssaków z całkowicie rozdzielonymi komorami, w którym krew utlenowana nie miesza się z odtlenowaną", "сердце птиц и млекопитающих с полностью разделёнными желудочками, где артериальная кровь не смешивается с венозной", 1, [], []],
  ["jeden-obieg", "pojedynczy obieg krwi", "один круг кровообращения", "krążenie, w którym krew w czasie pełnego obiegu ciała przepływa przez serce tylko raz, typowe dla ryb", "кровообращение, при котором за полный оборот кровь проходит через сердце только один раз, как у рыб", 2, ["jeden obieg krwi"], []],
  ["podwojny-obieg", "podwójny obieg krwi", "два круга кровообращения", "krążenie z krwiobiegiem płucnym i ustrojowym, w którym krew dwukrotnie przepływa przez serce", "кровообращение с лёгочным и системным кругами, при котором кровь дважды проходит через сердце", 2, ["dwa obiegi krwi"], ["двойное кровообращение"]],
  ["hemocyjanina", "hemocyjanina", "гемоцианин", "barwnik oddechowy zawierający miedź, nadający niebieską barwę hemolimfie mięczaków i skorupiaków", "дыхательный пигмент с медью, придающий голубой цвет гемолимфе моллюсков и ракообразных", 3, [], []],
]);

// ---- §7.1 Osmoregulacja i wydalanie u zwierząt ----

export const ANIMAL_EXCRETION = namedTable(P.urinary.animals, [
  ["amoniak", "amoniak", "аммиак", "bardzo toksyczny i dobrze rozpuszczalny w wodzie produkt przemiany białek, wydalany przez zwierzęta wodne", "очень токсичный и хорошо растворимый в воде продукт обмена белков, выводимый водными животными", 1, [], []],
  ["mocznik", "mocznik", "мочевина", "mniej toksyczny produkt przemiany białek wytwarzany w wątrobie ssaków i płazów, wydalany z umiarkowaną ilością wody", "менее токсичный продукт обмена белков, образуемый в печени млекопитающих и земноводных и выводимый с умеренным количеством воды", 1, [], []],
  ["kwas-moczowy", "kwas moczowy", "мочевая кислота", "słabo rozpuszczalny produkt przemiany białek, wydalany prawie bez wody przez ptaki, gady i owady", "плохо растворимый продукт обмена белков, выводимый почти без воды птицами, пресмыкающимися и насекомыми", 1, [], []],
  ["protonefrydia", "protonefrydia", "протонефридии", "kanaliki zakończone komórkami płomykowymi — narządy wydalnicze płazińców", "канальцы, оканчивающиеся пламенными клетками, — органы выделения плоских червей", 2, [], []],
  ["metanefrydia", "metanefrydia", "метанефридии", "parzyste kanaliki w każdym segmencie ciała pierścienic, zaczynające się lejkiem otwartym do jamy ciała", "парные канальцы в каждом сегменте тела кольчатых червей, начинающиеся воронкой, открытой в полость тела", 2, [], []],
  ["cewki-malpighiego", "cewki Malpighiego", "мальпигиевы сосуды", "ślepo zakończone kanaliki uchodzące do jelita owadów, usuwające produkty przemiany z hemolimfy", "слепо замкнутые канальцы, впадающие в кишечник насекомых и удаляющие продукты обмена из гемолимфы", 2, ["cewki Malpighiego"], ["мальпигиевы трубочки"]],
  ["gruczoly-solne", "gruczoły solne", "солевые железы", "gruczoły w okolicy oczu lub nozdrzy ptaków i gadów morskich, wydalające nadmiar soli", "железы около глаз или ноздрей морских птиц и пресмыкающихся, выводящие избыток соли", 2, [], []],
  ["wodniczka-tetniaca", "wodniczka tętniąca", "сократительная вакуоль", "organellum pierwotniaków słodkowodnych usuwające z komórki nadmiar wody", "органоид пресноводных простейших, удаляющий из клетки избыток воды", 2, [], ["пульсирующая вакуоль"]],
  ["ryby-slodkowodne", "ryby słodkowodne", "пресноводные рыбы", "kręgowce oddychające skrzelami, do których ciała woda stale napływa osmotycznie, dlatego nie piją, wydalają dużo rozcieńczonego moczu i aktywnie pobierają jony przez skrzela", "дышащие жабрами позвоночные, в тело которых вода постоянно поступает осмотически, поэтому они не пьют, выделяют много разбавленной мочи и активно поглощают ионы жабрами", 3, [], []],
  ["ryby-morskie", "ryby morskie", "морские рыбы", "kręgowce oddychające skrzelami, tracące wodę do otoczenia, dlatego piją wodę morską i usuwają nadmiar soli przez skrzela", "дышащие жабрами позвоночные, теряющие воду в окружающую среду, поэтому они пьют морскую воду и выводят избыток соли через жабры", 3, ["morskie ryby kostnoszkieletowe"], ["морские костные рыбы"]],
]);

// ---- §8.1 Układ nerwowy u zwierząt ----

export const ANIMAL_NERVES = namedTable(P.nervous.animals, [
  ["rozproszony", "rozproszony układ nerwowy", "диффузная нервная система", "sieć neuronów rozmieszczonych równomiernie w całym ciele, bez ośrodków, typowa dla parzydełkowców", "сеть нейронов, равномерно рассеянных по телу без центров, характерная для кишечнополостных", 1, ["układ nerwowy siateczkowy"], ["сетчатая нервная система"]],
  ["drabinkowy", "drabinkowy układ nerwowy", "лестничная нервная система", "pnie nerwowe połączone poprzecznymi spoidłami, z parą zwojów głowowych, występujące u płazińców", "нервные стволы, соединённые поперечными перемычками, с парой головных ганглиев, как у плоских червей", 2, [], ["ортогон"]],
  ["lancuszek", "łańcuszek brzuszny", "брюшная нервная цепочка", "parzyste zwoje w kolejnych segmentach ciała, połączone w łańcuch pod przewodem pokarmowym, u pierścienic i stawonogów", "парные ганглии в сегментах тела, соединённые в цепочку под пищеварительным трактом, у кольчатых червей и членистоногих", 1, ["brzuszny łańcuszek nerwowy"], ["брюшная цепочка"]],
  ["zwoj-nadprzelykowy", "zwój nadprzełykowy", "надглоточный ганглий", "główny ośrodek nerwowy bezkręgowców leżący nad gardzielą, pełniący rolę mózgu", "главный нервный центр беспозвоночных, лежащий над глоткой и выполняющий роль мозга", 2, ["zwój mózgowy"], ["головной ганглий"]],
  ["cewka-nerwowa", "cewka nerwowa", "нервная трубка", "grzbietowo położony, pusty w środku zawiązek ośrodkowego układu nerwowego strunowców", "лежащий на спинной стороне полый зачаток центральной нервной системы хордовых", 2, [], []],
  ["cefalizacja", "cefalizacja", "цефализация", "skupianie się ośrodków nerwowych i narządów zmysłów w przedniej części ciała", "сосредоточение нервных центров и органов чувств в передней части тела", 2, [], []],
  ["kora-nowa", "kora nowa", "новая кора", "zewnętrzna warstwa półkul mózgowych, najsilniej rozwinięta u ssaków", "наружный слой полушарий головного мозга, сильнее всего развитый у млекопитающих", 2, [], ["неокортекс"]],
  ["platy-wzrokowe", "płaty wzrokowe", "зрительные доли", "silnie rozwinięta część śródmózgowia ryb i ptaków, przetwarzająca bodźce wzrokowe", "сильно развитая часть среднего мозга рыб и птиц, обрабатывающая зрительные сигналы", 3, [], ["зрительные доли среднего мозга"]],
]);

// ---- §9.1 Narządy zmysłów u zwierząt ----

export const ANIMAL_SENSES = namedTable(P.senses.animals, [
  ["oczy-zlozone", "oczy złożone", "фасеточные глаза", "narządy wzroku owadów i skorupiaków zbudowane z wielu omatidiów", "органы зрения насекомых и ракообразных, состоящие из множества омматидиев", 1, [], ["сложные глаза"]],
  ["omatidium", "omatidium", "омматидий", "pojedyncza jednostka oka złożonego z własną soczewką i komórkami światłoczułymi", "отдельная единица фасеточного глаза со своей линзой и светочувствительными клетками", 2, ["omatidia"], ["омматидии"]],
  ["przyoczka", "przyoczka", "глазки", "proste narządy wzroku odbierające głównie kierunek i natężenie światła, np. u wypławka", "простые органы зрения, воспринимающие в основном направление и силу света, например у планарии", 2, [], ["простые глаза"]],
  ["linia-boczna", "linia boczna", "боковая линия", "narząd zmysłu ryb i larw płazów odbierający ruchy wody i drgania", "орган чувств рыб и личинок земноводных, воспринимающий движение воды и колебания", 1, [], []],
  ["narzad-jacobsona", "narząd Jacobsona", "якобсонов орган", "narząd chemiczny w podniebieniu węży i jaszczurek, do którego język przenosi cząsteczki zapachowe", "химический орган в нёбе змей и ящериц, к которому язык приносит пахучие молекулы", 3, ["narząd lemieszowo-nosowy"], ["вомероназальный орган"]],
  ["dolki", "dołki policzkowe", "лицевые ямки", "narządy grzechotników odbierające promieniowanie podczerwone ciepłych ofiar", "органы гремучих змей, улавливающие инфракрасное излучение тёплой добычи", 3, ["jamki policzkowe"], ["термолокаторы"]],
  ["echolokacja", "echolokacja", "эхолокация", "określanie położenia przeszkód i ofiar na podstawie ech wysyłanych ultradźwięków, u nietoperzy i delfinów", "определение положения препятствий и добычи по эху испускаемых ультразвуков, у летучих мышей и дельфинов", 1, [], []],
  ["statocysty", "statocysty", "статоцисты", "pęcherzyki z ziarenkami odbierające położenie ciała względem siły ciężkości, np. u meduz i raków", "пузырьки с крупинками, воспринимающие положение тела относительно силы тяжести, например у медуз и раков", 2, [], []],
  ["blona-odblaskowa", "błona odblaskowa", "тапетум", "warstwa za siatkówką odbijająca światło, poprawiająca widzenie w nocy, np. u kotów", "слой за сетчаткой, отражающий свет и улучшающий ночное зрение, например у кошек", 3, ["tapetum lucidum"], ["отражающий слой"]],
]);

// ---- §10.1 Układ hormonalny u zwierząt ----

export const ANIMAL_HORMONES = namedTable(P.hormones.animals, [
  ["ekdyzon", "ekdyzon", "экдизон", "hormon stawonogów wywołujący linienie i przeobrażenie", "гормон членистоногих, вызывающий линьку и превращение", 2, [], []],
  ["juwenilny", "hormon juwenilny", "ювенильный гормон", "hormon owadów utrzymujący cechy larwalne; spadek jego stężenia pozwala na przeobrażenie w postać dorosłą", "гормон насекомых, сохраняющий личиночные черты; снижение его уровня позволяет превратиться во взрослую форму", 2, [], []],
  ["gruczoly-przedpiersiowe", "gruczoły przedpiersiowe", "проторакальные железы", "gruczoły owadów wydzielające ekdyzon", "железы насекомых, выделяющие экдизон", 3, [], ["переднегрудные железы"]],
  ["neurosekrecyjne", "komórki neurosekrecyjne", "нейросекреторные клетки", "neurony wydzielające hormony do płynów ustrojowych, występujące u bezkręgowców i w podwzgórzu", "нейроны, выделяющие гормоны в жидкости тела, — у беспозвоночных и в гипоталамусе", 2, ["neurony neurosekrecyjne"], []],
  ["feromony", "feromony", "феромоны", "substancje wydzielane na zewnątrz ciała, wpływające na zachowanie osobników tego samego gatunku", "вещества, выделяемые во внешнюю среду и влияющие на поведение особей того же вида", 1, [], []],
  ["tyroksyna-plazy", "tyroksyna", "тироксин", "hormon tarczycy, który u kijanki wywołuje przeobrażenie w dorosłą żabę", "гормон щитовидной железы, вызывающий у головастика превращение во взрослую лягушку", 2, ["T4"], ["Т4"]],
  ["melatonina-zwierzeta", "melatonina", "мелатонин", "hormon szyszynki regulujący rytm dobowy i sezonowy, np. okres godowy i wymianę futra", "гормон эпифиза, регулирующий суточные и сезонные ритмы, например брачный период и линьку меха", 2, [], []],
]);

// ---- §11.1 Rozmnażanie i rozwój u zwierząt ----

export const ANIMAL_REPRODUCTION = namedTable(P.reproduction.animals, [
  ["partenogeneza", "partenogeneza", "партеногенез", "rozwój nowego osobnika z niezapłodnionej komórki jajowej, np. u mszyc i trutni", "развитие новой особи из неоплодотворённой яйцеклетки, например у тлей и трутней", 2, ["dzieworództwo"], ["девственное размножение"]],
  ["paczkowanie", "pączkowanie", "почкование", "rozmnażanie bezpłciowe, w którym nowy osobnik wyrasta z ciała rodzica, np. u stułbi", "бесполое размножение, при котором новая особь вырастает из тела родителя, например у гидры", 1, [], []],
  ["fragmentacja", "fragmentacja", "фрагментация", "rozpad ciała na części, z których każda odtwarza cały organizm, np. u wypławka", "распад тела на части, каждая из которых восстанавливает целый организм, например у планарии", 2, [], []],
  ["obojnactwo", "obojnactwo", "гермафродитизм", "obecność męskich i żeńskich narządów rozrodczych w jednym osobniku, np. u dżdżownicy", "наличие мужских и женских половых органов у одной особи, например у дождевого червя", 1, ["hermafrodytyzm"], []],
  ["zaplodnienie-zewnetrzne", "zapłodnienie zewnętrzne", "наружное оплодотворение", "łączenie się gamet poza ciałem samicy, w wodzie, np. u większości ryb i płazów", "слияние гамет вне тела самки, в воде, например у большинства рыб и земноводных", 1, [], []],
  ["zaplodnienie-wewnetrzne", "zapłodnienie wewnętrzne", "внутреннее оплодотворение", "łączenie się gamet w drogach rodnych samicy, typowe dla zwierząt lądowych", "слияние гамет в половых путях самки, характерное для наземных животных", 1, [], []],
  ["jajorodnosc", "jajorodność", "яйцекладность", "składanie jaj, w których zarodek rozwija się poza ciałem matki", "откладывание яиц, в которых зародыш развивается вне тела матери", 2, [], ["яйцерождение"]],
  ["zyworodnosc", "żyworodność", "живорождение", "rodzenie młodych, które rozwijały się w ciele matki i były przez nią odżywiane", "рождение детёнышей, которые развивались в теле матери и получали от неё питание", 2, [], []],
  ["rozwoj-zlozony", "rozwój złożony", "непрямое развитие", "rozwój, w którym z jaja wylęga się larwa wyraźnie różniąca się od postaci dorosłej", "развитие, при котором из яйца выходит личинка, заметно отличающаяся от взрослой формы", 2, ["rozwój pośredni", "rozwój z przeobrażeniem"], ["развитие с превращением"]],
  ["blony-plodowe", "błony płodowe", "зародышевые оболочки", "owodnia, kosmówka i omocznia — błony chroniące zarodek gadów, ptaków i ssaków", "амнион, хорион и аллантоис — оболочки, защищающие зародыш пресмыкающихся, птиц и млекопитающих", 2, ["błony zarodkowe"], []],
]);
