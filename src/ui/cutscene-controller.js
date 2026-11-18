import { pickCutsceneBackground } from '../story/story-loader.js?v=14';
import {
  bindHoverClearsKeyboardFocus,
  isKeyboardUiMode,
  onUiInputModeChange,
  setUiInputMode,
} from './input-mode.js?v=1';
import { WebModalController } from './web-modal.js?v=1';

export class CutsceneController {
  constructor() {
    this.screen = document.getElementById('cutscene-screen');
    this.stageEl = this.screen.querySelector('.cutscene-stage');
    this.bgLabel = document.getElementById('cutscene-bg-label');
    this.leftImg = document.getElementById('cutscene-left-img');
    this.leftName = document.getElementById('cutscene-left-name');
    this.leftSlot = document.getElementById('cutscene-left-slot');
    this.rightImg = document.getElementById('cutscene-right-img');
    this.rightName = document.getElementById('cutscene-right-name');
    this.rightSlot = document.getElementById('cutscene-right-slot');
    this.speakerEl = document.getElementById('cutscene-speaker');
    this.textEl = document.getElementById('cutscene-text');
    this.choicesEl = document.getElementById('cutscene-choices');
    this.actionsEl = this.screen.querySelector('.cutscene-actions');
    this.linkBtn = document.getElementById('cutscene-link-btn');
    this.nextBtn = document.getElementById('cutscene-next-btn');
    this.webModal = new WebModalController();
    this.videoLayer = document.getElementById('cutscene-video-layer');
    this.videoEl = document.getElementById('cutscene-video');
    this.videoSkipBtn = document.getElementById('cutscene-video-skip');
    this.videoTranscriptEl = document.getElementById('cutscene-video-transcript');
    this.videoActive = false;
    this.videoEl?.addEventListener('ended', () => this.#endVideo());
    this.videoEl?.addEventListener('error', () => this.#videoFailed());
    this.videoSkipBtn?.addEventListener('click', () => this.#endVideo());

    this.active = false;
    this.awaitingDelivery = false;
    this.cutscene = null;
    this.characters = null;
    this.stepIndex = 0;
    this.selectedChoiceIndex = 0;
    this.selectedActionIndex = 0;
    this.onFinish = null;
    this.onDeliverRequest = null;
    this.prevAction = false;
    this.prevUp = false;
    this.prevDown = false;
    this.prevLeft = false;
    this.prevRight = false;
    this.recentBackgroundsByType = new Map();
    this.wrongChoices = new Set();
    this.stats = { correct: 0, firstTry: 0, wrong: 0 };
    this.feedbackActive = false;
    this.feedbackEl = null;

    this.linkBtn?.addEventListener('click', () => this.openStepLink());
    this.nextBtn.addEventListener('click', () => this.advance());
    bindHoverClearsKeyboardFocus(this.choicesEl, () => this.#syncChoiceSelection());
    bindHoverClearsKeyboardFocus(this.actionsEl, () => this.#syncActionSelection());
    onUiInputModeChange(() => {
      if (this.active) {
        this.#syncChoiceSelection();
        this.#syncActionSelection();
      }
    });
  }

  #matchesSpeaker(speaker, charId, charName) {
    const normalize = (val) =>
      String(val || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    const s = normalize(speaker);
    if (!s) return false;
    const idNorm = normalize(charId);
    const nameNorm = normalize(charName);
    if (s === idNorm || s === nameNorm) return true;
    const firstWord = nameNorm.split(/\s+/)[0];
    return Boolean(firstWord && s === firstWord);
  }

  #syncChoiceSelection() {
    if (!this.choicesEl) return;
    const buttons = [...this.choicesEl.querySelectorAll('.cutscene-choice-btn')];
    const showFocus = isKeyboardUiMode();
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('selected', showFocus && idx === this.selectedChoiceIndex);
    });
  }

  #syncActionSelection() {
    const step = this.cutscene?.steps?.[this.stepIndex];
    const hasLink = Boolean(step?.link && !(step?.choices && step.choices.length > 0));
    if (!hasLink) {
      this.linkBtn?.classList.remove('selected');
      this.nextBtn?.classList.remove('selected');
      return;
    }
    const showFocus = isKeyboardUiMode();
    this.linkBtn?.classList.toggle('selected', showFocus && this.selectedActionIndex === 0);
    this.nextBtn?.classList.toggle('selected', showFocus && this.selectedActionIndex === 1);
  }

  play(cutscene, characters, onFinish, options = {}) {
    if (!cutscene || !cutscene.steps || cutscene.steps.length === 0) {
      onFinish?.({ outcome: 'complete', reason: '' });
      return;
    }

    this.active = true;
    this.awaitingDelivery = false;
    this.cutscene = cutscene;
    this.characters = characters;
    this.stepIndex = 0;
    this.selectedChoiceIndex = 0;
    this.selectedActionIndex = 0;
    this.onFinish = onFinish;
    this.onDeliverRequest = options.onDeliverRequest || null;
    this.wrongChoices = new Set();
    this.stats = { correct: 0, firstTry: 0, wrong: 0 };
    this.#clearFeedback();
    this.prevAction = true;
    this.prevUp = false;
    this.prevDown = false;
    this.prevLeft = false;
    this.prevRight = false;

    let chosenBackgroundImage = cutscene.backgroundImage || '';
    if (Array.isArray(cutscene.backgroundPool) && cutscene.backgroundPool.length > 0) {
      const typeKey = cutscene.backgroundType || 'default';
      const recent = this.recentBackgroundsByType.get(typeKey) || [];
      const picked = pickCutsceneBackground(cutscene.backgroundPool, recent);
      if (picked.url) {
        chosenBackgroundImage = picked.url;
        this.recentBackgroundsByType.set(typeKey, picked.nextRecent);
      }
    }

    const rawBgText = String(cutscene.background || '').trim();
    const isFilePathBg = /\.(jpe?g|png|webp)$/i.test(rawBgText);
    if (isFilePathBg) {
      this.bgLabel.textContent = '';
      this.bgLabel.classList.add('hidden');
    } else {
      this.bgLabel.textContent = rawBgText || 'Escena';
      this.bgLabel.classList.remove('hidden');
    }
    if (this.stageEl) {
      if (chosenBackgroundImage) {
        this.stageEl.style.backgroundImage = `linear-gradient(180deg, rgba(15, 23, 42, 0.16) 0%, rgba(15, 23, 42, 0.32) 62%, rgba(10, 14, 22, 0.78) 100%), url("${chosenBackgroundImage}")`;
        this.stageEl.classList.add('has-bg-image');
      } else {
        this.stageEl.style.backgroundImage = '';
        this.stageEl.classList.remove('has-bg-image');
      }
    }

    const leftChar = characters?.get(cutscene.leftChar);
    const rightChar = characters?.get(cutscene.rightChar);

    this.leftSlot.classList.remove('speaking');
    this.rightSlot.classList.remove('speaking');
    this.applyCharacterSlot(this.leftSlot, this.leftImg, this.leftName, leftChar, 'right');
    this.applyCharacterSlot(this.rightSlot, this.rightImg, this.rightName, rightChar, 'left');

    this.screen.classList.remove('hidden');
    // Garante reflow antes de aplicar .speaking para disparar a animação no 1º frame
    void this.screen.offsetWidth;
    this.renderStep();
  }

  applyCharacterSlot(slotEl, imgEl, nameEl, charDef, facingView) {
    if (!charDef) {
      slotEl.classList.add('hidden');
      return;
    }
    slotEl.classList.remove('hidden');
    nameEl.textContent = charDef.name;
    const src = charDef.sprites?.[facingView] || charDef.sprites?.front || '';
    if (src) {
      imgEl.src = src;
      imgEl.alt = charDef.name;
      imgEl.classList.remove('hidden');
    } else {
      imgEl.removeAttribute('src');
      imgEl.classList.add('hidden');
    }
  }

  renderStep() {
    this.#clearFeedback();
    const step = this.cutscene.steps[this.stepIndex];
    if (!step) {
      this.#hideVideo();
      this.finish({ outcome: 'complete', reason: '' });
      return;
    }

    if (step.type === 'video') {
      this.#playVideo(step);
      return;
    }
    this.#hideVideo();

    if (step.type === 'deliver') {
      if (typeof this.onDeliverRequest === 'function') {
        this.awaitingDelivery = true;
        this.onDeliverRequest(
          step.itemId,
          () => {
            this.awaitingDelivery = false;
            this.prevAction = true;
            this.stepIndex += 1;
            this.selectedChoiceIndex = 0;
            this.renderStep();
          },
          () => {
            this.awaitingDelivery = false;
            this.prevAction = true;
            this.stepIndex = Math.max(0, this.stepIndex - 1);
            this.renderStep();
          },
        );
        return;
      }
      this.stepIndex += 1;
      this.renderStep();
      return;
    }

    this.speakerEl.textContent = step.speaker || '';
    this.textEl.textContent = step.text || '';

    const isLeftSpeaking = this.#matchesSpeaker(
      step.speaker,
      this.cutscene?.leftChar,
      this.leftName.textContent,
    );
    const isRightSpeaking = this.#matchesSpeaker(
      step.speaker,
      this.cutscene?.rightChar,
      this.rightName.textContent,
    );
    if (isLeftSpeaking && this.leftName.textContent) {
      this.speakerEl.textContent = this.leftName.textContent;
    } else if (isRightSpeaking && this.rightName.textContent) {
      this.speakerEl.textContent = this.rightName.textContent;
    }
    this.leftSlot.classList.toggle('speaking', isLeftSpeaking);
    this.rightSlot.classList.toggle('speaking', isRightSpeaking);

