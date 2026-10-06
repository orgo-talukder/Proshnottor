'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Search,
  ChevronDown,
  Mail,
  Send,
  MessageSquare,
  Lock,
  Database,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface HelpAndPrivacyViewProps {
  viewType: 'help' | 'privacy';
}

export default function HelpAndPrivacyView({ viewType }: HelpAndPrivacyViewProps) {
  const [searchFaq, setSearchFaq] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const faqs = [
    {
      q: 'অনলাইন MCQ পরীক্ষায় কীভাবে অংশগ্রহণ করব?',
      a: 'Dashboard বা বাম পাশের Sidebar থেকে "MCQ Exam" নির্বাচন করুন। যে পরীক্ষাটিতে অংশ নিতে চান তার কার্ডে "Start" বাটনে ক্লিক করুন। নির্দেশাবলী পড়ে সম্মতি দিয়ে সরাসরি লাইভ পরীক্ষা আরম্ভ করতে পারবেন।',
    },
    {
      q: 'পরীক্ষা চলাকালে ইন্টারনেট চলে গেলে কি আমার উত্তর হারিয়ে যাবে?',
      a: 'না। Proshnottor প্ল্যাটফর্মে অপটিমিস্টিক লোকাল ক্যাশ প্রযুক্তি ব্যবহার করা হয়েছে। প্রতিটি উত্তর তাৎক্ষণিকভাবে আপনার ডিভাইসে সেভ হয়ে যায় এবং ইন্টারনেট ফিরে পাওয়া মাত্রই সার্ভারে ক্লাউড সিঙ্ক সম্পন্ন হয়।',
    },
    {
      q: 'নেগেটিভ মার্কিং কীভাবে হিসাব করা হয়?',
      a: 'বিসিএস ও অন্যান্য প্রতিযোগিতামূলক পরীক্ষার স্ট্যান্ডার্ড নিয়ম অনুযায়ী প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা হয়। কোনো প্রশ্নের উত্তর না দিলে (Unattempted) কোনো নম্বর কাটা যাবে না।',
    },
    {
      q: 'ভুল প্রশ্নগুলো কীভাবে পুনরায় প্র্যাকটিস করব?',
      a: 'Sidebar থেকে "History" এর অধীনে "Wrong Questions" এ যান। সেখানে আপনার পূর্ববর্তী পরীক্ষাগুলোর সকল ভুল প্রশ্ন সঠিক ব্যাখ্যাসহ দেখতে পারবেন এবং "ভুল প্রশ্নগুলো পুনরায় প্র্যাকটিস করুন" বাটনে ক্লিক করে রিটেক দিতে পারবেন।',
    },
    {
      q: 'KaTeX সমীকরণ ঠিকমতো না দেখা গেলে কী করব?',
      a: 'ব্রাউজার পেজটি রিফ্রেশ দিন। আমাদের প্ল্যাটফর্ম সম্পূর্ণ বিল্ট-ইন KaTeX ম্যাথ ইঞ্জিন ব্যবহার করে, যা ইন্টারনেট স্পিড কম থাকলেও অত্যন্ত পরিষ্কারভাবে গণিত ও বিজ্ঞানের সমীকরণ ডিসপ্লে করে।',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
      item.a.toLowerCase().includes(searchFaq.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {viewType === 'help' ? (
        <>
          {/* HELP CENTER */}
          <div className="space-y-3 border-b border-[#262626] pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
              Help Center & FAQ
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              পরীক্ষা পদ্ধতি, টাইমার, নেগেটিভ মার্কিং এবং প্রযুক্তিগত সকল প্রশ্নের সমাধান।
            </p>

            {/* Search Help */}
            <div className="relative pt-2">
              <Search className="h-4 w-4 absolute left-3.5 top-5 text-[#6B6B6B]" />
              <input
                type="text"
                value={searchFaq}
                onChange={(e) => setSearchFaq(e.target.value)}
                placeholder="প্রশ্ন বা সমস্যা খুঁজুন..."
                className="w-full h-11 pl-10 pr-4 bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-xl text-xs text-[#F5F5F5] placeholder-[#555] outline-none"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Getting Started', 'MCQ Exam Rules', 'Results & Scoring', 'Timer & Auto-Save', 'Account & Privacy', 'Security'].map((cat) => (
              <div
                key={cat}
                onClick={() => setSearchFaq(cat === 'MCQ Exam Rules' ? 'নেগেটিভ' : '')}
                className="p-3.5 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] cursor-pointer text-xs font-semibold text-[#F5F5F5] transition-colors"
              >
                {cat}
              </div>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#F5F5F5]">Frequently Asked Questions</h2>
            <div className="space-y-2.5">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#262626] bg-[#0A0A0A] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#F5F5F5] hover:text-[#FACC15] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#6B6B6B] shrink-0 ml-2 transition-transform ${
                          isOpen ? 'rotate-180 text-[#FACC15]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-[#A3A3A3] leading-relaxed border-t border-[#1C1C1C]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Trigger */}
          <div className="rounded-2xl border border-[#262626] bg-[#0D0D0D] p-6 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#F5F5F5]">এখনও সাহায্য প্রয়োজন?</h3>
            <p className="text-xs text-[#A3A3A3]">
              আমাদের সাপোর্ট টিম সবসময় আপনার প্রশ্নের উত্তর দিতে প্রস্তুত রয়েছে।
            </p>
            <button
              onClick={() => {
                setContactModalOpen(true);
                setSupportSubmitted(false);
              }}
              className="mt-2 inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] transition-all shadow"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Support</span>
            </button>
          </div>
        </>
      ) : (
        /* PRIVACY POLICY (Spec Section 60) */
        <div className="space-y-6">
          <div className="border-b border-[#262626] pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
              Privacy Policy & Security
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
              ব্যবহারকারীর তথ্যের নিরাপত্তা ও ডেটা স্টোরেজ সম্পর্কিত বিস্তারিত নীতিমালা।
            </p>
          </div>

          <div className="space-y-6 text-xs text-[#A3A3A3] leading-relaxed">
            <section className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
              <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#FACC15]" />
                1. Information We Collect
              </h2>
              <p>
                Proshnottor প্ল্যাটফর্ম ব্যবহারকালে আমরা আপনার নাম, ইমেইল ঠিকানা, রোল (Student/Admin), শিক্ষা প্রতিষ্ঠান এবং পরীক্ষার ফলাফল ও উত্তরের পরিসংখ্যান সংগ্রহ করি যাতে আপনার প্রোগ্রেস ও অ্যানালিটিক্স প্রদর্শিত হতে পারে।
              </p>
            </section>

            <section className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
              <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <Database className="h-4 w-4 text-sky-400" />
                2. Data Storage & Firebase Integration
              </h2>
              <p>
                আপনার পরীক্ষার ডাটা এবং অ্যাকাউন্ট তথ্য Google Cloud Firebase Firestore-এ এনক্রিপ্টেড অবস্থায় সংরক্ষিত থাকে। ক্লাউড সংযোগ বিচ্ছিন্ন হলেও ব্রাউজারের লোকাল স্টোরেজে অস্থায়ী ব্যাকআপ রাখা হয়।
              </p>
            </section>

            <section className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
              <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                3. Security & Access Control
              </h2>
              <p>
                আমরা রোল-বেজড অ্যাক্সেস কন্ট্রোল (RBAC) ব্যবহার করি। অ্যাডমিন ছাড়া অন্য কেউ প্রশ্নব্যাংক পরিবর্তন বা অন্যান্য পরীক্ষার্থীর অভ্যন্তরীণ সেশন অ্যাক্সেস করতে পারবে না।
              </p>
            </section>

            <section className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
              <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                4. User Rights & Account Management
              </h2>
              <p>
                আপনার যেকোনো সময় আপনার প্রোফাইল তথ্য সংশোধন করার বা অ্যাকাউন্ট হিস্টোরি মুছে ফেলার অধিকার রয়েছে। সেটিংস মেনু থেকে আপনি এগুলো নিয়ন্ত্রণ করতে পারেন।
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Support Dialog Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5]">Contact Support Team</h3>

            {supportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-lg">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-[#F5F5F5]">বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
                <p className="text-xs text-[#A3A3A3]">
                  আমাদের সাপোর্ট টিম শীঘ্রই আপনার ইমেইলে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => setContactModalOpen(false)}
                  className="mt-4 h-9 px-4 rounded-xl bg-[#262626] text-xs font-semibold text-white"
                >
                  বন্ধ করুন
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSupportSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[#A3A3A3] mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    defaultValue="Argo Talukder"
                    required
                    className="w-full h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    defaultValue="argotalukder70@gmail.com"
                    required
                    className="w-full h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1">সমস্যার বিবরণ</label>
                  <textarea
                    rows={4}
                    placeholder="আপনার প্রশ্ন বা কারিগরি সমস্যার বিবরণ লিখুন..."
                    required
                    className="w-full p-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15] resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="h-9 px-4 rounded-xl border border-[#262626] text-[#A3A3A3] hover:text-white"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-xl bg-[#FACC15] text-black font-bold hover:bg-[#EAB308] flex items-center gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
