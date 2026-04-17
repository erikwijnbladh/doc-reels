import { AbsoluteFill, Audio, Video, useCurrentFrame, useVideoConfig } from 'remotion'
import type { SubtitleChunk } from '../types'

interface Props {
  backgroundVideoSrc: string | null
  audioSrc: string
  subtitleChunks: SubtitleChunk[]
  muted: boolean
}

export const DocReel: React.FC<Props> = ({
  backgroundVideoSrc,
  audioSrc,
  subtitleChunks,
  muted,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  // Find the chunk that covers the current time
  const chunk =
    subtitleChunks.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime,
    ) ??
    // Before first chunk or between chunks — show nearest upcoming
    subtitleChunks.find((c) => currentTime < c.endTime) ??
    null

  // Fade in at start of each chunk
  const chunkStart = chunk?.startTime ?? 0
  const fadeFrames = Math.min(6, fps / 5)
  const opacity = chunk
    ? Math.min(1, ((currentTime - chunkStart) * fps) / fadeFrames)
    : 0

  return (
    <AbsoluteFill style={{ background: '#0a0a0a' }}>
      {backgroundVideoSrc && (
        <Video
          src={backgroundVideoSrc}
          loop
          volume={0}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      )}

      {!muted && <Audio src={audioSrc} />}

      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.28)' }} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 36px',
          opacity,
        }}
      >
        {chunk && (
          <p
            style={{
              color: 'white',
              fontSize: 38,
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.35,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)',
              WebkitTextStroke: '1px rgba(0,0,0,0.5)',
              margin: 0,
            }}
          >
            {chunk.text}
          </p>
        )}
      </AbsoluteFill>

    </AbsoluteFill>
  )
}
