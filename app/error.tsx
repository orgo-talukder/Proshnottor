'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#F5F5F5] px-4 text-center">
      <div className="h-12 w-12 rounded-xl bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400 mb-4 font-mono font-bold text-lg">
        !
      </div>
      <h2 className="text-xl font-bold">একটি অপ্রত্যাশিত ত্রুটি ঘটেছে</h2>
      <p className="mt-2 text-xs text-[#A3A3A3] max-w-sm">
        সিস্টেমে সাময়িক সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#EAB308] transition-colors"
      >
        পুনরায় চেষ্টা করুন
      </button>
    </div>
  );
}
