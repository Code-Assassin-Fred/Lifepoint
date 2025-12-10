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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  // Detect when section is fully in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio === 1) setStartAnimation(true);
      },
      { threshold: 1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Track scroll progress AFTER section is fully visible
  useEffect(() => {
    if (!startAnimation) return;

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const progress = Math.min(
        Math.max((windowHeight - rect.top) / (rect.height * 1.2), 0),
        1
      );

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [startAnimation]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-[#2a2a2a] py-20 overflow-hidden min-h-screen"
    >
      {/* 3D Cube Background Pattern */}
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

      <div className="relative w-full max-w-md mx-auto z-10">
        {cards.map((card, i) => {
          const slice = 1 / cards.length;
          const start = i * slice;
          const end = start + slice;
          const unfoldAmount = Math.min(Math.max((scrollProgress - start) / slice, 0), 1);
          const rotateDir = i % 2 === 0 ? -90 : 90;

          return (
            <div
              key={card.id}
              className="absolute top-0 left-0 w-full border-2 border-white bg-[#3a3a3a]/80 backdrop-blur-md p-10"
              style={{
                zIndex: cards.length - i,
                transformOrigin: i % 2 === 0 ? "bottom left" : "bottom right",
                transform: `
                  rotate(${rotateDir * unfoldAmount}deg)
                  translateY(${i * 10}px)
                  translateX(${i * 5}px)
                `,
                transition: "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)"
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

        {/* Spacer to keep layout height */}
        <div className="opacity-0 pointer-events-none p-10">
          <h2 className="text-2xl">{cards[0].title}</h2>
        </div>
      </div>
    </div>
  );
}
