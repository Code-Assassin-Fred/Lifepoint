'use client';

import React from "react";
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();

  return (
    <section className="w-full h-[100vh] relative overflow-hidden z-0 flex items-center">
      {/* Video */}
      <video
        className="w-full h-full object-cover"
        src="/video1.mp4"
        autoPlay
        loop
        muted
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/80 z-0"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center mt-20 px-10 md:px-20 z-10 text-left">
        <h1
          className="text-white font-extrabold text-6xl md:text-8xl tracking-wider leading-none"
          style={{ fontFamily: "Impact, Anton, Bebas Neue, sans-serif" }}
        >
          <span className="text-red-500">LIFEPOINT</span>
        </h1>

        <p className="text-gray-200 mt-6 text-xl md:text-2xl max-w-xl leading-relaxed">
          A global online church and growth movement empowering youth,
          adults, and leaders to rise in faith, purpose, and influence.
        </p>

        <div className="mt-10 flex gap-4">
          <button
            onClick={() => router.push('/auth')}
            className="bg-red-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-red-700 transition"
          >
            Join Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
