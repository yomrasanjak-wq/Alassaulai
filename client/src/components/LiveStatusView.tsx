import { useEffect, useRef, useState } from "react";

type LiveStatusViewProps = {
  src?: string;
  isLive?: boolean;
};

export function LiveStatusView({ src, isLive }: LiveStatusViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "live" | "error">("idle");

  useEffect(() => {
    if (!src) return;
    if (!videoRef.current) return;

    let hlsInstance: any = null;
    const video = videoRef.current;

    const init = async () => {
      try {
        setStatus("loading");
        if (src.includes(".m3u8")) {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
              setStatus("live");
              video.play().catch(() => {});
            });
            hlsInstance.on(Hls.Events.ERROR, (_: any, data: any) => {
              if (data?.fatal) setStatus("error");
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            setStatus("live");
          }
        } else {
          video.src = src;
          setStatus("live");
        }
      } catch {
        setStatus("error");
      }
    };

    init();
    return () => {
      if (hlsInstance) hlsInstance.destroy();
    };
  }, [src]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} controls playsInline className="w-full h-full object-contain" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {isLive && <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded animate-pulse">LIVE</span>}
        <span className="px-2 py-1 text-xs bg-black/60 text-white rounded">{status}</span>
      </div>
    </div>
  );
}

export default LiveStatusView;
