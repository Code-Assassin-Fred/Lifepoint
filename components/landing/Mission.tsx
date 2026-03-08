'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function Mission() {
  const router = useRouter();

  return (
    <section id="about" className="w-full bg-white pt-24 md:pt-32 pb-16 md:pb-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* Left Column - Heading */}
        <div>
          <h2 className="text-[#1a2a3a] text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-tight tracking-tight">
            Experience Fellowship<br />
            <span className="text-[#2d4156]">In Your Space</span>
          </h2>
          <div className="w-24 h-1 bg-[#ff9d2e] mt-6"></div>
        </div>

        {/* Right Column - Description + CTA */}
        <div className="space-y-6">
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Lifepoint Virtual is a premier platform that brings together
            inspiration, mentorship, and leadership development. We empower individuals
            to rise in potential, purpose, and influence through accessible personal
            guidance and a thriving community.{' '}
            <span className="font-bold text-[#1a2a3a]">
              Join our community and start your journey towards world-class wisdom and leadership today.
            </span>
          </p>

          <button
            onClick={() => router.push('/auth')}
            className="mt-4 px-10 py-3.5 border-2 border-[#2d4156] text-[#2d4156] rounded-md font-bold uppercase tracking-[0.2em] text-sm hover:bg-[#2d4156] hover:text-white transition-all duration-300"
          >
            Join The Movement
          </button>
        </div>

      </div>

      {/* Community Map Section */}
      <div className="mt-12 max-w-5xl mx-auto text-center">
        <div className="mb-6">
          <p className="text-gray-700 max-w-2xl mx-auto text-base md:text-lg">
            When you join our sessions, you connect with individuals from across the country
            and beyond, all seeking the same growth and transformation.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-2xl shadow-black/5 bg-gray-50/50 p-4 md:p-8">
          <img
            src="/Livestream1.png"
            alt="Community Connection"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
