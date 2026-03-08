'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  ShieldCheck,
  Users,
  Globe,
  PlayCircle,
  Calendar,
  Radio,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const resources = [
  {
    title: "Wisdom Hub",
    description: "Deep-dive knowledge studies and action plans designed for spiritual and mental foundations.",
    color: "#ff9d2e"
  },
  {
    title: "Personal Growth",
    description: "Discover your purpose and build confidence through dedicated life skills modules.",
    color: "#1c7ca6"
  },
  {
    title: "Leadership",
    description: "Masterclasses and certificate programs aimed at developing world-class organizational leaders.",
    color: "#2d4156"
  },
  {
    title: "Mentorship",
    description: "Connect with seasoned mentors for youth and adult coaching tailored to your growth.",
    color: "#ff9d2e"
  },
  {
    title: "Community",
    description: "Engage in groups and forums where authentic relationships are built.",
    color: "#1c7ca6"
  },
  {
    title: "Media Hub",
    description: "Access a wealth of podcasts, insight clips, and inspirational success stories anytime.",
    color: "#2d4156"
  },
  {
    title: "Events",
    description: "Participate in workshops and impact-driven sessions with world-renowned guest speakers.",
    color: "#ff9d2e"
  },
  {
    title: "Live Sessions",
    description: "Join real-time weekly sessions and reflection rooms that ground your daily faith.",
    color: "#1c7ca6"
  }
];

export default function Resources() {
  const router = useRouter();
  return (
    <section id="programs" className="w-full bg-white py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">

        {/* Header Section - Inspiration from Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              More Than A Platform<br />
              <span className="relative">
                A Journey
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Lifepoint Virtual exists to help people live purposefully, grounded in wisdom,
              shaped by leadership, and strengthened through a thriving community.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              We believe growth is meant to be lived out in real life. Here, you'll find
              the resources and people to walk together through every season of maturity.
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mb-20" />

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          {resources.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col items-start space-y-4"
            >
              <div className="space-y-3">
                <h3
                  className="text-xl font-bold uppercase tracking-wide transition-colors duration-300"
                  style={{ color: item.color }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => router.push('/auth')}
                className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors duration-300"
              >
                <span>Explore</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
