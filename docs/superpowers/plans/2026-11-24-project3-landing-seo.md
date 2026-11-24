# Проект 3: лендинг + SEO + запуск — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сдать третий кейс портфолио — русскоязычный лендинг услуги с SEO, работающей формой и инструкцией по запуску.

**Architecture:** Один статический HTML-файл с 8 секциями, один таблица стилей с дизайн-токенами, небольшой JS для меню/формы/слайдера. Проверки — встроенный `node:test`, без зависимостей и сборщиков. Деплой — GitHub Pages, но пуш только после подтверждения.

**Tech Stack:** HTML5, CSS3 (`@layer`, `:has()`, `@container`, `clamp()`), vanilla JS, Node.js 24 (`node --test`), git, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-24-project3-landing-seo-design.md`

## Global Constraints
- Без зависимостей и сборщиков: `package.json` и `npm install` не нужны.
- Бренд: «Мастер Отделки». Язык страницы `ru`. 8 блоков в порядке из спеки.
- Ценовые и отзывы помечать словом «пример» прямо на странице.
- Телефон `+7 (999) 000-00-00`, Telegram `https://t.me/your_username`, адрес города — плейсхолдеры; README требует замены перед боевым запуском.
- Адаптив 1024 / 768 / 480 px; 360 px без горизонтальной прокрутки.
- Один `<h1>`, у всех `<img>` есть `alt`, внутренние ссылки ведут на существующие `id`.
- Создавать репозиторий на GitHub, пушить и что-либо покупать — только после прямого «да» Олега.
- В футере запрещено «учебный проект».

## Review Focus
- Реальная форма: пустое имя / некорректный телефон не должны «успешно» копироваться → тест на `required`, `type="tel"`, `pattern` и обработчик `submit` с `checkValidity()`.
- Кнопки CTA и форма должны вести в Telegram даже при выключенном JS → тест: у CTA есть `href="https://t.me/..."`, в форме есть `<noscript>` со ссылкой.
- Слайдер «до/после» с клавиатуры и без JS → тест: `input[type=range]` с `aria-label`, обе картинки в разметке, CSS `clip-path`.
- Мобильное меню: Escape закрывает, `aria-expanded` синхронизирован → тест на Presence `Escape` и `aria-expanded` в JS.
- Разметка 360 px: длинные слова/цены не ломают сетку → визальная проверка скриншота 360 px + `overflow-x: hidden`.

---

### Task 1: Фундамент проекта

**Files:**
- Create: `AGENTS.md`, `.gitignore`, `tests/site.test.js` (первая версия)

**Interfaces:**
- Produces: корень проекта, тестовая база `tests/site.test.js` с хелпером `read(f)`.

- [ ] **Step 1: Создать `AGENTS.md`** (до 30 строк): стек, команды `open index.html` / `node --test tests/site.test.js`, структура, правила (плейсхолдеры, «пример», без зависимостей, деплой после подтверждения).

- [ ] **Step 2: Создать `.gitignore`** с одной строкой `.DS_Store` (больше нечего игнорировать).

- [ ] **Step 3: Создать тестовую базу**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
```

- [ ] **Step 4: Проверить запуск тестов**

Run: `node --test tests/site.test.js`
Expected: PASS (пока 0 тестов; файл подключится позже).

- [ ] **Step 5: Инициализировать git и коммит**

```bash
git init
git add AGENTS.md .gitignore tests/site.test.js docs/
git commit -m "лендинг: фундамент проекта и документация"
```

### Task 2: Контент и HTML-каркас (8 блоков + SEO-разметка)

**Files:**
- Create: `index.html`
- Modify: `tests/site.test.js`

**Interfaces:**
- Consumes: `read(f)` из Task 1.
- Produces: `id` секций `hero, problem, services, steps, works, reviews, faq, contacts`; классы для CSS и JS: `.site-header`, `.nav-toggle`, `.site-nav`, `.cta`, `.price-note`, `.case`, `.compare`, `.compare__range`, `.form-card`, `.form-status`, `.site-footer`.

- [ ] **Step 1: Написать тесты на структуру и SEO**

```js
test('SEO: lang, title, description, OG, один H1 и alt у картинок', () => {
  const html = read('index.html');
  assert.match(html, /<html[^>]+lang="ru"/);
  assert.match(html, /<title>[^<]{20,80}<\/title>/);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]{60,180}"/);
  assert.match(html, /<meta\s+property="og:title"/);
  assert.match(html, /<meta\s+property="og:description"/);
  assert.match(html, /<meta\s+property="og:image"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /alt="[^"]+"/);
});

