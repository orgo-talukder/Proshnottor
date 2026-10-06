# 🚀 পূর্ণাঙ্গ বাস্তবায়ন পরিকল্পনা: Pure Firebase Firestore ও Firebase Auth লাইভ ডাটা ইন্টিগ্রেশন

---

## 📌 ওভারভিউ ও মূল লক্ষ্য
আমাদের মূল উদ্দেশ্য হল MCQ Engine প্রজেক্টের রুট লেভেল থেকে সমস্ত ডামি/মক ডাটা, ফলব্যাক অ্যারে এবং স্ট্যাটিক লোকাল স্টেট সম্পূর্ণ অপসারণ করে **Firebase Firestore** এবং **Firebase Authentication** এর সাথে ১০০% লাইভ, ডায়নামিক ও রিয়েল-টাইম আর্কিটেকচার প্রতিষ্ঠা করা।

---

## 🏗️ ১. Firestore Collections ও ডাটা মডেল আর্কিটেকচার

| Collection নাম | উদ্দেশ্য ও ফিল্ডসমূহ |
| :--- | :--- |
| **`quizzes`** (Exams) | `id`, `title`, `description`, `type` (`mock`/`quiz`), `subject`, `duration` (মিনিট), `totalMarks`, `negativeMarks`, `questionIds`, `difficulty`, `status` (`published`/`draft`), `createdAt` |
| **`questions`** | `id`, `stem` (প্রশ্নের বিষয়বস্তু / LaTeX সমীকরণ), `options` (অপশন তালিকা), `subject`, `topic`, `difficulty` |
| **`questionKeys`** | `id` (questionId), `correctIndex`, `explanation` (সঠিক উত্তর ও বিস্তারিত সমাধান) |
| **`attempts`** (User Results) | `id`, `userId`, `userEmail`, `quizId`, `quizTitle`, `score`, `accuracy`, `totalQuestions`, `answeredCount`, `correctCount`, `wrongCount`, `unansweredCount`, `timeSpentSeconds`, `startedAt`, `submittedAt`, `status`, `userAnswers` |
| **`users`** (Profiles) | `uid`, `email`, `displayName`, `photoURL`, `streak`, `totalExamsTaken`, `lastActiveDate`, `weakAreas`, `createdAt` |
| **`bookmarks`** | `id`, `userId`, `questionId`, `subject`, `topic`, `savedAt` |
| **`logs`** (System Logs) | `id`, `action`, `user`, `details`, `timestamp`, `level` |

---

## 🛠️ ২. পেজ-ভিত্তিক লাইভ ডাটা ইন্টিগ্রেশন ও মক ডাটা অপসারণ

### ক) Dashboard Page (`components/DashboardView.tsx`)
- ❌ **অপসারণ**: সমস্ত হার্ডকোডেড স্ট্যাট ও ডামি সাম্প্রতিক রেজাল্ট।
- ✅ **লাইভ ইমপ্লিমেন্টেশন**:
  - `Total Exams`, `Average Score`, `Accuracy`, `Current Streak` সরাসরি Firestore `attempts` ও `users` থেকে লাইভ হিসাব হবে।
  - `Available MCQ Exams` সেকশনে Firestore `quizzes` কালেকশনের লাইভ এক্সাম তালিকা রেন্ডার হবে।
  - `Recent Results` সেকশনে বর্তমান লগইনকৃত ইউজারের সর্বশেষ এক্সাম হিস্ট্রি লাইভ প্রদর্শিত হবে।
  - কোনো এক্সাম বা হিস্ট্রি না থাকলে স্লিক বাংলা এম্পটি স্টেট ও "প্রথম পরীক্ষা শুরু করুন" সিটিএ বাটন প্রদর্শিত হবে।

### খ) MCQ Exam Catalog Page (`components/MCQExamCatalog.tsx`)
- ❌ **অপসারণ**: লোকাল ডামি ফিল্টার ও স্ট্যাটিক এক্সাম অ্যারে।
- ✅ **লাইভ ইমপ্লিমেন্টেশন**:
  - Search bar, Subject Filters (সকল বিষয়, গাণিতিক যুক্তি, বাংলাদেশ বিষয়াবলী, সাধারণ বিজ্ঞান ইত্যাদি), Difficulty (`easy`/`medium`/`hard`), Type (`mock`/`quiz`) লাইভ কুয়েরি ও ফিল্টারিং।
  - লাইভ ডাটা ফেচিংয়ের সময় পালসিং স্কেলিটন লোডার (Skeleton Loader)।

