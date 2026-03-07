import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Mission from '@/components/landing/Mission';
import Services from '@/components/landing/Services';
import DailyDevotional from '@/components/landing/DailyDevotional';
import Resources from '@/components/landing/Resources';
import LeadBishop from '@/components/landing/LeadBishop';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Mission />
      <Services />
      <DailyDevotional />
      <Resources />
      <LeadBishop />

      {/* Fancy Spacer */}
      <div className="relative py-10 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
          <div className="my-4 w-2 h-2 rounded-full bg-[#ff9d2e] shadow-[0_0_15px_rgba(255,157,46,0.5)]" />
          <div className="w-px h-8 bg-gradient-to-t from-transparent via-gray-300 to-transparent" />
        </div>
      </div>

      <Contact />
      <Footer />
    </>
  );
}