// Warung Rush — Dapur Kilat: every pixel the game draws.
// Canvas 2D, all art drawn in code: tiled warung wall, wooden counter,
// ticket rail, ingredient bins, flaming wok, plating station and serve bell.
// LAYOUT is exported so input.js hit-tests the exact same rectangles.

import { CANVAS_W, CANVAS_H, INGREDIENTS, RECIPES, COLORS, formatRupiah, formatClock } from './config.js';

export const LAYOUT = {
  header: { x: 0, y: 0, w: CANVAS_W, h: 64 },
  tickets: { x: 24, y: 76, w: 296, h: 96, gap: 16 },
  binsLabel: { x: 24, y: 204 },
  bins: { x: 24, y: 228, w: 102, h: 100, gap: 12, cols: 3 },
  wok: { cx: 590, cy: 400, rx: 150, ry: 62 },
  stove: { x: 420, y: 440, w: 340, h: 92 },
  cookButton: { x: 480, y: 552, w: 220, h: 48 },
  trash: { x: 700, y: 552, w: 60, h: 48 },
  plate: { cx: 1038, cy: 372, r: 96 },
  serveWindow: { x: 828, y: 500, w: 404, h: 132 },
  serveButton: { x: 888, y: 548, w: 284, h: 56 },
  bell: { cx: 856, cy: 576, r: 20 },
  chef: { cx: 590, cy: 196 },
  bottomBar: { x: 0, y: 656, w: CANVAS_W, h: 64 },
  mute: { x: 1216, y: 14, w: 48, h: 36 },
};

export function ticketRect(i) {
  const t = LAYOUT.tickets;
  return { x: t.x + i * (t.w + t.gap), y: t.y, w: t.w, h: t.h };
}

export function binRect(i) {
  const b = LAYOUT.bins;
  const col = i % b.cols;
  const row = Math.floor(i / b.cols);
  return { x: b.x + col * (b.w + b.gap), y: b.y + row * (b.h + b.gap), w: b.w, h: b.h };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function text(ctx, str, x, y, size, color, weight = 800, align = 'left', font = 'Arial, Helvetica, sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

export function drawIngredientIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff7e0';
    ellipse(ctx, 0, 2, r, r * 0.72); ctx.fill();
    ctx.fillStyle = '#e8d9a8';
    for (let i = 0; i < 5; i++) {
      ellipse(ctx, -r * 0.5 + i * r * 0.25, -r * 0.25 + (i % 2) * r * 0.2, r * 0.09, r * 0.05);
      ctx.fill();
    }
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
    ellipse(ctx, 0, 2, r, r * 0.72); ctx.stroke();
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f6c453'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.85 - k * 0.22), 0.4 + k, 2.6 + k * 1.4);
      ctx.stroke();
    }
    ctx.strokeStyle = '#c98f1b'; ctx.lineWidth = 2;
    ellipse(ctx, 0, 0, r, r * 0.8); ctx.stroke();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdfdfd';
    ellipse(ctx, 0, 0, r, r * 0.78); ctx.fill();
    ctx.fillStyle = '#f6a821';
    ellipse(ctx, r * 0.12, -r * 0.05, r * 0.42, r * 0.36); ctx.fill();
    ctx.fillStyle = '#ffd25e';
    ellipse(ctx, r * 0.05, -r * 0.12, r * 0.2, r * 0.16); ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#e07840';
    ellipse(ctx, -r * 0.1, 0, r * 0.72, r * 0.55); ctx.fill();
    ctx.fillStyle = '#c25a28';
    ellipse(ctx, -r * 0.25, -r * 0.15, r * 0.3, r * 0.22); ctx.fill();
    ctx.strokeStyle = '#fdf3e0'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.1); ctx.lineTo(r * 0.95, -r * 0.45); ctx.stroke();
    ctx.fillStyle = '#fdf3e0';
    ellipse(ctx, r * 0.98, -r * 0.5, r * 0.16, r * 0.16); ctx.fill();
    ellipse(ctx, r * 0.86, -r * 0.28, r * 0.14, r * 0.14); ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#58a34a';
    for (let k = 0; k < 3; k++) {
      const a = -0.7 + k * 0.7;
      ctx.save(); ctx.translate(0, 0); ctx.rotate(a);
      ellipse(ctx, 0, -r * 0.45, r * 0.3, r * 0.55); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2f6b2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, r * 0.2); ctx.lineTo(0, r * 0.85); ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.9, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#d9381e';
    ellipse(ctx, 0, -r * 0.15, r * 0.72, r * 0.42); ctx.fill();
    ctx.fillStyle = '#ff6b4a';
    ellipse(ctx, -r * 0.2, -r * 0.35, r * 0.2, r * 0.12); ctx.fill();
    ctx.fillStyle = '#7fc24a';
    ellipse(ctx, r * 0.35, -r * 0.3, r * 0.12, r * 0.08); ctx.fill();
  }
  ctx.restore();
}

