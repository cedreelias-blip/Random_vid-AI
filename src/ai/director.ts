import type { Scene, VideoProject, VisualKind, VisualStyle } from "../types";

function chooseStyle(prompt: string, requested: VisualStyle): Exclude<VisualStyle, "auto"> {
  if (requested !== "auto") return requested;
  const value = prompt.toLowerCase();
  if (/space|spacex|nasa|apollo|moon|lunar|rocket|satellite|computer|technology|science|chip|phone|smartphone/.test(value)) return "tech";
  if (/history|documentary|true story|facts|explained/.test(value)) return "documentary";
  if (/mystery|horror|thriller|dramatic/.test(value)) return "cinematic";
  return "minimal";
}

function detectVisualKind(prompt: string): VisualKind {
  const value = prompt.toLowerCase();
  // Specific subject terms must win over broad mission/space terms:
  // "Apollo 11 computer vs smartphone" is a computer comparison, not a space scene.
  if (/computer|processor|cpu|chip|guidance computer|memory|ram|semiconductor|technology/.test(value)) return "computer";
  if (/phone|smartphone|mobile|iphone|android|touchscreen/.test(value)) return "phone";
  if (/apollo|moon|lunar|space|nasa|rocket|spacex|astronaut|planet|satellite/.test(value)) return "space";
  if (/map|country|city|travel|location|route|border|geography/.test(value)) return "map";
  if (/history|ancient|century|war|historical|civilization|past/.test(value)) return "history";
  if (/science|physics|biology|atom|energy|experiment|climate/.test(value)) return "science";
  if (/data|statistics|comparison|versus| vs |speed|number|percentage|chart/.test(value)) return "data";
  return "generic";
}

const sceneBeats = [
  { title: "The surprising question", text: "LOOK CLOSER", visual: "A dramatic hero reveal introduces the subject with a moving focal object." },
  { title: "The essential context", text: "THE BIG PICTURE", visual: "A wide composition establishes the subject and its scale." },
  { title: "How it works", text: "INSIDE THE SYSTEM", visual: "A simplified animated breakdown reveals the key parts and connections." },
  { title: "The key detail", text: "THE DETAIL THAT MATTERS", visual: "A close-up highlights one important feature with labels and callouts." },
  { title: "The challenge", text: "THE BIG CHALLENGE", visual: "A visual contrast illustrates the limitation, risk, or turning point." },
  { title: "What it means", text: "WHY IT MATTERS", visual: "A final composed reveal connects the details to the bigger story." }
];

const visualPlans: Record<VisualKind, string[]> = {
  space: ["A planet or Moon rises behind a moving spacecraft silhouette.", "A star map and orbital path establish the mission's destination.", "A spacecraft schematic separates the major stages and components.", "A lunar surface close-up uses a moving lander silhouette and altitude markers.", "A warning panel and trajectory line show the mission's critical moment.", "The Moon, Earth, and spacecraft align in a final orbital composition."],
  computer: ["A glowing processor package appears with animated circuit traces.", "A scale comparison introduces the machine and its era.", "A chip diagram reveals memory, processing, and input-output blocks.", "A close-up memory grid lights up cell by cell.", "A performance meter contrasts constraints and capability.", "A processor outline resolves into a clean technical hero shot."],
  phone: ["A smartphone silhouette rotates into view with a bright screen reveal.", "A size comparison places the device beside familiar objects.", "Layered phone components separate into a clean exploded view.", "A close-up highlights the screen, camera, or chip area.", "A battery or performance meter shows the trade-off.", "The phone returns as a polished product-style hero shot."],
  map: ["A globe rotates and zooms toward the story's region.", "A map grid reveals the wider geographic context.", "A route draws itself between highlighted locations.", "A map pin and callout spotlight the key place.", "Two map regions compare distance, scale, or boundaries.", "The route and destination settle into a final map composition."],
  history: ["A timeline marker emerges from a textured archival-style background.", "A dated timeline establishes the era and context.", "An illustrated artifact or landmark appears in layered perspective.", "A close-up frame highlights the pivotal detail.", "A timeline branches to show the turning point and consequence.", "The timeline resolves on the event's lasting significance."],
  science: ["A glowing scientific object appears as a dramatic macro reveal.", "A labeled scale or environment establishes the phenomenon.", "Animated particles and connected diagrams explain the process.", "A magnified detail reveals the underlying mechanism.", "A measurement gauge visualizes the challenge or limit.", "The phenomenon resolves into a clear explanatory diagram."],
  data: ["A bold number counter introduces the central comparison.", "Two metric cards slide into a side-by-side comparison.", "An animated chart builds from axes to data bars.", "A highlighted data point expands with a callout.", "A gauge compares the two outcomes.", "A final comparison graphic summarizes the takeaway."],
  generic: ["A bold central object emerges from a moving spotlight.", "A layered composition introduces the subject and context.", "Connected cards reveal the main parts of the idea.", "A close-up panel highlights the most interesting detail.", "A split-screen contrast shows the central tension.", "A clean final graphic reinforces the takeaway."]
};

function splitIntoScenes(prompt: string, count: number): Scene[] {
  const kind = detectVisualKind(prompt);
  return Array.from({ length: count }, (_, index) => {
    const beat = sceneBeats[index % sceneBeats.length];
    const plan = visualPlans[kind][index % visualPlans[kind].length];
    return {
      id: `scene-${index + 1}`,
      title: beat.title,
      narration: index === 0 ? `What makes this story so surprising? ${prompt.trim()}` : beat.title + ". " + beat.visual,
      visual: plan,
      visualKind: kind,
      onScreenText: beat.text,
      duration: 8,
      transition: index === 0 ? "fade" : index % 2 ? "cut" : "zoom"
    };
  });
}

/** Offline visual director: creates topic-aware storyboard directions without claiming factual research. */
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