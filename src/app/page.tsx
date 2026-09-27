import type { Metadata } from 'next';
import PublicRoute from '@/components/PublicRoute';
import BankingHero from '@/components/BankingHero';
import ReportScamSection from '@/components/ReportScamSection';
import ServiceSplit from '@/components/ServiceSplit';
import WhyChooseUs from '@/components/WhyChooseUs';
import ProcessSteps from '@/components/ProcessSteps';
import AssetRecoverySection from '@/components/AssetRecoverySection';
import FraudTypes from '@/components/FraudTypes';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import SecurityCompliance from '@/components/SecurityCompliance';
import FinalCTA from '@/components/FinalCTA';

export const metadata: Metadata = {
  title: 'Solariem | Trace money lost to fraud, hold what you keep',
  description:
      'We trace money taken by fraud through the banks that moved it, and hold balances in several currencies. You pay 15-25% only when money actually reaches you.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Solariem | Trace money lost to fraud, hold what you keep',
    description:
      'We trace money taken by fraud through the banks that moved it. You pay 15-25% only when money actually reaches you.',
    url: '/',
  },
};

// Every section is static, server-rendered content shipped in the initial HTML
// response, so the page paints at once on a slow connection. Only the FAQ
// accordion and the testimonials island are client components.

export default function Home() {
  return (
    <PublicRoute>
      <main id="main" className="bg-background">
        <BankingHero />
        <ServiceSplit />
        <AssetRecoverySection />
        <ProcessSteps />
        <FraudTypes />
        <WhyChooseUs />
        <ReportScamSection />
        <SecurityCompliance />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTA />
      </main>
    </PublicRoute>
  );
}