function drawDishOnPlate(ctx, dishIndex, cx, cy, r) {
  const recipe = RECIPES[dishIndex];
  const needs = recipe.needs;
  if (dishIndex === 0 || dishIndex === 4) {
    // Rice-based: rice mound with egg on top, chili at the side.
    drawIngredientIcon(ctx, 'nasi', cx, cy + r * 0.08, r * 0.62);
    drawIngredientIcon(ctx, 'telur', cx + r * 0.1, cy - r * 0.28, r * 0.34);
    drawIngredientIcon(ctx, 'sambal', cx + r * 0.55, cy + r * 0.3, r * 0.26);
    if (needs.includes('ayam')) drawIngredientIcon(ctx, 'ayam', cx - r * 0.5, cy + r * 0.25, r * 0.3);
  } else if (dishIndex === 1) {
    drawIngredientIcon(ctx, 'mie', cx, cy, r * 0.66);
    drawIngredientIcon(ctx, 'telur', cx + r * 0.15, cy - r * 0.3, r * 0.3);
    drawIngredientIcon(ctx, 'sayur', cx - r * 0.5, cy + r * 0.3, r * 0.28);
  } else if (dishIndex === 2) {
    drawIngredientIcon(ctx, 'sayur', cx - r * 0.15, cy - r * 0.1, r * 0.5);
    drawIngredientIcon(ctx, 'telur', cx + r * 0.4, cy - r * 0.3, r * 0.32);
    drawIngredientIcon(ctx, 'sambal', cx + r * 0.35, cy + r * 0.35, r * 0.3);
  } else {
    // Sate: three skewers of chicken with sambal.
    for (let k = 0; k < 3; k++) {
      const y = cy - r * 0.35 + k * r * 0.35;
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - r * 0.7, y); ctx.lineTo(cx + r * 0.7, y); ctx.stroke();
      drawIngredientIcon(ctx, 'ayam', cx - r * 0.25 + k * 0.25, y, r * 0.26);
    }
    drawIngredientIcon(ctx, 'sambal', cx + r * 0.55, cy + r * 0.4, r * 0.26);
  }
}

function drawTicket(ctx, order, slot, selected, t) {
  const r = ticketRect(slot);
  const recipe = RECIPES[order.dishIndex];
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.3;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillStyle = COLORS.paper;
  rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
  ctx.restore();
  if (selected) {
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
  } else if (urgent) {
    // Urgency flashes the border, never the header: white title stays readable.
    ctx.strokeStyle = Math.sin(t * 6) > 0 ? COLORS.red : '#ff9d8a';
    ctx.lineWidth = 3;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
  }
  ctx.fillStyle = COLORS.red;
  rr(ctx, r.x, r.y, r.w, 30, 10); ctx.fill();
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(r.x, r.y + 20, r.w, 10);
  text(ctx, recipe.name.toUpperCase(), r.x + 12, r.y + 16, 16, '#fff', 900);
  text(ctx, formatRupiah(recipe.price), r.x + r.w - 12, r.y + 16, 14, '#ffe9a8', 800, 'right');
  // Needed ingredients as chips; filled ones are checked off.
  recipe.needs.forEach((need, i) => {
    const cx = r.x + 26 + i * 44;
    const cy = r.y + 56;
    ctx.fillStyle = '#f3e3c2';
    ellipse(ctx, cx, cy, 18, 18); ctx.fill();
    drawIngredientIcon(ctx, need, cx, cy, 12);
  });
  text(ctx, 'PESANAN #' + order.id, r.x + 12, r.y + 84, 11, '#8a7a5f', 700);
  // Patience bar.
  const barX = r.x + 108, barY = r.y + 78, barW = r.w - 120, barH = 10;
  ctx.fillStyle = '#e5d9bd';
  rr(ctx, barX, barY, barW, barH, 5); ctx.fill();
  ctx.fillStyle = frac > 0.6 ? '#58a34a' : frac > 0.3 ? '#f6a821' : '#d9381e';
  if (frac > 0) { rr(ctx, barX, barY, Math.max(10, barW * frac), barH, 5); ctx.fill(); }
}

