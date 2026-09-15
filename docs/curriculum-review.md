# Ревизия черновика программы: математика (SP 5–8, LO 1–4)

Дата проверки: 15.09.2026.
Что проверялось: `packages/trainers/math/src/curriculum/sp.ts` и `packages/trainers/math/src/curriculum/lo.ts`.
С чем сравнивалось:
- действующая *podstawa programowa* с учётом *uszczuplenia* 2024 г.;
- распределение тем по классам в учебных планах издательств: «Matematyka z kluczem» (Nowa Era), «Matematyka z plusem» (GWO), «MATeMAtyka» (Nowa Era, издание 2024).

Условные сокращения:
- **MzK** — «Matematyka z kluczem»;
- **M+** — «Matematyka z plusem»;
- **ZP / ZPiR** — план «MATeMAtyka» для *zakres podstawowy* / *zakres podstawowy i rozszerzony*;
- «Dz.» — *dział* (раздел учебника).

Римские номера вида «VIII.7» — это пункты *podstawy programowej*. Для SP номера даются по блокам «IV–VI» и «VII–VIII», для LO — по разделам I–XIII.

---

## 0. Контекст, который важно учесть

1. **Обязательная база с 1.09.2024 — «uszczuplona podstawa programowa».** Для SP это Rozporządzenie MEN z 28.06.2024 ([Dz.U. 2024 poz. 996](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240000996)). Для LO и технікума — [Dz.U. 2024 poz. 1019](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001019). Анонс MEN: [gov.pl](https://www.gov.pl/web/edukacja/uszczuplone-podstawy-programowe--rozporzadzenia-podpisane). Действующие тексты опубликованы на ZPE: [SP](https://zpe.gov.pl/podstawa-programowa/szkola-podstawowa/matematyka), [LO/technikum](https://zpe.gov.pl/podstawa-programowa/szkola-ponadpodstawowa/matematyka). Все изменения прокомментированы в документе GWO [«Treści nauczania – wskazanie uszczupleń wprowadzonych w 2024 r.»](https://gwo.pl/tresci-nauczania-wskazanie-uszczuplen-wprowadzonych-w-2024-gdanskie-wydawnictwo-oswiatowe/). Ниже этот документ называется «документ GWO».
   - **Ограничение метода.** В документе GWO удалённые и добавленные фрагменты выделены цветом, а при извлечении текста цвет теряется. Поэтому ниже как «удалённое» указано только то, что подтверждено комментариями GWO или сравнением с текстом на ZPE.
2. **Реформа «Reforma26. Kompas Jutra».** Новая *podstawa* вводится поэтапно ([gov.pl](https://www.gov.pl/web/edukacja/reforma26-kompas-jutra--nowa-szkola-dla-nowego-pokolenia)):
   - с 1.09.2026 — в классах 1 и 4 SP;
   - с 1.09.2027 — в 1-х классах *szkół ponadpodstawowych*;
   - первый экзамен ósmoklasisty по новой базе — в 2031 г.
   
   Выводы для черновика:
   - В 2026/27 классы SP5–SP8 и LO1–LO4 ещё учатся по «uszczuplona» базе, так что эта ревизия для них актуальна.
   - По вторичным источникам ([bryk.pl](https://www.bryk.pl/artykul/nowa-matematyka-w-szkole-od-2026-roku-co-zmieni-sie-na-lekcjach), [e-korepetycje](https://www.e-korepetycje.net/artykuly/reforma-edukacji-kompas-jutra)), класс 5 перейдёт на новую базу в 2027/28, дальше — по году на класс. Официально я этого не проверил.
   - LO1 перейдёт на новую базу в 2027/28.
   - Значит, через год `sp5` и `lo1` придётся пересматривать заново.
3. **Учебные планы, по которым проверялось распределение по классам.** Не все документы удалось найти в актуальной редакции.
   - **M+ (GWO)**, [страница rozkładów](https://gwo.pl/rozklady-materialu-m/):
     - [кл. 5](https://gwo.pl/rozklad_materialu_dla_klasy_v_szkoly_podstawowej-2/), [кл. 6](https://gwo.pl/rozklad_materialu_dla_klasy_vi_szkoly_podstawowej-2/), [кл. 8](https://gwo.pl/rozklad_materialu_dla_klasy_viii_szkoly_podstawowej-2/). Документы без даты. В кл. 8 есть рекомендация, связанная с изменениями 2024 г.
     - [кл. 7 — «od roku szkolnego 2026/2027»](https://gwo.pl/rozklad-materialu-dla-klasy-7-szkoly-podstawowej-od-roku-szkolnego-20262027/). Это новая редакция, в ней twierdzenie Pitagorasa перенесено в 7 класс. У нынешних восьмиклассников с M+ Pitagoras остаётся в 8 классе.
   - **MzK (Nowa Era)**, «Plan wynikowy z rozkładem materiału»:
     - [кл. 6](https://sp3.sosnowiec.pl/szkola-podstawowa/images/wymagania/matematyka/matematyka_klasa_6.pdf) и [кл. 7](https://sppigza.edupage.org/files/plan-wynikowy-klasa-7.pdf) ссылаются на *podstawę z 28.06.2024*;
     - [кл. 8](https://zsp.szczawno-zdroj.pl/wp-content/uploads/2025/09/Wymagania-edukacyjne-z-matematyki-kl.-8.pdf) — выложен школой в 09.2025;
     - **кл. 5 — только версия под базу 2017 г.** ([pdf](https://cms-v1-files.superszkolna.pl/sites/862/cms/szablony/46246/pliki/planwynikowyklasa5.pdf)). Версия 2024 г. есть на [dlanauczyciela.nowaera.pl](https://dlanauczyciela.nowaera.pl/zasob/171128,rozklad-materialu-nauczania-z-planem-wynikowym-klasa-5.pdf), но она требует входа, и прочитать её не удалось.
   - **«MATeMAtyka» (Nowa Era), «Plan wynikowy», © 2024.** Файлы выложены школой [lowegrow.aplus.pl](https://lowegrow.aplus.pl/):
     - ZP: [1](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa1_zakres_podstawowy.pdf), [2](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa2_zakres_podstawowy.pdf), [3](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa3_zakres_podstawowy.pdf), [4](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa4_zakres_podstawowy.pdf);
     - ZPiR: [1](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa1_zakres_rozszerzony.pdf), [2](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa2_zakres_rozszerzony.pdf), [3](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa3_zakres_rozszerzony.pdf), [4](https://lowegrow.aplus.pl/cms/wp-content/uploads/2024/09/matematyka_klasa4_zakres_rozszerzony.pdf);
     - в 2025 г. вышла «Nowa MATeMAtyka» ([flipbook](https://flipbook.nowaera.pl/dokumenty/Flipbook/Nowa_MATeMAtyka%5BZPiR%5D%5Bkl_2%5D%5B2025%5D/)). Её распределение по классам я **не проверял**.
4. **Технікум** учится 5 лет, и темы распределены по-другому. Черновик покрывает только LO 1–4.

---

## 1. Итог: насколько надёжен черновик

**SP 5–8: в целом надёжен, около 75–80% тем стоят правильно.** Названия и разделы соответствуют *podstawie* и учебникам. Основные проблемы:
- **Подтемы вне podstawy SP.** Проверка разделов I, II, XIV и XV (klasy VII–VIII) по документу GWO и ZPE показала, что этих подтем в базе нет:
  - «potęga o wykładniku całkowitym ujemnym»;
  - «usuwanie niewymierności z mianownika» (в MzK 7 — только как *wymaganie ponadpodstawowe*);
  - «długość łuku i pole wycinka» (это LO, VIII.6);
  - «symetria w układzie współrzędnych» (это LO, IX.5).
- **Распределение по классам зависит от учебника.** Twierdzenie Pitagorasa, układ współrzędnych и statystyka: в MzK — в 7 классе, в M+ (текущее издание) — в 8. «Graniastosłupy» ни в одной серии не изучаются в 7 классе.
- **Пропуски.** В SP6 нет процентов и работы с диаграммами (IV–VI XII, XIII). В SP7 нет Pitagorasa и układu współrzędnych для пользователей MzK.
- **Ограничения 2024 г. не учтены в подтемах:** NWD/NWW, podwyżki/obniżki, pole pierścienia и др.

**LO 1–4: надёжность низкая.** Примерно у трети тем неверный класс или уровень. Главные расхождения с «MATeMAtyka» (издание 2024):
- **Wielomiany и funkcje wymierne (P)** изучаются во **2** классе, а не в 3-м.
- **Kąty 0°–180°, pole trójkąta z sinusem, twierdzenie cosinusów (P)** — во **2** классе.
- **Przesuwanie wykresów (P)** — в **1** классе.
- **Statystyka** — в **3** классе, а не в 4-м.
- **Темы R не на своём месте:**
  - trygonometria dowolnego kąta — в **3** классе;
  - zmiana podstawy logarytmu — во **2** классе;
  - optymalizacja z pochodną — в **3** классе.
- **«Okręgi i koła» почти целиком относятся к уровню P**, а не R.
- **Сокращения 2024 г. не учтены.** Odchylenie standardowe, nierówności trygonometryczne, odległość punktu od prostej и twierdzenie sinusów на уровне P из базы уходят.

**Архитектурное ограничение.** Функция `topicsFor(grade, "R")` добавляет к R все темы P того же класса. Но распределение по классам в ZP и ZPiR разное:
- funkcja wykładnicza i logarytmiczna: ZP — кл. 3, ZPiR — кл. 2;
- funkcja kwadratowa в ZPiR начинается уже в кл. 1.

Одна привязка к классу не подходит обоим уровням. Варианты решения — в разделе 5.

---

## 2. Таблицы по классам

Статусы: **OK** · **неверный класс → X** · **неверный уровень P↔R** · **удалено в 2024** · **неясно**.
Если статус относится только к части подтем, это сказано в комментарии.

### SP5

| id | Статус | Комментарий |
|---|---|---|
| `sp5.natural` | OK (поправить подтемы) | M+5 Dz.1 «Liczby i działania», MzK5 Dz.I. Подтема «potęgi o wykładniku naturalnym» шире базы: IV–VI II.8 — только «kwadraty i sześciany liczb naturalnych». Добавить «system rzymski (do 3000)» (IV–VI I.5), «szacowanie wyników», «dzielenie z resztą: a = b·q + r» (II.15). |
| `sp5.divisibility` | OK (ограничения 2024) | M+5 Dz.2, MzK5 Dz.I. С 2024 г.: NWD и NWW — только для чисел не более чем трёхзначных (II.11); разложение на простые множители — только для не более чем трёхзначных чисел, где не больше одного множителя > 10 (II.14). |
| `sp5.fractions` | OK | M+5 Dz.3, MzK5 Dz.III. V.1: знаменатели одно- или двузначные. |
| `sp5.decimals` | OK (ограничения 2024) | M+5 Dz.5, MzK5 Dz.IV. С 2024 г.: письменные действия — только если у дробей в сумме ≤ 6 ненулевых цифр (V.2); округление — до 2-го знака после запятой в практическом контексте (IV.11). |
| `sp5.integers` | неясно (класс) | M+5 Dz.7 (сложение и вычитание со звёздочкой — «можно начать в 6 классе»); в MzK это кл. 6 Dz.I. База IV–VI III: только ось, модуль, сравнение, «proste rachunki pamięciowe». Можно оставить в SP5 как вводную тему; остальное покрывает `sp6.rational`. |
| `sp5.angles` | OK | M+5 Dz.4, MzK5 Dz.II; IV–VI VII, VIII. |
| `sp5.polygons` | OK | M+5 Dz.4, MzK5 Dz.II. Добавить «konstrukcja trójkąta o danych bokach, nierówność trójkąta» (IX.2) и «oś symetrii figury» (IX.5). |
| `sp5.area` | OK | M+5 Dz.6, MzK5 Dz.V; XI.3–5. Осторожно с подтемой «jednostki pola»: XI.4 говорит «bez zamiany jednostek w trakcie obliczeń», при этом XI.3 допускает данные, требующие перевода единиц. |
| `sp5.cuboids` | OK | M+5 Dz.8 «Objętość figury», MzK5 Dz.VII (по плану 2017 г.); X.4, XI.6–7. |

### SP6

| id | Статус | Комментарий |
|---|---|---|
| `sp6.fractionOps` | OK | M+6 Dz.1, MzK6 Dz.II–III; V.3–7. Уровень сложности — не выше примера в V.7. |
| `sp6.rational` | OK | M+6 Dz.7, MzK6 Dz.I. «Potęgi liczb ujemnych» — только квадраты и кубы (V.5). Отрицательные дроби есть в V.7. |
| `sp6.algebra` | OK (упростить) | M+6 Dz.8, MzK6 Dz.V. IV–VI VI.3: уравнения, где неизвестное стоит только в одной части, решаются подбором или обратным действием. «Redukcja wyrazów podobnych» в базе IV–VI явно не названа, но в M+6 есть «Upraszczanie wyrażeń»; оставить на простом уровне. |
| `sp6.plane` | OK | M+6 Dz.2, MzK6 Dz.IV. |
| `sp6.area` | неясно (дубль `sp5.area`) | M+6 Dz.5 повторяет площади; в MzK6 отдельного раздела нет. Лучше переименовать в «Pola wielokątów – zadania praktyczne» (XI.3, XI.5) или объединить с `sp5.area`. |
| `sp6.solids` | OK (подтемы шире базы) | M+6 Dz.9, MzK6 Dz.VI «Bryły». В базе IV–VI площадь поверхности и объём — только у прямоугольного параллелепипеда (XI.6). У призм это VII–VIII XI.2; в M+6 соответствующие уроки помечены звёздочкой «можно начать в 7 классе». |
| `sp6.word` | OK | M+6 Dz.3–4, MzK6 Dz.VII «Matematyka i my», Dz.VIII «Matematyka na co dzień»; IV–VI XII.3–9. |

### SP7

| id | Статус | Комментарий |
|---|---|---|
| `sp7.numbers` | OK | M+7 Dz.1, MzK7 Dz.I. |
| `sp7.percent` | OK (ограничение 2024) | M+7 Dz.2, MzK7 Dz.II. С 2024 г. повышения и понижения цены — **не более двух раз подряд** (VII–VIII V.5; раньше было «wielokrotnych»). Добавить «punkty procentowe» и «diagramy procentowe» (есть в M+7). |
| `sp7.powers` | OK класс; подтема вне базы | M+7 Dz.6, MzK7 Dz.III. «Potęga o wykładniku całkowitym ujemnym» — **вне podstawy**: I.1–2 — только натуральные показатели; в I.5 целый k встречается только в записи a·10^k. В планах MzK7 и M+7 такой подтемы нет — удалить. |
| `sp7.roots` | OK | M+7 Dz.6, MzK7 Dz.III. II.1–5: только квадратные и кубические корни; из действий — умножение и деление корней одной степени, вынесение множителя из-под корня и внесение под корень. |
| `sp7.expressions` | OK (уточнить) | M+7 Dz.4, MzK7 Dz.IV. IV.3–4: сумма × одночлен и **двучлен × двучлен**. Общее умножение многочленов шире базы. |
| `sp7.equations` | OK | M+7 Dz.5, MzK7 Dz.V; VI.1–5. |
| `sp7.proportion` | OK (класс зависит от учебника) | В MzK7 есть «Proporcjonalność»; в M+ «Wielkości wprost proporcjonalne» — в кл. 8. Добавить «podział proporcjonalny» (VII.3). |
| `sp7.prisms` | **неверный класс → sp8** (частично sp6) | Ни в MzK7, ни в M+7 (изд. 2026/27) призм нет. Изучаются в MzK8 Dz.V «Geometria przestrzenna» и M+8 Dz.5; знакомство — в MzK6 и M+6. |
| `sp7.statistics` | неясно (класс) | M+7 (изд. 2026/27) Dz.8 «Statystyka»; в MzK это кл. 8 Dz.I «Statystyka i prawdopodobieństwo». Добавить «diagramy słupkowe i kołowe, wykresy» (XIII.1–2). |

### SP8

| id | Статус | Комментарий |
|---|---|---|
| `sp8.powersRoots` | OK класс; подтема вне базы | Повторение; M+8 Dz.1. «Usuwanie niewymierności z mianownika» — **вне podstawy SP**: в MzK7 это *wymaganie ponadpodstawowe*. Удалить или пометить как дополнительное. |
| `sp8.algebra` | OK | M+8 Dz.2, MzK8 Dz.II. |
| `sp8.word` | OK | M+8 Dz.4 «Zastosowania matematyki», MzK8 Dz.VI «Powtórzenie». |
| `sp8.pythagoras` | неясно (класс) | M+8 Dz.3 (текущее издание) — 8 класс; MzK7 Dz.VI «Trójkąty prostokątne» и M+7 (изд. 2026/27) Dz.7 — 7 класс. VIII.7: «**bez twierdzenia odwrotnego**» — обратную теорему в заданиях не использовать. |
| `sp8.plane` | OK | M+8 Dz.3, MzK8 Dz.III–IV. Добавить «nierówność trójkąta» (VIII.5), «wielokąty foremne» (IX.1), «proste dowody geometryczne» (VIII.8). |
| `sp8.symmetry` | OK класс; подтема вне базы | M+8 Dz.6, MzK8 Dz.VII. «Symetria w układzie współrzędnych» — **вне podstawy SP**: в XV — только symetralna, dwusieczna, фигуры с осевой и центральной симметрией; в LO это P IX.5. Добавить «symetralna odcinka», «dwusieczna kąta». Раздел XV можно проходить **после** экзамена ósmoklasisty. |
| `sp8.circle` | OK класс; подтема вне базы | M+8 Dz.7, MzK8 Dz.VII. «Długość łuku i pole wycinka» — **вне podstawy SP** (LO VIII.6). С 2024 г. раздел XIV обязателен **до** экзамена, а «pole pierścienia kołowego» (бывший XIV.5) удалено. Добавить «wyznaczanie promienia z długości okręgu / pola koła» (XIV.2, XIV.4). |
| `sp8.solids` | OK | MzK8 Dz.V, M+8 Dz.5; XI.1–3. |
| `sp8.coordinates` | неясно (класс) | MzK7 Dz.VII «Układ współrzędnych», M+7 (изд. 2026/27) урок «Układ współrzędnych», M+8 «Odcinki w układzie współrzędnych»; X.1–5. Добавить «zaznaczanie zbiorów liczb na osi (np. x ≥ 1,5)» (X.1). |
| `sp8.probability` | OK (перенести подтему) | MzK8 Dz.I, M+8 Dz.8; XII, XVI, XVII. «Średnia arytmetyczna i diagramy» — это статистика, перенести. Добавить «losowanie dwóch elementów ze zwracaniem i bez zwracania» (XVII.1–2). |

### LO1

| id | Ур. | Статус | Комментарий |
|---|---|---|---|
| `lo1.real` | P | OK (одна подтема неясна) | ZP/ZPiR 1 Dz.1 «Liczby rzeczywiste»; P I. Явного требования «błąd przybliżenia» в текущей базе я не нашёл — неясно. «Procenty i punkty procentowe» и «notacja wykładnicza» есть в плане ZPiR 1. |
| `lo1.sets` | P | OK (ограничение 2024) | ZP/ZPiR 1 Dz.2 «Język matematyki». С 2024 г. на P остались только **уравнения** вида \|x+4\|=5 и интерпретация на оси (I.7). **Неравенства** с модулем теперь только на R (R III.4). |
| `lo1.powers` | P | OK | ZP/ZPiR 1 Dz.1 (potęgi o wykładniku wymiernym, logarytm); P I.3–5, I.9. |
| `lo1.expressions` | P | OK класс; сокращения 2024 | ZP/ZPiR 1 Dz.2. С 2024 г. на P: формулы — только (a±b)² и a²−b² (II.1); из разложения на множители — только вынесение одночлена за скобки (II.3). Группировка → R II.2; формулы 3-й степени → R II.5. «Usuwanie niewymierności» явно не названо, но есть в учебнике — оставить. |
| `lo1.linearEq` | P | OK | ZP 1 Dz.2; P III.1–3. |
| `lo1.systems` | P | OK | ZP/ZPiR 1 Dz.3; P IV.1–2. Системы «линейное + квадратное» с 2024 г. — только R (R IV). |
| `lo1.functions` | P | OK | ZP/ZPiR 1 Dz.4; P V.1–4. Добавить «przesuwanie wykresu y=f(x−a), y=f(x)+b» (V.12; уроки 7–8 в ZP 1). |
| `lo1.linearFn` | P | OK | ZP/ZPiR 1 Dz.5; P V.5–6, IX.1–2. |
| `lo1.triangles` | P | OK | ZP/ZPiR 1 Dz.6 «Planimetria». «Twierdzenie odwrotne do twierdzenia Talesa» с 2024 г. — только R (R VIII.2). Добавить «trójkąty przystające», «pola wielokątów». |
| `lo1.absR` | R | OK | ZPiR 1 «Własności wartości bezwzględnej», продолжение в ZPiR 2; R III.4. |
| `lo1.paramR` | R | неясно | В базе (R III.5) — «równania i nierówności liniowe i kwadratowe z parametrami»; системы с параметром явно не названы. В плане ZPiR 1 есть задания с параметром, но точную привязку подтвердить не удалось. Предложение: «Równania liniowe z parametrem». |
| `lo1.logR` | R | **неверный класс → lo2** | «Zmiana podstawy logarytmu» — ZPiR 2 Dz.6 (R I). «Proste równania logarytmiczne» как отдельного требования в базе нет — неясно. |

### LO2

| id | Ур. | Статус | Комментарий |
|---|---|---|---|
| `lo2.transform` | P | **неверный класс → lo1**; частично **P→R** | Сдвиги графиков — ZP 1 Dz.4 (P V.12). «Symetria względem osi układu» (y=−f(x), y=f(−x)) с 2024 г. **перенесена в R** (R V.1); в ZPiR 1 есть урок «Przekształcanie wykresu». |
| `lo2.quadratic` | P | OK | ZP 2 Dz.1; в ZPiR начинается в кл. 1 (Dz.7). P V.7–10. Добавить «zadania optymalizacyjne z funkcją kwadratową» (P XIII). |
| `lo2.quadEq` | P | OK | ZP 2 Dz.1; P III.4. |
| `lo2.quadrilaterals` | P | неясно | Отдельного раздела о четырёхугольниках в ZP 2 нет: «Pole czworokąta» — в Dz.4 «Trygonometria», подобие — в ZP 1 Dz.6. Лучше заменить темой «Planimetria – okręgi i wielokąty» (P) — см. раздел 3. |
| `lo2.trigAcute` | P | OK (расширить) | ZP/ZPiR 2 Dz.4. В базе P VII.1 — углы **от 0° до 180°**; VII.4 — «rozwiązywanie trójkątów prostokątnych». |
| `lo2.quadParamR` | R | OK | ZPiR 2 Dz.1 (wzory Viète'a, zadania z parametrem); R III.3, III.5. Добавить «równania dwukwadratowe» (R III.6, перенесено из P в 2024). |
| `lo2.polynomialsR` | R | OK (подтемы) | ZPiR 2 Dz.2; R II.1–3, III.1. С 2024 г. на R — только **целые** корни (рациональные удалены). Добавить «nierówności wielomianowe». Сам многочлен есть и на P во 2 классе — см. `lo3.polynomials`. |
| `lo2.rationalR` | R | OK | ZPiR 2 Dz.3; R II.6, III.2, III.7. «Hiperbola» f(x)=a/x — уровень P (V.13). |
| `lo2.trigAnyR` | R | **неверный класс → lo3** | ZPiR 3 Dz.1 «Funkcje trygonometryczne»: miara łukowa, wykresy, wzory redukcyjne; R VII.1–5. |
| `lo2.circlesR` | R | **неверный уровень R→P** (кроме tw. sinusów) | Kąty wpisane i środkowe (P VIII.5), styczne (P VIII.1), okrąg wpisany i opisany (P VIII.10), twierdzenie cosinusów (P VII.3) — это **P**, ZP 2 Dz.5 «Planimetria». Twierdzenie sinusów с 2024 г. — только R (R VII.7); на R добавить «czworokąty wpisane i opisane» (R VIII.1). |

### LO3

| id | Ур. | Статус | Комментарий |
|---|---|---|---|
| `lo3.polynomials` | P | **неверный класс → lo2**; сокращения 2024 | ZP 2 Dz.2. С 2024 г. на P: вынесение одночлена за скобки и уравнения W(x)=0 в разложенном виде (P III.5). Группировка, деление на x−a, целые корни, биквадратные уравнения → R. |
| `lo3.rational` | P | **неверный класс → lo2**; частично **P→R** | ZP 2 Dz.3. На P остались f(x)=a/x (V.13) и умножение/деление рациональных выражений (II.4). С 2024 г. сложение и вычитание (→ R II.6) и уравнения V(x)/W(x)=0 (→ R III.7) — только R. **Неясно:** в плане ZP 2 (2024) уроки «Równania wymierne (1)(2)» остались. |
| `lo3.sequences` | P | OK | ZP 3 Dz.3, ZPiR 3 Dz.3; P VI. |
| `lo3.analytic` | P | OK (дополнить) | ZP 3 Dz.2; P IX. Добавить «wzajemne położenie prostych» (IX.1) и «symetria osiowa i środkowa w układzie» (IX.5). Точки пересечения прямой и окружности с 2024 г. — только R. |
| `lo3.expLog` | P | OK для P; для R неясно | ZP 3 Dz.1; P V.14, I.9. В ZPiR эта тема — во **2** классе (Dz.6), так что R-ученики увидят её повторно. |
| `lo3.trig` | P | **неверный класс → lo2** | Kąt rozwarty, pole trójkąta ½ab·sinγ, twierdzenie cosinusów — ZP 2 Dz.4–5; P VII.1, VII.3. |
| `lo3.limitsR` | R | OK | ZPiR 3 Dz.3 (granica ciągu, szereg geometryczny); R VI.1–2. |
| `lo3.trigEqR` | R | OK класс; **подтема удалена в 2024** | ZPiR 3 Dz.1. «Nierówności trygonometryczne» **удалены** из R VII.6. Добавить «wzory na sinus/cosinus sumy, różnicy i kąta podwojonego» (R VII.5). |
| `lo3.analyticR` | R | OK класс; **подтема удалена в 2024** | ZPiR 3 Dz.2. «Odległość punktu od prostej» удалена из P (бывший IX.5) и в список R не добавлена (документ GWO, ZPE). Урок в плане ZPiR 3 остался, но это уже вне базы. Также удалено «równanie okręgu w postaci ogólnej» (бывший R IX.1). Добавить «wektory» (R IX.3), «prosta styczna do okręgu» (R IX.4), «układy równań drugiego stopnia» (R IV). |
| `lo3.derivativesR` | R | OK | ZPiR 3 Dz.4 «Rachunek różniczkowy»; R XIII.1, XIII.3–5. Добавить «ciągłość, granice jednostronne, własność Darboux» (R XIII.2; часть этого пункта удалена в 2024 г., какая именно — однозначно не установлено). |

### LO4

| id | Ур. | Статус | Комментарий |
|---|---|---|---|
| `lo4.stereometry` | P | OK | ZP/ZPiR 4 Dz.2–3; P X. «Przekrój prostopadłościanu» (бывший X.5) удалён в 2024 г. — в черновике его нет, хорошо. |
| `lo4.combinatorics` | P | OK класс; подтема **P→R** | ZP 4 Dz.1. В P XI — только правила умножения и сложения. Формулы перестановок, сочетаний и размещений — R XI.1. В плане ZP 4 уроки «Permutacje» и «Wariacje» есть, но на P их лучше решать через правило умножения. |
| `lo4.probability` | P | OK (одна подтема неясна) | ZP 4 Dz.1; P XII.1 — классическая модель. «Doświadczenia wieloetapowe» есть отдельным уроком в ZPiR 4; для P неясно. |
| `lo4.statistics` | P | **неверный класс → lo3**; **подтема удалена в 2024** | ZP 3 Dz.4, ZPiR 3 Dz.5. «Odchylenie standardowe» (бывший XII.4) **удалено** с обоих уровней. Остались средняя арифметическая и взвешенная, медиана, мода (XII.2). |
| `lo4.review` | P | OK | ZP 4 Dz.5, ZPiR 4 Dz.5 «Powtórzenie». |
| `lo4.combinatoricsR` | R | OK | ZPiR 4 Dz.1; R XI.1–2, R II.4–5 (trójkąt Pascala, (a+b)ⁿ). |
| `lo4.conditionalR` | R | OK | ZPiR 4 Dz.1; R XII.1. Добавить «wzór Bayesa». |
| `lo4.bernoulliR` | R | OK | ZPiR 4 Dz.1; R XII.2. |
| `lo4.optimizationR` | R | **неверный класс → lo3** | ZPiR 3 Dz.4 (уроки «Wartość najmniejsza i największa», «Zagadnienia optymalizacyjne»); R XIII.6. В 4 классе можно оставить только как повторение. |

---

## 3. Недостающие темы

### SP

| Класс | Предлагаемый id | Название (PL) | Подтемы | Основание |
|---|---|---|---|---|
| SP6 | `sp6.percent` | Procenty w praktyce | procent jako część całości (100%, 50%, 25%, 10%, 1%); obliczanie 50%, 10%, 20% danej wielkości; diagramy procentowe | IV–VI XII.1–2; M+6 Dz.6 |
| SP6 | `sp6.data` | Odczytywanie danych | dane w tabelach i na diagramach; odczytywanie wykresów; opis zmian („wartości rosną/maleją”) | IV–VI XIII; M+6 Dz.3 |
| SP7 | `sp7.pythagoras` | Twierdzenie Pitagorasa | obliczanie długości boków; przekątna kwadratu i wysokość trójkąta równobocznego; trójkąty 45°-45°-90° i 30°-60°-90°; zadania praktyczne (bez twierdzenia odwrotnego) | VIII.7; MzK7 Dz.VI, M+7 (2026/27) Dz.7 |
| SP7 | `sp7.coordinates` | Układ współrzędnych | punkty kratowe; środek odcinka; długość odcinka; zaznaczanie zbiorów liczb na osi | X.1–5; MzK7 Dz.VII |
| SP7 | `sp7.plane` | Figury na płaszczyźnie | kąty przy prostych równoległych; przystawanie trójkątów; wielokąty foremne; pola wielokątów | VIII.1–4, IX; M+7 (2026/27) Dz.3 |
| SP8 | `sp8.statistics` | Statystyka | średnia arytmetyczna; diagramy słupkowe i kołowe; wykresy | XIII; MzK8 Dz.I |
| SP8 | `sp8.examReview` | Powtórzenie przed egzaminem ósmoklasisty | zadania zamknięte z różnych działów; zadania otwarte; zadania z kontekstem praktycznym | MzK8 Dz.VI |

### LO — уровень P

| Класс | Предлагаемый id | Название (PL) | Подтемы | Основание |
|---|---|---|---|---|
| LO2 | `lo2.polynomials` | Wielomiany | stopień i współczynniki; dodawanie, odejmowanie i mnożenie wielomianów; wyłączanie jednomianu przed nawias; równania wielomianowe w postaci iloczynowej | II.2–3, III.5; ZP 2 Dz.2 |
| LO2 | `lo2.rational` | Funkcja f(x)=a/x i wyrażenia wymierne | wykres i własności f(x)=a/x; wielkości odwrotnie proporcjonalne; mnożenie i dzielenie wyrażeń wymiernych | V.13, II.4; ZP 2 Dz.3 |
| LO2 | `lo2.circles` | Planimetria – okręgi i wielokąty | kąty wpisane i środkowe; okrąg wpisany i opisany na trójkącie; długość łuku i pole wycinka; wielokąty foremne | VIII.1, 3, 5, 6, 10; ZP 2 Dz.5 |
| LO2 | `lo2.trigTriangles` | Trygonometria w trójkątach | funkcje trygonometryczne kątów 0°–180°; pole trójkąta P = ½ab·sinγ; twierdzenie cosinusów; pola czworokątów z trygonometrią | VII.1, 3; VIII.12; ZP 2 Dz.4–5 |
| LO3 | `lo3.statistics` | Statystyka | średnia arytmetyczna i ważona; mediana; dominanta | XII.2; ZP 3 Dz.4 |
| LO4 | `lo4.proofs` | Dowody w matematyce | dowody w algebrze (podzielność, reszty); dowód nie wprost; dowody w geometrii | I.2, VIII.11; ZP 4 Dz.4 (есть и в ZPiR) |

### LO — уровень R

| Класс | Предлагаемый id | Название (PL) | Подтемы | Основание |
|---|---|---|---|---|
| LO1 | `lo1.transformR` | Przekształcenia wykresów – rozszerzenie | wykresy y=−f(x) i y=f(−x); wektory w układzie współrzędnych; złożenie funkcji | R V.1–2, R IX.3; ZPiR 1 Dz.4 |
| LO1 | `lo1.algebraR` | Wzory skróconego mnożenia – rozszerzenie | wzory (a±b)³, a³±b³; rozkład wielomianu metodą grupowania; nierówności z wartością bezwzględną | R II.2, II.5, III.4; ZPiR 1 Dz.2 |
| LO2 | `lo2.expLogR` | Funkcja wykładnicza i logarytmiczna (R) | wykresy i przekształcenia; zmiana podstawy logarytmu; zastosowania | R I; ZPiR 2 Dz.6 (заменяет `lo1.logR`) |
| LO2 | `lo2.sinesR` | Twierdzenie sinusów i czworokąty | twierdzenie sinusów; rozwiązywanie dowolnych trójkątów; czworokąty wpisane w okrąg i opisane na okręgu | R VII.7–8, R VIII.1; ZPiR 2 Dz.5 |
| LO3 | `lo3.trigFunctionsR` | Funkcje trygonometryczne dowolnego kąta | miara łukowa; wykresy i okresowość; wzory redukcyjne; przekształcenia wykresów | R VII.1–4; ZPiR 3 Dz.1 (заменяет `lo2.trigAnyR`) |
| LO3 | `lo3.optimizationR` | Zastosowania pochodnej | ekstrema funkcji; wartość najmniejsza i największa w przedziale; zadania optymalizacyjne | R XIII.5–6; ZPiR 3 Dz.4 (заменяет `lo4.optimizationR`) |
| LO4 | `lo4.stereometryR` | Stereometria – rozszerzenie | twierdzenie o trzech prostopadłych; kąt między prostą a płaszczyzną i kąt dwuścienny; przekroje sześcianu i ostrosłupów prawidłowych | R X.1–2, P X.2; ZPiR 4 Dz.2 |

---

## 4. Что убрать из промптов

### 4a. Удалено или ограничено в 2024 г.

По документу GWO; для SP и LO сверено с текстом на ZPE.

**SP (klasy IV–VI):**
- NWD/NWW — только для не более чем трёхзначных чисел; разложение на простые множители — только для таких чисел, где не больше одного множителя > 10.
- Письменные действия с десятичными дробями — только если у дробей в сумме ≤ 6 ненулевых цифр.
- Округление десятичных дробей — не дальше 2-го знака, в практическом контексте.

**SP (klasy VII–VIII):**
- Повышения и понижения цены — не более **двух** подряд (было «wielokrotne»).
- «Pole pierścienia kołowego» (бывший XIV.5) — удалено.

**LO — перенесено с P на R** (для ученика уровня P в промптах не использовать):
- неравенства с модулем (|x−2|<3);
- формулы (a±b)³, a³−b³, aⁿ−bⁿ;
- разложение группировкой;
- целые корни многочлена; деление многочлена на x−a;
- сложение и вычитание рациональных выражений;
- биквадратные уравнения и уравнения, сводящиеся к квадратным;
- уравнения V(x)/W(x)=0;
- системы «линейное + квадратное»;
- y=−f(x) и y=f(−x);
- twierdzenie sinusów; решение произвольных треугольников (на P остаются только прямоугольные);
- обратная теорема Фалеса (twierdzenie odwrotne do twierdzenia Talesa);
- касательная к окружности как «prosta o zadanych własnościach»;
- точки пересечения прямой и окружности.

**LO — удалено полностью (с P и с R):**
- twierdzenie o dwusiecznej kąta (в списке теорем для доказательства на P оно осталось) и twierdzenie o kącie między styczną a cięciwą;
- точки пересечения прямой и параболы;
- odległość punktu od prostej — удалена из P; в R-требованиях её тоже нет;
- przekrój prostopadłościanu płaszczyzną;
- skala centylowa, **odchylenie standardowe**, **wartość oczekiwana**.

**LO — удалено только на R:**
- **рациональные** корни многочлена (остаются только целые);
- **nierówności trygonometryczne**;
- równanie okręgu w postaci ogólnej;
- y=|f(x)|: по документу GWO часть пункта R V.1 удалена, и по контексту это именно |f(x)|. Но выдержка с ZPE, полученная при проверке, неоднозначна — **сверить с текстом Dz.U. 2024 poz. 1019**;
- часть пункта о własności Darboux (какая именно — не установлено).

**Перенесено в «sposoby realizacji»** (не требования): поиск значений тригонометрических функций и углов по таблицам или калькулятору.

### 4b. Вне базы SP (независимо от 2024 г.)

В черновике эти подтемы есть, но в *podstawie* SP их нет:
- «potęga o wykładniku całkowitym ujemnym» (кроме записи a·10^k с отрицательным k);
- «usuwanie niewymierności z mianownika»;
- «długość łuku i pole wycinka»;
- «symetria w układzie współrzędnych»;
- twierdzenie odwrotne do twierdzenia Pitagorasa (VIII.7 прямо говорит «bez twierdzenia odwrotnego»);
- умножение произвольных многочленов (в базе — только двучлен на двучлен).

---

## 5. Чеклист правок для `sp.ts` / `lo.ts`

### sp.ts

**SP5**
- [ ] `sp5.natural`: заменить «potęgi o wykładniku naturalnym» на «kwadraty i sześciany liczb»; добавить «system rzymski», «szacowanie», «dzielenie z resztą».
- [ ] `sp5.divisibility`: в подтемах или промпте указать ограничение «liczby co najwyżej trzycyfrowe».
- [ ] `sp5.decimals`: указать ограничения 2024 г. (≤ 6 ненулевых цифр; округление до сотых).
- [ ] `sp5.polygons`: добавить «konstrukcja trójkąta, nierówność trójkąta», «oś symetrii».

**SP6**
- [ ] `sp6.solids`: заменить «pole powierzchni/objętość graniastosłupa» на «pole powierzchni i objętość prostopadłościanu»; призмы оставить как «rozpoznawanie i siatki».
- [ ] `sp6.area`: объединить с `sp5.area` или переименовать в «Pola wielokątów – zadania praktyczne».
- [ ] Добавить `sp6.percent` и `sp6.data`.

**SP7**
- [ ] `sp7.powers`: удалить «potęga o wykładniku całkowitym ujemnym».
- [ ] `sp7.expressions`: заменить «mnożenie sum algebraicznych» на «mnożenie sumy przez jednomian i dwumianu przez dwumian».
- [ ] `sp7.percent`: добавить «punkty procentowe», ограничение «co najwyżej dwukrotne podwyżki/obniżki».
- [ ] `sp7.prisms`: удалить, содержимое перенести в `sp8.solids` (там уже есть призмы и пирамиды).
- [ ] Добавить `sp7.pythagoras`, `sp7.coordinates`, `sp7.plane` — ради пользователей MzK и M+ издания 2026/27.

**SP8**
- [ ] `sp8.powersRoots`: удалить «usuwanie niewymierności z mianownika».
- [ ] `sp8.symmetry`: удалить «symetria w układzie współrzędnych»; добавить «symetralna odcinka», «dwusieczna kąta».
- [ ] `sp8.circle`: удалить «długość łuku i pole wycinka»; добавить «promień z długości okręgu / pola koła».
- [ ] `sp8.probability`: перенести «średnia arytmetyczna i diagramy» в новую `sp8.statistics`; добавить «losowanie ze zwracaniem i bez zwracania».
- [ ] Добавить `sp8.statistics`, `sp8.examReview`.

**Общее**
- [ ] В общий промпт SP добавить «вне podstawy» из раздела 4b и ограничения из 4a.
- [ ] Решить, как учитывать разницу между учебниками (Pitagoras, układ współrzędnych, statystyka): дублировать темы в SP7 и SP8 или добавить в профиль ученика выбор серии (MzK / M+).

### lo.ts

**LO1**
- [ ] Добавить в `lo1.functions` «przesuwanie wykresu y=f(x−a), y=f(x)+b».
- [ ] `lo1.sets`: заменить «wartość bezwzględna jako odległość» на «równania z wartością bezwzględną typu |x+4|=5» (без неравенств).
- [ ] `lo1.expressions`: указать, что на P только (a±b)², a²−b² и вынесение одночлена.
- [ ] `lo1.real`: убрать или пометить «błąd przybliżenia» (неясно).
- [ ] `lo1.logR`: удалить; вместо неё — `lo2.expLogR`.
- [ ] `lo1.paramR`: переименовать в «Równania liniowe z parametrem» (или проверить по учебнику).
- [ ] Добавить `lo1.transformR`, `lo1.algebraR`.

**LO2**
- [ ] `lo2.transform`: удалить; сдвиги — в `lo1.functions`, симметрии — в `lo1.transformR`.
- [ ] `lo2.quadrilaterals`: заменить на `lo2.circles` (P).
- [ ] `lo2.circlesR`: удалить (или превратить в `lo2.sinesR`: twierdzenie sinusów и czworokąty wpisane/opisane).
- [ ] `lo2.trigAcute`: расширить до 0°–180° или объединить с новой `lo2.trigTriangles`.
- [ ] Добавить `lo2.polynomials` (P), `lo2.rational` (P), `lo2.trigTriangles` (P).
- [ ] `lo2.polynomialsR`: убрать «pierwiastki wymierne» (если появятся); добавить «nierówności wielomianowe», «pierwiastki całkowite».
- [ ] `lo2.quadParamR`: добавить «równania dwukwadratowe».
- [ ] `lo2.trigAnyR`: перенести в `lo3` (как `lo3.trigFunctionsR`).

**LO3**
- [ ] `lo3.polynomials`, `lo3.rational`, `lo3.trig`: удалить (перенесены в `lo2`).
- [ ] `lo3.analytic`: добавить «wzajemne położenie prostych», «symetrie w układzie współrzędnych».
- [ ] `lo3.analyticR`: удалить «odległość punktu od prostej»; добавить «wektory», «prosta styczna do okręgu», «układy równań drugiego stopnia».
- [ ] `lo3.trigEqR`: удалить «nierówności trygonometryczne»; добавить «wzory na funkcje sumy i różnicy kątów».
- [ ] `lo3.derivativesR`: добавить «ciągłość i własność Darboux».
- [ ] Добавить `lo3.statistics` (P) и `lo3.optimizationR`.

**LO4**
- [ ] `lo4.statistics`: удалить (перенесена в `lo3.statistics`) вместе с подтемой «odchylenie standardowe».
- [ ] `lo4.combinatorics`: заменить «permutacje» на «zliczanie z regułą mnożenia i dodawania»; формулы оставить в `lo4.combinatoricsR`.
- [ ] `lo4.optimizationR`: удалить или сделать повторением.
- [ ] `lo4.conditionalR`: добавить «wzór Bayesa».
- [ ] Добавить `lo4.stereometryR` и `lo4.proofs`.

**Общее**
- [ ] В общий промпт LO добавить список из 4a: «для P не использовать» и «удалено полностью».
- [ ] **Архитектура.** Решить, как быть с тем, что распределение ZP и ZPiR по классам разное (exp/log: ZP кл. 3 и ZPiR кл. 2; funkcja kwadratowa в ZPiR с кл. 1). Варианты:
  - (а) отдельный класс для каждого уровня у темы;
  - (б) отдельные R-копии тем с другим классом;
  - (в) давать R-ученику доступ к темам соседних классов.
- [ ] Отдельно проверить распределение в «Nowa MATeMAtyka» (2025): эта ревизия основана на «MATeMAtyka», издание 2024.
- [ ] Запланировать пересмотр `sp5` к 2027/28 и `lo1` к 2027/28 (Reforma26).
