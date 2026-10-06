import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#F5F5F5] px-4 text-center">
      <h1 className="text-5xl font-black font-mono text-[#FACC15]">৪০৪</h1>
      <h2 className="mt-4 text-xl font-bold">পৃষ্ঠাটি পাওয়া যায়নি</h2>
      <p className="mt-2 text-xs text-[#A3A3A3] max-w-sm">
        আপনি যে পেজটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#EAB308] transition-colors"
      >
        হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}
