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
                Created by the Still Speaking Writer's Group by The Pilgrim Press, the Daily Devotional grounds our daily faith.
              </p>
            </div>

            <button
              onClick={() => router.push('/auth')}
              className="self-start px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-[#1c7ca6] transition-all duration-300">
              Subscribe to Daily Devotional
            </button>
          </div>

          {/* Right Column - Secondary Card */}
          <div className="flex-1 relative py-8 md:py-0 px-6 md:px-0 flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:absolute md:-top-8 md:-bottom-8 md:right-0 w-full md:w-[90%] bg-[#1080aa] rounded-[40px] p-8 md:p-12 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <h3 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide">
                  THIRSTY
                </h3>
                <p className="text-white text-lg md:text-xl leading-relaxed font-normal">
                  O God, you are my God, I seek you, my soul thirsts for you; my flesh faints for you,
                  as in a dry and weary land where there is no water. — Psalm 68:1 (NRSV) &nbsp; O God, I'm so thirsty. I'm thirsty for a...
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => router.push('/auth')}
                  className="text-white font-bold uppercase tracking-widest text-sm underline underline-offset-8 hover:text-white/80 transition-all">
                  Read More
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DailyDevotional;