function drawBins(ctx, game, hover) {
  text(ctx, 'BAHAN  —  klik atau tekan 1-6', LAYOUT.binsLabel.x, LAYOUT.binsLabel.y, 13, '#6b4423', 800);
  INGREDIENTS.forEach((ing, i) => {
    const b = binRect(i);
    const isHover = hover && hover.kind === 'bin' && hover.index === i;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = isHover ? '#fff3d6' : '#fdf6e3';
    rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = isHover ? COLORS.gold : '#d9c48a'; ctx.lineWidth = isHover ? 3 : 2;
    rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.stroke();
    drawIngredientIcon(ctx, ing.id, b.x + b.w / 2, b.y + 40, 26);
    text(ctx, ing.name, b.x + b.w / 2, b.y + 78, 14, COLORS.ink, 800, 'center');
    ctx.fillStyle = '#8a7a5f';
    ellipse(ctx, b.x + b.w - 16, b.y + 16, 11, 11); ctx.fill();
    text(ctx, ing.key, b.x + b.w - 16, b.y + 17, 12, '#fff', 800, 'center');
  });
  // Pan contents preview under the bins: what is in the wok right now.
  const order = game.orders.find((o) => o.id === game.selectedOrderId) || game.orders[0];
  if (order && game.pan.contents.length > 0) {
    const recipe = RECIPES[order.dishIndex];
    text(ctx, 'DI WAJAN: ' + recipe.name, 24, 478, 13, '#6b4423', 800);
    game.pan.contents.forEach((c, i) => {
      drawIngredientIcon(ctx, c, 44 + i * 44, 506, 15);
    });
    const missing = recipe.needs.filter((n) => !game.pan.contents.includes(n));
    text(ctx, missing.length ? 'Kurang: ' + missing.map((m) => INGREDIENTS.find((x) => x.id === m).name).join(', ') : 'Lengkap — siap dimasak!',
      24, 540, 13, missing.length ? '#8a7a5f' : COLORS.teal, 800);
  }
}

function drawChef(ctx, t) {
  const { cx, cy } = LAYOUT.chef;
  const bob = Math.sin(t * 2) * 2;
  // Toque.
  ctx.fillStyle = '#fdfdfd';
  ellipse(ctx, cx, cy - 34 + bob, 26, 18); ctx.fill();
  ellipse(ctx, cx - 16, cy - 26 + bob, 14, 12); ctx.fill();
  ellipse(ctx, cx + 16, cy - 26 + bob, 14, 12); ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ellipse(ctx, cx, cy - 8 + bob, 22, 24); ctx.fill();
  // Smile + eyes.
  ctx.fillStyle = '#2b2118';
  ellipse(ctx, cx - 8, cy - 12 + bob, 2.5, 3.5); ctx.fill();
  ellipse(ctx, cx + 8, cy - 12 + bob, 2.5, 3.5); ctx.fill();
  ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy - 4 + bob, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Apron shoulders (cut off by the counter).
  ctx.fillStyle = '#2e7d6b';
  rr(ctx, cx - 34, cy + 14 + bob, 68, 26, 10); ctx.fill();
  ctx.fillStyle = '#fffaf0';
  rr(ctx, cx - 12, cy + 14 + bob, 24, 26, 4); ctx.fill();
}

