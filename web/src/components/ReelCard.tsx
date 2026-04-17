import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { DocReel } from "../remotion/DocReel";
import type { Reel } from "../types";

const FPS = 30;
export const REEL_W = 460;
export const REEL_H = 818; // 9:16

interface Props {
  reel: Reel;
  playing: boolean;
  scale?: number;
}

export function ReelCard({ reel, playing, scale = 1 }: Props) {
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [durationInFrames, setDurationInFrames] = useState(FPS * 45);
  const playerRef = useRef<PlayerRef>(null);

  // Play/pause via imperative ref
  useEffect(() => {
    if (playing) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
      playerRef.current?.seekTo(0);
    }
  }, [playing]);

  // Get actual audio duration
  useEffect(() => {
    const audio = new Audio(reel.audioUrl);
    const onMeta = () => {
      setDurationInFrames(Math.ceil(audio.duration * FPS) + FPS);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    return () => audio.removeEventListener("loadedmetadata", onMeta);
  }, [reel.audioUrl]);

  const speeds = [1, 1.5, 2];
  const nextSpeed = () =>
    setSpeed((s) => speeds[(speeds.indexOf(s) + 1) % speeds.length]);

  return (
    // Outer: layout-sized to the scaled dimensions
    <div style={{ width: REEL_W * scale, height: REEL_H * scale, flexShrink: 0 }}>
      {/* Inner: full resolution, CSS-scaled */}
      <div
        style={{
          position: "relative",
          borderRadius: scale < 1 ? 12 : 18,
          overflow: "hidden",
          width: REEL_W,
          height: REEL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
      <Player
        ref={playerRef}
        component={DocReel}
        durationInFrames={durationInFrames}
        compositionWidth={REEL_W}
        compositionHeight={REEL_H}
        fps={FPS}
        style={{ width: REEL_W, height: REEL_H, display: "block" }}
        loop
        playbackRate={speed}
        inputProps={{
          backgroundVideoSrc: reel.backgroundVideo,
          audioSrc: reel.audioUrl,
          subtitleChunks: reel.subtitleChunks,
          muted,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        <button onClick={nextSpeed} style={pillBtn}>
          {speed}x
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          style={{ ...pillBtn, width: 38, padding: 0 }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <a
          href={reel.audioUrl}
          download={`${reel.title.replace(/\s+/g, "-").toLowerCase()}.mp3`}
          style={{ ...pillBtn, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        >
          ⬇
        </a>
      </div>
      </div>
    </div>
  );
}

const pillBtn: React.CSSProperties = {
  padding: "7px 13px",
  borderRadius: 20,
  border: "none",
  background: "rgba(0,0,0,0.65)",
  color: "white",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  letterSpacing: 0.3,
};
