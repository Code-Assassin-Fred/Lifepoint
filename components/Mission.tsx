'use client';

import React from "react";
import { motion } from "framer-motion";

export default function Mission() {
  return (
    <section className="relative w-full bg-red-600 text-white overflow-hidden py-12 md:py-16 px-6 md:px-20">
      {/* Angled Top Border */}
      <div 
        className="absolute top-0 left-0 w-full h-16 bg-white"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 60% 100%, 40% 0, 0 100%)'
        }}
      />
      
      {/* Background Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src="/mission-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* 30 / 70 Grid */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[30%_70%] gap-10 items-center mt-8">

        {/* Logo (30%) - Octagon Shape */}
        <motion.img
          src="/logo.jpg"
          alt="logo"
          className="w-40 md:w-56 lg:w-64 mx-auto drop-shadow-2xl"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Text (70%) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 md:space-y-6"
        >
          <h2 className="text-sm md:text-base font-black tracking-[0.3em] mb-2">
            OUR MISSION IS TO
          </h2>

          <h1 className="
            text-2xl 
            sm:text-3xl
            md:text-4xl 
            lg:text-5xl
            font-semibold 
            leading-[1.3] 
            tracking-normal
            mb-6
          ">
            CONNECT, INSPIRE, AND EMPOWER A GLOBAL COMMUNITY OF FAITH AND LEADERSHIP.
          </h1>

          <p className="text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed font-light">
            Lifepoint is a global faith-based growth platform that brings together 
            worship, mentorship, and leadership development. We provide accessible spiritual 
            guidance, personal growth resources, and community engagement to youth, adults, and 
            leaders worldwide combining faith, purpose, and impact in one integrated ecosystem.
          </p>
        </motion.div>
      </div>
    </section>
  );
}