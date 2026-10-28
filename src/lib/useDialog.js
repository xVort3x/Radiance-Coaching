import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Makes an element behave like a modal dialog:
 *  - moves focus inside it and keeps Tab / Shift+Tab from leaving
 *  - closes on Escape
 *  - locks page scroll and hides the rest of the page from assistive tech
 *  - returns focus to whatever opened it
 */
// Dialogs currently open, last = the one on top. Only the top one reacts to the keyboard, and the
// page is only un-hidden once the last one closes.
const openDialogs = [];

export function useDialog(ref, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const opener = document.activeElement;
    openDialogs.push(node);
    const root = document.getElementById('root');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (root) root.inert = true;

    (node.querySelector('[data-autofocus]') || node).focus();

    const onKeyDown = (event) => {
      if (openDialogs[openDialogs.length - 1] !== node) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0,
      );
      if (items.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const at = openDialogs.lastIndexOf(node);
      if (at !== -1) openDialogs.splice(at, 1);
      if (openDialogs.length === 0) {
        document.body.style.overflow = previousOverflow;
        if (root) root.inert = false;
      }
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [ref]);
}
