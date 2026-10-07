'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#F5F5F5] px-4 text-center select-none">
      <div className="h-12 w-12 rounded-xl bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold">Unexpected Exception Encountered</h2>
      <p className="mt-2 text-xs text-[#A3A3A3] max-w-sm">
        An operational error occurred during evaluation. Your saved state is preserved.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#FDE047] transition-colors"
      >
        Retry Action
      </button>
    </div>
  );
}