test('8 блоков на месте и внутренние ссылки ведут в существующие id', () => {
  const html = read('index.html');
  for (const id of ['hero','problem','services','steps','works','reviews','faq','contacts'])
    assert.ok(html.includes(`id="${id}"`), `нет блока #${id}`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const href of [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))
    assert.ok(ids.has(href), `нет цели #${href}`);
});

test('честность: цены и отзывы помечены "пример", футер без "учебный проект"', () => {
  const html = read('index.html');
  assert.ok((html.match(/пример/gi) || []).length >= 4);
  assert.doesNotMatch(read('index.html'), /учебный проект/i);
});

test('SEO-файлы: JSON-LD LocalBusiness, robots.txt, sitemap.xml', () => {
  const html = read('index.html');
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ld, 'нет JSON-LD');
  const data = JSON.parse(ld[1]);
  assert.equal(data['@type'], 'LocalBusiness');
  for (const key of ['name', 'telephone', 'address', 'openingHours'])
    assert.ok(data[key], `в JSON-LD нет ${key}`);
  assert.match(read('robots.txt'), /Sitemap:\s*https?:\/\//);
  assert.match(read('sitemap.xml'), /<loc>https?:\/\//);
});
```

- [ ] **Step 2: Запустить тесты, убедиться в падении**

Run: `node --test tests/site.test.js`
Expected: FAIL (нет `index.html`).

- [ ] **Step 3: Написать `index.html`** — `<html lang="ru">`, head с title «Ремонт квартир под ключ | Мастер Отделки», description 100–150 символов, `og:*`, `twitter:card`, canonical, JSON-LD `LocalBusiness` с	name/telephone/address/openingHoursSpecification/areaServed/url/image, `<link rel="preload">` на главное фото. body: skip-link, header с логотипом и `.nav-toggle` (`aria-expanded="false"`, `aria-controls="site-nav"`), `<nav id="site-nav">`, 8 `<section id=...>` с H2/H3, CTA-ссылки `https://t.me/your_username`, 4 карточки услуг с `.price-note` «цена пример», 4 шага, 3 кейса с парой фото «до/после» и `.compare__range`, 3 отзыва с «пример», FAQ на `<details>`, форма `id="request-form"` с `name`, `tel required type="tel" pattern="\+?[\d\s()\-]{10,}"`, `<p class="form-status" role="status" aria-live="polite">` и `<noscript>` со ссылкой в Telegram, футер с атрибуцией фото (CC0/CC BY + автор) и без «учебный проект».

- [ ] **Step 4: Создать `robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://example.github.io/landing_seo/sitemap.xml
```

- [ ] **Step 5: Создать `sitemap.xml`** с одним `<url>` на `https://example.github.io/landing_seo/`, `<lastmod>2026-11-24</lastmod>`.

- [ ] **Step 6: Прогнать тесты**

Run: `node --test tests/site.test.js`
Expected: PASS.

- [ ] **Step 7: Коммит**

```bash
git add index.html robots.txt sitemap.xml tests/site.test.js
git commit -m "лендинг: 8 блоков, тексты и SEO-разметка"
```

### Task 3: Дизайн и адаптивная вёрстка

**Files:**
- Create: `styles.css`, `images/` (локальные фото)
- Modify: `tests/site.test.js`

**Interfaces:**
- Consumes: классы из Task 2.
- Produces: дизайн-токены и адаптивные правила, используемые Task 4.

- [ ] **Step 1: Добавить тесты на CSS и картинки**

```js
test('адаптив и современный CSS присутствуют', () => {
  const css = read('styles.css');
  for (const w of [1024, 768, 480]) assert.ok(css.includes(`${w}px`), `нет ${w}px`);
  assert.match(css, /overflow-x:\s*hidden/);
  for (const f of ['@layer', '@container', ':has\(', 'clamp\(', 'prefers-reduced-motion'])
    assert.ok(css.includes(f), `нет ${f}`);
});

test('картинки локальные, с размерами и lazy-загрузкой', () => {
  const html = read('index.html');
  const srcs = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 6);
  for (const src of srcs) {
    assert.ok(!/^https?:/.test(src), `картинка не локальная: ${src}`);
    assert.ok(fs.existsSync(path.join(root, src)), `нет файла ${src}`);
  }
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  assert.ok(imgs.some((i) => /loading="lazy"/.test(i)));
  assert.ok(imgs.every((i) => /width="\d+"/.test(i) && /height="\d+"/.test(i)));
});
```

- [ ] **Step 2: Прогнать тесты — ожидаемое падение**

Run: `node --test tests/site.test.js`
Expected: FAIL (нет `styles.css` и картинок).

- [ ] **Step 3: Скачать фото** CC0/CC BY (ремонт, отделка, интерьер) в `images/`, при необходимости переименовать в `work-1-before.jpg` … `work-3-after.jpg`, `hero.jpg`. Атрибуцию (автор, источник, лицензия) записать в футер `index.html` и в README. Если сеть недоступна — остановиться и сообщить Олегу, не выдумывать лицензию.

- [ ] **Step 4: Написать `styles.css`** с `@layer tokens, base, components, media;`: токены (цвета, шрифт system-ui, радиусы, тени), базовые стили, сетки секций, `.price-note`, `.case`, `.compare` (две картинки, верхняя обрезается `clip-path: inset(0 calc(100% - var(--pos)) 0 0)`), `.compare__range` как range-инпут, `.form-card`, `.site-footer`, skip-link, `:focus-visible`, `scroll-behavior: smooth` и `prefers-reduced-motion`, `content-visibility: auto` для нижележащих секций; медиазапросы 1024 / 768 / 480; `body { overflow-x: hidden }`.

- [ ] **Step 5: Прогнать тесты**

Run: `node --test tests/site.test.js`
Expected: PASS.

- [ ] **Step 6: Коммит**

```bash
git add styles.css images/ tests/site.test.js index.html
git commit -m "лендинг: адаптивная вёрстка и локальные фото"
```

### Task 4: Интерактив на vanilla JS

**Files:**
- Create: `script.js`
- Modify: `index.html` (подключение `<script src="script.js" defer></script>`), `tests/site.test.js`

**Interfaces:**
- Consumes: `.nav-toggle`, `#site-nav`, `#request-form`, `.form-status`, `.compare__range`, `.compare`.
- Produces: честная отправка заявки (копирование + t.me), доступное меню, слайдер.

- [ ] **Step 1: Добавить тесты на интерактив**

```js
test('JS: меню, форма и слайдер доступны', () => {
  const js = read('script.js');
  const html = read('index.html');
  assert.match(js, /Escape/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /clipboard|execCommand/);
  assert.match(js, /checkValidity/);
  assert.match(html, /<script src="script.js" defer><\/script>/);
  assert.match(html, /<noscript>[\s\S]*?t\.me\//);
  assert.match(html, /type="range"/);
});
```

- [ ] **Step 2: Прогнать тесты — ожидаемое падение**

Run: `node --test tests/site.test.js`
Expected: FAIL (нет `script.js`).

- [ ] **Step 3: Написать `script.js`** — три независимые части:
  1) меню: `toggle.addEventListener('click', ...)`, закрытие по Escape и по клику на ссылку, синхронизация `aria-expanded`;
  2) форма: `form.addEventListener('submit', async (e) => { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } ... })`; собрать текст из `name`/`tel`, `navigator.clipboard.writeText` с fallback через скрытый `<textarea>` + `document.execCommand('copy')`, записать статус в `.form-status`, открыть `https://t.me/your_username?text=...` через `window.open` (с проверкой, что окно не заблокировано) и показать честный текст «Заявка скопирована — вставьте её в чат Telegram»;
  3) слайдер: для каждого `.compare` слушать `input` range, ставить `--pos` в `%`, поддерживать клавиатуру нативно и `aria-label`.

