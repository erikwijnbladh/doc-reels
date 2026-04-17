const PEXELS_API_KEY = process.env.PEXELS_API_KEY!

// Rotate through brain-rot adjacent search terms
const SEARCH_POOL = [
  'minecraft parkour',
  'parkour runner',
  'obstacle course',
  'satisfying run',
  'urban parkour',
  'free running',
  'skateboarding trick',
  'basketball skills',
]

interface PexelsVideoFile {
  link: string
  quality: string
  width: number
  height: number
}

interface PexelsVideo {
  id: number
  video_files: PexelsVideoFile[]
}

interface PexelsResponse {
  videos: PexelsVideo[]
}

function pickPortraitHD(files: PexelsVideoFile[]): PexelsVideoFile {
  // Prefer portrait HD, fallback to any
  return (
    files.find((f) => f.quality === 'hd' && f.height >= f.width) ??
    files.find((f) => f.quality === 'hd') ??
    files[0]
  )
}

export async function fetchBackgroundVideos(count: number): Promise<string[]> {
  if (!PEXELS_API_KEY) return []

  const term = SEARCH_POOL[Math.floor(Math.random() * SEARCH_POOL.length)]
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(term)}&per_page=${Math.min(count, 15)}&orientation=portrait`

  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  })

  if (!res.ok) {
    console.warn(`[videos] Pexels error ${res.status}`)
    return []
  }

  const data = (await res.json()) as PexelsResponse
  const videos = data.videos.slice(0, count)

  return videos.map((v) => pickPortraitHD(v.video_files).link)
}
