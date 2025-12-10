'use client';

import React from "react";
import { motion } from "framer-motion";

export default function Mission() {
  return (
    <section
      className="relative w-full text-white py-12 md:py-16 px-6 md:px-20 -mt-[55px]"
      style={{
        backgroundColor: "#e10600",
        clipPath:
          "polygon(0 8%, 43% 8%, 45% 0, 100% 0, 100% 92%, 60% 100%, 40% 92%, 0 92%)",
        overflow: "hidden",
      }}
    >
      {/* Background Overlay with Parallax */}
      <motion.div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <img
          src="/mandatory2.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Grid */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[30%_70%] gap-10 items-center">
        
        {/* Logo with Rotation and Glow */}
        <div className="w-40 md:w-56 lg:w-64 aspect-square mx-auto">
          <motion.img
            src="/logo.jpg"
            alt="logo"
            className="w-full h-full object-cover drop-shadow-2xl"
            style={{
              clipPath:
                "polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
            initial={{ opacity: 0, x: -40, rotate: -5, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ 
              scale: 1.05, 
              rotate: 2,
              filter: "brightness(1.2)",
              transition: { duration: 0.3 }
            }}
          />
        </div>

        {/* Text with Staggered Reveal */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 md:space-y-6"
        >
          <motion.h2 
            className="text-sm md:text-base font-black tracking-[0.3em] mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            OUR MISSION IS TO
          </motion.h2>

          <motion.h1
            className="
              text-2xl sm:text-3xl md:text-4xl lg:text-5xl
              font-semibold leading-[1.3] mb-6
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            CONNECT, INSPIRE, AND EMPOWER A GLOBAL COMMUNITY OF FAITH AND
            LEADERSHIP.
          </motion.h1>

          <motion.p 
            className="text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed font-light mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Lifepoint is a global faith-based growth platform that brings
            together worship, mentorship, and leadership development. We provide
            accessible spiritual guidance, personal growth resources, and
            community engagement worldwide.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}