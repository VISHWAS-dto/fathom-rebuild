"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type PlayerHandle = {
  seekTo: (sec: number, play?: boolean) => void;
  play: () => void;
  pause: () => void;
  getTime: () => number;
};

let apiPromise: Promise<void> | null = null;
function loadYT(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

type Props = {
  videoId: string;
  start?: number;
  /** When set, playback pauses at this time (used for clips). */
  end?: number;
  autoplay?: boolean;
  onTime?: (t: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onClipEnd?: () => void;
};

const YouTubePlayer = forwardRef<PlayerHandle, Props>(function YouTubePlayer(
  { videoId, start = 0, end, autoplay = false, onTime, onPlayingChange, onClipEnd },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ready = useRef(false);
  const pending = useRef<{ t: number; play: boolean } | null>(null);
  const cb = useRef({ onTime, onPlayingChange, onClipEnd, end });
  cb.current = { onTime, onPlayingChange, onClipEnd, end };

  useImperativeHandle(ref, () => ({
    seekTo(t, play = true) {
      if (!ready.current || !player.current) {
        pending.current = { t, play };
        return;
      }
      player.current.seekTo(t, true);
      if (play) player.current.playVideo();
      cb.current.onTime?.(t);
    },
    play: () => player.current?.playVideo(),
    pause: () => player.current?.pauseVideo(),
    getTime: () => player.current?.getCurrentTime() ?? 0,
  }));

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const mount = document.createElement("div");
    host.current?.appendChild(mount);

    loadYT().then(() => {
      if (cancelled || !window.YT) return;
      player.current = new window.YT.Player(mount, {
        videoId,
        playerVars: { start: Math.floor(start), autoplay: autoplay ? 1 : 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            ready.current = true;
            if (pending.current) {
              const { t, play } = pending.current;
              pending.current = null;
              player.current?.seekTo(t, true);
              if (play) player.current?.playVideo();
            }
          },
          onStateChange: (e) => cb.current.onPlayingChange?.(e.data === 1),
        },
      });
      timer = setInterval(() => {
        const p = player.current;
        if (!ready.current || !p) return;
        const t = p.getCurrentTime();
        cb.current.onTime?.(t);
        const e = cb.current.end;
        if (e !== undefined && t >= e && p.getPlayerState() === 1) {
          p.pauseVideo();
          cb.current.onClipEnd?.();
        }
      }, 250);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      ready.current = false;
      player.current?.destroy();
      player.current = null;
      mount.remove();
    };
    // Player is created once per video; start/autoplay only matter at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-black/10">
      <div ref={host} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
    </div>
  );
});

export default YouTubePlayer;