- [ ] **Step 4: Прогнать тесты**

Run: `node --test tests/site.test.js`
Expected: PASS.

- [ ] **Step 5: Коммит**

```bash
git add script.js index.html tests/site.test.js
git commit -m "лендинг: форма, мобильное меню и слайдер до/после"
```

### Task 5: Проверка глазами и доводка

**Files:**
- Modify: `styles.css`, `index.html` (только то, что показала проверка)

**Interfaces:**
- Consumes: готовая страница из Tasks 2–4.
- Produces: скриншоты `screenshots/desktop.png`, `screenshots/mobile.png`, `screenshots/mobile-360.png`.

- [ ] **Step 1: Открыть страницу в браузере** и снять скриншоты 1440×900, 768×1024, 360×800 — смотреть именно глазами, не только по тестам.

- [ ] **Step 2: Проверить вручную** по чек-листу: шрифт и контраст, отступы, выравнивание карточек, нет обрезанного текста, меню на мобильном, работа формы (валидация + копирование), слайдер мышью и клавиатурой, 360 px без горизонтальной прокрутки, appointment всех CTA в Telegram.

- [ ] **Step 3: Исправить найденное** минимальными правками в `styles.css` / `index.html`, снова снять скриншоты.

- [ ] **Step 4: Прогнать все тесты**

