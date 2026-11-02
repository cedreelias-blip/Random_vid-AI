import type { Scene, VideoProject, VisualKind } from "../types";

type ProgressHandler = (value: number) => void;
const W = 720;
const H = 1280;

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  let offset = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, y + offset);
      line = word;
      offset += lineHeight;
    } else line = candidate;
  }
  if (line) ctx.fillText(line, x, y + offset);
}
function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function drawSpace(ctx: CanvasRenderingContext2D, t: number, accent: string, phase: number) {
  const x = 360 + Math.sin(t * 0.35) * 24;
  ctx.save();
  ctx.fillStyle = "#d8dce5"; ctx.globalAlpha = 0.95;
  ctx.beginPath(); ctx.arc(460, 360, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8b97a8"; ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.arc(490, 335, 83, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.globalAlpha = 0.75;
  ctx.beginPath(); ctx.ellipse(360, 370, 230, 78, -0.25, 0, Math.PI * 2); ctx.stroke();
  ctx.translate(x, 340 + Math.sin(t) * 12); ctx.rotate(-0.22);
  ctx.fillStyle = "#eef3fa"; ctx.beginPath(); ctx.moveTo(0, -86); ctx.quadraticCurveTo(44, -24, 32, 48); ctx.lineTo(-32, 48); ctx.quadraticCurveTo(-44, -24, 0, -86); ctx.fill();
  ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(-32, 24); ctx.lineTo(-66, 65); ctx.lineTo(-26, 55); ctx.fill(); ctx.beginPath(); ctx.moveTo(32, 24); ctx.lineTo(66, 65); ctx.lineTo(26, 55); ctx.fill();
  ctx.fillStyle = "#ffb45e"; ctx.beginPath(); ctx.moveTo(-17, 49); ctx.lineTo(0, 105 + Math.sin(t * 14) * 15); ctx.lineTo(17, 49); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 12; i++) {
    const sx = (i * 83 + 34) % W; const sy = (i * 59 + 170) % 620;
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t + i); ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawComputer(ctx: CanvasRenderingContext2D, t: number, accent: string, phase: number) {
  const pulse = 1 + Math.sin(t * 2) * 0.025;
  ctx.save(); ctx.translate(360, 370); ctx.scale(pulse, pulse);
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  for (let i = -2; i <= 2; i++) {
    const p = i * 38;
    line(ctx, -150, p, -205, p, accent, 4); line(ctx, 150, p, 205, p, accent, 4);
    line(ctx, p, -150, p, -205, accent, 4); line(ctx, p, 150, p, 205, accent, 4);
  }
  ctx.fillStyle = "#14283a"; ctx.strokeStyle = accent; ctx.lineWidth = 5;
  roundedRect(ctx, -150, -150, 300, 300, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#203e52"; roundedRect(ctx, -100, -100, 200, 200, 14); ctx.fill();
  ctx.fillStyle = accent; ctx.font = "700 38px Arial"; ctx.textAlign = "center"; ctx.fillText("CORE", 0, 12);
  ctx.font = "16px Arial"; ctx.fillText("PROCESSOR", 0, 48);
  ctx.restore(); ctx.textAlign = "left";
  for (let i = 0; i < 7; i++) {
    const h = 24 + ((Math.sin(t * 3 + i) + 1) * 52);
    ctx.fillStyle = accent; ctx.globalAlpha = 0.5;
    roundedRect(ctx, 170 + i * 65, 600 - h, 30, h, 8); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawPhone(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save(); ctx.translate(360, 365); ctx.rotate(Math.sin(t * 0.6) * 0.045);
  ctx.fillStyle = "#111c2a"; ctx.strokeStyle = accent; ctx.lineWidth = 5;
  roundedRect(ctx, -112, -205, 224, 410, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1b3850"; roundedRect(ctx, -92, -170, 184, 340, 18); ctx.fill();
  ctx.fillStyle = accent; ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.arc(0, -105, 42 + Math.sin(t * 2) * 4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = "#eff6ff"; ctx.font = "700 24px Arial"; ctx.textAlign = "center"; ctx.fillText("SMART", 0, 5); ctx.fillText("DEVICE", 0, 35);
  ctx.restore(); ctx.textAlign = "left";
}
function drawMap(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save(); ctx.translate(360, 370);
  ctx.fillStyle = "#122c35"; ctx.strokeStyle = "#47747b"; ctx.lineWidth = 2;
  for (let y = -190; y <= 190; y += 55) for (let x = -260; x <= 260; x += 65) {
    const wobble = Math.sin(x * 0.02 + y * 0.03) * 12;
    ctx.beginPath(); ctx.moveTo(x + wobble, y); ctx.lineTo(x + 45 + wobble, y + 24); ctx.lineTo(x + 60, y + 55); ctx.stroke();
  }
  ctx.strokeStyle = accent; ctx.lineWidth = 6; ctx.beginPath();
  ctx.moveTo(-210, 110); ctx.bezierCurveTo(-80, -150, 70, 180, 210, -95); ctx.stroke();
  const px = -210 + phaseMap(t) * 420; const py = 110 - Math.sin(phaseMap(t) * Math.PI) * 190;
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function phaseMap(t: number) { return (t * 0.16) % 1; }
function drawHistory(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save(); ctx.translate(360, 370);
  ctx.strokeStyle = accent; ctx.lineWidth = 5; line(ctx, -260, 80, 260, 80, accent, 5);
  for (let i = 0; i < 5; i++) {
    const x = -220 + i * 110;
    ctx.fillStyle = i === Math.floor((t * 0.6) % 5) ? accent : "#23394b";
    ctx.beginPath(); ctx.arc(x, 80, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e9eff7"; ctx.font = "18px Arial"; ctx.textAlign = "center"; ctx.fillText(String(1960 + i * 10), x, 125);
    ctx.strokeStyle = accent; ctx.globalAlpha = 0.5; line(ctx, x, 60, x, -80 - (i % 2) * 35, accent, 2); ctx.globalAlpha = 1;
    ctx.fillStyle = "#182b3d"; roundedRect(ctx, x - 38, -170 - (i % 2) * 35, 76, 82, 8); ctx.fill(); ctx.strokeStyle = accent; ctx.stroke();
  }
  ctx.restore(); ctx.textAlign = "left";
}
function drawData(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save(); ctx.translate(360, 410);
  line(ctx, -240, 160, 240, 160, "#8292a8", 3); line(ctx, -240, 160, -240, -180, "#8292a8", 3);
  for (let i = 0; i < 6; i++) {
    const h = 65 + (i * 29) + Math.max(0, Math.sin(t * 1.7 - i * 0.4)) * 85;
    ctx.fillStyle = i % 2 ? accent : "#547c9b";
    roundedRect(ctx, -195 + i * 72, 155 - h, 42, h, 8); ctx.fill();
  }
  ctx.restore();
}
function drawScience(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save(); ctx.translate(360, 370);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(0, 0, 190, 75, i * Math.PI / 3 + t * 0.2, 0, Math.PI * 2);
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.globalAlpha = 0.75; ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.fillStyle = "#eaf5ff"; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent;
  for (let i = 0; i < 8; i++) { const a = t * 0.8 + i * Math.PI / 4; ctx.beginPath(); ctx.arc(Math.cos(a) * 190, Math.sin(a) * 75, 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function drawGeneric(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  const cx = 360; const cy = 370;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.12);
  for (let i = 0; i < 5; i++) { ctx.strokeStyle = accent; ctx.globalAlpha = 0.7 - i * 0.1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 60 + i * 34, 0, Math.PI * 1.6); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 130);
  glow.addColorStop(0, `${accent}88`); glow.addColorStop(1, `${accent}00`);
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.fill();
}
function drawVisual(ctx: CanvasRenderingContext2D, kind: VisualKind | undefined, t: number, accent: string, phase: number) {
  switch (kind) {
    case "space": drawSpace(ctx, t, accent, phase); break;
    case "computer": drawComputer(ctx, t, accent, phase); break;
    case "phone": drawPhone(ctx, t, accent); break;
    case "map": drawMap(ctx, t, accent); break;
    case "history": drawHistory(ctx, t, accent); break;
    case "science": drawScience(ctx, t, accent); break;
    case "data": drawData(ctx, t, accent); break;
    default: drawGeneric(ctx, t, accent);
  }
}
function drawFrame(ctx: CanvasRenderingContext2D, project: VideoProject, elapsed: number) {
  const total = project.duration;
  const sceneIndex = Math.min(project.scenes.length - 1, Math.floor((elapsed / total) * project.scenes.length));
  const scene: Scene = project.scenes[sceneIndex];
  const localProgress = (elapsed / total) * project.scenes.length - sceneIndex;
  const accent = project.style === "cinematic" ? "#ff766e" : project.style === "documentary" ? "#e8c878" : "#70e4dc";
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#101b2c"); bg.addColorStop(0.55, "#080d17"); bg.addColorStop(1, "#05070c");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = accent; ctx.lineWidth = 1;
  const shift = (elapsed * 12) % 64;
  for (let x = -64 + shift; x < W + 64; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 120, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  drawVisual(ctx, scene.visualKind, elapsed, accent, localProgress);

  ctx.fillStyle = accent; ctx.font = "600 19px Arial"; ctx.fillText("RANDOM_VID  /  TOPIC VISUALS", 52, 82);
  ctx.fillStyle = "#8292a8"; ctx.font = "16px Arial";
  ctx.fillText(`SCENE ${String(sceneIndex + 1).padStart(2, "0")}  /  ${String(project.scenes.length).padStart(2, "0")}`, 52, 119);
  roundedRect(ctx, 52, 145, 616, 5, 2); ctx.fillStyle = "#283648"; ctx.fill();
  roundedRect(ctx, 52, 145, 616 * ((sceneIndex + localProgress) / project.scenes.length), 5, 2); ctx.fillStyle = accent; ctx.fill();

  ctx.fillStyle = accent; ctx.font = "600 17px Arial";
  wrapText(ctx, scene.title.toUpperCase(), 52, 790, 610, 25);
  ctx.fillStyle = "#f4f7fb"; ctx.font = "700 48px Arial";
  wrapText(ctx, scene.onScreenText || scene.title.toUpperCase(), 52, 860, 610, 58);
  ctx.fillStyle = "#aeb9c8"; ctx.font = "21px Arial";
  wrapText(ctx, scene.visual, 52, 1015, 600, 30);

  ctx.fillStyle = "#77869a"; ctx.font = "16px Arial";
  ctx.fillText("A STORY IN MOTION", 52, 1190);
  ctx.fillText(`${Math.floor(elapsed).toString().padStart(2, "0")}s  /  ${total}s`, 570, 1190);
  const fade = Math.min(1, localProgress * 5 + 0.15);
  ctx.fillStyle = `rgba(5, 8, 14, ${Math.max(0, 0.16 - fade * 0.16)})`; ctx.fillRect(0, 0, W, H);
}

export async function renderProjectToWebM(project: VideoProject, canvas: HTMLCanvasElement, onProgress: ProgressHandler = () => undefined): Promise<Blob> {
  if (!canvas.captureStream || typeof MediaRecorder === "undefined") throw new Error("Este navegador no permite exportar video desde Canvas. Prueba con Chrome actualizado.");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el motor gráfico del navegador.");
  canvas.width = W; canvas.height = H;
  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error("Este navegador no ofrece un formato de grabación compatible.");
  const stream = canvas.captureStream(30);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  return new Promise<Blob>((resolve, reject) => {
    let animation = 0;
    const startedAt = performance.now();
    const durationMs = project.duration * 1000;
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
    recorder.onerror = () => { cancelAnimationFrame(animation); stream.getTracks().forEach((track) => track.stop()); reject(new Error("La grabación del video se interrumpió.")); };
    recorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); onProgress(100); resolve(new Blob(chunks, { type: mimeType })); };
    const frame = (now: number) => {
      const elapsedMs = Math.min(durationMs, now - startedAt);
      drawFrame(ctx, project, elapsedMs / 1000);
      onProgress(Math.min(99, Math.round((elapsedMs / durationMs) * 100)));
      if (elapsedMs >= durationMs) { recorder.stop(); return; }
      animation = requestAnimationFrame(frame);
    };
    recorder.start(1000);
    animation = requestAnimationFrame(frame);
  });
}
