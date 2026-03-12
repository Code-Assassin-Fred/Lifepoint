'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, User, Search, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '@/lib/services/eventService';

const Navbar = () => {
  const router = useRouter();

  const menuItems = {
    Home: [
      { label: 'Live Sessions' },
      { label: 'Reflection Rooms' },
      { label: 'Recent Insights' }
    ],
    'Wisdom Hub': [
      { label: 'Knowledge Hub' },
      { label: 'Daily Reflection' },
      { label: 'AI Insight Guide' }
    ],
    Growth: [
      { label: 'Personal Growth' },
      { label: 'Leadership Development' },
      { label: 'Assessments' }
    ],
    Mentorship: [
      { label: 'Find a Mentor' },
      { label: 'Book Coaching' },
      { label: 'Youth Mentorship' }
    ],
    Community: [
      { label: 'Community Groups' },
      { label: 'Forums' },
      { label: 'Events' }
    ],
    Media: [
      { label: 'Videos' },
      { label: 'Podcasts' },
      { label: 'Guest Speakers' }
    ]
  };

  type MenuKey = keyof typeof menuItems;

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hasEvents, setHasEvents] = useState<boolean | null>(null);
  const [showNoEventsModal, setShowNoEventsModal] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for events existence
  useEffect(() => {
    const checkEvents = async () => {
      try {
        const events = await eventService.getUpcomingEvents();
        setHasEvents(events.length > 0);
      } catch (error) {
        console.error('Error checking events in Navbar:', error);
        setHasEvents(false);
      }
    };
    checkEvents();
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'upcoming-events' && hasEvents === false) {
      setShowNoEventsModal(true);
      setSidebarOpen(false);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setSidebarOpen(false);
    } else {
      if (id === 'upcoming-events' && hasEvents === false) {
        setShowNoEventsModal(true);
      } else {
        router.push(`/#${id}`);
      }
      setSidebarOpen(false);
    }
  };

  const renderSidebarItems = (key: MenuKey) =>
    menuItems[key].map((subitem) => (
      <button
        key={subitem.label}
        onClick={() => {
          if (subitem.label === 'Events') {
            scrollToSection('upcoming-events');
          } else if (subitem.label === 'Community Groups' || subitem.label === 'Forums') {
            // Keep auth for now or handle accordingly
            router.push('/auth');
            setSidebarOpen(false);
          } else {
            router.push('/auth');
            setSidebarOpen(false);
          }
        }}
        className="w-full text-left px-6 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
      >
        {subitem.label}
      </button>
    ));

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? 'bg-[#2d4156]/95 backdrop-blur-sm shadow-lg border-b border-white/10'
          : 'bg-[#2d4156] border-b border-white/10'
          } ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between relative">

          {/* Text Logo */}
          <div
            className="shrink-0 cursor-pointer relative z-[60]"
            onClick={() => router.push('/')}
          >
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Lifepoint Virtual
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-8">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('about')}
                className="text-white/80 hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('upcoming-events')}
                className="text-white/80 hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
              >
                Upcoming Events
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-white/80 hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
              >
                Contact Us
              </button>
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-all active:scale-95 group font-bold uppercase tracking-widest text-xs"
            >
              <Menu size={20} />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 md:top-24 right-0 md:right-5 w-full md:max-w-sm h-auto max-h-[calc(100vh-100px)] bg-[#1a2a3a]/98 md:bg-[#1a2a3a]/95 backdrop-blur-lg text-white z-[101] shadow-2xl flex flex-col overflow-y-auto rounded-none md:rounded-2xl border-b md:border border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="text-lg font-bold tracking-tight">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 py-4 px-4">
              {Object.keys(menuItems).map((item) => {
                const key = item as MenuKey;
                const isOpen = openMenu === key;
                return (
                  <div key={key} className="mb-1">
                    <button
                      onClick={() => setOpenMenu(isOpen ? null : key)}
                      className={`w-full flex items-center justify-between px-6 py-3 rounded-xl transition-all ${isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/80'
                        }`}
                    >
                      <span className="text-base font-medium">{key}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-white/40'}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 ml-4 border-l border-white/10 space-y-1">
                            {renderSidebarItems(key)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/10 space-y-4">
              <button
                onClick={() => {
                  router.push('/auth');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white text-[#2d4156] rounded-xl font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-black/20 text-sm"
              >
                <User size={18} />
                <span>Login / Register</span>
              </button>
              <div className="text-center text-white/40 text-[10px]">
                © 2026 Lifepoint Fellowship. All rights reserved.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Events Modal */}
      <AnimatePresence>
        {showNoEventsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-20 bg-blue-50 rounded-full -mr-10 -mt-10 z-0" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                  <Info size={40} className="text-white" />
                </div>

                <h3 className="text-2xl font-black text-zinc-900 mb-4 uppercase tracking-tight">No Events Available</h3>
                <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                  We don't have any upcoming events scheduled right now. Please check back later or follow our social media for updates!
                </p>

                <button
                  onClick={() => setShowNoEventsModal(false)}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
