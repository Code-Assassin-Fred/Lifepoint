import React from "react";

const Hero = () => {
  return (
    <section className="w-full h-[80vh] relative overflow-hidden z-0 flex items-center justify-center">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <h1 className="text-white font-extrabold text-5xl md:text-7xl leading-tight tracking-wide">
          WE ARE{" "}
          <span className="text-red-600">
            LIFEPOINT
          </span>
        </h1>

        <p className="text-gray-200 mt-4 text-lg md:text-xl max-w-2xl">
          A Global Online Church & Growth Movement — where faith,
          purpose, mentorship, and leadership development meet.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-red-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-red-700 transition">
            Join Free
          </button>
          <button className="border border-gray-300 text-white font-semibold px-8 py-3 rounded-md hover:bg-white/10 transition">
            Explore Growth
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
