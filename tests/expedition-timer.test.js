import test from 'node:test';
import assert from 'node:assert/strict';
import { ExpeditionTimer, formatRemaining } from '../src/ui/expedition-timer.js';

function fakeEl() {
  const classes = new Set();
  return {
    textContent: '',
    value: '10',
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)),
      contains: (c) => classes.has(c),
    },
  };
}

function memoryStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
}

test('formatRemaining muestra minutos y segundos', () => {
  assert.equal(formatRemaining(600000), '10:00');
  assert.equal(formatRemaining(61000), '1:01');
  assert.equal(formatRemaining(-5), '0:00');
});

test('el temporizador cuenta, avisa una sola vez al llegar a cero y se retoma desde el almacenamiento', () => {
  let now = 1_000_000;
  const storage = memoryStorage();
  const badge = fakeEl();
  const text = fakeEl();
  const select = fakeEl();
  select.value = '7';
  let timeUps = 0;
  const timer = new ExpeditionTimer({ badgeEl: badge, textEl: text, selectEl: select, now: () => now, storage, onTimeUp: () => { timeUps += 1; } });

  timer.begin({ restart: true });
  assert.equal(text.textContent, '7:00');
  assert.equal(badge.classList.contains('hidden'), false);

  now += 7 * 60000 - 30000;
  timer.begin();
  assert.equal(text.textContent, '0:30');
  assert.equal(badge.classList.contains('is-low'), true);

  // Recargar la página conserva la cuenta.
  const reloaded = new ExpeditionTimer({ badgeEl: badge, textEl: text, selectEl: select, now: () => now, storage, onTimeUp: () => { timeUps += 1; } });
  assert.equal(select.value, '7');
  now += 31000;
  reloaded.begin();
  assert.equal(text.textContent, '¡TIEMPO!');
  assert.equal(badge.classList.contains('is-up'), true);
  reloaded.begin();
  assert.equal(timeUps, 1);
  timer.reset();
  reloaded.reset();
});

test('sin límite oculta el temporizador', () => {
  const badge = fakeEl();
  const select = fakeEl();
  select.value = '0';
  const timer = new ExpeditionTimer({ badgeEl: badge, textEl: fakeEl(), selectEl: select, storage: memoryStorage() });
  timer.begin({ restart: true });
  assert.equal(badge.classList.contains('hidden'), true);
  assert.equal(timer.remainingMs(), null);
});
