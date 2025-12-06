'use client';

import React, { useState } from 'react';
import { ChevronDown, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const menuItems = {
    Church: [
      { label: 'Sunday Livestream', href: '#' },
      { label: 'Prayer Rooms', href: '#' },
      { label: 'Past Messages', href: '#' }
    ],
    'Bible Study': [
      { label: 'Bible Study Hub', href: '#' },
      { label: 'Daily Devotion', href: '#' },
      { label: 'AI Study Guide', href: '#' }
    ],
    Growth: [
      { label: 'Personal Growth', href: '#' },
      { label: 'Leadership Development', href: '#' },
      { label: 'Assessments', href: '#' }
    ],
    Mentorship: [
      { label: 'Find a Mentor', href: '#' },
      { label: 'Book Coaching', href: '#' },
      { label: 'Youth Mentorship', href: '#' }
    ],
    Community: [
      { label: 'Global Groups', href: '#' },
      { label: 'Forums', href: '#' },
      { label: 'Events', href: '#' }
    ],
    Media: [
      { label: 'Videos', href: '#' },
      { label: 'Podcasts', href: '#' },
      { label: 'Guest Speakers', href: '#' }
    ]
  };

  type MenuKey = keyof typeof menuItems;

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderMenuItems = (key: MenuKey) =>
    menuItems[key].map((subitem) => (
      <a
        key={subitem.label}
        href={subitem.href}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
      >
        {subitem.label}
      </a>
    ));

  return (
    <nav className="w-full bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-xl">L</div>
            </div>
          </div>

          {/* Desktop Menu - Centered */}
          <div className="hidden lg:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {Object.keys(menuItems).map((item) => {
              const key = item as MenuKey;
              return (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setOpenMenu(key)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wider transition-colors">
                    <span>{key}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openMenu === key ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 mt-0 w-56 bg-white rounded-md shadow-xl border border-gray-200 transition-all duration-200 origin-top z-50 ${
                      openMenu === key
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    <div className="py-2">{renderMenuItems(key)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Login - Right Side */}
          <div className="hidden lg:flex">
            <a
              href="#"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm uppercase tracking-wider transition-colors"
            >
              <User size={18} />
              <span>Login</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 z-50 relative">
            {Object.keys(menuItems).map((item) => {
              const key = item as MenuKey;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenMenu(openMenu === key ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-red-600 font-medium text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>{key}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${openMenu === key ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {openMenu === key && (
                    <div className="bg-gray-50">{renderMenuItems(key)}</div>
                  )}
                </div>
              );
            })}

            {/* Mobile Login */}
            <div className="border-t border-gray-200 mt-4 pt-4 px-4">
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 text-sm uppercase tracking-wider"
              >
                <User size={18} />
                <span>Login</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
