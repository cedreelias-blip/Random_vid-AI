import { useMemo, useRef, useState } from "react";
import { createLocalProject } from "./ai/director";
import { renderProjectToWebM } from "./render/renderer";
import { loadProjects, saveProject } from "./storage/projects";
import type { VideoProject, VisualStyle } from "./types";

const styles: { value: VisualStyle; label: string }[] = [
  { value: "auto", label: "Auto · el director elige" },
  { value: "tech", label: "Tecnología" },
  { value: "documentary", label: "Documental" },
  { value: "cinematic", label: "Cinematográfico" },
  { value: "minimal", label: "Minimalista" }
];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<VisualStyle>("auto");
  const [duration, setDuration] = useState(45);
  const [language, setLanguage] = useState("English");
  const [project, setProject] = useState<VideoProject | null>(null);
  const [projects, setProjects] = useState<VideoProject[]>(() => loadProjects());
  const [notice, setNotice] = useState("");
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneTotal = useMemo(() => project?.scenes.reduce((sum, scene) => sum + scene.duration, 0) ?? 0, [project]);

  function generate() {
    if (prompt.trim().length < 8) {
      setNotice("Escribe una idea un poco más detallada (mínimo 8 caracteres).");
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    const next = createLocalProject(prompt, { style, duration, language });
    setProject(next);
    setProjects(saveProject(next));
    setNotice("Storyboard inicial creado. Ya puedes producir una primera animación.");
  }

  function openProject(item: VideoProject) {
    setProject(item);
    setPrompt(item.prompt);
    setVideoUrl("");
    setNotice("Proyecto cargado.");
  }

  async function renderVideo() {
    if (!project || !canvasRef.current || rendering) return;
    setRendering(true);
    setRenderProgress(0);
    setNotice("Produciendo animación. Mantén esta pestaña abierta hasta terminar.");
    try {
      const blob = await renderProjectToWebM(project, canvasRef.current, setRenderProgress);
      const nextUrl = URL.createObjectURL(blob);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(nextUrl);
      setNotice("¡Video animado listo! Puedes reproducirlo o guardarlo.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo exportar el video.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Random vid AI inicio">
          <span className="brand-mark">R<span>V</span></span>
          <span>RANDOM_VID <b>AI</b></span>
        </a>
        <span className="top-tag"><i /> STUDIO / BETA</span>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><span className="spark">✳</span> YOUR IDEA. DIRECTED BY AI.</div>
        <h1>Ideas into<br /><em>moving stories.</em></h1>
        <p className="hero-copy">Un director creativo para convertir una idea en un plan de video vertical. Escribe el concepto; nosotros organizamos la historia.</p>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div><span className="step">01 / BRIEF</span><h2>Cuéntame tu idea</h2></div>
          <span className="format-pill">9:16 · VERTICAL</span>
        </div>

        <label className="field-label" htmlFor="idea">¿De qué tratará tu video?</label>
        <textarea id="idea" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ej. The hidden technology that made the Apollo 11 Moon landing possible..." rows={4} />

        <div className="settings-grid">
          <div className="setting">
            <label className="field-label" htmlFor="style">Dirección visual</label>
            <select id="style" value={style} onChange={(event) => setStyle(event.target.value as VisualStyle)}>
              {styles.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="setting">
            <label className="field-label" htmlFor="language">Idioma del guion</label>
            <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option>English</option><option>Español</option><option>Português</option><option>Français</option>
            </select>
          </div>
        </div>

        <div className="duration-row">
          <label className="field-label" htmlFor="duration">Duración aproximada</label>
          <div className="duration-control"><input id="duration" type="range" min="20" max="85" step="5" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><strong>{duration}s</strong></div>
        </div>

        <button className="generate-button" onClick={generate}><span>✳</span> Create my video plan <b>↗</b></button>
        <p className="microcopy">Director local y storyboard. No requiere API ni servicios de pago.</p>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>

      {project && <section className="result-section">
        <div className="section-heading result-heading">
          <div><span className="step">02 / DIRECTOR'S CUT</span><h2>{project.title}</h2></div>
          <span className="format-pill">{sceneTotal}s · {project.style.toUpperCase()}</span>
        </div>
        <div className="timeline">
          {project.scenes.map((scene, index) => <article className="scene-card" key={scene.id}>
            <div className="scene-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="scene-body">
              <div className="scene-meta"><b>{scene.title}</b><span>{scene.duration}s</span></div>
              <p>{scene.narration}</p>
              <div className="visual-note"><span>VISUAL DIRECTION</span>{scene.visual}</div>
              <div className="on-screen">ON SCREEN: {scene.onScreenText}</div>
            </div>
          </article>)}
        </div>

        <div className="render-panel">
          <div className="render-heading"><span className="step">03 / MOTION ENGINE</span><span className="format-pill">720 × 1280 · 30 FPS</span></div>
          <h3>Produce your animated video</h3>
          <p>El motor crea fondos, movimiento, elementos gráficos y textos animados a partir de las escenas.</p>
          <canvas ref={canvasRef} className="render-canvas" aria-label="Vista previa de la animación generada" />
          <button className="generate-button render-button" onClick={renderVideo} disabled={rendering}>
            {rendering ? `Produciendo… ${renderProgress}%` : "Render animated video"}
            <b>{rendering ? "◌" : "↗"}</b>
          </button>
          {rendering && <div className="progress-track"><span style={{ width: `${renderProgress}%` }} /></div>}
          {videoUrl && <div className="video-result">
            <video controls playsInline src={videoUrl} />
            <a className="download-link" href={videoUrl} download={`random-vid-${project.id}.webm`}>↓ Guardar video WebM</a>
          </div>}
          <p className="microcopy">Primera versión: video animado sin narración ni música. La exportación depende de la compatibilidad del navegador; se genera en este dispositivo.</p>
        </div>
      </section>}

      <section className="library-section">
        <div className="section-heading"><div><span className="step">04 / LIBRARY</span><h2>Your projects</h2></div><span className="count">{projects.length} SAVED</span></div>
        {projects.length === 0 ? <p className="empty-state">Tus proyectos aparecerán aquí cuando crees el primero.</p> : <div className="project-list">
          {projects.map((item) => <button className="project-item" key={item.id} onClick={() => openProject(item)}><span className="project-dot">▶</span><span><b>{item.title}</b><small>{new Date(item.createdAt).toLocaleDateString()} · {item.duration}s · {item.style}</small></span><span className="project-arrow">↗</span></button>)}
        </div>}
      </section>

      <footer><span>RANDOM_VID AI</span><span>BUILT FOR STORIES · 2026</span></footer>
    </main>
  );
}
