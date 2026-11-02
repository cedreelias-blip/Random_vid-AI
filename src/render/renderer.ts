import type { Scene, VideoProject, VisualKind } from "../types";

type ProgressHandler = (value: number) => void;
const W = 720;
const H = 1280;

interface VisualAsset { image: HTMLImageElement; credit: string; }

async function loadVisualAssets(project: VideoProject): Promise<VisualAsset[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);
  try {
    const query = encodeURIComponent(project.prompt + " " + (project.scenes[0]?.visualKind ?? ""));
    const endpoint = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" + query + "&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json&origin=*";
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json() as { query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; extmetadata?: Record<string, { value?: string }> }> }> } };
    const pages = Object.values(data.query?.pages ?? {});
    const results = await Promise.all(pages.map(async (page) => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl) return null;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = info.thumburl;
      try {
        await Promise.race([
          image.decode(),
          new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Image load timeout")), 3500))
        ]);
      } catch {
        image.src = "";
        return null;
      }
      const artist = (info.extmetadata?.Artist?.value ?? "Wikimedia Commons").replace(/<[^>]*>/g, "").slice(0, 70);
      const license = (info.extmetadata?.LicenseShortName?.value ?? "license varies").replace(/<[^>]*>/g, "").slice(0, 30);
      return { image, credit: artist + " · " + license } as VisualAsset;
    }));
    return results.filter((item): item is VisualAsset => item !== null);
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeout);
  }
}
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
function drawFrame(ctx: CanvasRenderingContext2D, project: VideoProject, elapsed: number, assets: VisualAsset[]) {
  const total=project.duration, sceneIndex=Math.min(project.scenes.length-1,Math.floor(elapsed/total*project.scenes.length));
  const scene:Scene=project.scenes[sceneIndex], localProgress=elapsed/total*project.scenes.length-sceneIndex;
  const accent=project.style==="cinematic"?"#ff766e":project.style==="documentary"?"#e8c878":"#70e4dc";
  const kind=scene.visualKind??"generic", ease=1-Math.pow(1-Math.min(1,localProgress),3);
  const camera=.96+ease*.055+Math.sin(elapsed*.7)*.008;
  const bg=ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,"#101d30"); bg.addColorStop(.48,"#080e19"); bg.addColorStop(1,"#03060c");
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  if (assets.length) {
    const asset=assets[sceneIndex % assets.length], image=asset.image;
    const scale=Math.max(W/image.width,650/image.height);
    const iw=image.width*scale, ih=image.height*scale;
    ctx.save();ctx.globalAlpha=.48;ctx.drawImage(image,(W-iw)/2,(650-ih)/2,iw,ih);ctx.restore();
    const shade=ctx.createLinearGradient(0,0,0,760);shade.addColorStop(0,"#07101a55");shade.addColorStop(.78,"#07101aee");shade.addColorStop(1,"#080e19");
    ctx.fillStyle=shade;ctx.fillRect(0,0,W,760);
  }
  const glow=ctx.createRadialGradient(360+Math.sin(elapsed*.22)*150,390,10,360,420,620);
  glow.addColorStop(0,accent+"24");glow.addColorStop(1,"#05070c00");ctx.fillStyle=glow;ctx.fillRect(0,0,W,850);
  ctx.save();ctx.globalAlpha=.09;ctx.strokeStyle=accent;ctx.lineWidth=1;const shift=elapsed*9%72;
  for(let x=-72+shift;x<W+72;x+=72){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-170,850);ctx.stroke();}
  for(let y=0;y<850;y+=72){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.restore();
  ctx.save();ctx.translate(W/2,390);ctx.scale(camera,camera);ctx.translate(-W/2,-390);drawVisual(ctx,kind,elapsed,accent,localProgress);ctx.restore();

  const labels:Record<string,string[]>={computer:["PROCESSING UNIT","MEMORY SYSTEM","INPUT / OUTPUT"],phone:["MOBILE COMPUTING","INTEGRATED DESIGN","REAL-TIME SYSTEM"],space:["MISSION PROFILE","FLIGHT PATH","CRITICAL SYSTEMS"],map:["LOCATION","ROUTE ANALYSIS","GEOGRAPHIC CONTEXT"],history:["TIMELINE","KEY EVENT","HISTORICAL CONTEXT"],science:["OBSERVATION","MECHANISM","MEASUREMENT"],data:["BASELINE","COMPARISON","RESULT"]};
  const tags=labels[kind]??["OVERVIEW","KEY DETAIL","TAKEAWAY"], active=Math.min(2,Math.floor(localProgress*3));
  ctx.save();ctx.fillStyle="#091421dd";ctx.strokeStyle=accent+"88";ctx.lineWidth=1.5;roundedRect(ctx,42,626,636,82,18);ctx.fill();ctx.stroke();
  for(let i=0;i<3;i++){const x=62+i*210;ctx.fillStyle=i===active?accent:"#71849b";ctx.beginPath();ctx.arc(x,651,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=i===active?"#f4f8ff":"#91a0b4";ctx.font="600 12px Arial";ctx.textAlign="left";ctx.fillText(tags[i],x+13,655);if(i<2)line(ctx,x+13,675,x+174,675,"#26394c",2);}ctx.restore();

  ctx.fillStyle=accent;ctx.font="700 18px Arial";ctx.fillText("RANDOM_VID  /  FIELD NOTES",48,66);
  ctx.fillStyle="#8292a8";ctx.font="14px Arial";ctx.fillText(kind.toUpperCase()+"  •  VISUAL STORY",48,94);
  ctx.textAlign="right";ctx.fillText(String(sceneIndex+1).padStart(2,"0")+" / "+String(project.scenes.length).padStart(2,"0"),672,66);ctx.textAlign="left";
  ctx.fillStyle="#263648";roundedRect(ctx,48,116,624,4,2);ctx.fill();ctx.fillStyle=accent;roundedRect(ctx,48,116,624*((sceneIndex+localProgress)/project.scenes.length),4,2);ctx.fill();
  const panel=ctx.createLinearGradient(0,748,0,1160);panel.addColorStop(0,"#0b1422ee");panel.addColorStop(1,"#070b13f5");
  ctx.fillStyle=panel;roundedRect(ctx,34,748,652,402,26);ctx.fill();ctx.strokeStyle="#ffffff18";ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=accent;ctx.font="700 16px Arial";wrapText(ctx,scene.title.toUpperCase(),62,798,590,23);
  ctx.fillStyle="#f5f7fb";ctx.font="700 43px Arial";wrapText(ctx,scene.onScreenText||scene.title.toUpperCase(),62,870,590,52);
  ctx.fillStyle="#aebdce";ctx.font="20px Arial";wrapText(ctx,scene.visual,62,1002,585,29);
  ctx.fillStyle="#243448";roundedRect(ctx,62,1090,590,3,2);ctx.fill();ctx.fillStyle=accent;roundedRect(ctx,62,1090,590*Math.max(.04,localProgress),3,2);ctx.fill();
  ctx.fillStyle="#8292a8";ctx.font="14px Arial";ctx.fillText("A STORY IN MOTION",48,1205);
  if (assets.length) { ctx.font="10px Arial";ctx.fillStyle="#91a0b4";ctx.fillText("IMAGE: "+assets[sceneIndex % assets.length].credit,48,1230); }ctx.textAlign="right";ctx.fillText(Math.floor(elapsed).toString().padStart(2,"0")+"s / "+total+"s",672,1205);ctx.textAlign="left";
  const flash=Math.max(0,1-localProgress*7);if(flash>0){ctx.fillStyle="rgba(225,240,255,"+(flash*.12)+")";ctx.fillRect(0,0,W,H);}
}
export async function renderProjectToWebM(project: VideoProject, canvas: HTMLCanvasElement, onProgress: ProgressHandler = () => undefined): Promise<Blob> {
  if (!canvas.captureStream || typeof MediaRecorder === "undefined") throw new Error("Este navegador no permite exportar video desde Canvas. Prueba con Chrome actualizado.");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el motor gráfico del navegador.");
  canvas.width = W; canvas.height = H;
  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error("Este navegador no ofrece un formato de grabación compatible.");
  onProgress(1);
  const assets = await loadVisualAssets(project);
  onProgress(3);
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
      drawFrame(ctx, project, elapsedMs / 1000, assets);
      onProgress(Math.min(99, Math.round((elapsedMs / durationMs) * 100)));
      if (elapsedMs >= durationMs) { recorder.stop(); return; }
      animation = requestAnimationFrame(frame);
    };
    recorder.start(1000);
    animation = requestAnimationFrame(frame);
  });
}
