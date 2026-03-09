/**
 * Generates all app icon and splash screen assets.
 * Run: node scripts/generate-assets.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(OUT, { recursive: true });

// ─── Color palette ───────────────────────────────────────────────────────────
const NAVY       = '#0A1628';
const NAVY_MID   = '#1C3461';
const NAVY_LIGHT = '#142240';
const GOLD       = '#C9A84C';
const GOLD_LIGHT = '#E8C97A';
const GOLD_DARK  = '#A07C2E';
const WHITE      = '#FFFFFF';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hex(ctx, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
}

function save(canvas, filename) {
  const out = path.join(OUT, filename);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(out, buf);
  const kb = (buf.length / 1024).toFixed(0);
  console.log(`✓ ${filename} (${canvas.width}×${canvas.height}, ${kb} KB)`);
}

/**
 * Draws a classic heraldic shield shape.
 * Center of canvas, fills the given fraction of canvas width.
 */
function drawShield(ctx, cx, cy, w, h) {
  // Shield: rounded top corners, pointed bottom
  const r = w * 0.12; // corner radius
  ctx.beginPath();
  // top-left corner
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  // top edge
  ctx.lineTo(cx + w / 2 - r, cy - h / 2);
  // top-right corner arc
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + r, r);
  // right side to waist
  ctx.lineTo(cx + w / 2, cy + h * 0.15);
  // right curve to point
  ctx.quadraticCurveTo(cx + w / 2, cy + h / 2 * 0.95, cx, cy + h / 2);
  // left curve from point
  ctx.quadraticCurveTo(cx - w / 2, cy + h / 2 * 0.95, cx - w / 2, cy + h * 0.15);
  // left side up
  ctx.lineTo(cx - w / 2, cy - h / 2 + r);
  // top-left corner arc
  ctx.arcTo(cx - w / 2, cy - h / 2, cx - w / 2 + r, cy - h / 2, r);
  ctx.closePath();
}

/**
 * Draws a Latin cross centered at (cx, cy).
 * total height = h, width = w
 */
function drawCross(ctx, cx, cy, w, h) {
  const armW  = w * 0.28;   // thickness of horizontal arm
  const stemW = w * 0.22;   // thickness of vertical stem
  const topY  = cy - h / 2;
  const botY  = cy + h / 2;
  const armY  = cy - h * 0.05; // where horizontal arm sits (slightly above center)

  ctx.beginPath();
  // Vertical stem
  ctx.rect(cx - stemW / 2, topY, stemW, h);
  ctx.fill();
  // Horizontal arm
  ctx.beginPath();
  ctx.rect(cx - w / 2, armY - armW / 2, w, armW);
  ctx.fill();
}

// ─── Stars helper ─────────────────────────────────────────────────────────────

