import React from 'react';

const Services = () => {
  return (
    <section className="bg-gray-50 py-16 -mt-[45px]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 ">
        {/* Title */}
        <h2
          className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Lifepoint’s Network of Ministries & Services
        </h2>

        {/* Description */}
        <p
          className="text-gray-700 text-lg md:text-xl mb-6"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          Lifepoint’s network of services offers a holistic approach to spiritual growth, personal development, and leadership empowerment. From online worship experiences to structured leadership programs, mentorship opportunities, and coaching sessions, everything we do is designed to guide individuals toward faith, growth, and community impact.
        </p>

        <p
          className="text-gray-700 text-lg md:text-xl"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          Whether through livestreamed Sunday services, deep-dive Bible studies, youth and adult mentorship programs, or premium pastoral coaching, Lifepoint supports each person on a journey of spiritual maturity and personal excellence.
        </p>
      </div>
    </section>
  );
};

export default Services;