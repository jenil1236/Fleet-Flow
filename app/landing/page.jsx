import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LogisticsSection } from '@/components/LogisticsSection';
import { RolesSection } from '@/components/RolesSection';
import { StatsSection } from '@/components/StatsSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'FleetFlow - Digital Fleet Management & Record Keeping System',
  description: 'Replace paper logbooks with FleetFlow. Cloud-based fleet management platform for storing vehicle records, tracking trips, managing drivers, and analyzing fleet performance. Access your data anywhere, anytime.',
  keywords: 'fleet management, vehicle tracking, driver management, trip logging, expense tracking, fleet analytics, digital records, cloud fleet management',
  openGraph: {
    title: 'FleetFlow - Digital Fleet Management & Record Keeping System',
    description: 'Replace paper logbooks with FleetFlow. Cloud-based fleet management platform for storing vehicle records, tracking trips, and analyzing fleet performance.',
    url: 'https://fleetflow-ten.vercel.app',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'FleetFlow',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '150',
            },
            description: 'Digital fleet management and record-keeping system for modern logistics operations.',
            featureList: [
              'Vehicle Management',
              'Driver Management',
              'Trip Tracking',
              'Expense Tracking',
              'Real-time Analytics',
              'Multi-user Access',
              'Cloud Storage',
              'Logistic Management'
            ],
          }),
        }}
      />
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
    </>
  );
}
