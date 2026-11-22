import { useEffect, useRef } from 'react';

/**
 * Makes the browser/phone Back button and back gesture step through the app's
 * screens and overlays instead of leaving the site.
 *
 * Every "layer" (a screen we navigated to, or an open sheet/modal) pushes one
 * history entry. Back pops the top layer and runs its close() callback.
 * When a layer is closed from the UI instead, its history entry is removed so
 * the history never gets out of step with what is on screen.
 */

type Layer = { close: () => void; dead: boolean; pushed: boolean };

const stack: Layer[] = [];
let ignorePops = 0; // popstate events caused by our own history.back() calls
let queued: Layer[] = []; // pushes waiting for an in-flight history.back() to finish
let installed = false;

const flush = () => {
  const q = queued;
  queued = [];
  q.forEach((l) => {
    if (stack.includes(l)) {
      window.history.pushState({ farmoneLayer: true }, '');
      l.pushed = true;
    }
  });
};

const onPop = () => {
  if (ignorePops > 0) {
    ignorePops--;
    if (ignorePops === 0) flush();
    return;
  }
  const layer = stack.pop();
  if (!layer) return;
  if (layer.dead) {
    // Its owner is already gone (e.g. an overlay on a screen we left): skip it
    window.history.back();
    return;
  }
  layer.close();
};

const install = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('popstate', onPop);
};

const dismiss = (layer: Layer) => {
  const i = stack.indexOf(layer);
  if (i < 0) return; // already popped by Back
  if (i !== stack.length - 1) {
    // Something sits above it; leave its history entry and skip it later
    layer.dead = true;
    return;
  }
  stack.pop();
  if (!layer.pushed) {
    queued = queued.filter((l) => l !== layer);
    return;
  }
  ignorePops++;
  window.history.back();
};

/** Register a layer. Returns a function to call when it is closed from the UI. */
export const pushLayer = (close: () => void) => {
  install();
  const layer: Layer = { close, dead: false, pushed: false };
  stack.push(layer);
  if (ignorePops > 0) {
    queued.push(layer);
  } else {
    window.history.pushState({ farmoneLayer: true }, '');
    layer.pushed = true;
  }
  return () => dismiss(layer);
};

/** In-app back buttons call this so they behave exactly like the system Back. */
export const goBack = (fallback?: () => void) => {
  if (stack.some((l) => !l.dead)) window.history.back();
  else fallback?.();
};

/** Make an overlay (sheet, modal, menu) close on Back while `open` is true. */
export const useBackLayer = (open: boolean, onClose: () => void) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const release = pushLayer(() => closeRef.current());
    return release;
  }, [open]);
};
