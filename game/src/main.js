// Warung Rush — Dapur Kilat: boot and the main loop.
// Wires canvas, input, state and rendering together. A ?scene= URL loads
// a frozen demo state for screenshots; otherwise the game starts on its
// title screen and runs on requestAnimationFrame.

import { CANVAS_W, CANVAS_H } from './config.js';
import { Sfx } from './audio.js';
import { createGame, update, liveRng } from './state.js';
import { draw } from './render.js';
import { hitAt, handleClick, handleKey } from './input.js';
import { applyScene, sceneFromUrl, SHOT_TIME } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();
const sfx = new Sfx();
const rng = liveRng();

let hover = null;
let frozenTime = null;
let last = performance.now();

const scene = sceneFromUrl();
if (scene) {
  applyScene(game, scene);
  frozenTime = SHOT_TIME;
  // Tell the screenshot harness the frame is ready to capture.
  document.title = 'Warung Rush — scene ' + scene;
  window.__warungReady = true;
}

function toGameCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

canvas.addEventListener('mousemove', (event) => {
  const p = toGameCoords(event);
  hover = hitAt(game, p.x, p.y);
  canvas.style.cursor = hover ? 'pointer' : 'default';
});

canvas.addEventListener('click', (event) => {
  const p = toGameCoords(event);
  handleClick(game, p.x, p.y, sfx, rng);
});

window.addEventListener('keydown', (event) => {
  if (event.key === ' ') event.preventDefault();
  handleKey(game, event.key, sfx, rng);
});

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (frozenTime === null) update(game, dt, rng, sfx);
  draw(ctx, game, frozenTime === null ? now / 1000 : frozenTime, hover);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
