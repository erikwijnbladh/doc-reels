import { readdirSync, mkdirSync } from 'fs'
import { join, basename, extname } from 'path'
import { spawnSync, execSync } from 'child_process'

const WINGET_FFMPEG = 'C:\\Users\\Erik\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe'

function findFfmpeg(): string {
  try {
    const result = execSync('where.exe ffmpeg', { encoding: 'utf8' })
    const found = result.trim().split('\n')[0].trim()
    if (found && !found.startsWith('INFO:')) return found
  } catch {}
  return WINGET_FFMPEG
}

const FFMPEG = findFfmpeg()

const INPUT_DIR = join(import.meta.dir, '../vids')
const OUTPUT_DIR = join(import.meta.dir, '../api/public/videos')
const SEGMENT_SECONDS = 45

mkdirSync(OUTPUT_DIR, { recursive: true })

const files = readdirSync(INPUT_DIR).filter((f) =>
  /\.(mp4|mov|webm)$/i.test(f),
)

if (files.length === 0) {
  console.log('No video files found in vids/')
  process.exit(0)
}

for (const file of files) {
  const input = join(INPUT_DIR, file)
  const slug = basename(file, extname(file))
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 40)
  const outputPattern = join(OUTPUT_DIR, `${slug}_%03d.mp4`)

  console.log(`Splitting: ${file}`)

  const result = spawnSync(
    FFMPEG,
    [
      '-i', input,
      '-c', 'copy',
      '-map', '0',
      '-segment_time', String(SEGMENT_SECONDS),
      '-f', 'segment',
      '-reset_timestamps', '1',
      '-y',
      outputPattern,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )

  if (result.status !== 0) {
    console.error(`Failed to split ${file}`)
    if (result.stderr) console.error(result.stderr.toString().slice(-500))
    if (result.error) console.error(result.error.message)
  } else {
    console.log(`Done: ${file}`)
  }
}

console.log(`\nSegments saved to api/public/videos/`)
