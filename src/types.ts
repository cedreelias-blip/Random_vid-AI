export type VisualStyle = "auto" | "documentary" | "tech" | "cinematic" | "minimal";

export interface Scene {
  id: string;
  title: string;
  narration: string;
  visual: string;
  onScreenText: string;
  duration: number;
  transition: "cut" | "fade" | "zoom";
}

export interface VideoProject {
  id: string;
  prompt: string;
  title: string;
  style: Exclude<VisualStyle, "auto">;
  duration: number;
  language: string;
  scenes: Scene[];
  createdAt: string;
}