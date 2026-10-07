import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#F5F5F5] px-4 text-center select-none">
      <h1 className="text-6xl font-black font-mono text-[#FACC15] tabular-nums">404</h1>
      <h2 className="mt-4 text-xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-xs text-[#A3A3A3] max-w-sm">
        The requested stage does not exist or has been relocated within the examination archive.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#FDE047] transition-colors"
      >
        Return to Platform Home
      </Link>
    </div>
  );
}

