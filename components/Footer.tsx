'use client';

import React from 'react';
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Phone, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();

  const quickLinks = [
    { label: 'Church', href: '#' },
    { label: 'Bible Study', href: '#' },
    { label: 'Growth', href: '#' },
    { label: 'Mentorship', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Media', href: '#' },
  ];

  const resources = [
    { label: 'Events', href: '#' },
    { label: 'Support', href: '#' },
  ];

  const socialLinks = [
    { icon: <Facebook size={20} />, href: 'https://facebook.com' },
    { icon: <Instagram size={20} />, href: 'https://instagram.com' },
    { icon: <Youtube size={20} />, href: 'https://youtube.com' },
    { icon: <Linkedin size={20} />, href: 'https://linkedin.com' },
    { icon: <Twitter size={20} />, href: 'https://twitter.com' },
  ];

  const contactNumber = '+254721720069';

  return (
    <footer className="bg-gray-800 text-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo + Description */}
          <div className="space-y-4">
            <div
              className="w-24 h-24 cursor-pointer"
              onClick={() => router.push('/')}
              style={{
                clipPath:
                  'polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)'
              }}
            >
              <img
                src="/logo.jpg"
                alt="Lifepoint Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm md:text-base">
              Lifepoint is a global online church and growth platform empowering youth, adults, and leaders to rise in faith, purpose, and influence.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Phone size={18} />
              <a href={`tel:${contactNumber}`} className="hover:text-red-600 transition-colors">{contactNumber}</a>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <MessageCircle size={18} />
              <a href={`https://wa.me/254721720069`} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-red-600 transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-red-600 transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-600 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-4"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Lifepoint. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
