'use client';

import { useEffect, useRef, useState } from "react";

export default function SkillsComponent() {
  const cards = [
    { id: 1, title: "Online Church", submodules: ["Sunday Livestream", "Past Messages", "Prayer Rooms"] },
    { id: 2, title: "Bible Learning & Discipleship", submodules: ["Foundations", "Deep-Dive Bible Studies", "Devotionals", "Study Plans"] },
    { id: 3, title: "Personal Growth", submodules: ["Purpose Discovery", "Confidence Building", "Communication Skills", "Life Skills"] },
    { id: 4, title: "Leadership Development", submodules: ["Leadership Programs", "Masterclasses", "Certificates", "Workshops"] },
    { id: 5, title: "Mentorship & Coaching", submodules: ["Youth Mentorship", "Adult Mentorship", "Leadership Coaching", "Pastoral Executive Coaching"] },
    { id: 6, title: "Community Engagement", submodules: ["Global Groups", "Forums", "Meetups", "Topic Discussions"] },
    { id: 7, title: "Media & Content Hub", submodules: ["Sermon Clips", "Podcasts", "Inspirational Content", "Testimonies"] },
    { id: 8, title: "Events & Programs", submodules: ["Workshops", "Faith-Based Events", "Guest Speaker Sessions", "Online Programs"] }
  ];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const scrollAccumulator = useRef(0);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.75) setStartAnimation(true);
        else setStartAnimation(false);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!startAnimation) return;

    const unfoldableCards = cards.length - 1;
    const scrollSensitivity = 2000;
    // Lower sensitivity for touch (more responsive on mobile)
    const touchSensitivity = 800;

    const updateProgress = (delta: number, sensitivity: number) => {
      const el = sectionRef.current;
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPoint = windowHeight / 2;

      const inUnfoldZone = rect.top <= startPoint && rect.bottom >= startPoint;

      const isScrollingUp = delta < 0;
      const isFullyFolded = scrollAccumulator.current <= 0;
      const isFullyUnfolded = scrollAccumulator.current >= sensitivity;

      if (inUnfoldZone) {
        if (isScrollingUp && isFullyFolded) return false;
        if (!isScrollingUp && isFullyUnfolded) return false;

        scrollAccumulator.current = Math.min(
          Math.max(scrollAccumulator.current + delta, 0),
          sensitivity
        );

        const newProgress = scrollAccumulator.current / sensitivity;
        setScrollProgress(newProgress);
        return true; // Indicate we handled the scroll
      }
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (updateProgress(e.deltaY, scrollSensitivity)) {
        e.preventDefault();
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY.current = e.touches[0].clientY;
        lastTouchY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      // Invert delta because touch drag down = scroll up (negative delta)
      const delta = (lastTouchY.current - currentY) * 3; // Multiply for more responsive feel
      lastTouchY.current = currentY;

      if (updateProgress(delta, touchSensitivity)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = 0;
      lastTouchY.current = 0;
    };

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPoint = windowHeight / 2;
      const sensitivity = isTouchDevice ? touchSensitivity : scrollSensitivity;

      if (rect.top > startPoint) {
        scrollAccumulator.current = 0;
        setScrollProgress(0);
      }

      if (rect.bottom < startPoint) {
        scrollAccumulator.current = sensitivity;
        setScrollProgress(1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Add touch event listeners
    const el = sectionRef.current;
    if (el) {
      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchmove", handleTouchMove, { passive: false });
      el.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      if (el) {
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchmove", handleTouchMove);
        el.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [startAnimation, isTouchDevice]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-[#2a2a2a] py-20 overflow-hidden min-h-[600px] md:min-h-screen"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-12 gap-0">
          {[...Array(144)].map((_, i) => (
            <div
              key={i}
              className="aspect-square border border-[#1a1a1a]"
              style={{
                background: `linear-gradient(135deg, 
                  ${i % 3 === 0 ? '#3a3a3a' : '#2a2a2a'} 0%, 
                  ${i % 2 === 0 ? '#252525' : '#2a2a2a'} 100%)`,
                transform: `perspective(1000px) rotateX(${i % 5 * 2}deg) rotateY(${i % 7 * 2}deg)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="relative w-full max-w-md mx-auto z-10 mb-32 md:mb-0">
        {cards.map((card, i) => {
          const unfoldableCards = cards.length - 1;
          const cardIndex = i >= unfoldableCards ? unfoldableCards : i;

          const cardScrollStart = cardIndex / unfoldableCards;
          const cardScrollEnd = (cardIndex + 1) / unfoldableCards;

          let rawProgress = (scrollProgress - cardScrollStart) / (cardScrollEnd - cardScrollStart);
          rawProgress = Math.min(Math.max(rawProgress, 0), 1);

          const eased =
            rawProgress < 0.5
              ? 2 * rawProgress * rawProgress
              : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

          const rotateDir = i % 2 === 0 ? -90 : 90;
          const rotation = i === cards.length - 1 ? 0 : rotateDir * eased;

          return (
            <div
              key={card.id}
              className={`absolute top-0 left-0 w-full border-2 border-white p-10 ${isTouchDevice ? 'bg-[#3a3a3a]' : 'bg-[#3a3a3a]/80 backdrop-blur-md'
                }`}
              style={{
                zIndex: cards.length - i,
                transformOrigin: i % 2 === 0 ? "bottom left" : "bottom right",
                transform: `rotate(${rotation}deg) translateY(${i * 10}px) translateX(${i * 5}px)`,
                transition: "none",
                willChange: "transform",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden"
              }}
            >
              <h2 className="text-2xl text-white mb-6">{card.title}</h2>
              <ul className="space-y-3 text-white">
                {card.submodules.map((sub, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3" />
                    <span className="text-lg">{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Spacer */}
        <div className="opacity-0 pointer-events-none p-10">
          <h2 className="text-2xl">{cards[0].title}</h2>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap">
        <div
          className="text-5xl font-semibold text-white inline-block px-10"
          style={{ animation: "scrollText 18s linear infinite" }}
        >
          <span style={{ color: "#ff6b6b" }}>Learn.</span>
          Believe.
          <span style={{ color: "#ff6b6b" }}>Become.</span>
          One moment of growth at a time. &nbsp;
          <span style={{ color: "#ff6b6b" }}>Learn. </span>
          <span style={{ color: "#ff6b6b" }}>Believe. </span>
          <span style={{ color: "#ff6b6b" }}>Become. </span>
          One moment of growth at a time.
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}