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
      <Contact />
      <Footer />
    </>
  );
}