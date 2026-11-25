// Warung Rush — Dapur Kilat: the whole game state and its rules.
// Orders arrive on the ticket rail, the cook fills the wok from the
// ingredient bins, cooks before the dish burns, plates it and serves it
// while the customer's patience lasts. Pure logic — no drawing here.

import { INGREDIENTS, RECIPES, TUNING, SHIFT_SECONDS, dishPoolFor, mulberry32 } from './config.js';

let nextOrderId = 1;

export function createGame() {
  return {
    screen: 'title', // 'title' | 'playing' | 'done'
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    selectedOrderId: null,
    orders: [],
    pan: { contents: [], cooking: false, progress: 0, burn: 0, dish: null },
    plate: { dish: null, ready: false },
    spawnIn: TUNING.spawnFirstDelay,
    toast: '',
    toastUntil: 0,
    floaters: [], // {x, y, text, color, until}
    muted: false,
    results: null,
  };
}

export function activeOrder(game) {
  return game.orders.find((o) => o.id === game.selectedOrderId) || game.orders[0] || null;
}

export function recipeOf(order) {
  return RECIPES[order.dishIndex];
}

export function spawnOrder(game, rng) {
  if (game.orders.length >= TUNING.maxTickets) return null;
  const pool = dishPoolFor(game.elapsed);
  const dishIndex = pool[Math.floor(rng() * pool.length)];
  const patience = game.elapsed > TUNING.spawnRampAt ? TUNING.orderPatienceLate : TUNING.orderPatience;
  const order = {
    id: nextOrderId++,
    dishIndex,
    patience,
    maxPatience: patience,
    state: 'waiting',
  };
  game.orders.push(order);
  if (!game.selectedOrderId) game.selectedOrderId = order.id;
  return order;
}

export function selectOrder(game, id) {
  if (game.orders.some((o) => o.id === id)) game.selectedOrderId = id;
}

export function setToast(game, text, seconds = 1.6) {
  game.toast = text;
  game.toastUntil = game.elapsed + seconds;
}

export function addFloater(game, x, y, text, color) {
  game.floaters.push({ x, y, text, color, until: game.elapsed + 1.1 });
}

// The pan only accepts ingredients the active order's recipe still needs.
export function addIngredient(game, ingredientId, sfx) {
  if (game.screen !== 'playing') return false;
  const order = activeOrder(game);
  if (!order) { setToast(game, 'Tidak ada pesanan — tunggu pelanggan!'); return false; }
  if (game.pan.cooking) { setToast(game, 'Wok sedang memasak!'); if (sfx) sfx.buzz(); return false; }
  const recipe = recipeOf(order);
  if (!recipe.needs.includes(ingredientId)) {
    setToast(game, `${ingredientName(ingredientId)} tidak dipakai di ${recipe.name}`);
    if (sfx) sfx.buzz();
    return false;
  }
  if (game.pan.contents.includes(ingredientId)) {
    setToast(game, `${ingredientName(ingredientId)} sudah di wajan`);
    if (sfx) sfx.buzz();
    return false;
  }
  if (game.pan.dish && game.pan.dish !== order.dishIndex) {
    setToast(game, 'Kosongkan wajan dulu (klik tempat sampah)');
    if (sfx) sfx.buzz();
    return false;
  }
  game.pan.contents.push(ingredientId);
  game.pan.dish = order.dishIndex;
  if (sfx) sfx.pop();
  return true;
}

export function panReady(game) {
  const order = activeOrder(game);
  if (!order || game.pan.dish !== order.dishIndex) return false;
  const recipe = recipeOf(order);
  return recipe.needs.every((n) => game.pan.contents.includes(n));
}

export function startCooking(game, sfx) {
  if (game.screen !== 'playing') return false;
  if (game.pan.cooking) return false;
  if (!panReady(game)) {
    setToast(game, 'Lengkapi dulu bahan di wajan!');
    if (sfx) sfx.buzz();
    return false;
  }
  game.pan.cooking = true;
  game.pan.progress = 0;
  game.pan.burn = 0;
  if (sfx) { sfx.chop(); sfx.startSizzle(); }
  return true;
}

export function trashPan(game, sfx) {
  if (game.pan.contents.length === 0 && !game.pan.cooking) return false;
  game.pan = { contents: [], cooking: false, progress: 0, burn: 0, dish: null };
  setToast(game, 'Wajan dikosongkan');
  if (sfx) { sfx.stopSizzle(); sfx.buzz(); }
  return true;
}

export function plateDish(game, sfx) {
  if (game.screen !== 'playing') return false;
  if (game.plate.dish !== null) return false;
  if (!game.pan.cooking || game.pan.progress < 1) {
    setToast(game, 'Masakan belum matang!');
    if (sfx) sfx.buzz();
    return false;
  }
  game.plate.dish = game.pan.dish;
  game.plate.ready = true;
  game.pan = { contents: [], cooking: false, progress: 0, burn: 0, dish: null };
  if (sfx) { sfx.stopSizzle(); sfx.ding(); }
  return true;
}

