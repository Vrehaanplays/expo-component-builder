/**
 * Generates a shareable Acuity Score card as a canvas-rendered PNG blob.
 * Uses the Nuance design system: deep ocean gradients, DM Mono for stats,
 * Syne-style headings, Arctic Teal accents, glassmorphism feel.
 */

interface ShareCardData {
  username: string;
  acuityScore: number;
  accuracy: number;
  streak: number;
  rank: string;
  rankPosition?: number | null;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

/**
 * Renders the Acuity Score card to an offscreen canvas and returns a Blob.
 */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // ─── Background: radial depth gradient ───
  const bgGrad = ctx.createRadialGradient(
    CARD_WIDTH * 0.3, CARD_HEIGHT * 0.2, 0,
    CARD_WIDTH * 0.5, CARD_HEIGHT * 0.5, CARD_HEIGHT * 0.8
  );
  bgGrad.addColorStop(0, "#1A3A4A");    // depth-surface
  bgGrad.addColorStop(0.25, "#132A3E"); // depth-current
  bgGrad.addColorStop(0.55, "#0F1B2D"); // depth-ocean
  bgGrad.addColorStop(1, "#0A0E1A");    // depth-abyss
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ─── Noise grain overlay (subtle) ───
  addGrain(ctx, CARD_WIDTH, CARD_HEIGHT, 0.035);

  // ─── Ambient glow orbs ───
  drawGlow(ctx, CARD_WIDTH * 0.7, CARD_HEIGHT * 0.15, 220, "rgba(74,234,220,0.08)");
  drawGlow(ctx, CARD_WIDTH * 0.2, CARD_HEIGHT * 0.7, 280, "rgba(167,139,250,0.06)");

  // ─── Glass card container ───
  const cardX = 60;
  const cardY = 200;
  const cardW = CARD_WIDTH - 120;
  const cardH = 880;
  drawGlassCard(ctx, cardX, cardY, cardW, cardH);

  // ─── "NUANCE" brand at top ───
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "700 28px 'Syne', sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("N U A N C E", CARD_WIDTH / 2, 120);

  // ─── Acuity Score label ───
  ctx.fillStyle = "rgba(74,234,220,0.9)";
  ctx.font = "600 18px 'DM Sans', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("ACUITY SCORE", CARD_WIDTH / 2, cardY + 80);

  // ─── Big score number ───
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "500 120px 'DM Mono', monospace";
  ctx.letterSpacing = "-4px";
  ctx.fillText(data.acuityScore.toLocaleString(), CARD_WIDTH / 2, cardY + 220);

  // ─── Arctic teal glow line ───
  const lineGrad = ctx.createLinearGradient(cardX + 80, 0, cardX + cardW - 80, 0);
  lineGrad.addColorStop(0, "rgba(74,234,220,0)");
  lineGrad.addColorStop(0.3, "rgba(74,234,220,0.6)");
  lineGrad.addColorStop(0.7, "rgba(74,234,220,0.6)");
  lineGrad.addColorStop(1, "rgba(74,234,220,0)");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(cardX + 80, cardY + 260, cardW - 160, 2);

  // ─── Glow under the line ───
  drawGlow(ctx, CARD_WIDTH / 2, cardY + 260, 120, "rgba(74,234,220,0.12)");

  // ─── Rank tier ───
  ctx.fillStyle = "#F5D97E"; // starlight
  ctx.font = "700 36px 'Syne', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText(data.rank.toUpperCase(), CARD_WIDTH / 2, cardY + 340);

  // ─── Stats row ───
  const statsY = cardY + 460;
  const statLabels = ["Accuracy", "Streak", "Global Rank"];
  const statValues = [
    `${Math.round(data.accuracy)}%`,
    `🔥 ${data.streak}`,
    data.rankPosition ? `#${data.rankPosition}` : "—",
  ];

  const colWidth = cardW / 3;
  for (let i = 0; i < 3; i++) {
    const cx = cardX + colWidth * i + colWidth / 2;

    // Stat value
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "500 38px 'DM Mono', monospace";
    ctx.letterSpacing = "-1px";
    ctx.fillText(statValues[i], cx, statsY);

    // Stat label
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "600 14px 'DM Sans', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(statLabels[i].toUpperCase(), cx, statsY + 36);
  }

  // ─── Divider lines between stats ───
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const dx = cardX + colWidth * i;
    ctx.beginPath();
    ctx.moveTo(dx, statsY - 40);
    ctx.lineTo(dx, statsY + 50);
    ctx.stroke();
  }

  // ─── Username ───
  ctx.fillStyle = "rgba(74,234,220,0.8)";
  ctx.font = "600 24px 'DM Sans', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText(`@${data.username}`, CARD_WIDTH / 2, cardY + 580);

  // ─── Inner card glass border top edge glow ───
  ctx.fillStyle = "rgba(74,234,220,0.08)";
  ctx.fillRect(cardX + 1, cardY + 1, cardW - 2, 1);

  // ─── CTA at bottom ───
  // Pill button
  const btnW = 440;
  const btnH = 64;
  const btnX = (CARD_WIDTH - btnW) / 2;
  const btnY = CARD_HEIGHT - 200;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
  btnGrad.addColorStop(0, "#4AEADC");
  btnGrad.addColorStop(1, "#3DD4C8");
  ctx.fillStyle = btnGrad;
  roundRect(ctx, btnX, btnY, btnW, btnH, 999);
  ctx.fill();

  // Shadow behind button
  ctx.shadowColor = "rgba(74,234,220,0.3)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = btnGrad;
  roundRect(ctx, btnX, btnY, btnW, btnH, 999);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Button text
  ctx.fillStyle = "#0A0E1A";
  ctx.font = "700 20px 'DM Sans', sans-serif";
  ctx.letterSpacing = "0.5px";
  ctx.fillText("Think you can beat me?", CARD_WIDTH / 2, btnY + 40);

  // ─── Bottom tagline ───
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "500 16px 'DM Sans', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("NUANCE — TRAIN YOUR JUDGMENT", CARD_WIDTH / 2, CARD_HEIGHT - 80);

  // ─── Export ───
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 1);
  });
}

/**
 * Share the score card via native Web Share API, or download as fallback.
 */
export async function shareScoreCard(data: ShareCardData): Promise<void> {
  const blob = await renderShareCard(data);
  const file = new File([blob], "nuance-score.png", { type: "image/png" });

  // Try native share (mobile, some desktop)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `My Nuance Acuity Score: ${data.acuityScore.toLocaleString()}`,
        text: `I scored ${data.acuityScore.toLocaleString()} on Nuance. Think you can beat me? 🧠`,
        files: [file],
      });
      return;
    } catch {
      // User cancelled or share failed — fall through to download
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nuance-score.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────

function drawGlassCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  // Glass fill
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  roundRect(ctx, x, y, w, h, 28);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();

  // Inner top glow
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, x + 1, y + 1, w - 2, 1, 0);
  ctx.fill();
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number, color: string
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function addGrain(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, opacity: number
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * opacity;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }
  ctx.putImageData(imageData, 0, 0);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
