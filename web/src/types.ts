export interface SubtitleChunk {
  text: string
  startTime: number
  endTime: number
}

export interface Reel {
  id: string
  title: string
  script: string
  audioUrl: string
  backgroundVideo: string | null
  subtitleChunks: SubtitleChunk[]
}
