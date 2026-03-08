'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LeadBishop = () => {
  return (
    <section className="relative w-full bg-black py-12 md:py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Background Grid - Seamlessly integrated */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-0">
          {[...Array(144)].map((_, i) => (
            <div
              key={i}
              className="aspect-square border border-white/5"
              style={{
                background: `linear-gradient(135deg, 
                  ${i % 3 === 0 ? '#1a1a1a' : '#0a0a0a'} 0%, 
                  ${i % 2 === 0 ? '#0d0d0d' : '#050505'} 100%)`,
              }}
            />
          ))}
        </div>
        {/* Radial Fade for the Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Image (High Contrast, seamless blend) */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              {/* Grayscale Bishop Image with extreme contrast and vignetting */}
              <img 
                src="/mike1.jpg" 
                alt="Dr. Mike Mutua - Lead Bishop" 
                className="w-full h-full object-cover grayscale brightness-75 contrast-[1.4] blur-[0.5px]"
              />
              {/* Seamless Blending Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
              {/* Vignette effect */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-[#ff9d2e] text-xs font-bold uppercase tracking-[0.3em]">
                Founding Visionary
              </h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
                OUR LEAD <br />
                BISHOP
              </h3>
            </div>

            <div className="space-y-6 text-white/80">
              <p className="text-lg md:text-xl leading-relaxed font-light italic pl-0">
                "My calling is about empowering leaders and transforming lives through practical wisdom and authentic faith."
              </p>
              
              <p className="text-base md:text-lg leading-relaxed font-light">
                Dr. Mike Mutua is the Bishop of LifePoint Ministry Kenya and Lead Strategist at The Ark Consult. 
                Dedicated to helping individuals discover their purpose, he champions mentorship and spiritual maturity through excellence in leadership.
              </p>
            </div>
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default LeadBishop;
