import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://fleetflow-ten.vercel.app'),
  title: {
    default: 'FleetFlow - Digital Fleet Management System',
    template: '%s | FleetFlow'
  },
  description: 'Modern cloud-based fleet management platform. Store vehicle records, track trips, manage drivers, monitor expenses, and get real-time analytics. Replace paper logbooks with digital record-keeping.',
  keywords: [
    'fleet',
    'logistics',
    'fleet management',
    'fleet management software',
    'vehicle tracking',
    'fleet analytics',
    'driver management',
    'trip management',
    'expense tracking',
    'fleet maintenance',
    'logistics software',
    'fleet record keeping',
    'digital fleet management',
    'cloud fleet management',
    'fleet management system',
    'vehicle management software',
    'fleet operations'
  ],
  authors: [{ name: 'FleetFlow Team' }],
  creator: 'FleetFlow',
  publisher: 'FleetFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fleetflow-ten.vercel.app',
    title: 'FleetFlow - Digital Fleet Management System',
    description: 'Modern cloud-based fleet management platform. Store vehicle records, track trips, manage drivers, and get real-time analytics.',
    siteName: 'FleetFlow',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FleetFlow - Digital Fleet Management System',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FleetFlow - Digital Fleet Management System',
    description: 'Modern cloud-based fleet management platform. Store vehicle records, track trips, manage drivers, and get real-time analytics.',
    images: ['/og-image.png'],
    creator: '@fleetflow',
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
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
