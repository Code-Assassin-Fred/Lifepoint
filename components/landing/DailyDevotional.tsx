'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const DailyDevotional = () => {
  const router = useRouter();
  return (
    <section className="w-full bg-white py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex flex-col md:flex-row bg-[#1c7ca6] rounded-sm overflow-visible items-stretch">

          {/* Left Column - Content */}
          <div className="flex-1 p-8 md:p-16 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
                Daily Devotional
              </h2>
              <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-lg font-light">
                Nourish your spirit daily. Our devotionals provide the foundational wisdom and practical guidance needed to navigate life with purpose and clarity.
              </p>
            </div>

            <button
              onClick={() => router.push('/auth')}
              className="self-start px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-[#1c7ca6] transition-all duration-300"
            >
              Stay Grounded Daily
            </button>
          </div>

          {/* Right Column - Secondary Card */}
          <div className="flex-1 relative py-12 md:py-0 px-4 md:px-0 flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative md:absolute md:-top-8 md:-bottom-8 md:right-0 w-full md:w-[90%] bg-[#1080aa] rounded-[30px] md:rounded-[40px] p-8 md:p-12 shadow-2xl flex flex-col justify-between"
            >
              <div className="h-full flex flex-col justify-center">
                <p className="text-white text-xl md:text-2xl leading-relaxed font-normal">
                  Start each day with a focused reflection designed to align your mind and heart with your highest purpose and character.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DailyDevotional;