function drawWok(ctx, game, t, hover) {
  const { cx, cy, rx, ry } = LAYOUT.wok;
  const stove = LAYOUT.stove;
  // Stove body.
  ctx.fillStyle = '#3a3a3a';
  rr(ctx, stove.x, stove.y, stove.w, stove.h, 12); ctx.fill();
  ctx.fillStyle = '#26221f';
  ellipse(ctx, cx, stove.y + 18, 120, 16); ctx.fill();
  // Flames when cooking.
  if (game.pan.cooking && game.pan.progress < 1) {
    for (let k = 0; k < 5; k++) {
      const fx = cx - 90 + k * 45 + Math.sin(t * 9 + k * 2) * 4;
      const fh = 34 + Math.sin(t * 11 + k * 3) * 8;
      ctx.fillStyle = k % 2 ? '#ff9d2e' : '#ffc93c';
      ctx.beginPath();
      ctx.moveTo(fx - 13, stove.y + 14);
      ctx.quadraticCurveTo(fx - 8, stove.y - fh, fx, stove.y - fh - 8);
      ctx.quadraticCurveTo(fx + 8, stove.y - fh, fx + 13, stove.y + 14);
      ctx.closePath(); ctx.fill();
    }
  }
  // Wok.
  ctx.fillStyle = COLORS.wok;
  ellipse(ctx, cx, cy, rx, ry); ctx.fill();
  ctx.fillStyle = '#17140f';
  ellipse(ctx, cx, cy - 4, rx - 12, ry - 10); ctx.fill();
  ctx.strokeStyle = '#4a4238'; ctx.lineWidth = 3;
  ellipse(ctx, cx, cy, rx, ry); ctx.stroke();
  // Contents.
  if (game.pan.contents.length > 0) {
    game.pan.contents.forEach((c, i) => {
      const a = -0.9 + i * 0.55;
      const px = cx + Math.cos(a) * 62;
      const py = cy - 4 + Math.sin(a) * 18 + (game.pan.cooking ? Math.sin(t * 7 + i * 2) * 2 : 0);
      drawIngredientIcon(ctx, c, px, py, 20);
    });
  }
  // Steam while cooking.
  if (game.pan.cooking && game.pan.progress < 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0; k < 4; k++) {
      const phase = (t * 0.5 + k * 0.25) % 1;
      const sx = cx - 50 + k * 32 + Math.sin(t * 3 + k) * 8;
      const sy = cy - 30 - phase * 70;
      ellipse(ctx, sx, sy, 14 * (1 - phase * 0.4), 8); ctx.fill();
    }
  }
  // Progress ring around the wok.
  if (game.pan.cooking) {
    const burning = game.pan.progress >= 1;
    const frac = burning ? Math.min(1, game.pan.burn / 3.5) : game.pan.progress;
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(cx, cy, rx + 16, ry + 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = burning ? '#d9381e' : '#f2b705';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 16, ry + 16, 0, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    text(ctx, burning ? 'ANGKAT! GOSONG!' : 'MEMASAK ' + Math.round(game.pan.progress * 100) + '%',
      cx, cy - ry - 30, 15, burning ? '#d9381e' : '#6b4423', 900, 'center');
  } else if (game.pan.contents.length > 0) {
    text(ctx, 'Klik MASAK saat bahan lengkap', cx, cy - ry - 30, 14, '#8a7a5f', 700, 'center');
  } else {
    text(ctx, 'WOK — pilih pesanan, isi bahan', cx, cy - ry - 30, 14, '#8a7a5f', 700, 'center');
  }
  // Cook button.
  const cb = LAYOUT.cookButton;
  const order = game.orders.find((o) => o.id === game.selectedOrderId) || game.orders[0];
  const ready = order && !game.pan.cooking && game.pan.dish === order.dishIndex &&
    RECIPES[order.dishIndex].needs.every((n) => game.pan.contents.includes(n));
  const isHover = hover && hover.kind === 'cook';
  ctx.fillStyle = ready ? (isHover ? '#ff7a3c' : '#e85d26') : '#b9ac93';
  rr(ctx, cb.x, cb.y, cb.w, cb.h, 12); ctx.fill();
  if (ready) {
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3;
    rr(ctx, cb.x, cb.y, cb.w, cb.h, 12); ctx.stroke();
  }
  text(ctx, game.pan.cooking ? 'MEMASAK...' : 'MASAK  (W)', cb.x + cb.w / 2, cb.y + cb.h / 2 + 1, 18, '#fff', 900, 'center');
  // Trash.
  const tr = LAYOUT.trash;
  ctx.fillStyle = isHover && hover.kind === 'trash' ? '#e8e0cf' : '#d8cdb4';
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 10); ctx.fill();
  ctx.strokeStyle = '#8a7a5f'; ctx.lineWidth = 2;
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 10); ctx.stroke();
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(tr.x + 14, tr.y + 14, 32, 4);
  ctx.fillRect(tr.x + 18, tr.y + 22, 24, 18);
  text(ctx, 'BUANG (T)', tr.x + tr.w / 2, tr.y + tr.h + 16, 11, '#8a7a5f', 700, 'center');
}