### গ) Progress & Analytics Page (`components/ProgressAnalyticsView.tsx`)
- ❌ **অপসারণ**: ডামি প্রোগ্রেস পার্সেন্টেজ ও স্ট্যাটিক গ্রাফ ডাটা।
- ✅ **লাইভ ইমপ্লিমেন্টেশন**:
  - `Overall Score`, `Overall Accuracy`, `Total Questions Solved` ইউজারের সম্পূর্ণ সাবমিটেড `attempts` কালেকশন থেকে ডায়নামিক ক্যালকুলেশন।
  - `Subject Performance` প্রোগ্রেস বার প্রতিটি বিষয়ের সঠিক উত্তরের শতাংশ অনুযায়ী লাইভ রেন্ডার হবে।
  - `Weak Area Alert` ইউজারের ভুল উত্তর দেওয়া বিষয়সমূহ শনাক্ত করে স্বয়ংক্রিয় পরামর্শ জেনারেট করবে।
  - `Score Trend` টাইমলাইন ও চার্টে প্রতিটি পরীক্ষার লাইভ স্কোর ট্রেন্ড প্রদর্শিত হবে।

### ঘ) History & Wrong Questions Page (`components/HistoryAndWrongQuestions.tsx`)
- ❌ **অপসারণ**: স্ট্যাটিক ভুল প্রশ্নের তালিকা।
- ✅ **লাইভ ইমপ্লিমেন্টেশন**:
  - ইউজারের নেওয়া প্রতিটি পরীক্ষার বিস্তারিত রেজাল্ট শিট, সময় এবং সঠিক/ভুল ব্রেকডাউন লাইভ ফেচ।
  - ভুল হওয়া প্রশ্নগুলো লাইভ `questionKeys` এবং `questions` এর সাথে মিলিয়ে সঠিক উত্তর ও ব্যাখ্যার সাথে প্রদর্শন।

### ঙ) Main Application State & Seeder (`app/page.tsx`, `lib/firestore-service.ts`)
- ✅ **অটো-সিডিং সুবিধা**: ডাটাবেজ প্রথমবার সম্পূর্ণ খালি থাকলে স্বয়ংক্রিয়ভাবে স্ট্যান্ডার্ড বিসিএস প্রশ্ন ও এক্সাম ক্লাউড ফায়ারস্টোরে সেটআপ করবে এবং তাৎক্ষণিক লাইভ কুয়েরিতে যুক্ত হবে।
- ✅ **রিয়েল-টাইম লিসেনার (`onSnapshot`)**: ব্যাকগ্রাউন্ডে অ্যাডমিন কোনো নতুন এক্সাম বা প্রশ্ন যোগ করলে সকল ইউজারের স্ক্রিনে রিলোড ছাড়াই তাৎক্ষণিক আপডেট প্রতিফলিত হবে।

---

## 📋 ৩. ফাইলের তালিকা ও পরিবর্তনসমূহ

| ফাইল | কাজের বিবরণ |
| :--- | :--- |
| `lib/firestore-service.ts` | লাইভ লিসেনার, ইউজার প্রোফাইল স্ট্যাট সিঙ্ক, ডায়নামিক ইউজার কুয়েরি এবং অটো-সিড মেকানিজম নিখুঁত করা। |
| `lib/store.ts` | লোকাল স্টোরেজ ও ক্লাউড ডাটা সিঙ্কিং লজিক অপটিমাইজ করা এবং ডামি ফলব্যাক অবজেক্ট ক্লিন করা। |
| `app/page.tsx` | রিয়েল-টাইম ফায়ারস্টোর সাবস্ক্রিপশন (`onSnapshot`) যুক্ত করা এবং লাইভ স্টেট প্রপস হিসেবে প্রতিটি ভিউতে পাস করা। |
| `components/DashboardView.tsx` | খাঁটি লাইভ স্ট্যাট ক্যালকুলেটর ও লাইভ রেজাল্ট ফিড ইন্টিগ্রেশন। |
| `components/MCQExamCatalog.tsx` | লাইভ ফায়ারস্টোর ডাটা ফিল্টারিং এবং স্কেলিটন লোডার নিশ্চিত করা। |
| `components/ProgressAnalyticsView.tsx` | লাইভ অ্যানালিটিক্স, উইক এরিয়া অ্যালার্ট ও স্কোর ট্রেন্ড ক্যালকুলেশন। |
| `components/HistoryAndWrongQuestions.tsx` | লাইভ হিস্ট্রি ও ভুল প্রশ্ন বিশ্লেষণ ইঞ্জিন। |
| `components/AdminPortal.tsx` | অ্যাডমিন প্যানেলে প্রশ্ন/কুইজ তৈরির সাথে সাথে ক্লাউড ফায়ারস্টোর লাইভ সিঙ্ক। |

---

## 🚀 ৪. ভেরিফিকেশন ও কোয়ালিটি গ্যারান্টি

1. **Firestore Connectivity & Data Check**: ফায়ারস্টোর কালেকশনে ডাটা সঠিক স্ট্রাকচারে সংরক্ষিত ও ফেচ হচ্ছে কিনা তা যাচাই করা।
2. **ESLint Validation**: `lint_applet` চালিয়ে কোডে কোনো টাইপ মিসম্যাচ বা আনইউজড ভ্যারিয়েবল নেই তা নিশ্চিত করা।
3. **Production Build Compilation**: `compile_applet` চালিয়ে জিরো-এরর নিশ্চিত করা।
