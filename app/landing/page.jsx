import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LogisticsSection } from '@/components/LogisticsSection';
import { RolesSection } from '@/components/RolesSection';
import { StatsSection } from '@/components/StatsSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <LogisticsSection />
      <FeaturesSection />
      <RolesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
