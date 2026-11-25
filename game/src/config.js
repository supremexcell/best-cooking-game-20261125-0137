// Warung Rush — Dapur Kilat: tuning, recipes and palette.
// One clear job: every number and name the game runs on lives here.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const SHIFT_SECONDS = 150;

export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fff7e0', rim: '#d9c48a' },
  { id: 'mie', name: 'Mie', key: '2', color: '#f6c453', rim: '#c98f1b' },
  { id: 'telur', name: 'Telur', key: '3', color: '#fdfdfd', rim: '#d8d8d8' },
  { id: 'ayam', name: 'Ayam', key: '4', color: '#e07840', rim: '#a34d1f' },
  { id: 'sayur', name: 'Sayur', key: '5', color: '#58a34a', rim: '#2f6b2a' },
  { id: 'sambal', name: 'Sambal', key: '6', color: '#d9381e', rim: '#8f1d0c' },
];

export const RECIPES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng', price: 15000, cookTime: 4,
    needs: ['nasi', 'telur', 'ayam', 'sambal'],
    blurb: 'Nasi + telur + ayam + sambal',
  },
  {
    id: 'mie-goreng', name: 'Mie Goreng', price: 14000, cookTime: 4,
    needs: ['mie', 'telur', 'sayur', 'sambal'],
    blurb: 'Mie + telur + sayur + sambal',
  },
  {
    id: 'gado-gado', name: 'Gado-Gado', price: 12000, cookTime: 3,
    needs: ['sayur', 'telur', 'sambal'],
    blurb: 'Sayur + telur + sambal',
  },
  {
    id: 'sate-ayam', name: 'Sate Ayam', price: 18000, cookTime: 5,
    needs: ['ayam', 'sambal', 'sayur'],
    blurb: 'Ayam + sambal + sayur',
  },
  {
    id: 'ayam-geprek', name: 'Ayam Geprek', price: 17000, cookTime: 5,
    needs: ['nasi', 'ayam', 'sambal', 'sayur'],
    blurb: 'Nasi + ayam + sambal + sayur',
  },
];

// Which dishes can appear as the shift goes on (index into RECIPES).
export function dishPoolFor(elapsed) {
  if (elapsed < 25) return [0, 1];
  if (elapsed < 55) return [0, 1, 2];
  if (elapsed < 90) return [0, 1, 2, 3];
  return [0, 1, 2, 3, 4];
}

export const TUNING = {
  orderPatience: 45,        // seconds before a customer walks away
  orderPatienceLate: 34,    // patience once the rush is on
  spawnFirstDelay: 2.5,
  spawnIntervalEarly: 10,
  spawnIntervalLate: 6.5,
  spawnRampAt: 60,          // seconds into the shift when spawning speeds up
  maxTickets: 4,
  burnGrace: 3.5,           // seconds a finished dish survives in the wok
  tipFull: 0.5,             // +50% when served with > 60% patience left
  tipHalf: 0.25,            // +25% when served with > 30% patience left
  comboStep: 0.1,           // +10% per combo level, capped
  comboCap: 0.5,
};

export const COLORS = {
  wall: '#f6e3bd',
  tileA: '#c96f4a',
  tileB: '#e8a87c',
  counterTop: '#a9713f',
  counterFront: '#7c4a21',
  counterEdge: '#5d3413',
  floor: '#8a5a33',
  ink: '#2b2118',
  paper: '#fffaf0',
  red: '#d9381e',
  redDark: '#8f1d0c',
  teal: '#1f7a6d',
  tealDark: '#14584e',
  gold: '#f2b705',
  cream: '#fff3d6',
  wok: '#26221f',
  steel: '#c9ced6',
};

// Deterministic RNG for screenshot scenes.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
