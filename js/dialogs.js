// Keep keyboard focus inside the topmost dialog and restore it on dismissal.
(function(root) {
  "use strict";
  const dialogs = [];
  const focusable = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

  function contain(overlay) {
    if (dialogs.some(entry => entry.overlay === overlay)) return;
    const entry = {
      overlay,
      previous: document.activeElement
    };
    entry.onKey = event => {
      if (event.key !== "Tab" || dialogs[dialogs.length - 1] !== entry) return;
      const controls = Array.from(overlay.querySelectorAll(focusable))
        .filter(control => control.getClientRects().length && !control.closest('[hidden], [inert]'));
      const first = controls[0],
        last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        const dialog = overlay.querySelector('[role="dialog"]');
        dialog?.setAttribute("tabindex", "-1");
        dialog?.focus();
      } else if (!overlay.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialogs.push(entry);
    document.addEventListener("keydown", entry.onKey, true);
  }

  function release(overlay) {
    const index = dialogs.findIndex(entry => entry.overlay === overlay);
    if (index < 0) return;
    const wasTop = index === dialogs.length - 1;
    const [entry] = dialogs.splice(index, 1);
    document.removeEventListener("keydown", entry.onKey, true);
    if (wasTop && entry.previous?.isConnected) entry.previous.focus();
  }

  root.WriteQuestDialogs = {
    contain,
    release
  };
})(globalThis);
