// Temporizador de expedición: cuenta regresiva en tiempo real (de reloj de la clase),
// visible en el HUD. No detiene el juego al llegar a cero: avisa que hay que ir al cierre.
const STORAGE_KEY = 'expedicion_cc_timer_v1';

export function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export class ExpeditionTimer {
  constructor({ badgeEl, textEl, selectEl, onTimeUp, now = () => Date.now(), storage = globalThis.localStorage } = {}) {
    this.badgeEl = badgeEl;
    this.textEl = textEl;
    this.selectEl = selectEl;
    this.onTimeUp = onTimeUp;
    this.now = now;
    this.storage = storage;
    this.deadline = null;
    this.warned = false;
    this.interval = null;
    this.#load();
    if (this.selectEl && this.minutes !== undefined) this.selectEl.value = String(this.minutes);
  }

  #load() {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.deadline = Number.isFinite(data.deadline) ? data.deadline : null;
      this.minutes = Number(data.minutes) || 0;
      this.warned = Boolean(data.warned);
    } catch { /* sin almacenamiento: el temporizador funciona igual en memoria */ }
  }

  #save() {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify({ deadline: this.deadline, minutes: this.minutes, warned: this.warned }));
    } catch { /* ignorar */ }
  }

  selectedMinutes() {
    return Number(this.selectEl?.value || 0) || 0;
  }

  /** Arranca (o continúa) la expedición. Con restart=true reinicia la cuenta. */
  begin({ restart = false } = {}) {
    const minutes = this.selectedMinutes();
    if (restart || this.deadline === null || minutes !== this.minutes) {
      this.minutes = minutes;
      this.deadline = minutes > 0 ? this.now() + minutes * 60000 : null;
      this.warned = false;
      this.#save();
    }
    this.#tick();
    clearInterval(this.interval);
    if (this.deadline !== null) this.interval = setInterval(() => this.#tick(), 500);
  }

  reset() {
    this.deadline = null;
    this.warned = false;
    clearInterval(this.interval);
    this.#save();
    this.#tick();
  }

  remainingMs() {
    return this.deadline === null ? null : this.deadline - this.now();
  }

  #tick() {
    const remaining = this.remainingMs();
    if (!this.badgeEl) return;
    if (remaining === null) {
      this.badgeEl.classList.add('hidden');
      return;
    }
    this.badgeEl.classList.remove('hidden');
    const timeUp = remaining <= 0;
    this.badgeEl.classList.toggle('is-low', !timeUp && remaining <= 60000);
    this.badgeEl.classList.toggle('is-up', timeUp);
    if (this.textEl) this.textEl.textContent = timeUp ? '¡TIEMPO!' : formatRemaining(remaining);
    if (timeUp && !this.warned) {
      this.warned = true;
      this.#save();
      clearInterval(this.interval);
      this.onTimeUp?.();
    }
  }
}
