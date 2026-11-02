import type { Scene, VideoProject, VisualStyle } from "../types";

function chooseStyle(prompt: string, requested: VisualStyle): Exclude<VisualStyle, "auto"> {
  if (requested !== "auto") return requested;
  const value = prompt.toLowerCase();
  if (/space|spacex|nasa|ai|artificial intelligence|computer|technology|science|satellite/.test(value)) return "tech";
  if (/history|documentary|true story|facts|explained/.test(value)) return "documentary";
  if (/mystery|horror|thriller|dramatic/.test(value)) return "cinematic";
  return "minimal";
}

function splitIntoScenes(prompt: string, count: number): Scene[] {
  const beats = [
    ["The hook", "Open with the most surprising visual. Establish the central question.", "A bold opening image with a slow push-in."],
    ["The big idea", "Introduce the subject clearly and show why it matters.", "A clean visual reveal with a subtle camera move."],
    ["How it works", "Break the concept into a simple visual explanation.", "A sequence of labeled parts, lines, and animated connections."],
    ["The detail", "Highlight one concrete fact or unexpected detail.", "A close-up technical or documentary-style visual."],
    ["The challenge", "Show the limitation, risk, or unanswered question.", "A restrained visual contrast with a measured zoom."],
    ["The takeaway", "End with the central implication and a memorable final image.", "A composed closing frame with the key idea."]
  ];
  return Array.from({ length: count }, (_, index) => {
    const beat = beats[index % beats.length];
    return {
      id: `scene-${index + 1}`,
      title: beat[0],
      narration: index === 0 ? `What if this changes everything? ${prompt.trim()}` : beat[1],
      visual: beat[2],
      onScreenText: beat[0].toUpperCase(),
      duration: 8,
      transition: index === 0 ? "fade" : index % 2 ? "cut" : "zoom"
    };
  });
}

/**
 * Offline fallback director. This creates a storyboard template, not a factual
 * research result or a finished AI-generated video.
 */
export function createLocalProject(prompt: string, options?: {
  style?: VisualStyle;
  duration?: number;
  language?: string;
}): VideoProject {
  const cleanPrompt = prompt.trim();
  const duration = Math.min(85, Math.max(20, options?.duration ?? 45));
  const sceneCount = Math.max(3, Math.ceil(duration / 8));
  const style = chooseStyle(cleanPrompt, options?.style ?? "auto");
  return {
    id: crypto.randomUUID(),
    prompt: cleanPrompt,
    title: cleanPrompt.length > 54 ? `${cleanPrompt.slice(0, 51)}…` : cleanPrompt,
    style,
    duration,
    language: options?.language ?? "English",
    scenes: splitIntoScenes(cleanPrompt, sceneCount).map((scene, index, all) => ({
      ...scene,
      duration: Math.floor(duration / all.length) + (index < duration % all.length ? 1 : 0)
    })),
    createdAt: new Date().toISOString()
  };
}