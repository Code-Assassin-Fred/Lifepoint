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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

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

    const handleWheel = (e: WheelEvent) => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPoint = windowHeight / 2;

      const inUnfoldZone = rect.top <= startPoint && rect.bottom >= startPoint;
      
      // Check if scrolling up when fully folded
      const isScrollingUp = e.deltaY < 0;
      const isFullyFolded = scrollAccumulator.current <= 0;
      const isFullyUnfolded = scrollAccumulator.current >= scrollSensitivity;

      if (inUnfoldZone) {
        // Allow normal scroll up if cards are fully folded
        if (isScrollingUp && isFullyFolded) {
          return; 
        }
        
        // Allow normal scroll down if cards are fully unfolded
        if (!isScrollingUp && isFullyUnfolded) {
          return; 
        }

        e.preventDefault();

        // Accumulate delta, clamp between 0 and scrollSensitivity
        scrollAccumulator.current = Math.min(
          Math.max(scrollAccumulator.current + e.deltaY, 0),
          scrollSensitivity
        );

        const newProgress = scrollAccumulator.current / scrollSensitivity;
        setScrollProgress(newProgress);
      }
    };

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPoint = windowHeight / 2;

      // Reset when scrolling back above start
      if (rect.top > startPoint) {
        scrollAccumulator.current = 0;
        setScrollProgress(0);
      }

      // If below unfolding zone, lock scrollProgress at max
      if (rect.bottom < startPoint) {
        scrollAccumulator.current = scrollSensitivity;
        setScrollProgress(1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [startAnimation]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-[#2a2a2a] py-20 overflow-hidden min-h-screen"
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

      <h1 className="text-4xl text-white text-center mb-10 tracking-widest z-10 relative">
        SERVICES
      </h1>

      {/* Cards */}
      <div className="relative w-full max-w-md mx-auto z-10">
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
              className="absolute top-0 left-0 w-full border-2 border-white bg-[#3a3a3a]/80 backdrop-blur-md p-10"
              style={{
                zIndex: cards.length - i,
                transformOrigin: i % 2 === 0 ? "bottom left" : "bottom right",
                transform: `rotate(${rotation}deg) translateY(${i * 10}px) translateX(${i * 5}px)`,
                transition: "none"
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

        {/* Spacer for container height */}
        <div className="opacity-0 pointer-events-none p-10">
          <h2 className="text-2xl">{cards[0].title}</h2>
        </div>
      </div>
    </div>
  );
}