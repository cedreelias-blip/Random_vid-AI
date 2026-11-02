import type { VideoProject } from "../types";

type ProgressHandler = (value: number) => void;

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
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
    } else {
      line = candidate;
    }
  }
  if (line) ctx.fillText(line, x, y + offset);
}

function drawFrame(ctx: CanvasRenderingContext2D, project: VideoProject, elapsed: number) {
  const width = 720;
  const height = 1280;
  const total = project.duration;
  const sceneIndex = Math.min(project.scenes.length - 1, Math.floor((elapsed / total) * project.scenes.length));
  const scene = project.scenes[sceneIndex];
  const localProgress = (elapsed / total) * project.scenes.length - sceneIndex;
  const t = elapsed;
  const accent = project.style === "cinematic" ? "#ff766e" : project.style === "documentary" ? "#e8c878" : "#70e4dc";

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#101b2c");
  bg.addColorStop(0.55, "#080d17");
  bg.addColorStop(1, "#05070c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle animated technical grid.
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  const shift = (t * 12) % 64;
  for (let x = -64 + shift; x < width + 64; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 120, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.restore();

  // Moving orbital rings and focal point.
  const cx = width / 2;
  const cy = 470;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.16);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 145 + i * 43, 58 + i * 23, i * 0.38, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.42 - i * 0.1;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
  const pulse = 1 + Math.sin(t * 2.2) * 0.08;
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 150 * pulse);
  glow.addColorStop(0, `${accent}55`);
  glow.addColorStop(1, `${accent}00`);
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, 150 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(cx, cy, 7 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Header and scene marker.
  ctx.fillStyle = accent;
  ctx.font = "600 19px Arial";
  ctx.fillText("RANDOM_VID  /  ORIGINAL MOTION", 52, 82);
  ctx.fillStyle = "#8292a8";
  ctx.font = "16px Arial";
  ctx.fillText(`SCENE ${String(sceneIndex + 1).padStart(2, "0")}  /  ${String(project.scenes.length).padStart(2, "0")}`, 52, 119);

  // Animated progress line.
  roundedRect(ctx, 52, 145, 616, 4, 2);
  ctx.fillStyle = "#283648"; ctx.fill();
  roundedRect(ctx, 52, 145, 616 * ((sceneIndex + localProgress) / project.scenes.length), 4, 2);
  ctx.fillStyle = accent; ctx.fill();

  // Editorial title and supporting text.
  ctx.fillStyle = "#f4f7fb";
  ctx.font = "700 54px Arial";
  wrapText(ctx, scene.onScreenText || scene.title.toUpperCase(), 52, 760, 610, 66);
  ctx.fillStyle = "#aeb9c8";
  ctx.font = "25px Arial";
  wrapText(ctx, scene.title, 52, 920, 600, 36);

  // Animated equalizer-like bars make each scene feel alive.
  const baseY = 1080;
  for (let i = 0; i < 28; i++) {
    const barHeight = 12 + (Math.sin(t * 2.4 + i * 0.62) + 1) * (22 + (i % 5) * 5);
    ctx.globalAlpha = 0.45 + (i % 4) * 0.12;
    ctx.fillStyle = accent;
    roundedRect(ctx, 52 + i * 22, baseY - barHeight, 11, barHeight, 5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#77869a";
  ctx.font = "16px Arial";
  ctx.fillText("A STORY IN MOTION", 52, 1170);
  ctx.fillText(`${Math.floor(elapsed).toString().padStart(2, "0")}s  /  ${total}s`, 570, 1170);

  // Soft scene entrance.
  const fade = Math.min(1, localProgress * 5 + 0.15);
  ctx.fillStyle = `rgba(5, 8, 14, ${Math.max(0, 0.18 - fade * 0.18)})`;
  ctx.fillRect(0, 0, width, height);
}

export async function renderProjectToWebM(
  project: VideoProject,
  canvas: HTMLCanvasElement,
  onProgress: ProgressHandler = () => undefined
): Promise<Blob> {
  if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
    throw new Error("Este navegador no permite exportar video desde Canvas. Prueba con Chrome actualizado.");
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el motor gráfico del navegador.");

  canvas.width = 720;
  canvas.height = 1280;
  const mimeType = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error("Este navegador no ofrece un formato de grabación compatible.");

  const stream = canvas.captureStream(30);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });

  return new Promise<Blob>((resolve, reject) => {
    let animation = 0;
    const startedAt = performance.now();
    const durationMs = project.duration * 1000;
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
    recorder.onerror = () => {
      cancelAnimationFrame(animation);
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("La grabación del video se interrumpió."));
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      onProgress(100);
      resolve(new Blob(chunks, { type: mimeType }));
    };

    const frame = (now: number) => {
      const elapsedMs = Math.min(durationMs, now - startedAt);
      drawFrame(ctx, project, elapsedMs / 1000);
      onProgress(Math.min(99, Math.round((elapsedMs / durationMs) * 100)));
      if (elapsedMs >= durationMs) {
        recorder.stop();
        return;
      }
      animation = requestAnimationFrame(frame);
    };

    recorder.start(1000);
    animation = requestAnimationFrame(frame);
  });
}
