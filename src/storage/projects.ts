import type { VideoProject } from "../types";

const STORAGE_KEY = "random-vid-ai.projects.v1";

export function loadProjects(): VideoProject[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as VideoProject[];
  } catch {
    return [];
  }
}

export function saveProject(project: VideoProject): VideoProject[] {
  const projects = [project, ...loadProjects().filter((item) => item.id !== project.id)].slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
}