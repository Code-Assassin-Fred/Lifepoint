'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

type MediaItem =
  | { type: 'video'; src: string; layout?: 'grid' | 'cover' }
  | { type: 'image'; src: string };

const GRID_COLS = 4;
const GRID_ROWS = 3;
const TRANSITION_DURATION = 2.5;

const VideoTile = ({
  src,
  index,
}: {
  src: string;
  index: number;
}) => {
  const tileVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  const handleLoadedMetadata = useCallback(() => {
    const video = tileVideoRef.current;
    if (!video || hasInitialized.current) return;
    hasInitialized.current = true;

    // Set unique offset immediately
    const offset = (index * 2) % video.duration;
    video.currentTime = offset;

    // Start playing immediately so it's always moving in the background
    video.play().catch(() => { });
  }, [index]);

  const handleCanPlay = () => setIsReady(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      className="w-full h-full bg-black"
    >
      <video
        ref={tileVideoRef}
        src={src}
        muted
        playsInline
        loop
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        className="w-full h-full object-cover object-top pointer-events-none"
      />
    </motion.div>
  );
};

const VideoGrid = ({ src }: { src: string }) => {
  const tiles = [];

  // Use 6 tiles for mobile (2x3 or similar) and 12 for desktop (4x3)
  const totalTiles = 12;

  for (let i = 0; i < totalTiles; i++) {
    tiles.push(
      <div
        key={i}
        className="relative overflow-hidden"
      >
        <VideoTile src={src} index={i} />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 grid bg-black grid-cols-2 md:grid-cols-4 grid-rows-6 md:grid-rows-3 gap-[1px] md:gap-[2px]"
    >
      {tiles}
    </div>
  );
};

const Hero = () => {
  const router = useRouter();

  const mediaItems: MediaItem[] = [
    { type: 'video', src: '/video1.mp4', layout: 'grid' },
    { type: 'image', src: '/Mandatory4.jpg' },
    { type: 'video', src: '/video2.mp4', layout: 'cover' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const coverVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  useEffect(() => {
    const current = mediaItems[currentIndex];

    // Set auto-advance timers for all slide types
    let duration = current.type === 'image' ? 10000 : 15000;
    if (currentIndex === 2) duration = 25000;
    timerRef.current = setTimeout(goToNext, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, goToNext]);

  // Keep the cover video "hot"
  useEffect(() => {
    const video = coverVideoRef.current;
    if (video) {
      video.play().catch(() => { });
      if (currentIndex === 2) {
        video.currentTime = 0;
      }
    }
  }, [currentIndex]);

  // Preload links
  useEffect(() => {
    const preloadLinks = [
      { href: '/video1.mp4', as: 'video', type: 'video/mp4' },
      { href: '/video2.mp4', as: 'video', type: 'video/mp4' },
      { href: '/Mandatory4.jpg', as: 'image' },
    ];
    preloadLinks.forEach(({ href, as: asAttr, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = asAttr;
      if (type) link.type = type;
      document.head.appendChild(link);
    });
  }, []);

  return (
    <section id="hero" className="w-full h-[105vh] md:h-[120vh] relative overflow-hidden z-0 bg-black">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaItems.map((media, i) => {
          const isActive = i === currentIndex;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? (media.type === 'image' ? 1.05 : 1) : 1.02,
              }}
              transition={{
                opacity: { duration: TRANSITION_DURATION, ease: 'easeInOut' },
                scale: { duration: isActive ? 15 : TRANSITION_DURATION, ease: 'linear' },
              }}
              className="absolute inset-x-0 -top-[1px] -bottom-[1px] will-change-transform"
              style={{
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {/* SLIDE CONTENT */}
              {media.type === 'video' && media.layout === 'grid' ? (
                <div className="absolute inset-x-0 -top-[1px] -bottom-[1px]">
                  <VideoGrid src={media.src} />
                </div>
              ) : media.type === 'video' ? (
                <motion.video
                  ref={coverVideoRef}
                  src={media.src}
                  muted
                  playsInline
                  onEnded={goToNext}
                  initial={{ x: '0%' }}
                  animate={(mounted && isMobile && isActive) ? {
                    x: ['0%', '-75%', '0%'],
                  } : { x: '0%' }}
                  transition={{
                    x: {
                      duration: 25,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute top-0 left-0 h-full w-auto md:w-full min-w-full object-cover object-left max-w-none"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: `url("${media.src}")`,
                    backgroundPosition: 'center 15%',
                  }}
                />
              )}

              {/* Cinematic overlays */}
              <div className={`absolute inset-0 transition-colors duration-1000 ${media.type === 'video' ? 'bg-black/45' : 'bg-black/25'}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Hero Content Wrapper - Fixes Gap by isolating content from bg logic */}
      <div className="relative z-10 w-full min-h-full flex flex-col items-center justify-center pt-20 md:pt-24">
        <div className="px-6 max-w-3xl text-center">
          <h1 className="text-white text-xl md:text-3xl lg:text-4xl tracking-wide leading-snug uppercase">
            Where <span className="font-bold">Spiritual Growth</span> Meets <span className="text-[#ff9d2e] font-bold">Leadership Development</span>
          </h1>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="group flex items-center space-x-3 bg-[#2d4156]/80 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-3.5 rounded-md shadow-lg hover:bg-[#2d4156] transition-all border border-white/10"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded flex items-center justify-center">
                <Play size={12} fill="white" className="ml-0.5 md:size-[14px]" />
              </div>
              <span className="text-[10px] md:text-base font-bold uppercase tracking-[0.2em] md:tracking-[0.25em]">Start Your Journey</span>
            </button>
          </div>

          <div className="mt-6 space-y-0.5">
            <p className="text-white/70 text-xs md:text-base tracking-[0.1em]">
              Experience a transformative journey designed to elevate your purpose, character, and impact in every sphere of life.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20">
        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#2d4156]/80 backdrop-blur-sm text-white px-5 py-2.5 rounded shadow-lg border border-white/10 hover:bg-[#2d4156] transition-all text-xs font-medium tracking-widest uppercase"
        >
          Get In Touch
        </button>
      </div>
    </section>
  );
};

export default Hero;
