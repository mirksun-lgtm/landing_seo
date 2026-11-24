const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

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
  assert.doesNotMatch(html, /учебный проект/i);
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

test('форма отклоняет слишком короткий телефон', () => {
  const html = read('index.html');
  const input = html.match(/<input[^>]*id="client-tel"[^>]*>/)[0];
  const pattern = input.match(/pattern="([^"]+)"/)[1];
  const re = new RegExp(`^(?:${pattern})$`, 'v');
  assert.equal(re.test('123'), false);
  assert.equal(re.test('+7 999 123-45-67'), true);
});
