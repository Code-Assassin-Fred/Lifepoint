import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import Services from '@/components/Services';
import SkillsComponent from '@/components/SkillsComponent';
import InsideValuetainment from '@/components/InsideLifepoint';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Mission />
      <Services />
      <SkillsComponent />
      <InsideValuetainment />
      <Footer />
    </>
  );
}