function drawPlateAndServe(ctx, game, t, hover) {
  const p = LAYOUT.plate;
  // Plating station label.
  text(ctx, 'PIRING SAJI', p.cx - 120, 210, 13, '#6b4423', 800, 'left');
  // Glow when a dish is ready.
  if (game.plate.dish !== null) {
    const pulse = 0.5 + Math.sin(t * 5) * 0.2;
    ctx.fillStyle = `rgba(242,183,5,${pulse * 0.35})`;
    ellipse(ctx, p.cx, p.cy, p.r + 22, p.r + 22); ctx.fill();
  }
  ctx.fillStyle = '#fdfdfd';
  ellipse(ctx, p.cx, p.cy, p.r, p.r); ctx.fill();
  ctx.fillStyle = '#f3ead2';
  ellipse(ctx, p.cx, p.cy, p.r - 16, p.r - 16); ctx.fill();
  ctx.strokeStyle = '#d9c48a'; ctx.lineWidth = 3;
  ellipse(ctx, p.cx, p.cy, p.r, p.r); ctx.stroke();
  if (game.plate.dish !== null) {
    drawDishOnPlate(ctx, game.plate.dish, p.cx, p.cy, 62);
    text(ctx, RECIPES[game.plate.dish].name.toUpperCase() + ' — SIAP DIANTAR!',
      p.cx, p.cy + p.r + 22, 15, COLORS.teal, 900, 'center');
  } else if (game.pan.cooking && game.pan.progress >= 1) {
    text(ctx, 'Matang! Klik piring untuk menata', p.cx, p.cy + p.r + 22, 14, '#8a7a5f', 700, 'center');
  } else {
    text(ctx, 'Piring kosong', p.cx, p.cy + p.r + 22, 14, '#8a7a5f', 700, 'center');
  }
  // Serve window + bell + button.
  const sw = LAYOUT.serveWindow;
  ctx.fillStyle = '#5d3413';
  rr(ctx, sw.x, sw.y, sw.w, sw.h, 12); ctx.fill();
  ctx.fillStyle = '#2b2118';
  rr(ctx, sw.x + 10, sw.y + 10, sw.w - 20, 52, 8); ctx.fill();
  text(ctx, 'JENDELA ANTAR  •  pelanggan menunggu di luar', sw.x + sw.w / 2, sw.y + 36, 13, '#ffe9a8', 800, 'center');
  const bell = LAYOUT.bell;
  const ringing = game.plate.dish !== null;
  ctx.save();
  if (ringing) ctx.translate(Math.sin(t * 18) * 2, 0);
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath(); ctx.arc(bell.cx, bell.cy, bell.r, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(bell.cx - bell.r, bell.cy - 2, bell.r * 2, 5);
  ctx.fillStyle = '#c98f1b';
  ellipse(ctx, bell.cx, bell.cy + 4, 5, 4); ctx.fill();
  ctx.restore();
  const sb = LAYOUT.serveButton;
  const isHover = hover && hover.kind === 'serve';
  const canServe = game.plate.dish !== null;
  ctx.fillStyle = canServe ? (isHover ? '#25a08d' : COLORS.teal) : '#b9ac93';
  rr(ctx, sb.x, sb.y, sb.w, sb.h, 12); ctx.fill();
  if (canServe) {
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3;
    rr(ctx, sb.x, sb.y, sb.w, sb.h, 12); ctx.stroke();
  }
  text(ctx, 'ANTAR PESANAN  (SPASI)', sb.x + sb.w / 2, sb.y + sb.h / 2 + 1, 18, '#fff', 900, 'center');
}

function drawHeader(ctx, game) {
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, CANVAS_W, 64);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(0, 60, CANVAS_W, 4);
  text(ctx, 'WARUNG RUSH', 24, 26, 28, '#fff', 900);
  text(ctx, 'DAPUR KILAT  •  masak cepat, antar panas-panas', 24, 50, 12, '#f2b705', 700);
  // Shift clock, centre.
  const cx = CANVAS_W / 2;
  ctx.fillStyle = game.timeLeft < 30 && game.screen === 'playing' ? '#ff6b4a' : '#fffaf0';
  ellipse(ctx, cx - 78, 32, 15, 15); ctx.fill();
  ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 78, 32); ctx.lineTo(cx - 78, 21); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 78, 32); ctx.lineTo(cx - 70, 32); ctx.stroke();
  text(ctx, formatClock(game.timeLeft), cx - 56, 33, 30, '#fff', 900);
  text(ctx, 'SISA SHIFT', cx - 56, 52, 10, '#c9b896', 800);
  // Coins + combo, right.
  text(ctx, formatRupiah(game.coins), CANVAS_W - 92, 26, 24, COLORS.gold, 900, 'right');
  text(ctx, game.combo > 1 ? 'KOMBO x' + game.combo : 'KOLEKSI KOIN', CANVAS_W - 92, 50, 12, '#c9b896', 800, 'right');
  const m = LAYOUT.mute;
  ctx.fillStyle = '#4a4238';
  rr(ctx, m.x, m.y, m.w, m.h, 8); ctx.fill();
  text(ctx, game.muted ? 'M: OFF' : 'M: ON', m.x + m.w / 2, m.y + m.h / 2 + 1, 12, '#fff', 800, 'center');
}

