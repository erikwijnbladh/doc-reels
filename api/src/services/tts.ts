const API_KEY = process.env.ELEVENLABS_API_KEY!
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB'

export interface SubtitleChunk {
  text: string
  startTime: number // seconds
  endTime: number
}

interface ElevenLabsResponse {
  audio_base64: string
  alignment: {
    characters: string[]
    character_start_times_seconds: number[]
    character_end_times_seconds: number[]
  }
}

const WORDS_PER_CHUNK = 6

function buildChunks(
  characters: string[],
  startTimes: number[],
  endTimes: number[],
): SubtitleChunk[] {
  // Group characters into words with timing
  const words: { text: string; start: number; end: number }[] = []
  let current = ''
  let wordStart = 0

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i]
    if (ch === ' ' || i === characters.length - 1) {
      if (ch !== ' ') current += ch
      if (current.trim()) {
        words.push({ text: current.trim(), start: wordStart, end: endTimes[i] })
      }
      current = ''
      wordStart = startTimes[i + 1] ?? endTimes[i]
    } else {
      if (current === '') wordStart = startTimes[i]
      current += ch
    }
  }

  // Group into chunks of N words
  const chunks: SubtitleChunk[] = []
  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const slice = words.slice(i, i + WORDS_PER_CHUNK)
    chunks.push({
      text: slice.map((w) => w.text).join(' '),
      startTime: slice[0].start,
      endTime: slice[slice.length - 1].end,
    })
  }
  return chunks
}

export async function generateSpeech(
  text: string,
): Promise<{ audio: Buffer; chunks: SubtitleChunk[] }> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as ElevenLabsResponse
  const audio = Buffer.from(data.audio_base64, 'base64')
  const chunks = buildChunks(
    data.alignment.characters,
    data.alignment.character_start_times_seconds,
    data.alignment.character_end_times_seconds,
  )

  return { audio, chunks }
}