Run: `node --test tests/site.test.js`
Expected: PASS.

- [ ] **Step 5: Коммит**

```bash
git add styles.css index.html screenshots/
git commit -m "лендинг: визуальная доводка по скриншотам"
```

### Task 6: README и сдача

**Files:**
- Create: `README.md`
- Modify: страница-портфолио (путь уточнить перед правкой)

**Interfaces:**
- Consumes: всё из Tasks 1–5.
- Produces: готовый кейс, инструкция по запуску.

- [ ] **Step 1: Написать `README.md`**: что это и зачем; структура файлов; как открыть локально; как залить на GitHub Pages (пошагово); как подключить свой домен (A/CNAME + DNS, без покупки); почему статика быстрее и дешевле WordPress; раздел «Что под капотом» (CSS-фичи, доступность, progressive enhancement, JSON-LD, тесты) с пояснениями простыми словами; ручной SEO-чек-лист; атрибуция фото; явная пометка про плейсхолдеры телефона/Telegram/адреса.

- [ ] **Step 2: Добавить третий кейс на страницу-портфолио** — найти файл, добавить ссылку на репозиторий/живую страницу; если страница не найдена — не выдумывать, сообщить Олегу.

- [ ] **Step 3: Финальная проверка**

Run: `node --test tests/site.test.js`
Expected: PASS. Проверить, что `git status` чистый (кроме ожидающих подтверждения операций с remote).

- [ ] **Step 4: Коммит**

```bash
git add README.md
git commit -m "лендинг: README с инструкцией по запуску"
```

- [ ] **Step 5: Спросить Олега разрешение на создание GitHub-репозитория и пуш** (отдельный важный шаг, не часть автоматического этапа).