    this.choicesEl.replaceChildren();
    if (step.choices && step.choices.length > 0) {
      this.linkBtn?.classList.add('hidden');
      this.nextBtn.classList.add('hidden');
      this.choicesEl.classList.remove('hidden');
      this.selectedChoiceIndex = Math.min(this.selectedChoiceIndex, step.choices.length - 1);

      step.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cutscene-choice-btn';
        if (isKeyboardUiMode() && idx === this.selectedChoiceIndex) btn.classList.add('selected');
        btn.textContent = choice.label;
        if (this.wrongChoices.has(choice)) {
          btn.classList.add('is-wrong');
          btn.disabled = true;
        }
        btn.addEventListener('click', () => {
          this.#selectChoice(choice);
        });
        this.choicesEl.appendChild(btn);
      });
    } else {
      this.choicesEl.classList.add('hidden');
      this.nextBtn.classList.remove('hidden');
      this.nextBtn.textContent =
        this.stepIndex >= this.cutscene.steps.length - 1 ? 'Terminar escena' : 'Continuar';
      if (step.link) {
        if (this.linkBtn) {
          this.linkBtn.textContent = step.link.label;
          this.linkBtn.classList.remove('hidden');
        }
        this.selectedActionIndex = 0;
      } else {
        this.linkBtn?.classList.add('hidden');
        this.selectedActionIndex = 1;
      }
      this.#syncActionSelection();
    }
  }

  #playVideo(step) {
    if (!this.videoLayer || !this.videoEl) {
      this.#videoFailed();
      return;
    }
    this.videoActive = true;
    this.videoLayer.classList.remove('hidden');
    if (this.videoTranscriptEl) {
      this.videoTranscriptEl.textContent = (step.transcript || [])
        .map((line) => `${line.speaker}: ${line.text}`)
        .join(' ');
    }
    if (this.videoEl.getAttribute('src') !== step.url) this.videoEl.src = step.url;
    try { this.videoEl.currentTime = 0; } catch { /* ignore */ }
    const playing = this.videoEl.play();
    if (playing?.catch) playing.catch(() => { /* sin autoplay: queda el botón Saltar */ });
  }

  #hideVideo() {
    if (!this.videoActive && this.videoLayer?.classList.contains('hidden')) return;
    this.videoActive = false;
    this.videoEl?.pause();
    this.videoLayer?.classList.add('hidden');
  }

  #endVideo() {
    if (!this.active || !this.videoActive) return;
    this.videoActive = false;
    this.videoEl?.pause();
    this.prevAction = true;
    this.stepIndex += 1;
    this.selectedChoiceIndex = 0;
    this.renderStep();
  }

  // Si el video no carga, se muestran sus falas como diálogo común.
  #videoFailed() {
    if (!this.active) return;
    const step = this.cutscene?.steps?.[this.stepIndex];
    if (!step || step.type !== 'video') return;
    this.videoActive = false;
    this.videoLayer?.classList.add('hidden');
    const speech = (step.transcript || []).map((line) => ({ speaker: line.speaker, text: line.text }));
    this.cutscene.steps.splice(this.stepIndex, 1, ...speech);
    this.renderStep();
  }

  openStepLink() {
    if (!this.active || this.awaitingDelivery || this.webModal.active) return;
    const step = this.cutscene?.steps?.[this.stepIndex];
    if (!step?.link?.url) return;
    this.webModal.open(step.link.url, step.link.label, {
      onClose: () => {
        this.prevAction = true;
        this.prevLeft = false;
        this.prevRight = false;
        this.#syncActionSelection();
      },
    });
  }

  updateInput(inputState) {
    if (!this.active || this.awaitingDelivery) return;
    if (this.webModal.active) {
      this.webModal.updateInput(inputState);
      return;
    }
    const step = this.cutscene?.steps?.[this.stepIndex];
    if (!step) return;

    if (step.type === 'video') {
      const actionNow = Boolean(inputState.actionPressed ?? inputState.action);
      if (actionNow && !this.prevAction) this.#endVideo();
      this.prevAction = actionNow;
      return;
    }

    const up = Boolean(inputState.moveY < -0.5);
    const down = Boolean(inputState.moveY > 0.5);
    const left = Boolean(inputState.moveX < -0.5);
    const right = Boolean(inputState.moveX > 0.5);
    const action = Boolean(inputState.actionPressed ?? inputState.action);

    if (this.feedbackActive) {
      if (action && !this.prevAction) this.advance();
    } else if (step.choices && step.choices.length > 0) {
      const moveChoice = (delta) => {
        const n = step.choices.length;
        let idx = this.selectedChoiceIndex;
        for (let i = 0; i < n; i += 1) {
          idx = (idx + delta + n) % n;
          if (!this.wrongChoices.has(step.choices[idx])) break;
        }
        this.selectedChoiceIndex = idx;
        this.#syncChoiceSelection();
      };
      if (up && !this.prevUp) {
        setUiInputMode('keyboard');
        moveChoice(-1);
      }
      if (down && !this.prevDown) {
        setUiInputMode('keyboard');
        moveChoice(1);
      }
      if (action && !this.prevAction) {
        const chosen = step.choices[this.selectedChoiceIndex];
        this.#selectChoice(chosen);
      }
    } else if (step.link) {
      if ((left && !this.prevLeft) || (up && !this.prevUp)) {
        setUiInputMode('keyboard');
        this.selectedActionIndex = 0;
        this.#syncActionSelection();
      }
      if ((right && !this.prevRight) || (down && !this.prevDown)) {
        setUiInputMode('keyboard');
        this.selectedActionIndex = 1;
        this.#syncActionSelection();
      }
      if (action && !this.prevAction) {
        if (this.selectedActionIndex === 0) {
          this.openStepLink();
        } else {
          this.advance();
        }
      }
    } else if (action && !this.prevAction) {
      this.advance();
    }

    this.prevAction = action;
    this.prevUp = up;
    this.prevDown = down;
    this.prevLeft = left;
    this.prevRight = right;
  }

  #selectChoice(choice) {
    if (!choice) return;
    if (this.feedbackActive) return;
    if (choice.outcome === 'retry') {
      // Resposta errada: marca o botão, mostra a pista e mantém as opções.
      this.wrongChoices.add(choice);
      this.stats.wrong += 1;
      this.#showChoiceFeedback(choice.feedback, false);
      return;
    }
    if (choice.outcome === 'back') {
      this.stepIndex = Math.max(0, this.stepIndex - 1);
      this.selectedChoiceIndex = 0;
      this.prevAction = true;
      this.renderStep();
      return;
    }
    if (choice.outcome === 'next' && choice.feedback) {
      this.stats.correct += 1;
      if (!this.#stepHasWrongAnswer()) this.stats.firstTry += 1;
      this.#showChoiceFeedback(choice.feedback, true);
      return;
    }
    if (choice.outcome === 'next') {
      if (this.stepIndex < this.cutscene.steps.length - 1) {
        this.stepIndex += 1;
        this.selectedChoiceIndex = 0;
        this.prevAction = true;
        this.renderStep();
      } else {
        this.finish({ outcome: 'complete', reason: '' });
      }
      return;
    }
    this.finish({ outcome: choice.outcome, reason: choice.reason || '' });
  }

  #stepHasWrongAnswer() {
    const step = this.cutscene?.steps?.[this.stepIndex];
    return Boolean(step?.choices?.some((c) => this.wrongChoices.has(c)));
  }

  #showChoiceFeedback(text, isCorrect) {
    const step = this.cutscene?.steps?.[this.stepIndex];
    if (!step) return;
    this.feedbackEl?.remove();
    const box = document.createElement('p');
    box.className = `cutscene-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    box.setAttribute('role', 'status');
    box.textContent = `${isCorrect ? '✔ ¡Correcto! ' : '✘ '}${text || ''}`;
    this.feedbackEl = box;
    this.textEl.insertAdjacentElement('afterend', box);

    if (isCorrect) {
      this.feedbackActive = true;
      this.choicesEl.replaceChildren();
      this.choicesEl.classList.add('hidden');
      this.nextBtn.classList.remove('hidden');
      this.nextBtn.textContent =
        this.stepIndex >= this.cutscene.steps.length - 1 ? 'Terminar escena' : 'Continuar';
      this.selectedActionIndex = 1;
      this.prevAction = true;
      this.#syncActionSelection();
    } else {
      const buttons = [...this.choicesEl.querySelectorAll('.cutscene-choice-btn')];
      step.choices.forEach((choice, idx) => {
        const btn = buttons[idx];
        if (!btn) return;
        const wrong = this.wrongChoices.has(choice);
        btn.classList.toggle('is-wrong', wrong);
        btn.disabled = wrong;
      });
      const firstOpen = step.choices.findIndex((c) => !this.wrongChoices.has(c));
      if (firstOpen !== -1) this.selectedChoiceIndex = firstOpen;
      this.prevAction = true;
      this.#syncChoiceSelection();
    }
  }

  #clearFeedback() {
    this.feedbackActive = false;
    this.feedbackEl?.remove();
    this.feedbackEl = null;
  }

  advance() {
    if (!this.active || this.awaitingDelivery) return;
    const step = this.cutscene.steps[this.stepIndex];
    if (step?.choices && step.choices.length > 0 && !this.feedbackActive) return;

    if (this.stepIndex < this.cutscene.steps.length - 1) {
      this.stepIndex += 1;
      this.selectedChoiceIndex = 0;
      this.renderStep();
    } else {
      this.finish({ outcome: 'complete', reason: '' });
    }
  }

  finish(result) {
    this.#hideVideo();
    this.#clearFeedback();
    if (result && typeof result === 'object') result.stats = { ...this.stats };
    this.webModal.close();
    this.active = false;
    this.screen.classList.add('hidden');
    const cb = this.onFinish;
    this.onFinish = null;
    cb?.(result);
  }
}
