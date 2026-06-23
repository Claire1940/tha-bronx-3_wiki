"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

type ActivatedState = null | "auto" | "manual";

/**
 * VideoFeature - 进入视口自动播放（静音循环），点击播放按钮带声后备。
 * - IntersectionObserver threshold 0.45 → activated="auto"（autoplay=1&mute=1&loop=1）
 * - 用户点击播放 → activated="manual"（autoplay=1，用户手势满足浏览器音频策略可带声）
 * - 缩略图海报：maxresdefault 探测失败回退 hqdefault
 * - prefers-reduced-motion 时不自动播放（仍可手动点击）
 * - 无 JS / SSR 回退：<noscript> 内嵌 iframe（静音循环）
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState<ActivatedState>(null);
  const [posterSrc, setPosterSrc] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  );

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 静音循环 embed（自动播放）
  const autoEmbed = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
  // 带声 embed（用户点击触发）
  const manualEmbed = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;

  const embedSrc =
    activated === "manual" ? manualEmbed : activated === "auto" ? autoEmbed : "";

  // 探测 maxresdefault 缩略图，失败回退 hqdefault
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // maxresdefault 有时返回 120x90 占位图（视为不可用）
      if (img.naturalWidth < 200) {
        setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      }
    };
    img.onerror = () => {
      setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    };
    img.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }, [videoId]);

  // 进入视口自动播放（尊重 prefers-reduced-motion）
  useEffect(() => {
    if (activated !== null) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            setActivated("auto");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated === null ? (
          // 海报 + 播放按钮（点击带声播放）
          <button
            type="button"
            onClick={() => setActivated("manual")}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
          >
            <img
              src={posterSrc}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg transition-transform group-hover:scale-110 md:h-20 md:w-20">
              <Play className="ml-1 h-7 w-7 text-white md:h-9 md:w-9" fill="currentColor" />
            </span>
          </button>
        ) : (
          <iframe
            key={embedSrc}
            className="absolute left-0 top-0 h-full w-full"
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        {/* 无 JS / SSR 回退：静音循环 iframe */}
        <noscript>
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </noscript>
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
