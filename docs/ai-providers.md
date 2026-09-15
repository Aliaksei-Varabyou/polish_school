# Выбор провайдера LLM API для matema

**Дата исследования:** 15 сентября 2026 г.
**Это НЕ юридическая консультация.** Документ — техническое резюме публичных условий использования (ToS/AUP/Usage Policy) провайдеров LLM API, собранное для внутреннего решения о выборе провайдера. Перед коммерческим запуском нужна проверка юристом, знакомым с правом ЕС/Польши (GDPR, DSA, возможно AI Act) и с фактическими условиями, действующими на момент подписания договора с провайдером — условия меняются часто (см. даты версий ниже).

## Контекст

matema — образовательный веб-портал для школьников Польши (ЕЭЗ), примерно 10–19 лет, то есть значительная часть пользователей — несовершеннолетние, часть — младше 13/16 лет. Бэкенд вызывает LLM API для (а) генерации математических заданий в виде JSON (structured output) и (б) короткого фидбэка по ошибкам ученика. В промптах нет имён и контактных данных, но есть неверные ответы ученика и статистика по темам. Объём небольшой: ранняя стадия, от нескольких сотен до нескольких тысяч вызовов LLM в день, ~740 токенов на входе и ~1900 на выходе на один вызов генерации задания.

Уже подтверждено: **Google Gemini Developer API непригоден** — Additional Terms (ред. от 28.04.2026) прямо запрещают использование в сервисах, "directed towards or is likely to be accessed by individuals under the age of 18", и требуют платного тарифа для пользователей ЕЭЗ/Швейцарии/Великобритании.

---

## 1. Сводная таблица

| Провайдер | Несовершеннолетние разрешены? | ЕЭЗ | Обучение на данных? | DPA / регион ЕС | JSON schema | Самая дешёвая подходящая модель + цена (вход/выход за 1M токенов) | Оценка стоимости на 1k / 10k вызовов |
|---|---|---|---|---|---|---|---|
| **Google Vertex AI (Gemini на GCP)** | **Нет** — тот же запрет "directed towards or likely to be accessed by individuals under the age of 18" в Service Specific Terms, п. 20(d) | Да (есть DPA), но продукт всё равно запрещён из-за возрастного ограничения | Нет (Training Restriction, п. 18) | DPA есть, региональные endpoint'ы есть | Да (`responseSchema`) | Gemini 2.5 Flash-Lite: $0.10 / $0.40 | ~$0.83 / ~$8.3 (но использовать нельзя) |
| **Anthropic Claude API** | Да, при условии выполнения доп. требований для организаций, работающих с несовершеннолетними (возрастная верификация, фильтрация контента, мониторинг, раскрытие факта общения с ИИ) | Да | Нет ("Anthropic may not train models on Customer Content from Services") | DPA есть; `inference_geo` только "us"/"global" (нет выделенного EU-региона хранения на сегодня) | Да, GA, поддерживается Haiku 4.5 | Claude Haiku 4.5: $1 / $5 (batch: $0.50 / $2.50) | ~$10.2 / ~$102 (batch: ~$5.1 / ~$51) |
| **OpenAI API** | Да, при условии доп. мер (возрастная проверка, фильтры, мониторинг); для детей до 13 лет — обязательна нулевая ретенция (ZDR) | Да, есть выделенный EU-регион (`eu.api.openai.com`) при апруве | По умолчанию НЕ используется для обучения с 2023 г. | DPA есть; региональное хранение/обработка в ЕЭЗ доступны (нужен апрув + новая организация/проект) | Да (Structured Outputs, strict mode) | gpt-5-nano: $0.05 / $0.40 | ~$0.80 / ~$7.97 |
| **Mistral AI (La Plateforme)** | Разрешено с 13 лет, с согласия родителя/опекуна для несовершеннолетних; данные детей до 13 лет запрещены как Customer Data без согласия | Да, EU-компания, платформа хостится в ЕС по умолчанию | Нет по умолчанию (opt-out по умолчанию для коммерческих клиентов, кроме Labs/Preview моделей) | DPA есть (legal.mistral.ai/terms/data-processing-addendum), Mistral — data processor | Заявлена (custom structured outputs / JSON mode), детали strict-mode не проверены полностью | Ministral 8B: $0.15 / $0.15 (или Mistral Small: $0.15 / $0.6) | Ministral 8B: ~$0.40 / ~$3.96 |
| **Scaleway Generative APIs (EU-хостинг open-weight моделей)** | Явного пункта "нет несовершеннолетним" в найденных материалах не обнаружено (в отличие от Google) — требует доп. проверки | Да, данные обрабатываются в Париже | Нет ("data not used for training, retraining, or improving the base models") | Отдельного публичного DPA-текста не проверено детально в рамках этого исследования | Не подтверждено детально (модели поддерживают JSON-режимы в зависимости от модели) | Mistral Small 3.2 24B: €0.15 / €0.35 | ~€0.78 / ~€7.76 |
| **Self-hosted open-weight (Llama/Gemma/Qwen)** | Зависит от лицензии модели, а не от хостера; см. ниже — у Llama и Gemma есть пункты о защите детей от вредного контента, но нет общего запрета "сервис не для тех, кому < 18" | Полностью зависит от инфраструктуры, которую вы сами выбираете | Не применимо (вы не отправляете данные третьей стороне, если хостите сами) | Вы сами оператор — DPA не нужен провайдеру модели, но нужен для инфраструктуры хостинга | Зависит от инференс-стека (vLLM/TGI и т.п. поддерживают structured output через grammars) | Зависит от инфраструктуры хостинга | Не рассчитано (зависит от GPU-инфраструктуры) |

