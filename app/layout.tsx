import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chorcha - Online Exam & Quiz Evaluation Platform',
  description: 'Pure Black online mock exam and practice platform for competitive examinations.',
  openGraph: {
    title: 'Chorcha - Online Exam & Quiz Evaluation Platform',
    description: 'Pure Black online mock exam and practice platform for competitive examinations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chorcha - Online Exam & Quiz Evaluation Platform',
    description: 'Pure Black online mock exam and practice platform for competitive examinations.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body suppressHydrationWarning className="bg-[#000000] text-[#F5F5F5] antialiased selection:bg-[#FACC15] selection:text-black min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
