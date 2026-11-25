// Warung Rush — Dapur Kilat: mouse and keyboard.
// Hit-tests the same LAYOUT rectangles render.js draws, so a click never
// lands somewhere the player cannot see. One clear job: turn events into
// state.js calls and report what the pointer hovers for highlights.

import { INGREDIENTS } from './config.js';
import { LAYOUT, ticketRect, binRect } from './render.js';
import {
  selectOrder, addIngredient, startCooking, plateDish, serveDish, trashPan,
  startShift,
} from './state.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function insideCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

export function hitAt(game, x, y) {
  if (game.screen === 'title') return { kind: 'start' };
  if (game.screen === 'done') return { kind: 'restart' };
  for (let i = 0; i < 4; i++) {
    if (game.orders[i] && inside(x, y, ticketRect(i))) return { kind: 'ticket', index: i };
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(x, y, binRect(i))) return { kind: 'bin', index: i };
  }
  const w = LAYOUT.wok;
  if (insideCircle(x, y, w.cx, w.cy, w.rx + 10)) return { kind: 'wok' };
  if (inside(x, y, LAYOUT.cookButton)) return { kind: 'cook' };
  if (inside(x, y, LAYOUT.trash)) return { kind: 'trash' };
  const p = LAYOUT.plate;
  if (insideCircle(x, y, p.cx, p.cy, p.r + 8)) return { kind: 'plate' };
  if (inside(x, y, LAYOUT.serveButton)) return { kind: 'serve' };
  if (inside(x, y, LAYOUT.mute)) return { kind: 'mute' };
  return null;
}

export function handleClick(game, x, y, sfx, rng) {
  const hit = hitAt(game, x, y);
  if (!hit) return;
  if (hit.kind === 'start' || hit.kind === 'restart') {
    if (sfx) sfx.ensure();
    startShift(game, rng);
    if (sfx) sfx.ding();
    return;
  }
  if (hit.kind === 'mute') {
    game.muted = sfx ? sfx.toggleMute() : !game.muted;
    return;
  }
  if (game.screen !== 'playing') return;
  if (hit.kind === 'ticket') {
    const order = game.orders[hit.index];
    if (order) selectOrder(game, order.id);
  } else if (hit.kind === 'bin') {
    addIngredient(game, INGREDIENTS[hit.index].id, sfx);
  } else if (hit.kind === 'wok' || hit.kind === 'cook') {
    if (!startCooking(game, sfx)) {
      // Clicking a finished wok plates the dish instead of re-cooking.
      if (game.pan.cooking && game.pan.progress >= 1) plateDish(game, sfx);
    }
  } else if (hit.kind === 'plate') {
    plateDish(game, sfx);
  } else if (hit.kind === 'serve') {
    serveDish(game, sfx);
  } else if (hit.kind === 'trash') {
    trashPan(game, sfx);
  }
}

export function handleKey(game, key, sfx, rng) {
  const k = key.toLowerCase();
  if (game.screen === 'title' && (k === 'enter' || k === ' ')) {
    if (sfx) sfx.ensure();
    startShift(game, rng);
    return;
  }
  if (game.screen === 'done' && k === 'r') {
    startShift(game, rng);
    return;
  }
  if (k === 'm') {
    game.muted = sfx ? sfx.toggleMute() : !game.muted;
    return;
  }
  if (game.screen !== 'playing') return;
  const ingIndex = INGREDIENTS.findIndex((ing) => ing.key === k);
  if (ingIndex >= 0) {
    addIngredient(game, INGREDIENTS[ingIndex].id, sfx);
    return;
  }
  if (k === 'w') {
    if (!startCooking(game, sfx) && game.pan.cooking && game.pan.progress >= 1) plateDish(game, sfx);
  } else if (k === 'p') {
    plateDish(game, sfx);
  } else if (k === ' ') {
    serveDish(game, sfx);
  } else if (k === 't') {
    trashPan(game, sfx);
  }
}