function drawBottomBar(ctx, game) {
  const b = LAYOUT.bottomBar;
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  text(ctx, '1-6  bahan    •    W  masak    •    P  tata di piring    •    SPASI  antar    •    T  buang    •    M  suara',
    24, b.y + 20, 13, '#e8dcc2', 700);
  const order = game.orders.find((o) => o.id === game.selectedOrderId) || game.orders[0];
  if (order && game.screen === 'playing') {
    const recipe = RECIPES[order.dishIndex];
    text(ctx, 'PESANAN DIPILIH: ' + recipe.name.toUpperCase() + '  —  ' + recipe.blurb,
      24, b.y + 44, 13, '#f2b705', 800);
  }
  text(ctx, 'Disajikan: ' + game.served + '   •   Gagal: ' + game.failed + '   •   Kombo terbaik: x' + game.bestCombo,
    CANVAS_W - 24, b.y + 32, 13, '#c9b896', 700, 'right');
  if (game.toast && game.elapsed < game.toastUntil) {
    const tw = ctx.measureText(game.toast).width + 56;
    const tx = 250 - tw / 2;
    ctx.fillStyle = 'rgba(43,33,24,0.92)';
    rr(ctx, tx, 604, tw, 36, 18); ctx.fill();
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2;
    rr(ctx, tx, 604, tw, 36, 18); ctx.stroke();
    text(ctx, game.toast, 250, 623, 15, '#fff', 800, 'center');
  }
}

function drawKitchenBase(ctx) {
  // Wall + tiles.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 64, CANVAS_W, 592);
  ctx.fillStyle = COLORS.tileA;
  for (let x = 0; x < CANVAS_W; x += 64) {
    ctx.fillRect(x, 64, 62, 34);
  }
  ctx.fillStyle = COLORS.tileB;
  for (let x = 32; x < CANVAS_W; x += 64) {
    ctx.fillRect(x, 98, 62, 10);
  }
  // Hanging lamps.
  for (const lx of [200, 640, 1080]) {
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 64); ctx.lineTo(lx, 96); ctx.stroke();
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath(); ctx.moveTo(lx - 18, 96); ctx.lineTo(lx + 18, 96); ctx.lineTo(lx, 122); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,120,0.35)';
    ellipse(ctx, lx, 128, 34, 10); ctx.fill();
  }
  // Counter.
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(0, 556, CANVAS_W, 100);
  ctx.fillStyle = COLORS.counterFront;
  ctx.fillRect(0, 580, CANVAS_W, 76);
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(0, 556, CANVAS_W, 6);
  // Floor strip at the very bottom of the kitchen (above the bar).
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 640, CANVAS_W, 16);
}

function drawFloaters(ctx, game) {
  for (const f of game.floaters) {
    const age = 1 - (f.until - game.elapsed) / 1.1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - age);
    text(ctx, f.text, f.x, f.y - age * 46, 24, f.color, 900, 'center');
    ctx.restore();
  }
}