export function serveDish(game, sfx) {
  if (game.screen !== 'playing') return false;
  if (game.plate.dish === null) {
    setToast(game, 'Piring masih kosong — masak dulu!');
    if (sfx) sfx.buzz();
    return false;
  }
  const order = game.orders.find((o) => o.dishIndex === game.plate.dish);
  if (!order) {
    // The customer left while the dish sat on the plate: clear it.
    game.plate = { dish: null, ready: false };
    setToast(game, 'Pelanggan sudah pulang — piring dikosongkan');
    if (sfx) sfx.buzz();
    return false;
  }
  const recipe = recipeOf(order);
  const patienceFrac = order.patience / order.maxPatience;
  const tipRate = patienceFrac > 0.6 ? TUNING.tipFull : patienceFrac > 0.3 ? TUNING.tipHalf : 0;
  const comboRate = Math.min(game.combo * TUNING.comboStep, TUNING.comboCap);
  const earned = Math.round(recipe.price * (1 + tipRate + comboRate));
  game.coins += earned;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  addFloater(game, 1050, 430, '+' + earned.toLocaleString('id-ID'), '#1f7a6d');
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.selectedOrderId = game.orders.length ? game.orders[0].id : null;
  game.plate = { dish: null, ready: false };
  if (sfx) sfx.coin();
  return earned;
}

export function ingredientName(id) {
  const ing = INGREDIENTS.find((i) => i.id === id);
  return ing ? ing.name : id;
}

export function update(game, dt, rng, sfx) {
  if (game.screen !== 'playing') return;
  game.elapsed += dt;
  game.timeLeft = Math.max(0, SHIFT_SECONDS - game.elapsed);
  game.floaters = game.floaters.filter((f) => f.until > game.elapsed);

  // Patience drains; a customer who runs out walks away angry.
  for (const order of [...game.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      game.orders = game.orders.filter((o) => o.id !== order.id);
      game.failed += 1;
      game.combo = 0;
      // A wasted dish leaves with the customer: clear pan and plate.
      if (game.pan.dish === order.dishIndex) {
        game.pan = { contents: [], cooking: false, progress: 0, burn: 0, dish: null };
        if (sfx) sfx.stopSizzle();
      }
      if (game.plate.dish === order.dishIndex) game.plate = { dish: null, ready: false };
      setToast(game, `${recipeOf(order).name} batal — pelanggan pulang!`);
      if (game.selectedOrderId === order.id) {
        game.selectedOrderId = game.orders.length ? game.orders[0].id : null;
      }
      if (sfx) sfx.burn();
    }
  }

  // Cooking progresses; a finished dish burns if left in the wok.
  if (game.pan.cooking) {
    const order = game.orders.find((o) => o.dishIndex === game.pan.dish);
    const cookTime = order ? recipeOf(order).cookTime : 4;
    if (game.pan.progress < 1) {
      game.pan.progress = Math.min(1, game.pan.progress + dt / cookTime);
      if (game.pan.progress >= 1 && sfx) sfx.stopSizzle();
    } else {
      game.pan.burn += dt;
      if (game.pan.burn >= TUNING.burnGrace) {
        game.pan = { contents: [], cooking: false, progress: 0, burn: 0, dish: null };
        setToast(game, 'Gosong! Masakan hangus di wajan');
        if (sfx) sfx.burn();
      }
    }
  }

  // New customers arrive faster as the shift heats up.
  game.spawnIn -= dt;
  if (game.spawnIn <= 0) {
    spawnOrder(game, rng);
    const interval = game.elapsed > TUNING.spawnRampAt ? TUNING.spawnIntervalLate : TUNING.spawnIntervalEarly;
    game.spawnIn = interval * (0.85 + rng() * 0.3);
  }

  if (game.timeLeft <= 0) endShift(game, sfx);
}

export function endShift(game, sfx) {
  game.screen = 'done';
  if (sfx) sfx.stopSizzle();
  const stars = game.served >= 14 ? 3 : game.served >= 9 ? 2 : game.served >= 5 ? 1 : 0;
  game.results = {
    coins: game.coins,
    served: game.served,
    failed: game.failed,
    bestCombo: game.bestCombo,
    stars,
  };
}

export function startShift(game, rng) {
  const fresh = createGame();
  Object.assign(game, fresh, { screen: 'playing', muted: game.muted });
  spawnOrder(game, rng);
  game.spawnIn = TUNING.spawnFirstDelay;
}

// Seeded RNG the game uses in normal play (Math.random is fine there).
export function liveRng() {
  return Math.random;
}

export function seededRng(seed) {
  return mulberry32(seed);
}
