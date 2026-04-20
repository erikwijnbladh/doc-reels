import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { existsSync, readdirSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { fetchDocs } from './services/docs'
import { chunkDocsIntoReels } from './services/ai'
import { generateSpeech, type SubtitleChunk } from './services/tts'
import { fetchBackgroundVideos } from './services/videos'

const WORDS_PER_CHUNK = 6

async function transcribeToChunks(audioBuffer: Buffer): Promise<SubtitleChunk[]> {
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
  const form = new FormData()
  form.append('file', blob, 'audio.mp3')
  form.append('model_id', 'scribe_v1')
  form.append('timestamps_granularity', 'word')

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
    body: form,
  })
  if (!res.ok) throw new Error(`STT error ${res.status}: ${await res.text()}`)

  const data = await res.json() as {
    words: { text: string; start: number; end: number; type: string }[]
  }

  const spoken = data.words.filter((w) => w.type === 'word')
  const chunks: SubtitleChunk[] = []
  for (let i = 0; i < spoken.length; i += WORDS_PER_CHUNK) {
    const slice = spoken.slice(i, i + WORDS_PER_CHUNK)
    chunks.push({
      text: slice.map((w) => w.text).join(' '),
      startTime: slice[0].start,
      endTime: slice[slice.length - 1].end,
    })
  }
  return chunks
}

const AUDIO_DIR = join(import.meta.dir, '../public/audio')
const VIDEO_DIR = join(import.meta.dir, '../public/videos')

await mkdir(VIDEO_DIR, { recursive: true })

/** Local files as fallback when no Pexels key is set */
function pickLocalVideos(count: number): string[] {
  if (!existsSync(VIDEO_DIR)) return []
  const files = readdirSync(VIDEO_DIR)
    .filter((f) => /\.(mp4|webm|mov)$/i.test(f))
    .sort()

  if (files.length === 0) return []

  // Group by source video prefix, drop first and last segment of each group
  const groups = new Map<string, string[]>()
  for (const f of files) {
    const prefix = f.replace(/_\d+\.(mp4|webm|mov)$/i, '')
    if (!groups.has(prefix)) groups.set(prefix, [])
    groups.get(prefix)!.push(f)
  }

  const trimmed: string[] = []
  for (const segments of groups.values()) {
    if (segments.length <= 2) trimmed.push(...segments)
    else trimmed.push(...segments.slice(1, -1))
  }

  const shuffled = trimmed.sort(() => Math.random() - 0.5)
  return Array.from({ length: count }, (_, i) => `/videos/${shuffled[i % shuffled.length]}`)
}

async function getBackgroundVideos(count: number): Promise<(string | null)[]> {
  const pexels = await fetchBackgroundVideos(count)
  if (pexels.length > 0) return pexels
  const local = pickLocalVideos(count)
  return Array.from({ length: count }, (_, i) => local[i] ?? null)
}

const app = new Elysia()
  .use(cors())

  // Demo reel using a saved audio file (transcribes once, caches demo.json)
  .get('/api/demo', async ({ set }) => {
    const files = existsSync(AUDIO_DIR)
      ? readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3'))
      : []
    if (!files.length) {
      set.status = 404
      return 'No demo audio found — put an .mp3 in api/public/audio/'
    }
    const mp3Path = join(AUDIO_DIR, files[0])
    const jsonPath = mp3Path.replace(/\.mp3$/, '.json')

    let subtitleChunks: SubtitleChunk[]
    let title = 'Demo Reel'
    if (existsSync(jsonPath)) {
      const cached = JSON.parse(await readFile(jsonPath, 'utf8'))
      subtitleChunks = cached.subtitleChunks
      title = cached.title ?? title
    } else {
      console.log('[demo] Transcribing audio for subtitle chunks...')
      const audio = await readFile(mp3Path)
      subtitleChunks = await transcribeToChunks(audio)
      await writeFile(jsonPath, JSON.stringify({ title, subtitleChunks }, null, 2))
      console.log('[demo] Cached to', jsonPath)
    }

    const audio = await readFile(mp3Path)
    const audioUrl = `data:audio/mpeg;base64,${audio.toString('base64')}`
    const allVideos = existsSync(VIDEO_DIR)
      ? readdirSync(VIDEO_DIR).filter((f) => /\.(mp4|webm|mov)$/i.test(f))
      : []
    const randomVideo = allVideos.length
      ? `/videos/${allVideos[Math.floor(Math.random() * allVideos.length)]}`
      : null
    return Response.json({
      id: 'demo',
      title,
      script: '',
      audioUrl,
      backgroundVideo: randomVideo,
      subtitleChunks,
    })
  })

  // Serve background videos
  .get('/videos/:filename', async ({ params, set }) => {
    const filepath = join(VIDEO_DIR, params.filename)
    if (!existsSync(filepath)) {
      set.status = 404
      return 'Not found'
    }
    const file = Bun.file(filepath)
    return new Response(file, {
      headers: { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' },
    })
  })

  // Generate reels — streams SSE progress events then final data
  .post('/api/generate', ({ body }) => {
    const { url } = body as { url: string }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: object) =>
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`)

        try {
          send({ type: 'step', message: '📡 Fetching docs...' })
          const docsText = await fetchDocs(url)

          send({ type: 'step', message: `🤖 Asking Claude to make it brainrot...` })
          const scripts = await chunkDocsIntoReels(docsText)

          send({ type: 'step', message: '🎬 Picking background videos...' })
          const videos = await getBackgroundVideos(scripts.length)

          const reels = []
          for (let i = 0; i < scripts.length; i++) {
            send({ type: 'step', message: `🎙️ Generating voice ${i + 1}/${scripts.length} — "${scripts[i].title}"` })
            const { audio, chunks } = await generateSpeech(scripts[i].script).catch((e) => {
              console.error(`[tts] Failed for reel ${i}:`, e.message)
              throw e
            })
            reels.push({
              id: crypto.randomUUID(),
              title: scripts[i].title,
              script: scripts[i].script,
              audioUrl: `data:audio/mpeg;base64,${audio.toString('base64')}`,
              backgroundVideo: videos[i] ?? null,
              subtitleChunks: chunks,
            })
          }

          send({ type: 'done', reels })
        } catch (e) {
          send({ type: 'error', message: e instanceof Error ? e.message : 'Unknown error' })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  })

  // Serve built frontend in production (SPA with fallback to index.html)
  .get('/assets/*', ({ params }: { params: { '*': string } }) => {
    const file = Bun.file(join(import.meta.dir, '../../web/dist/assets', params['*']))
    return new Response(file)
  })
  .get('/*', ({ request }) => {
    const { pathname } = new URL(request.url)
    // Let API/video routes fall through as 404
    if (pathname.startsWith('/api') || pathname.startsWith('/videos')) {
      return new Response('Not found', { status: 404 })
    }
    return new Response(Bun.file(join(import.meta.dir, '../../web/dist/index.html')))
  })

  .listen({ port: Number(process.env.PORT) || 3001, hostname: '0.0.0.0' })

console.log(`API running on port ${process.env.PORT || 3001}`)
