import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'প্রশ্নোত্তর (Proshnottor) - অনলাইন কুইজ ও মক এক্সাম',
  description: 'বিসিএস, বিশ্ববিদ্যালয় ভর্তি ও সরকারি চাকরি পরীক্ষার প্রস্তুতির আধুনিক পিওর ব্ল্যাক অনলাইন কুইজ ও মক টেস্ট প্ল্যাটফর্ম।',
  openGraph: {
    title: 'প্রশ্নোত্তর (Proshnottor) - অনলাইন কুইজ ও মক এক্সাম',
    description: 'বিসিএস, বিশ্ববিদ্যালয় ভর্তি ও সরকারি চাকরি পরীক্ষার প্রস্তুতির আধুনিক পিওর ব্ল্যাক অনলাইন কুইজ ও মক টেস্ট প্ল্যাটফর্ম।',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'প্রশ্নোত্তর (Proshnottor) - অনলাইন কুইজ ও মক এক্সাম',
    description: 'বিসিএস, বিশ্ববিদ্যালয় ভর্তি ও সরকারি চাকরি পরীক্ষার প্রস্তুতির আধুনিক পিওর ব্ল্যাক অনলাইন কুইজ ও মক টেস্ট প্ল্যাটফর্ম।',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark">
      <body suppressHydrationWarning className="bg-black text-[#F5F5F5] antialiased selection:bg-[#FACC15] selection:text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