---

## 2. Детали по провайдерам

### 2.1 Google Vertex AI (Gemini на Google Cloud)

**Source:** [Google Cloud Service Specific Terms](https://cloud.google.com/terms/service-terms)

Раздел 20 "Generative AI Services", подпункт d "Age Restrictions":

> "Customer will not, and will not allow End Users to, use a Generative AI Service as part of a website, Customer Application, or other online service that is directed towards or is likely to be accessed by individuals under the age of 18."

Это **тот же запрет**, что и в условиях Gemini Developer API, распространённый и на Vertex AI / Gemini Enterprise Agent Platform — то есть Vertex AI **тоже непригоден** для matema.

Раздел 18 "Training Restriction":

> "Google will not use Customer Data to train or fine-tune any AI/ML models without Customer's prior permission or instruction."

Прошлые версии страницы датированы вплоть до 29 июля 2026 г.; точную дату действующей редакции подтвердить не удалось (страница отображает список "Previous versions" начиная с этой даты, актуальная шапка документа не была надёжно извлечена).

**Prohibited Use Policy для Generative AI** ([policies.google.com/terms/generative-ai/use-policy](https://policies.google.com/terms/generative-ai/use-policy), Last Updated: December 17, 2024) упоминает несовершеннолетних только в контексте CSAM ("Relates to child sexual abuse or exploitation") — то есть отдельного описания условий для детской аудитории здесь нет, всё регулируется через возрастной запрет из Service Specific Terms выше.

Есть также healthcare-запрет (не применимо к matema) и раздел про DPA/региональные данные — но раз возрастное условие категорически исключает продукт, направленный на несовершеннолетних, дальнейшая детализация (цены Gemini 3.1 Flash-Lite $0.25/$1.50, DPA, региональные endpoint'ы) в таблице приведена справочно, но **Vertex AI исключён из рекомендации**.

### 2.2 Anthropic Claude API

**Sources:** [Usage Policy](https://www.anthropic.com/legal/aup) (Effective: September 15, 2025), [Guidelines for organizations serving minors](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors) (страница датирована 16 марта 2026), [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) (Effective: June 17, 2025).

Usage Policy определяет несовершеннолетнего:

> "We define a minor or child to be any individual under the age of 18 years old, regardless of jurisdiction."

И прямо указывает на дополнительные обязательства для продуктов, работающих с детьми:

> "Products serving minors, including organizations providing minors with the ability to directly interact with products that incorporate our API(s), must comply with the additional guidelines outlined in our Help Center article."

В Help Center-статье перечислены требуемые меры:

- "Age verification systems to ensure only intended users can access" продукт
- "Content moderation and filtering to block inappropriate or harmful content"
- "Monitoring and reporting mechanisms to identify and address potential issues"
- "Educational resources and guidance for minors on safe and responsible use"
- рекомендация внедрить фирменный child-safety system prompt Anthropic
- соблюдение применимых законов о защите детей (в т.ч. COPPA в США — для ЕС/Польши это будет GDPR + местное законодательство о защите детей)
- обязательное раскрытие: "Organizations must disclose to their users that they are interacting with an AI system rather than a human."

Anthropic оставляет за собой право на аудит соответствия и приостановку/прекращение доступа при несоблюдении.

Отдельно, Usage Policy требует для high-risk use cases (к которым можно отнести автоматический фидбэк ученику):

> "When using our products or services to provide advice, recommendations, or in subjective decision-making directly affecting individuals or consumers, a qualified professional in that field must review the content or decision prior to dissemination or finalization."

> "If model outputs are presented directly to individuals or consumers, you must disclose to them that you are using AI to help produce your advice, decisions, or recommendations. This disclosure must be provided at a minimum at the beginning of each session."

Это применимо буквально к фидбэку об ошибках — требует раскрытия факта использования ИИ (не обязательно "человек-эксперт в цикле" в строгом смысле для математических подсказок, но лучше это уточнить с юристом: относится ли автоматическая проверка математики к "advice... directly affecting individuals").

**Обучение на данных.** Commercial Terms of Service:

> "Anthropic may not train models on Customer Content from Services."

> "Data submitted through the Services will be processed in accordance with the Anthropic Data Processing Addendum ("DPA"), which is incorporated into these Terms by reference."

**Данные/регион.** На сегодня `inference_geo` поддерживает только значения `"global"` (по умолчанию) и `"us"`; выделенного EU-региона инференса нет. `workspace geo` тоже поддерживает только `"us"`. Т.е. формальной гарантии обработки данных внутри ЕС через первую сторону (api.anthropic.com) на данный момент нет — это стоит явно проверить для соответствия GDPR (может потребоваться SCC/адекватность передачи в США).

**JSON schema / Structured Outputs.** GA-функциональность, поддерживает `claude-haiku-4-5-20251001` и другие текущие модели. ZDR-совместимо, за исключением того, что закешированные JSON-схемы (для `strict: true`) хранятся отдельно от контента промпта — не следует класть персональные данные в саму схему (в matema это не проблема, схема задания статична).

**Цена и оценка стоимости.** Claude Haiku 4.5: $1 / MTok вход, $5 / MTok выход (Batch API: $0.50 / $2.50, скидка 50%, но асинхронно — не годится для интерактивного фидбэка, годится для пакетной генерации заданий).

- На вызов (740 вход + 1900 выход): ≈ $0.0102 (standard), ≈ $0.0051 (batch)
- 1 000 вызовов: ≈ $10.2 (standard) / ≈ $5.1 (batch)
- 10 000 вызовов: ≈ $102 (standard) / ≈ $51 (batch)

Свободного тарифа как такового нет — только небольшие пробные кредиты для новых аккаунтов.

### 2.3 OpenAI API

**Sources:** [Under 18 API Guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [Usage policies](https://openai.com/policies/usage-policies/), [Services Agreement](https://openai.com/policies/services-agreement/) (ONLINE v.010126).

Под-18 руководство для разработчиков:

> "You should not use OpenAI services to process any personal data of children under 13 or the applicable age of digital consent without first implementing zero data retention in our API."

Рекомендованные меры (аналогично Anthropic):

1. "Providing age-appropriate disclosures to minors about AI tools and how to use them responsibly."
2. "Implementing age-appropriate content filters to address potentially sensitive content."
3. "Implementing reasonable monitoring and reporting mechanisms, including escalation paths for high-risk interactions."
4. "using age assurance systems to ensure only intended users can access the product."

Организации, работающие с несовершеннолетними, должны соблюдать применимое законодательство о защите детей, включая COPPA (в США; для Польши — соответствующее местное/GDPR-регулирование).

Services Agreement:

> "Customer will not, and will not permit End Users to, allow minors to use OpenAI Services without consent from their parent or guardian."

Существует также отдельное "OpenAI Student Data Privacy Agreement" — специализированный документ для образовательных организаций США (FERPA/COPPA-ориентирован), релевантность для польского школьного портала под вопросом, требует отдельной проверки юристом при работе с образовательными учреждениями ЕС.

**Данные и обучение.** По умолчанию данные API не используются для обучения моделей (с 1 марта 2023 г.), если явно не включён opt-in. Логи для контроля злоупотреблений хранятся до 30 дней по умолчанию. Zero Data Retention (ZDR) доступен только по одобрению OpenAI (заявка через sales/настройки организации), после чего управляется в Settings → Organization → Data controls.

**Регион ЕС.** Существует региональный endpoint `eu.api.openai.com` с региональным хранением и обработкой (ЕЭЗ + Швейцария), но требует: (1) одобрения контролей мониторинга злоупотреблений, (2) подписания Modified Retention amendment, (3) создания нового проекта под этот регион. Поддерживаемые endpoint'ы включают chat completions, responses, embeddings, files, fine-tuning, images, moderation, vector stores.

**JSON schema.** OpenAI поддерживает Structured Outputs с `response_format: json_schema` и строгим режимом (strict mode) — по данным о ZDR-совместимости этот функционал (за исключением самой схемы) считается ZDR-eligible. Модели семейства gpt-4.1/gpt-5 поддерживают structured outputs.

**Цена.** Из проверенной страницы прайсинга (стандартный тир):

- gpt-5-nano: $0.05 / $0.40 за 1M токенов (вход/выход)
- gpt-4.1-nano: $0.10 / $0.40
- gpt-4o-mini: $0.15 / $0.60
- gpt-5-mini: $0.25 / $2.00
- gpt-4.1-mini: $0.40 / $1.60

Региональная обработка (data residency) добавляет 10% наценку для моделей, выпущенных после 5 марта 2026 г. и подпадающих под data residency.

- На вызов (gpt-5-nano, 740 вход + 1900 выход): ≈ $0.0008
- 1 000 вызовов: ≈ $0.80
- 10 000 вызовов: ≈ $7.97

Это самый дешёвый вариант из всех рассмотренных провайдеров первого уровня.

### 2.4 Mistral AI (La Plateforme)

**Sources:** [Commercial Terms of Service](https://legal.mistral.ai/terms/commercial-terms-of-service) (Effective: August 5, 2026), [Usage Policy](https://legal.mistral.ai/terms/usage-policy) (Effective: June 11, 2026), [Terms of Use](https://mistral.ai/terms-of-use/).

Commercial Terms of Service, ограничения на Customer Data:

> "[Customer will not] include any personal information of children under 13 or the applicable age of digital consent as Customer Data or allow minors to use the Mistral AI Products without legally adequate consent from their parent or guardian."

Общие условия использования: минимальный возраст пользователя — 13 лет, с разрешением родителя/опекуна для несовершеннолетних.

В отличие от Google, **Mistral не запрещает сервисы, направленные на несовершеннолетнюю аудиторию как таковую** — запрет касается конкретно сбора персональных данных детей до 13 лет без согласия и требует согласия родителя для минорной аудитории в целом. Формально это совместимо с продуктом matema (10–19 лет), при условии организации согласия родителей для пользователей младше 16 (стандарт для Польши по GDPR — возраст цифрового согласия в Польше составляет 16 лет).

**Обучение на данных.**

> "Mistral AI will not use Customer Data or Outputs to train its artificial intelligence models except (a) when you (i) opted-in to training on a Mistral AI Product set to opt-out by default or (ii) have not opted-out of training on a Mistral AI Product set..."

То есть по умолчанию для коммерческих продуктов — opt-out (данные НЕ используются для обучения), но модель поведения зависит от конкретного продукта/тарифа — нужно явно проверить настройки конкретного продукта в личном кабинете. Исключение: Labs/Preview модели — там данные могут использоваться для обучения принудительно ("If you do not want your data or outputs used for training, do not use Labs or Preview Models") — их следует избегать.

**DPA и регион.** Mistral — компания из ЕС (Франция), La Plateforme хостится в ЕС по умолчанию.

> "If Customer uses the Mistral AI Products on Mistral Infrastructure, Mistral AI may Process Personal Data on behalf of Customer as a Data Processor. In such case, the Data Processing Agreement available at https://legal.mistral.ai/terms/data-processing-addendum ... will apply between the Parties."

Zero Data Retention доступен, но только на платном тарифе Scale и только для stateless-вызовов (chat completions, embeddings, moderation, OCR, audio) — по данным поиска, не проверено первоисточником напрямую.

**JSON schema.** Mistral документирует "Custom structured outputs" и JSON-режим как рекомендуемый способ получения структурированного вывода ("Custom structured outputs are more reliable and are recommended whenever possible"), но точные детали strict-mode и полный список поддерживаемых моделей не были подтверждены в рамках этого исследования — требуется дополнительная проверка по официальной API-референс документации перед интеграцией.

**Цена** (проверено частично, могут быть неточности из-за скрейпинга сайта):

- Ministral 3B: $0.10 / $0.10 за 1M токенов
- Ministral 8B: $0.15 / $0.15
- Ministral 14B: $0.20 / $0.20
- Mistral Small (последняя версия): $0.15 / $0.60
- Mistral Medium 3.5: $1.50 / $7.50

Для Ministral 8B (740 вход + 1900 выход):
- На вызов: ≈ $0.0004
- 1 000 вызовов: ≈ $0.40
- 10 000 вызовов: ≈ $3.96

Есть бесплатный тариф ("Experiment") с ограниченными кредитами — точные условия (лимиты, использование данных для обучения на этом тарифе) не были однозначно подтверждены; перед использованием бесплатного тарифа для реальных пользователей стоит перепроверить, распространяется ли на него тот же opt-out от обучения.

### 2.5 EU-хостинг: Scaleway Generative APIs (опционально)

**Source:** [Scaleway Generative APIs pricing](https://www.scaleway.com/en/pricing/model-as-a-service/), поиск по data privacy документации.

Scaleway — французский облачный провайдер, предлагающий inference-as-a-service для открытых моделей (Mistral, Llama, Gemma, Qwen и др.) с обработкой данных в регионе Париж.

По данным (не первоисточник, через поиск):

> "Your data is not used for training, retraining, or improving the base models."

> "Scaleway does not collect, read, reuse, or analyze the content of your inputs, prompts, or outputs generated by the API."

Единственное исключение — временное хранение HTTP-запроса (до двух недель) исключительно для расследования инцидентов безопасности/злоупотреблений.

**Цены** (EUR за 1M токенов, serverless):

- Mistral Small 3.2 (24B): €0.15 / €0.35
- Gemma (26B): €0.25 / €0.50
- Qwen 3.6 (35B): €0.25 / €1.50
- Llama 3.3 (70B): €0.90 / €0.90

Есть бесплатный старт: 1 млн токенов + 60 минут транскрипции аудио для новых пользователей.

Для Mistral Small 3.2 24B (740 вход + 1900 выход):
- На вызов: ≈ €0.0008
- 1 000 вызовов: ≈ €0.78
- 10 000 вызовов: ≈ €7.76

**Важная оговорка:** ни отдельного DPA-документа Scaleway, ни явного пункта об ограничениях на использование сервиса для несовершеннолетней аудитории не удалось найти и проверить в рамках этого исследования — это нужно запросить у Scaleway отдельно (обычно у крупных EU cloud-провайдеров DPA есть в стандартном порядке подписания контракта, но текст не был прочитан напрямую).

### 2.6 Self-hosted open-weight модели

Здесь ограничения накладывает **лицензия весов модели**, а не хостер — то есть при самостоятельном хостинге (например, на своём GPU или через нейтральную инфраструктуру типа vLLM на арендованном сервере) нужно смотреть именно на лицензию модели.

**Llama 3.3** — Llama 3.3 Community License + [Acceptable Use Policy](https://developer.meta.com/ai/llama3_3/use-policy/):

> "Exploitation or harm to children, including the solicitation, creation, acquisition, or dissemination of child exploitative content or failure to report Child Sexual Abuse Material"

> "The illegal distribution of information or materials to minors, including obscene materials, or failure to employ legally required age-gating in connection with such information or materials."

Требование раскрытия известных рисков (запрещено не раскрывать):

> "Fail to appropriately disclose to end users any known dangers of your AI system"

Важная оговорка про ЕС для **мультимодальных** моделей Llama 3.3 (если бы использовались):

> "With respect to any multimodal models included in Llama 3.3, the rights granted under Section 1(a) of the Llama 3.3 Community License Agreement are not being granted to you if you are an individual domiciled in, or a company with a principal place of business in, the European Union."

Так как matema — компания/проект в ЕС и, вероятно, использовала бы текстовую (не мультимодальную) модель для генерации заданий, это ограничение может не применяться напрямую — но лицензия сформулирована по признаку резидентства правообладателя лицензии, а не назначения использования, поэтому для компании из ЕС стоит перепроверить весь текст лицензии Llama 3.3 (и других версий Llama) на предмет общих ограничений для резидентов ЕС, а не только мультимодальной оговорки.

Общего запрета на использование для несовершеннолетних пользователей сервиса (как у Google) в лицензии Llama не найдено — есть только запрет на вредный для детей контент, что применимо к любому продукту.

**Gemma** — [Gemma Terms of Use](https://ai.google.dev/gemma/terms) (Last modified: April 1, 2026), для Gemma 4 действует отдельная "Gemma 4 license" (не проверена отдельно в этом исследовании). Условия использования Gemma инкорпорируют отдельную Prohibited Use Policy (ai.google.dev/gemma/prohibited_use_policy, не проверена детально), но **не содержат** аналога возрастного запрета из Vertex AI/Gemini API terms ("directed towards or likely to be accessed by individuals under the age of 18") — то есть этот запрет относится именно к Google-хостируемому API-сервису, а не к самим весам модели. Раздел Eligibility требует лишь, чтобы лицо, принимающее лицензию (юрлицо/представитель), было "of sufficient age of consent" — это про сторону договора, не про конечных пользователей продукта.

**Qwen** — по общедоступной информации (не проверено первоисточником в рамках этого исследования из-за ограничения по запросам) большинство актуальных весов линейки Qwen (Qwen2.5/Qwen3) распространяются под лицензией Apache 2.0, отдельные крупные варианты — под собственной Qwen License с ограничениями, похожими на Llama Community License. Это требует отдельной проверки перед использованием конкретной версии.

**Общий вывод по self-hosted:** юридически самый гибкий вариант в части возрастных ограничений (лицензии моделей не запрещают продукты для несовершеннолетних так, как это делает Google Cloud/Gemini API), но накладывает на matema полную ответственность за: инфраструктуру и её защиту данных (нет готового DPA от "провайдера модели", DPA нужен от хостинг-провайдера GPU), качество и безопасность вывода модели (нет встроенных safety-фильтров уровня Anthropic/OpenAI), и требует нетривиальных DevOps-ресурсов, что на текущей ранней стадии проекта, вероятно, избыточно.

---

## 3. Рекомендация для проекта

**Основной вариант: OpenAI API (gpt-5-nano или gpt-5-mini)** — самая низкая стоимость на 1k/10k вызовов (≈$0.8–$8 на 1k/10k при использовании nano), рабочий JSON Schema / Structured Outputs со strict-mode, по умолчанию данные не используются для обучения, доступен региональный EU endpoint при получении апрува. Требует явного продуктового compliance-трека для работы с несовершеннолетними (см. ниже).

**Запасной вариант: Mistral AI (La Plateforme, Ministral 8B / Mistral Small)** — EU-компания и EU-хостинг по умолчанию, наиболее благоприятные условия по минимальному возрасту (13 лет + согласие родителя для несовершеннолетних, без запрета на "направленность на несовершеннолетних" как у Google), сопоставимая цена, DPA на понятных для GDPR условиях. Минус — меньше проверенной документации по деталям structured output и не до конца ясные условия ZDR/бесплатного тарифа, что требует дополнительной due diligence перед переключением на него как на основной.

**Anthropic Claude API (Haiku 4.5)** — хорошая альтернатива по качеству и ясности compliance-требований (отдельная публичная страница именно про minors), но дороже (~$10/1k standard, ~$5/1k batch vs ~$0.8/1k у OpenAI nano) и без выделенного EU inference-региона на сегодняшний день — можно держать как третий вариант или для конкретных задач, где важно качество вывода (например, генерация сложных заданий), с батч-режимом для неинтерактивной части.

**Google Vertex AI/Gemini — исключить полностью**: тот же запрет на аудиторию до 18 лет, что и у Gemini Developer API, распространяется и на Vertex AI (Service Specific Terms, п. 20(d)).

### Продуктовые изменения, которые потребуются независимо от выбора OpenAI/Anthropic/Mistral

Поскольку все три жизнеспособных провайдера **разрешают** обслуживание несовершеннолетних только при выполнении дополнительных условий, для запуска потребуется:

1. **Возрастной шлюз / определение возраста пользователя** ("age assurance"/"age verification" — формулировки OpenAI и Anthropic) — как минимум сбор возраста при регистрации ученика.
2. **Механизм согласия родителя/опекуна** для пользователей младше возраста цифрового согласия по GDPR в Польше (16 лет) — либо через школу как посредника (если matema работает по B2B/B2G модели со школами, согласие может оформляться на уровне договора школа–платформа, это нужно свести с юристом отдельно), либо напрямую с родителями.
3. **Раскрытие использования ИИ** — явный дисклеймер в интерфейсе, что задания/фидбэк генерируются ИИ, а не человеком (жёсткое требование Anthropic для high-risk-контента, рекомендация OpenAI).
4. **Фильтрация вывода** — базовый контент-фильтр на стороне matema поверх встроенных safety-фильтров провайдера (все три провайдера явно перекладывают ответственность за фильтрацию конечного продукта на клиента API).
5. **Мониторинг и эскалация** — механизм для выявления и обработки потенциально проблемных ответов ИИ (хотя бы логирование + ручной разбор жалоб на первом этапе).
6. **Политика хранения данных** — зафиксировать явно, что и на какой срок хранится (в т.ч. сверка с настройками ZDR у выбранного провайдера, если решат её включать).

---

## 4. Что не удалось подтвердить (требует дополнительной проверки)

- **Точная действующая дата "Last modified" для Google Cloud Service Specific Terms** — извлечён только список архивных версий начиная с 29 июля 2026 г., шапка документа с текущей датой не была надёжно получена (не критично, так как сам Vertex AI исключён из рекомендации).
- **Полные детали Zero Data Retention у Mistral AI** (доступность только на тарифе Scale, точный список охваченных эндпоинтов) — получены через поиск, не через первоисточник (legal.mistral.ai/terms/data-processing-addendum не был прочитан напрямую).
- **Точные условия бесплатного тарифа Mistral ("Experiment")** — лимиты и использование данных для обучения на этом тарифе не подтверждены однозначно.
- **Strict-mode / полный список поддерживаемых моделей для JSON schema у Mistral** — не проверено по официальному API reference.
- **DPA и возрастные ограничения Scaleway** — не найден и не прочитан отдельный публичный текст DPA; explicit-пункт про несовершеннолетних пользователей сервиса не обнаружен (это может означать как отсутствие ограничения, так и то, что он просто не попал в проверенные источники).
- **Актуальная лицензия Qwen** (Apache 2.0 vs Qwen License для разных размеров моделей) — не проверена первоисточником в рамках этого исследования из-за исчерпания лимита запросов.
- **OpenAI Structured Outputs** — детали strict-mode/списка поддерживаемых моделей взяты из общих знаний, не перепроверены свежим запросом к официальной документации в рамках этой сессии.
- **Применимость требования "human-in-the-loop" у Anthropic** конкретно к автоматической проверке математических заданий и фидбэку — юридически неочевидно, попадает ли это под "advice... directly affecting individuals", нужна консультация юриста.
- **Соотнесение возраста цифрового согласия по GDPR в Польше (16 лет)** с формулировками "13 лет" (Mistral) и "13 лет / применимый возраст цифрового согласия" (OpenAI) — нужно свести воедино с юристом: даже если провайдер формально допускает работу с 13-летними, для пользователей 13–16 лет в Польше по GDPR всё равно, вероятно, нужно согласие родителя на уровне matema как оператора данных.