function drawTitle(ctx, game, t) {
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 64, CANVAS_W, 592);
  ctx.fillStyle = COLORS.paper;
  rr(ctx, 290, 130, 700, 440, 18); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
  rr(ctx, 290, 130, 700, 440, 18); ctx.stroke();
  text(ctx, 'WARUNG RUSH', 640, 196, 56, COLORS.red, 900, 'center');
  text(ctx, '— DAPUR KILAT —', 640, 240, 20, '#6b4423', 800, 'center');
  text(ctx, 'Warung paling sibuk di kota. Pesanan datang terus,', 640, 292, 17, COLORS.ink, 700, 'center');
  text(ctx, 'wajan panas, pelanggan lapar. Masak cepat, antar panas-panas!', 640, 318, 17, COLORS.ink, 700, 'center');
  const lines = [
    '1  Pilih pesanan di papan, klik bahan 1-6 ke wajan',
    '2  Tekan W untuk memasak — angkat sebelum gosong',
    '3  Tata di piring (P), antar ke jendela (SPASI)',
    '4  Sajikan selagi pelanggan sabar = tips lebih besar',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 366 + i * 30, 16, '#4a3a28', 700, 'center'));
  const pulse = 0.65 + Math.sin(t * 4) * 0.35;
  ctx.fillStyle = `rgba(31,122,109,${pulse})`;
  rr(ctx, 480, 500, 320, 52, 14); ctx.fill();
  text(ctx, 'KLIK UNTUK MULAI', 640, 527, 20, '#fff', 900, 'center');
  text(ctx, 'Shift 2½ menit  •  5 resep warung asli  •  tanpa jaringan', 640, 566, 12, '#8a7a5f', 700, 'center');
}

function drawResults(ctx, game, t) {
  const r = game.results || { coins: 0, served: 0, failed: 0, bestCombo: 0, stars: 0 };
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 64, CANVAS_W, 592);
  ctx.fillStyle = COLORS.paper;
  rr(ctx, 330, 120, 620, 460, 18); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
  rr(ctx, 330, 120, 620, 460, 18); ctx.stroke();
  text(ctx, 'SHIFT SELESAI!', 640, 176, 40, COLORS.red, 900, 'center');
  let stars = '';
  for (let i = 0; i < 3; i++) stars += i < r.stars ? '★' : '☆';
  text(ctx, stars, 640, 232, 44, COLORS.gold, 900, 'center');
  text(ctx, 'PENDAPATAN', 640, 286, 14, '#8a7a5f', 800, 'center');
  text(ctx, formatRupiah(r.coins), 640, 326, 44, COLORS.teal, 900, 'center');
  text(ctx, 'Piring disajikan:  ' + r.served, 640, 384, 18, COLORS.ink, 800, 'center');
  text(ctx, 'Pesanan gagal:  ' + r.failed + '      Kombo terbaik:  x' + r.bestCombo, 640, 414, 18, COLORS.ink, 800, 'center');
  text(ctx, r.stars === 3 ? 'Koki legendaris! Warungmu penuh sesak.' : r.stars === 2 ? 'Dapurmu ngebut — pelanggan pulang senang.' : 'Shift yang sibuk. Latihan lagi, koki!',
    640, 452, 16, '#4a3a28', 700, 'center');
  const pulse = 0.65 + Math.sin(t * 4) * 0.35;
  ctx.fillStyle = `rgba(31,122,109,${pulse})`;
  rr(ctx, 480, 496, 320, 52, 14); ctx.fill();
  text(ctx, 'MAIN LAGI  (R)', 640, 523, 20, '#fff', 900, 'center');
}

export function draw(ctx, game, t, hover) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawKitchenBase(ctx);
  drawHeader(ctx, game);
  if (game.screen === 'title') {
    // Show a dressed kitchen behind the title card.
    drawBins(ctx, game, null);
    drawWok(ctx, game, t, null);
    drawPlateAndServe(ctx, game, t, null);
    drawTitle(ctx, game, t);
  } else {
    // Order tickets (empty slots show a "waiting" card).
    for (let i = 0; i < 4; i++) {
      const order = game.orders[i];
      if (order) {
        drawTicket(ctx, order, i, order.id === game.selectedOrderId, t);
      } else {
        const r = ticketRect(i);
        ctx.fillStyle = 'rgba(255,250,240,0.55)';
        rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(138,122,95,0.6)'; ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'MENUNGGU PELANGGAN...', r.x + r.w / 2, r.y + r.h / 2, 13, '#8a7a5f', 700, 'center');
      }
    }
    drawBins(ctx, game, hover);
    drawChef(ctx, t);
    drawWok(ctx, game, t, hover);
    drawPlateAndServe(ctx, game, t, hover);
    drawFloaters(ctx, game);
    if (game.screen === 'done') drawResults(ctx, game, t);
  }
  drawBottomBar(ctx, game);
}
