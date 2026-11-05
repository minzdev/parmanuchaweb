import { useEffect, useRef, useState } from "react";
import { useContent } from "../lib/content";
import { getYouTubeId, loadYouTubeApi } from "../lib/youtube";
import { MusicNote, Pause } from "./icons";

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";

  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MusicPlayer() {
  const { content } = useContent();
  const music = content.music;
  const youtubeId = getYouTubeId(music?.url);
  const audioRef = useRef(null);
  const ytWrapperRef = useRef(null);
  const playerRef = useRef(null);
  const shouldPlayRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    setPlaying(false);
    setFailed(false);
    setLoading(false);
    setProgress({ current: 0, duration: 0 });
    shouldPlayRef.current = false;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        playerRef.current = null;
      }
      playerRef.current = null;
    }

    if (ytWrapperRef.current) {
      ytWrapperRef.current.innerHTML = "";
    }
  }, [music?.url]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          playerRef.current = null;
        }
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!youtubeId || !playing) return undefined;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;

      try {
        setProgress({
          current: player.getCurrentTime() || 0,
          duration: player.getDuration() || 0,
        });
      } catch {
        setFailed(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [youtubeId, playing]);

  if (!music?.enabled || !music?.url || failed) return null;

  const createYouTubePlayer = async () => {
    if (playerRef.current) return playerRef.current;
    if (!ytWrapperRef.current) return null;

    await loadYouTubeApi();

    if (!ytWrapperRef.current) return null;

    const container = document.createElement("div");
    ytWrapperRef.current.innerHTML = "";
    ytWrapperRef.current.appendChild(container);

    return new Promise((resolve, reject) => {
      try {
        const player = new window.YT.Player(container, {
          videoId: youtubeId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            loop: 1,
            playlist: youtubeId,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              event.target.setLoop(true);
              event.target.setVolume(60);
              setProgress({
                current: 0,
                duration: event.target.getDuration() || 0,
              });

              if (shouldPlayRef.current) {
                try {
                  event.target.playVideo();
                } catch {
                  setFailed(true);
                }
              }

              resolve(event.target);
            },
            onStateChange: (event) => {
              if (event.data === 1) setPlaying(true);
              if (event.data === 2 || event.data === 0) setPlaying(false);
            },
            onError: () => {
              setFailed(true);
              reject(new Error("YOUTUBE_PLAYER_ERROR"));
            },
          },
        });

        playerRef.current = player;
      } catch (error) {
        reject(error);
      }
    });
  };

  const toggle = async () => {
    if (youtubeId) {
      if (playerRef.current) {
        try {
          if (playerRef.current.getPlayerState() === 1) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
        } catch (error) {
          console.error(error);
          setFailed(true);
        }
        return;
      }

      shouldPlayRef.current = true;
      setLoading(true);

      try {
        await createYouTubePlayer();
      } catch (error) {
        console.error(error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  };

  const duration = Number.isFinite(progress.duration) ? progress.duration : 0;
  const percent =
    duration > 0
      ? Math.min(100, Math.max(0, (progress.current / duration) * 100))
      : 0;

  return (
    <>
      {youtubeId ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0"
        >
          <div ref={ytWrapperRef} />
        </div>
      ) : (
        <audio
          ref={audioRef}
          src={music.url}
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(event) => {
            const nextDuration = event.currentTarget.duration || 0;
            setProgress({ current: 0, duration: nextDuration });
          }}
          onDurationChange={(event) => {
            const nextDuration = event.currentTarget.duration || 0;
            setProgress((prev) => ({ ...prev, duration: nextDuration }));
          }}
          onTimeUpdate={(event) => {
            const current = event.currentTarget.currentTime || 0;
            setProgress((prev) => ({ ...prev, current }));
          }}
          onError={() => setFailed(true)}
        />
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-label={playing ? "Jeda backsound" : "Putar backsound"}
        className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 overflow-hidden rounded-full border border-rose-900/10 bg-white/85 py-2 pl-2 pr-4 text-cream shadow-lg shadow-rose-900/10 backdrop-blur-xl transition hover:border-rose-500/40 hover:bg-white disabled:opacity-80"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 text-white shadow-lg shadow-rose-700/30">
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <MusicNote className="h-4 w-4" />
          )}
        </span>

        <span className="hidden flex-col items-start text-left sm:flex">
          <span className="text-[0.6rem] uppercase tracking-[0.22em] text-rose-900/40">
            {loading ? "Memuat..." : playing ? "Now playing" : "Backsound"}
          </span>
          <span className="max-w-[10rem] truncate text-xs font-medium text-rose-900/80">
            {music.title || "Musik kita"}
          </span>
        </span>

        {duration > 0 ? (
          <span className="hidden text-[0.6rem] font-medium tabular-nums text-rose-900/50 md:block">
            {formatTime(progress.current)} / {formatTime(duration)}
          </span>
        ) : null}

        {playing ? (
          <span className="equalizer flex h-4 items-end gap-0.5">
            <span style={{ animationDelay: "0ms" }} />
            <span style={{ animationDelay: "150ms" }} />
            <span style={{ animationDelay: "300ms" }} />
          </span>
        ) : null}

        {duration > 0 ? (
          <span className="absolute inset-x-4 bottom-1 h-0.5 overflow-hidden rounded-full bg-rose-900/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-rose-600 to-pink-400"
              style={{ width: `${percent}%` }}
            />
          </span>
        ) : null}
      </button>
    </>
  );
}
