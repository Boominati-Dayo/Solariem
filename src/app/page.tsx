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
  title: 'Solariem | Multi-currency accounts and asset recovery',
  description:
    'Multi-currency accounts, and a practice that traces money taken by fraud. No recovery fee unless funds actually arrive. You pay 15–25% only then.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Solariem | Multi-currency accounts and asset recovery',
    description:
      'Multi-currency accounts, and a practice that traces money taken by fraud. No recovery fee unless funds actually arrive.',
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