function drawStar(ctx, cx, cy, outerR, innerR, points = 5) {
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// ─── Radial gradient background ───────────────────────────────────────────────

function navyBackground(ctx, size) {
  const grad = ctx.createRadialGradient(size / 2, size * 0.4, 0, size / 2, size / 2, size * 0.75);
  grad.addColorStop(0, NAVY_MID);
  grad.addColorStop(1, NAVY);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}

function navyBackgroundRect(ctx, w, h) {
  const grad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  grad.addColorStop(0, NAVY_MID);
  grad.addColorStop(1, NAVY);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ─── ICON (1024×1024) ─────────────────────────────────────────────────────────

function generateIcon() {
  const S = 1024;
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');

  // Background
  navyBackground(ctx, S);

  // Subtle radial glow behind shield
  const glow = ctx.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.5);
  glow.addColorStop(0, 'rgba(201,168,76,0.12)');
  glow.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  const cx = S / 2;
  const cy = S / 2 + 20;
  const sw = S * 0.58;
  const sh = S * 0.66;

  // ── Shield drop shadow ──
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  drawShield(ctx, cx, cy, sw, sh);
  ctx.fillStyle = NAVY_LIGHT;
  ctx.fill();
  ctx.restore();

  // ── Shield gold gradient fill ──
  const shieldGrad = ctx.createLinearGradient(cx - sw / 2, cy - sh / 2, cx + sw / 2, cy + sh / 2);
  shieldGrad.addColorStop(0, GOLD_LIGHT);
  shieldGrad.addColorStop(0.4, GOLD);
  shieldGrad.addColorStop(1, GOLD_DARK);
  drawShield(ctx, cx, cy, sw, sh);
  ctx.fillStyle = shieldGrad;
  ctx.fill();

  // ── Shield inner border (dark inset) ──
  const insetPad = sw * 0.06;
  drawShield(ctx, cx, cy, sw - insetPad * 2, sh - insetPad * 2);
  ctx.fillStyle = NAVY;
  ctx.fill();

  // ── Cross inside shield ──
  const crossW = sw * 0.46;
  const crossH = sh * 0.54;
  const crossGrad = ctx.createLinearGradient(cx - crossW / 2, cy - crossH / 2, cx + crossW / 2, cy + crossH / 2);
  crossGrad.addColorStop(0, GOLD_LIGHT);
  crossGrad.addColorStop(0.5, GOLD);
  crossGrad.addColorStop(1, GOLD_DARK);
  ctx.fillStyle = crossGrad;
  drawCross(ctx, cx, cy - sh * 0.02, crossW, crossH);

  // ── 3 small stars above cross top ──
  const starY = cy - crossH / 2 - 12;
  ctx.fillStyle = GOLD;
  [cx - 32, cx, cx + 32].forEach(sx => {
    drawStar(ctx, sx, starY, 9, 4.5);
  });

  // ── Thin gold border around whole shield ──
  drawShield(ctx, cx, cy, sw, sh);
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 6;
  ctx.stroke();

  save(c, 'icon.png');
  save(c, 'adaptive-icon.png');
  return c;
}

// ─── SPLASH (1284×2778, iPhone 15 Pro Max) ────────────────────────────────────

function generateSplash() {
  const W = 1284, H = 2778;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Background
  navyBackgroundRect(ctx, W, H);

  // Subtle horizontal rule lines (flag-like) — very faint
  ctx.globalAlpha = 0.04;
  const stripeH = H / 13;
  for (let i = 0; i < 13; i += 2) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, i * stripeH, W, stripeH);
  }
  ctx.globalAlpha = 1;

  const cx = W / 2;
  const cy = H * 0.42;

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, W * 0.6);
  glow.addColorStop(0, 'rgba(201,168,76,0.15)');
  glow.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Shield
  const sw = W * 0.52;
  const sh = W * 0.6;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  drawShield(ctx, cx, cy, sw, sh);
  ctx.fillStyle = NAVY_LIGHT;
  ctx.fill();
  ctx.restore();

  // Gold shield
  const sg = ctx.createLinearGradient(cx, cy - sh / 2, cx, cy + sh / 2);
  sg.addColorStop(0, GOLD_LIGHT);
  sg.addColorStop(0.45, GOLD);
  sg.addColorStop(1, GOLD_DARK);
  drawShield(ctx, cx, cy, sw, sh);
  ctx.fillStyle = sg;
  ctx.fill();

  // Inner dark
  const ip = sw * 0.07;
  drawShield(ctx, cx, cy, sw - ip * 2, sh - ip * 2);
  ctx.fillStyle = NAVY;
  ctx.fill();

  // Cross
  const crossW = sw * 0.46;
  const crossH = sh * 0.52;
  const cg = ctx.createLinearGradient(cx, cy - crossH / 2, cx, cy + crossH / 2);
  cg.addColorStop(0, GOLD_LIGHT);
  cg.addColorStop(0.5, GOLD);
  cg.addColorStop(1, GOLD_DARK);
  ctx.fillStyle = cg;
  drawCross(ctx, cx, cy - sh * 0.02, crossW, crossH);

  // Stars above cross
  const starY = cy - crossH / 2 - 16;
  ctx.fillStyle = GOLD;
  [cx - 40, cx, cx + 40].forEach(sx => drawStar(ctx, sx, starY, 12, 6));

  // Shield border
  drawShield(ctx, cx, cy, sw, sh);
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 8;
  ctx.stroke();

  // ── App Title ──
  const titleY = cy + sh / 2 + 80;
  ctx.textAlign = 'center';

  // "THE PATRIOT'S" line
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = `bold ${W * 0.065}px serif`;
  ctx.letterSpacing = '6px';
  ctx.fillText("THE PATRIOT'S", cx, titleY);

  // "BIBLE" line — larger
  ctx.fillStyle = WHITE;
  ctx.font = `bold ${W * 0.115}px serif`;
  ctx.letterSpacing = '12px';
  ctx.fillText('BIBLE', cx, titleY + W * 0.1);

  // Gold rule lines flanking tagline
  const tagY = titleY + W * 0.1 + 60;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - 220, tagY - 14); ctx.lineTo(cx - 60, tagY - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 60, tagY - 14); ctx.lineTo(cx + 220, tagY - 14); ctx.stroke();
  ctx.globalAlpha = 1;

  // Tagline
  ctx.fillStyle = GOLD;
  ctx.font = `${W * 0.038}px sans-serif`;
  ctx.letterSpacing = '4px';
  ctx.fillText('FAITH · FREEDOM · TRUTH', cx, tagY);

  // KJV note at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = `${W * 0.028}px sans-serif`;
  ctx.letterSpacing = '2px';
  ctx.fillText('KING JAMES VERSION', cx, H * 0.92);

  save(c, 'splash.png');
}

// ─── FAVICON (48×48) ─────────────────────────────────────────────────────────

function generateFavicon() {
  const S = 48;
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');

  // Round rect background
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.roundRect(0, 0, S, S, 8);
  ctx.fill();

  // Mini cross
  ctx.fillStyle = GOLD;
  const cw = S * 0.3, ch = S * 0.55;
  drawCross(ctx, S / 2, S / 2, cw, ch);

  save(c, 'favicon.png');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log('Generating Patriot\'s Bible assets...\n');
generateIcon();
generateSplash();
generateFavicon();
console.log('\nDone! Assets saved to assets/images/');
