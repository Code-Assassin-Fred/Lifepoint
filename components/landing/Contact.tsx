'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Play, Send, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Contact = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult("Sending...");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // USER can replace this later

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Message sent successfully!");
        (e.target as HTMLFormElement).reset();
      } else {
        setResult(data.message);
      }
    } catch (error) {
      setResult("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative w-full bg-[#2d4156] py-12 md:py-16 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Fading White Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left Side - Inspiration Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 md:space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
                Let's talk!
              </h2>
              <p className="text-white/80 text-base md:text-lg font-light max-w-sm md:max-w-md">
                Have a question or comment? Let us know. We're here to support your journey.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {/* Contact Button Style from Inspiration */}
              <div className="inline-flex flex-col space-y-8">
                <button className="flex items-center space-x-4 px-6 py-3 border border-white/40 rounded-xl text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 transition-all w-fit">
                  <Mail size={18} />
                  <span>Contact Us</span>
                </button>

                <button
                  onClick={() => router.push('/auth')}
                  className="flex items-center space-x-3 text-[#ff9d2e] font-black uppercase tracking-widest text-base hover:translate-x-2 transition-transform duration-300 w-fit"
                >
                  <Play size={20} fill="currentColor" />
                  <span>Join Us Now</span>
                </button>
              </div>
            </div>


          </motion.div>

          {/* Right Side - Web3 Form Implementation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gray-50/95 rounded-md p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Form Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff9d2e]/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[#2d4156] text-[10px] font-black uppercase tracking-widest">Full Name</label>
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="Name"
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9d2e] transition-all placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#2d4156] text-[10px] font-black uppercase tracking-widest">Email Address</label>
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9d2e] transition-all placeholder:text-gray-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#2d4156] text-[10px] font-black uppercase tracking-widest">Subject</label>
                <div className="relative">
                  <select
                    name="subject"
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9d2e] transition-all appearance-none cursor-pointer pr-12 text-sm"
                  >
                    <option>General Inquiry</option>
                    <option>Mentorship Program</option>
                    <option>Leadership Coaching</option>
                    <option>Prayer Request</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#2d4156] text-[10px] font-black uppercase tracking-widest">Your Message</label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="How can we help you rise..."
                  className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9d2e] transition-all resize-none placeholder:text-gray-400 text-sm"
                />
              </div>

              <button
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#2d4156] text-white rounded-md font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 hover:bg-[#1a2a3a] transition-all shadow-xl shadow-[#2d4156]/20 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                <Send size={16} />
              </button>

              {result && (
                <p className="text-center text-sm font-bold text-[#2d4156] animate-pulse">
                  {result}
                </p>
              )}
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
