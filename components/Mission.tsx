'use client';

import React from 'react';
import { Shield } from 'lucide-react';

const Mission = () => {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Red Background Section - Reduced padding */}
      <div className="relative bg-gradient-to-br from-red-600 to-red-700 px-6 md:px-20 py-16 md:py-20">
        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-16 w-48 h-48 border border-white rotate-45"></div>
          <div className="absolute bottom-16 right-32 w-64 h-64 border border-white rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Side - Smaller Shield */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-56 h-64 md:w-64 md:h-72">
                <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-900 rounded-t-full border-8 border-gray-200 shadow-2xl">
                  <div className="absolute inset-3 bg-gradient-to-b from-red-700 to-red-800 rounded-t-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-28 h-28 md:w-32 md:h-32 text-white opacity-90" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Right Side - Tighter, cleaner text */}
            <div className="text-white space-y-5">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-snug uppercase tracking-wider">
                Our Mission is to<br />
                <span className="text-gray-200">Enlighten, Entertain,<br />and Empower</span><br />
                Current and Future Leaders<br />
                Around the World.
              </h2>

              <p className="text-base md:text-lg text-gray-100 leading-relaxed max-w-xl">
                We shatter conventional narratives, spark bold conversations, and equip leaders with the clarity to think critically and act with purpose.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smaller Diagonal Transition */}
      <div className="relative h-20 bg-gradient-to-br from-red-600 to-red-700">
        <div className="absolute inset-0 bg-white transform origin-top-left -skew-y-3"></div>
      </div>
    </section>
  );
};

export default Mission;