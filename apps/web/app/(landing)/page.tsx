import { HeroSection } from '@/components/landing/HeroSection';
import { CatalogSection } from '@/components/landing/CatalogSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { AboutSection } from '@/components/landing/AboutSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CatalogSection />
      <ServicesSection />
      <AboutSection />
    </>
  );
}
