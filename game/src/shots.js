// Warung Rush — Dapur Kilat: deterministic demo scenes for screenshots.
// ?scene=rush|orders|assembly|serve seeds the exact game state the brief
// asks the screenshots to show — a kitchen and an order board, ingredients
// on the counter, one dish mid-assembly, a timer and a plate ready to serve.
// These are real renders of the game's own code, frozen at a fixed clock
// so the same URL always draws the same frame.

import { RECIPES, TUNING, SHIFT_SECONDS, mulberry32 } from './config.js';
import { createGame, spawnOrder } from './state.js';

function seedOrders(game, count, patienceFracs, dishIndexes) {
  const rng = mulberry32(20261125);
  for (let i = 0; i < count; i++) {
    const order = spawnOrder(game, rng);
    if (!order) break;
    order.dishIndex = dishIndexes[i % dishIndexes.length];
    order.patience = order.maxPatience * patienceFracs[i % patienceFracs.length];
  }
  game.selectedOrderId = game.orders.length ? game.orders[0].id : null;
}

// Every scene runs on the same frozen clock so steam and flames are stable.
export const SHOT_TIME = 1.234;

export function applyScene(game, scene) {
  const fresh = createGame();
  Object.assign(game, fresh, { screen: 'playing' });
  game.elapsed = 38;
  game.timeLeft = SHIFT_SECONDS - 38;
  game.coins = 45500;
  game.combo = 3;
  game.bestCombo = 3;
  game.served = 4;

  if (scene === 'orders') {
    game.elapsed = 6;
    game.timeLeft = SHIFT_SECONDS - 6;
    game.coins = 0;
    game.combo = 0;
    game.served = 0;
    seedOrders(game, 4, [0.95, 0.8, 0.7, 0.6], [0, 1, 2, 3]);
    return;
  }

  if (scene === 'assembly') {
    seedOrders(game, 2, [0.55, 0.75], [0, 4]);
    // Pan half full of the selected order, plate already holding a side.
    game.pan.contents = ['nasi', 'telur'];
    game.pan.dish = 0;
    game.plate.dish = null;
    game.toast = 'Lengkapi bahan di wajan!';
    game.toastUntil = 999;
    return;
  }

  if (scene === 'serve') {
    game.coins = 62500;
    seedOrders(game, 2, [0.45, 0.8], [0, 1]);
    game.plate.dish = 0;
    game.plate.ready = true;
    game.toast = 'Nasi Goreng siap — antar sekarang!';
    game.toastUntil = 999;
    return;
  }

  // 'rush' (the cover): full board, wok mid-cook with steam, plate mid-assembly.
  seedOrders(game, 3, [0.22, 0.55, 0.8], [0, 1, 3]);
  game.pan.contents = ['nasi', 'telur', 'ayam', 'sambal'];
  game.pan.dish = 0;
  game.pan.cooking = true;
  game.pan.progress = 0.62;
  game.plate.dish = null;
  game.toast = 'Wajan panas — jangan sampai gosong!';
  game.toastUntil = 999;
}

export function sceneFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('scene');
  } catch (e) {
    return null;
  }
}
