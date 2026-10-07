# Pure Black EdTech (Chorcha) Platform Redesign: Comprehensive Architectural Blueprint & Implementation Plan

> **লক্ষ্য**: Google Stitch থেকে এক্সপোর্টকৃত "stitch_mock_exam_platform_design.zip" এর ৩৮টি স্ক্রিনের প্রিমিয়াম UI ডিজাইনকে বর্তমান Next.js 15 + Cloud Firestore প্ল্যাটফর্মে শতভাগ টাইপ-সেফ, পিওর ব্ল্যাক (#000000) আর্কিটেকচারে রূপান্তর করা।

---

## ১. ক্যাপাবিলিটি সামারি ও এনভায়রনমেন্ট স্ট্যাটাস
- **Design Export**: `/app/applet/stitch_mock_exam_platform_design.zip` সফলভাবে আনজিপ করা হয়েছে (`/tmp/stitch_extract` ডিরেক্টরিতে)।
- **ডিজাইন সোর্স**: ৩৮টি সম্পূর্ণ ইউনিক স্ক্রিন HTML + `DESIGN.md` স্পেসিফিকেশন।
- **লাইভ ব্যাকএন্ড**: Google Cloud Firestore ডাটাবেজ `ai-studio-proshnottor-1d7a3d52-9a8f-427b-98fa-ca5347961075` এবং Firebase Auth সরাসরি সংযুক্ত ও যাচাইকৃত।
- **কোড কোয়ালিটি বেসলাইন**: `compile_applet` এবং `lint_applet` শতভাগ পাস (0 Errors)।

---

## ২. সিস্টেম আর্কিটেকচার ও শেল স্ট্রাকচার

```
                                 ┌─────────────────────────┐
                                 │     Root Middleware     │
                                 │   Auth & RBAC Guards    │
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┼────────────────────────┐
                      ▼                       ▼                        ▼
           ┌──────────────────────┐┌──────────────────────┐ ┌──────────────────────┐
           │     Landing / Auth   ││   Student AppShell   │ │      Admin Shell     │
           │        Shell         ││  (Left Sidebar 260px │ │ (Isolated Admin Nav  │
           │ (No Sidebar / Minimal││   + Mobile Tab Bar   │ │  Strict Admin RBAC   │
           │  Header CTA only)    ││   + More Drawer)     │ │  argotalukder70@...) │
           └──────────┬───────────┘└──────────┬───────────┘ └──────────┬───────────┘
                      │                       │                        │
       ┌──────────────┴──────────┐            │             ┌──────────┴──────────┐
       │ / (Landing Page)        │            │             │ /admin (Dashboard)  │
       │ /login                  │            │             │ /admin/questions    │
       │ /register               │            │             │ /admin/exams        │
       │ /forgot-password        │            │             │ /admin/students     │
       └─────────────────────────┘            │             │ /admin/audit-logs   │
                                              │             └─────────────────────┘
                                              ▼
                                 ┌────────────────────────┐
                                 │  Student Core Views    │
                                 │  /dashboard            │
                                 │  /mcq                  │
                                 │  /mock-tests           │
                                 │  /quizzes              │
                                 │  /history              │
                                 │  /progress             │
                                 │  /saved                │
                                 │  /leaderboard          │
                                 │  /profile & /settings  │
                                 └────────────┬───────────┘
                                              │
                                              ▼ Launch Exam
                                 ┌────────────────────────┐
                                 │   Focus Exam Runner    │
                                 │  /exam/[id]/runner     │
                                 │  (Zero Sidebar, Top HUD│
                                 │   Matrix Palette 320px │
                                 │   Server-Side Graded)  │
                                 └────────────────────────┘
```

---

## ৩. কোর ডিজাইন সিস্টেম টোকেন (Pure Black Enforcement)

| টোকেন নাম | HEX কোড | ব্যবহার |
| :--- | :--- | :--- |
| **Ground (Base BG)** | `#000000` | প্রধান ব্যাকগ্রাউন্ড (OLED ব্ল্যাক, নো গ্রে/নেভি) |
| **Surface Level 1** | `#0A0A0A` | বেস কার্ড, কন্টেইনার প্যানেল, সাইডবার ব্যাকগ্রাউন্ড |
| **Surface Level 2** | `#121212` | ড্রপডাউন, মোডাল, হোভার স্টেট, অ্যাক্টিভ ন্যাভ আইটেম |
| **Surface Level 3** | `#1A1A1A` | সিলেক্টেড অপশন, এলিভেটেড ইউটিলিটি বক্স |
| **Border Subtle** | `#262626` | ১px প্যাসিভ সীমানা, ডিভাইডার, কার্ড বর্ডার |
| **Border Strong** | `#3F3F3F` | ইনপুট ফিল্ড, আন-সিলেক্টেড অপশন ফ্রেম |
| **Border Interactive**| `#FACC15` | ফোকাস রিং, সিলেক্টেড রেডিও বাটন আউটলাইন |
| **Accent Primary** | `#FACC15` | একক প্রাইমারি সিটিএ বাটন (টেক্সট: `#000000`) |
| **Accent Hover** | `#FDE047` | প্রাইমারি বাটন হোভার স্টেট |
| **Text Primary** | `#F5F5F5` | প্রশ্নের মূল অংশ, হেডিং, গুরুত্বপূর্ণ সংখ্যা |
| **Text Secondary** | `#A3A3A3` | মেটাডাটা, বিবরণ, ব্রেডক্রাম্ব |
| **Text Muted** | `#6B6B6B` | প্লেসহোল্ডার, নিষ্ক্রিয় স্টেপ |
| **Status Success** | `#22C55E` | সঠিক উত্তর, পজিটিভ স্কোর ডেল্টা |
| **Status Danger** | `#EF4444` | ভুল উত্তর, মেয়াদোত্তীর্ণ টাইমার (<৫ মিনিট) |
| **Status Warning** | `#F59E0B` | লো-টাইম ওয়ার্নিং, আন-অ্যাটেম্পটেড কাউন্ট |
| **Review / Flag** | `#A855F7` | বুকমার্ক ও রিভিউ ফ্ল্যাগ করা প্রশ্ন |

---

## ৪. ফায়ারস্টোর ডাটা লেয়ার ও সার্ভার-সাইড সিকিউরিটি আর্কিটেকচার

1. **প্রশ্নোত্তর সিকিউরিটি ফিক্স**:
   - বর্তমানে `questionKeys` ক্লায়েন্ট থেকে সরাসরি রিড করা যায় এবং ব্রাউজারে `evaluateAttempt` হয়।
   - **পরিকল্পিত সমাধান**: নেক্সট.জেএস Server Action (`/app/actions/submit-exam.ts`) অথবা API Route (`/api/exams/submit`) এর মাধ্যমে সার্ভার-সাইডে উত্তর মূল্যায়ন হবে। ক্লায়েন্টে এক্সাম চলাকালীন কেবল প্রশ্ন (`stem`, `options`, `id`) যাবে, কোনো `correctIndex` বা উত্তর কখনোই যাবে না।

2. **লাইভ কালেকশনসমূহ**:
   - `quizzes`: প্রকাশিত মক টেস্ট ও কুইজের তালিকা।
   - `questions`: মূল প্রশ্ন ব্যাংক (উৎস, বিষয়, অপশনস)।
   - `questionKeys`: উত্তর ও ব্যাখ্যা (শুধু সার্ভার এবং অ্যাডমিনের জন্য সুরক্ষিত)।
   - `attempts`: শিক্ষার্থীর সাবমিটেড রেজাল্ট শিট ও পরিসংখ্যান।
   - `users`: শিক্ষার্থীর স্ট্রীক, পয়েন্ট, প্রতিষ্ঠান ও প্রোফাইল।
   - `bookmarks`: ব্যক্তিগত বুকমার্ককৃত প্রশ্নাবলী।
   - `logs`: প্ল্যাটফর্ম অডিট ও ক্রিয়াকলাপের লগ।

---

## ৫. ফেইজভিত্তিক বাস্তবায়ন পরিকল্পনা (Phase A - I)

- **Phase A: Safety Setup & Baseline Stabilization**
  - Git ট্যাগিং, এনভায়রনমেন্ট ভ্যালিডেশন, জিরো-ব্রেকিং বেসলাইন কনফার্মেশন।
- **Phase B: Design Foundation & Design Tokens**
  - Tailwind v4 পিওর ব্ল্যাক টোকেনাইজেশন, ফন্ট সেটআপ (`next/font/google` Inter), নিষিদ্ধ কালার ব্লকার লিন্ট রুল।
- **Phase C: Layout Shells & Unified Navigation**
  - ৩টি স্বতন্ত্র শেল: Landing/Auth Shell, Student AppShell (Sidebar 260px + Mobile Bottom Bar + More Drawer), Focus Exam Shell, এবং Isolated Admin Shell।
- **Phase D: Public & Auth Experience**
  - ল্যান্ডিং পেজ (একক কনভার্সন অপটিমাইজড), লগইন, রেজিস্টার, ফরগট পাসওয়ার্ড ও ওয়েলকাম অনবোর্ডিং।
- **Phase E: Student Core Feature Views**
  - ড্যাশবোর্ড, MCQ প্র্যাকটিস, মক টেস্ট ক্যাটালগ, কুইজেস, হিস্ট্রি, প্রোগ্রেস অ্যানালিটিক্স, সেভড প্রশ্নাবলী, লিডারবোর্ড, প্রোফাইল, সেটিংস ও হেল্প।
- **Phase F: High-Stakes Exam Runner Engine**
  - নির্দেশিকা মডাল, ফুল-স্ক্রিন ফোকাস প্লেয়ার, ট্যাপুলার-নামস কাউন্টডাউন টাইমার, ৩২-সেল কোশ্চেন প্যালেট, অফলাইন অটোসেভ এবং সার্ভার-সাইড সাবমিশন।
- **Phase G: Admin Portal Suite (১৮টি স্ক্রিন)**
  - ড্যাশবোর্ড, প্রশ্ন ব্যাংক, ইম্পোর্ট উইজার্ড, বিষয়-টপিক হায়ারার্কি, অ্যাসেসমেন্ট বিল্ডার, শিক্ষার্থী ব্যবস্থাপনা, অডিট লগ ও এনাউন্সমেন্টস।
- **Phase H: Hardening & Responsive Polish**
  - 360px, 768px, 1024px, 1440px রেসপনসিভনেস, কিবোর্ড অ্যাক্সেসিবিলিটি (WCAG), এবং সিকিউরিটি রুলস অডিট।
- **Phase I: Cleanup, Final Audit & Production Ready**
  - ডেড কোড অপসারণ, ডকুমেন্টেশন আপডেট, ডিপ্লয়মেন্ট চেকলিস্ট অনুমোদন।
