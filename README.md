# Random_vid AI

An Android-first, zero-cost video planning studio for the Random_vid creator workflow.

## Current status

The first version includes:
- Mobile-first React + TypeScript interface.
- Prompt, language, duration, and visual-style controls.
- Local storyboard planning and project saving in the browser.
- GitHub Actions workflow for GitHub Pages deployment.

**Important:** the current director is an offline storyboard fallback. It is not yet connected to a live AI model, image/video generation provider, narration service, or MP4 renderer. No paid API or secret key is required for the current prototype.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

In the repository settings, open **Pages** and choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/deploy.yml` publishes the `dist` directory after each push to `main`.

Expected site URL:

https://cedreelias-blip.github.io/Random_vid-AI/

## Roadmap

1. Prompt understanding and reliable AI-directed storyboards.
2. Animated scene engine with reusable motion-graphics templates.
3. Optional free-tier provider adapters through a secure backend proxy.
4. Browser-based video rendering with device capability checks and export fallback.

Never place private API keys in this public repository or in browser-side code.
