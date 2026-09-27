import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { PinPromptProvider } from '@/components/dashboard/PinPrompt';
import LoadingOverlay from '@/components/LoadingOverlay';
import ConditionalLayout from '@/components/ConditionalLayout';
import { Toaster } from 'react-hot-toast';
import { SITE_URL, ORG, SERVICES, FAQS } from '@/lib/site';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const TITLE = 'Solariem | Multi-Currency Accounts and Asset Recovery';
const DESCRIPTION =
  'Solariem provides multi-currency accounts and traces fraudulent transfers through the institutions involved. No recovery fee unless funds actually arrive.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Solariem',
  },
  description: DESCRIPTION,
  keywords: [
    'asset recovery',
    'fraud recovery service',
    'scam recovery',
    'tracing stolen funds',
    'bank chargeback help',
    'cross-border transfer',
    'multi-currency account',
  ],
  authors: [{ name: ORG.name }],
  creator: ORG.name,
  publisher: ORG.name,
  applicationName: ORG.name,
  category: 'finance',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: ORG.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Solariem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF9F6',
};

/* Machine-readable identity. Google removed FAQ rich results in May 2026, so
   FAQPage is kept purely for entity understanding — never relied on for SERP. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: ORG.name,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon/favicon.svg`,
      description: ORG.description,
      foundingDate: ORG.foundingDate,
      areaServed: ORG.areaServed,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: ORG.email,
        telephone: ORG.phone,
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'FinancialService',
      '@id': `${SITE_URL}/#service`,
      name: ORG.name,
      url: SITE_URL,
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      description: ORG.description,
      areaServed: ORG.areaServed,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: SERVICES.map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description,
            url: `${SITE_URL}${s.url}`,
          },
        })),
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LoadingProvider>
          <AuthProvider>
            <PinPromptProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
              <LoadingOverlay />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#14130F',
                    color: '#FAF9F6',
                    border: '1px solid #E3E1DA',
                    borderRadius: '0',
                    fontSize: '14px',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: { primary: '#2F6B4F', secondary: '#FAF9F6' },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: { primary: '#A33528', secondary: '#FAF9F6' },
                  },
                }}
              />
            </PinPromptProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
