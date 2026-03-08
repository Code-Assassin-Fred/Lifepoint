'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Services = () => {
  const router = useRouter();
  return (
    <section className="relative w-full bg-[#fdfaf5] overflow-hidden pt-12 md:pt-16 pb-12 md:pb-20">
      {/* Subtle Map-like Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column - Large Typography */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-[#1a2a3a] text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.2] tracking-tight">
                From every professional sphere to <br />
                every personal walk, we gather with <br />
                a singular focus on excellence. <br />
                We are united in <span className="italic">potential</span> and <br />
                <span className="font-bold">purpose</span>.
              </h2>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-200/50">
              <p className="text-[#2d4156] text-lg md:text-xl lg:text-2xl font-medium leading-[1.3] tracking-tight max-w-xl">
                A collective where your unique journey fuels your breakthrough. We are a launching pad for those ready to lead with wisdom and live with intention.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 bg-[#1a2a3a] text-white rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-[#2d4156] transition-all"
                >
                  Our Programs
                </button>
                <button
                  onClick={() => router.push('/auth')}
                  className="px-6 py-2.5 border border-[#1a2a3a] text-[#1a2a3a] rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-black/5 transition-all"
                >
                  Join Us
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Curved Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-[400px] lg:h-[550px] w-full"
          >
            <div
              className="absolute inset-0 bg-[#2d4156] overflow-hidden"
              style={{
                borderRadius: '400px 0 0 400px',
                transform: 'translateX(10%)'
              }}
            >
              <img
                src="/Mandatory1.jpg"
                alt="Programs and Opportunities"
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a2a3a]/60 to-transparent" />

              {/* Vertical Text Overlay */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 origin-right whitespace-nowrap">
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">
                  Maturity • Excellence • Community
                </span>
              </div>
            </div>

            {/* Small Floating Image/Card Detail (Optional extra touch) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-4 left-0 bg-white p-6 shadow-2xl rounded-2xl max-w-[280px] hidden md:block"
            >
              <div className="space-y-3">
                <div className="w-10 h-1 bg-[#ff9d2e]" />
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  Everything we do is designed to guide individuals toward excellence and personal growth.
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Services;

