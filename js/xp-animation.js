// Shared visual-only XP animation. Saved XP and level calculations remain authoritative.
(function (root) {
  'use strict';
  function create({ requestFrame, cancelFrame, now, reducedMotion, duration = 600 }) {
    const previous = new Map();
    let pending = [];
    function animate(container) {
      pending.forEach(cancelFrame);
      pending = [];
      container.querySelectorAll('[data-quest-xp]').forEach(bar => {
        const key = bar.dataset.questXp;
        const fraction = Math.max(0, Math.min(1, Number(bar.dataset.xpFraction)));
        const level = Number(bar.dataset.xpLevel);
        if (!Number.isFinite(fraction) || !Number.isFinite(level)) return;
        const prior = previous.get(key);
        previous.set(key, { fraction, level });
        const set = value => {
          if (bar.tagName === 'PROGRESS') bar.value = value;
          else bar.style.width = (100 * value) + '%';
        };
        if (reducedMotion() || !requestFrame ||
            (prior && prior.fraction === fraction && prior.level === level)) {
          set(fraction);
          return;
        }
        const from = prior ? prior.fraction : 0;
        const gainedLevel = prior && level > prior.level;
        const started = now();
        const ease = t => 1 - Math.pow(1 - t, 3);
        function step() {
          const t = Math.min(1, Math.max(0, (now() - started) / duration));
          if (reducedMotion() || t === 1) { set(fraction); return; }
          const value = gainedLevel
            ? t < .5 ? from + (1 - from) * ease(t * 2) : fraction * ease((t - .5) * 2)
            : from + (fraction - from) * ease(t);
          set(value);
          pending.push(requestFrame(step));
        }
        set(from);
        pending.push(requestFrame(step));
      });
    }
    return { animate };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { create };
  if (root.document) root.QuestXPAnimation = create({
    requestFrame: root.requestAnimationFrame?.bind(root),
    cancelFrame: root.cancelAnimationFrame?.bind(root) || (() => {}),
    now: () => root.performance.now(),
    reducedMotion: () => root.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
  // A saved check-in gets a readable, sequential reward presentation. The save
  // has already succeeded; dismissing this view never changes the awarded XP.
  if (root.document) root.QuestXPAnimation.showCheckinAwards = function (awards, done) {
    const overlay = root.document.createElement('div');
    overlay.className = 'save-overlay';
    const dialog = root.document.createElement('div');
    dialog.className = 'save-dialog checkin-rewards';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'xp-rewards-title');
    dialog.innerHTML = '<h2 id="xp-rewards-title">Progress saved</h2><p class="muted">Your writing practice adds up.</p>';
    const rows = awards.map(award => {
      const row = root.document.createElement('div');
      row.className = 'checkin-reward-row';
      const heading = root.document.createElement('div');
      heading.className = 'row';
      const name = root.document.createElement('strong');
      name.textContent = award.name;
      const gain = root.document.createElement('strong');
      gain.className = 'checkin-reward-gain';
      gain.textContent = (award.delta > 0 ? '+' : '') + award.delta + ' XP';
      heading.append(name, gain);
      const label = root.document.createElement('div');
      label.className = 'small muted';
      const meter = root.document.createElement('div');
      meter.className = 'meter';
      meter.setAttribute('role', 'progressbar');
      meter.setAttribute('aria-label', award.name);
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      const fill = root.document.createElement('div');
      fill.className = 'fill';
      fill.style.background = award.color;
      fill.style.transition = 'none';
      meter.appendChild(fill);
      row.append(heading, label, meter);
      dialog.appendChild(row);
      const fraction = p => p.level === 50 ? 1 : p.remaining / p.need;
      const set = (value, p) => {
        fill.style.width = (value * 100) + '%';
        meter.setAttribute('aria-valuenow', String(Math.round(value * 100)));
        label.textContent = 'Level ' + p.level + (p.level === 50 ? ' · MAX' : ' · ' + p.remaining + ' / ' + p.need + ' XP');
      };
      set(fraction(award.before), award.before);
      return { award, row, gain, set, fraction };
    });
    const status = root.document.createElement('p');
    status.className = 'small';
    status.setAttribute('role', 'status');
    const button = root.document.createElement('button');
    button.className = 'primary';
    button.textContent = 'Skip animation';
    dialog.append(status, button);
    overlay.appendChild(dialog);
    root.document.body.appendChild(overlay);
    let frame, closed = false, finished = false;
    const reduce = () => root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    function settle() {
      if (frame) root.cancelAnimationFrame(frame);
      rows.forEach(r => {
        r.set(r.fraction(r.award.after), r.award.after);
        r.row.classList.remove('is-awarding');
        r.row.classList.add('is-awarded');
      });
      finished = true;
      button.textContent = 'Continue';
      status.textContent = 'All XP applied.';
    }
    function close() {
      if (closed) return;
      closed = true;
      settle();
      root.document.removeEventListener('keydown', onKey);
      root.WriteQuestDialogs?.release(overlay);
      overlay.remove();
      done();
    }
    function onKey(event) { if (event.key === 'Escape') { event.preventDefault(); close(); } }
    button.addEventListener('click', () => { if (finished) close(); else settle(); });
    root.document.addEventListener('keydown', onKey);
    root.WriteQuestDialogs?.contain(overlay);
    button.focus();
    function next(index) {
      if (closed || finished) return;
      if (index === rows.length || reduce() || !root.requestAnimationFrame) { settle(); return; }
      const r = rows[index], a = r.award;
      r.row.classList.add('is-awarding');
      status.textContent = a.name + ': ' + (a.delta > 0 ? '+' : '') + a.delta + ' XP';
      const start = root.performance.now(), duration = 850;
      const from = r.fraction(a.before), to = r.fraction(a.after);
      function step(time) {
        if (closed || finished) return;
        if (reduce()) { settle(); return; }
        const t = Math.min(1, (time - start) / duration);
        const ease = x => 1 - Math.pow(1 - x, 3);
        // Reach the old level's end before showing progress in the new level.
        const value = a.after.level > a.before.level
          ? t < .5 ? from + (1 - from) * ease(t * 2) : to * ease((t - .5) * 2)
          : from + (to - from) * ease(t);
        r.set(value, t < .5 ? a.before : a.after);
        if (t < 1) frame = root.requestAnimationFrame(step);
        else {
          r.set(to, a.after);
          r.row.classList.remove('is-awarding');
          r.row.classList.add('is-awarded');
          next(index + 1);
        }
      }
      frame = root.requestAnimationFrame(step);
    }
    next(0);
  };
})(globalThis);

