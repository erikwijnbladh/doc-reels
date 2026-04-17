# Doc Reels

Brain-rot your way to enlightenment. Paste any docs URL and get 5 TikTok-style reels with Minecraft/Subway Surfers gameplay and AI voiceover — because nobody actually reads docs.

## What it does

1. You paste a documentation URL
2. Claude reads the docs and writes 5 punchy, casual scripts covering the key concepts
3. ElevenLabs converts each script to speech with character-level timestamp sync
4. The reels play as vertical videos with gameplay footage in the background and live subtitles

## Stack

- **Backend** — Bun + ElysiaJS (port 3001)
- **AI** — Claude `claude-opus-4-6` for script generation
- **TTS** — ElevenLabs `eleven_flash_v2_5` with `/with-timestamps` for subtitle sync
- **Video** — Remotion `@remotion/player` for in-browser composition
- **Streaming** — Server-Sent Events for live generation progress

## Setup

### Prerequisites

- [Bun](https://bun.sh)
- [ffmpeg](https://ffmpeg.org) (for splitting background videos)
- Claude API key
- ElevenLabs API key

### Install

```bash
bun install
```

### Environment

Create `api/.env`:

```env
ANTHROPIC_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
PEXELS_API_KEY=your_key_here   # optional fallback
```

### Background videos

Drop any long gameplay clips (Minecraft, Subway Surfers, etc.) into `vids/`, then split them into 45-second segments:

```bash
bun run split
```

Segments land in `api/public/videos/`. The first and last segment of each clip are skipped automatically (intros/outros).

### Run

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## Project structure

```
doc-reels/
├── api/
│   └── src/
│       ├── index.ts          # ElysiaJS server, SSE streaming
│       └── services/
│           ├── ai.ts         # Claude script generation
│           ├── tts.ts        # ElevenLabs TTS + subtitle timestamps
│           └── videos.ts     # Background video selection
├── web/
│   └── src/
│       ├── App.tsx           # Root layout, mobile/desktop split
│       ├── components/
│       │   ├── ReelFeed.tsx  # Snap-scroll feed
│       │   ├── ReelCard.tsx  # Single reel with Remotion Player
│       │   ├── Sidebar.tsx   # Desktop URL input
│       │   ├── TopBar.tsx    # Mobile header
│       │   └── BottomSheet.tsx  # Mobile URL input sheet
│       ├── remotion/
│       │   └── DocReel.tsx   # Remotion composition (video + audio + subtitles)
│       └── hooks/
│           └── useWindowSize.ts
├── scripts/
│   └── split-videos.ts       # ffmpeg video splitter
└── vids/                     # Raw gameplay footage (gitignored)
```

## Mobile

Fully responsive. On mobile: fixed top bar with a "+" button opens a bottom sheet to paste the URL. Reels scale to fit the viewport and snap-scroll vertically.
