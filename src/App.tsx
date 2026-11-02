import { useMemo, useState } from "react";
import { createLocalProject } from "./ai/director";
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

  const sceneTotal = useMemo(() => project?.scenes.reduce((sum, scene) => sum + scene.duration, 0) ?? 0, [project]);

  function generate() {
    if (prompt.trim().length < 8) {
      setNotice("Escribe una idea un poco más detallada (mínimo 8 caracteres).");
      return;
    }
    const next = createLocalProject(prompt, { style, duration, language });
    setProject(next);
    setProjects(saveProject(next));
    setNotice("Storyboard inicial creado y guardado en este dispositivo.");
  }

  function openProject(item: VideoProject) {
    setProject(item);
    setPrompt(item.prompt);
    setNotice("Proyecto cargado.");
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
        <p className="microcopy">Primera fase: director y storyboard local. No requiere API ni servicios de pago.</p>
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
        <div className="export-note"><span className="export-icon">↗</span><div><b>Storyboard ready</b><p>Esta versión organiza escenas e ideas. La generación de imágenes, animaciones y exportación MP4 se incorporará en las siguientes fases.</p></div></div>
      </section>}

      <section className="library-section">
        <div className="section-heading"><div><span className="step">03 / LIBRARY</span><h2>Your projects</h2></div><span className="count">{projects.length} SAVED</span></div>
        {projects.length === 0 ? <p className="empty-state">Tus proyectos aparecerán aquí cuando crees el primero.</p> : <div className="project-list">
          {projects.map((item) => <button className="project-item" key={item.id} onClick={() => openProject(item)}><span className="project-dot">▶</span><span><b>{item.title}</b><small>{new Date(item.createdAt).toLocaleDateString()} · {item.duration}s · {item.style}</small></span><span className="project-arrow">↗</span></button>)}
        </div>}
      </section>

      <footer><span>RANDOM_VID AI</span><span>BUILT FOR STORIES · 2026</span></footer>
    </main>
  );
}