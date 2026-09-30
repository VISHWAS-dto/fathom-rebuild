export {};
declare global {
  interface YTPlayer {
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    playVideo(): void;
    pauseVideo(): void;
    getPlayerState(): number;
    destroy(): void;
  }
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
