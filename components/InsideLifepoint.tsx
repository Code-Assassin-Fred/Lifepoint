import React from 'react';
import Image from 'next/image';

export default function InsideLifepoint() {
  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight">
            Inside Lifepoint
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
            From iconic stage moments to behind-the-scenes breakthroughs—witness the legacy of Lifepoint in motion.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory4.jpg"
              alt="Lifepoint team moment"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/mike1.jpg"
              alt="Lifepoint leadership"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mike2.jpg"
              alt="Lifepoint event"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory1.jpg"
              alt="Lifepoint gathering"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Row 2 */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory2.jpg"
              alt="Lifepoint experience"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/mandatory3.jpg"
              alt="Lifepoint community"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="lg:col-span-2 relative aspect-[8/3] lg:aspect-[2/1] overflow-hidden rounded-lg">
            <img
              src="/Mandatory4.jpg"
              alt="Lifepoint legacy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}