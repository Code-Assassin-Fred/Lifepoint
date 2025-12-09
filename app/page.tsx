import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import Services from '@/components/Services';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Mission />
      <Services />
    </>
  );
}