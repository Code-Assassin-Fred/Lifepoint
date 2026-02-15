import React from 'react';

const Services = () => {
  return (
    <section className="bg-white py-20 -mt-[55px]">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left Column - Title */}
          <div className="md:w-2/5">
            <h2
              className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase truncate"
              style={{ fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.02em' }}
              title="Programs & Opportunities"
            >
              Programs & Opportunities
            </h2>

          </div>

          {/* Right Column - Description */}
          <div className="md:w-3/5 space-y-6">
            <p
              className="text-gray-800 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Our network of services offer a holistic approach to personal growth, skills development, and leadership empowerment. From online inspiration streams to structured leadership programs, mentorship opportunities, and coaching sessions, everything we do is designed to guide individuals toward excellence, growth, and community impact.
            </p>

            <p
              className="text-gray-800 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Whether through livestreamed weekly sessions, deep-dive wisdom studies, youth and adult mentorship programs, or premium executive coaching, Lifepoint supports each person on a journey of maturity and personal excellence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
