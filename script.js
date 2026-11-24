document.documentElement.classList.add('js');

// Мобильное меню: состояние хранится в aria-expanded, стили реагируют через :has().
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  if (!toggle) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

toggle?.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

// Форма честно копирует заявку и открывает чат: никакого «отправлено» без отправки.
const form = document.getElementById('request-form');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = form.querySelector('#client-name').value.trim();
  const tel = form.querySelector('#client-tel').value.trim();
  const text = `Заявка на замер\nИмя: ${name}\nТелефон: ${tel}`;
  const status = form.querySelector('.form-status');

  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    copied = document.execCommand('copy');
    field.remove();
  }

  status.textContent = copied
    ? 'Заявка скопирована. Вставьте её в чат Telegram — автоматической отправки нет.'
    : 'Не получилось скопировать — отправьте имя и телефон в Telegram вручную.';

  const link = document.createElement('a');
  link.href = `https://t.me/your_username?text=${encodeURIComponent(text)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
});

// Сравнение «до/после»: range доступен с клавиатуры, без JS видны обе фотографии.
document.querySelectorAll('.compare').forEach((compare) => {
  const range = compare.querySelector('.compare__range');
  const update = () => compare.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', update);
  update();
});
