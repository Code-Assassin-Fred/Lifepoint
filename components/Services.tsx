import React from 'react';

const Services = () => {
  return (
    <section className="bg-white py-20 -mt-[45px]">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left Column - Title */}
          <div className="md:w-2/5">
            <h2
  className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase truncate"
  style={{ fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.02em' }}
  title="Ministries & Services"
>
  Ministries & Services
</h2>

          </div>

          {/* Right Column - Description */}
          <div className="md:w-3/5 space-y-6">
            <p
              className="text-gray-800 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Lifepoint's network of services offers a holistic approach to spiritual growth, personal development, and leadership empowerment. From online worship experiences to structured leadership programs, mentorship opportunities, and coaching sessions, everything we do is designed to guide individuals toward faith, growth, and community impact.
            </p>

            <p
              className="text-gray-800 text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Whether through livestreamed Sunday services, deep-dive Bible studies, youth and adult mentorship programs, or premium pastoral coaching, Lifepoint supports each person on a journey of spiritual maturity and personal excellence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
