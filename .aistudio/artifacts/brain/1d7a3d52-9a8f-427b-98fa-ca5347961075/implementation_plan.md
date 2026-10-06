# পাসওয়ার্ড নিশ্চিতকরণ (Confirm Password), শো/হাইড আইকন ও Firebase `auth/operation-not-allowed` সমাধান প্ল্যান

এই প্ল্যানে ব্যবহারকারীর লগইন/সাইন-আপ পেজে পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড ইনপুট, পাসওয়ার্ড Show/Hide (আঁখি আইকন) সুবিধা, `auth/operation-not-allowed` ত্রুটির কারণ ও সমাধান এবং `.env` ফাইলের মাধ্যমে Firebase Credentials কনফিগার করার সম্পূর্ণ রূপরেখা তুলে ধরা হলো।

---

## ইউজার রিভিউ ও গুরুত্বপূর্ণ সিদ্ধান্তসমূহ (Confirmed Decisions)

> [!IMPORTANT]
> **নিশ্চিতকৃত সিদ্ধান্তসমূহ:**
> 1. **পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড UX**: সাইন-আপ ট্যাবে Password ও Confirm Password উভয় ফিল্ডেই Eye toggle (Show/Hide) থাকবে এবং টাইপ করার সাথে সাথে পাসওয়ার্ড মিলছে কিনা তার লাইভ স্ট্যাটাস (Matching Indicator) প্রদর্শিত হবে।
> 2. **Firebase `.env` কনফিগারেশন**: `process.env.NEXT_PUBLIC_FIREBASE_*` ভেরিয়েবল থেকে কি লোড করা হবে এবং প্রয়োজনে `firebase-applet-config.json` থেকে স্বয়ংক্রিয় ফলব্যাক সাপোর্ট থাকবে।
> 3. **Firebase `auth/operation-not-allowed` হ্যান্ডলিং**: UI-তে স্পষ্ট বাংলায় ত্রুটির কারণ ও সমাধান ব্যাখ্যা করা থাকবে এবং ১-ক্লিক Google Sign-In বিকল্প থাকবে।

---

## ১. ত্রুটির বিশ্লেষণ ও সমাধান নির্দেশিকা (Error Analysis & Fix Guide)

### ক. `auth/operation-not-allowed` ত্রুটিটি কেন এসেছে?
Firebase Authentication-এ ডিফল্টভাবে **Email/Password Provider** বন্ধ (Disabled) থাকে। যখন কোড থেকে `createUserWithEmailAndPassword(auth, email, pass)` কল করা হয়, কিন্তু Firebase Console-এ Email/Password প্রোভাইডার চালু করা থাকে না, তখন Firebase সিকিউরিটি পলিসি অনুযায়ী এই এররটি পাঠায়:
```text
Firebase: Error (auth/operation-not-allowed).
```

### খ. এটি কীভাবে সমাধান করবেন?
যদি আপনি নিজস্ব কাস্টম Firebase প্রজেক্ট ব্যবহার করেন, তবে Firebase Console থেকে এটি চালু করতে হবে:
1. [Firebase Console](https://console.firebase.google.com/)-এ যান এবং আপনার প্রজেক্টটি নির্বাচন করুন।
2. বাম পাশের মেনু থেকে **Build > Authentication**-এ ক্লিক করুন।
3. **Sign-in method** ট্যাবে যান।
4. **Email/Password** অপশনে ক্লিক করে **Enable** টগল অন করুন এবং **Save** করুন।
5. একই সাথে **Google** প্রোভাইডারটিও চালু রয়েছে কিনা দেখে নিন।

### গ. `.env` ফাইলে কীভাবে Firebase Secrets / Keys যোগ করবেন?
Next.js অ্যাপ্লিকেশনে ক্লায়েন্ট সাইড থেকে Firebase ইনিশিয়ালাইজ করার জন্য ভেরিয়েবলগুলোর শুরুতে `NEXT_PUBLIC_` প্রিফিক্স থাকা আবশ্যক।

প্রজেক্টের রুট ডিরেক্টরিতে `.env` বা `.env.local` ফাইলে নিচের মতো কিগুলো যুক্ত করবেন:
```env
# Firebase Configuration Keys
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

আমাদের কোডে `lib/firebase.ts` ফাইলটি আপডেট করা হবে যাতে এটি প্রথমে `.env` থেকে মানগুলো পড়ে এবং কোনো ভেরিয়েবল না থাকলে স্বয়ংক্রিয়ভাবে `firebase-applet-config.json` ফাইল থেকে মান গ্রহণ করে।

---

## ২. ইউজার এক্সপেরিয়েন্স ও ভিজ্যুয়াল ডিজাইন (UX & Visual Details)

### ক. লগইন ট্যাব (Sign In Tab)
- **Email Address** ইনপুট
- **Password** ইনপুট + ডানপাশে **Eye / EyeOff** আইকন (এক ক্লিকে পাসওয়ার্ড দেখা বা গোপন করা যাবে)
- **লগইন করুন** বাটন
- **Google দিয়ে সহজে সাইন-ইন করুন** বাটন (১-ক্লিক অ্যাক্সেস)

### খ. সাইন-আপ ট্যাব (Sign Up Tab)
- **Full Name** ইনপুট
- **Email Address** ইনপুট
- **Password** ইনপুট + **Eye / EyeOff** আইকন + ন্যূনতম ৬ অক্ষরের রিয়েলটাইম ভ্যালিডেশন
- **Confirm Password** ইনপুট + **Eye / EyeOff** আইকন
- **Password Match Helper Indicator**:
  - উভয় পাসওয়ার্ড মিলে গেলে: `✓ পাসওয়ার্ড মিলেছে` (সবুজ রঙ)
  - পাসওয়ার্ড না মিললে: `✗ পাসওয়ার্ড দুটি মিলছে না` (হলুদ/লাল সতর্কবার্তা)
- পাসওয়ার্ড দুটি সঠিক ও মিলে যাওয়া সাপেক্ষে **অ্যাকাউন্ট তৈরি করুন** বাটন সক্রিয় হবে।

### গ. ভিজ্যুয়াল থিম
- Pure Black (`#000000`) ব্যাকগ্রাউন্ড, ডার্ক কার্ড (`#0A0A0A` ও `#121212`), এবং আইকনিক গোল্ডেন-ইয়েলো (`#FACC15`) অ্যাকসেন্ট।

---

## ৩. টেকনিক্যাল আর্কিটেকচার ও ডাটা ফ্লো (Architecture & Flow)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js Application                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌────────────────────────┐            ┌───────────────────────────┐   │
│   │   Environment (.env)   │            │ firebase-applet-config    │   │
│   │ NEXT_PUBLIC_FIREBASE_* │            │ (Auto Fallback Config)    │   │
│   └───────────┬────────────┘            └─────────────┬─────────────┘   │
│               │                                       │                 │
│               └───────────────────┬───────────────────┘                 │
│                                   ▼                                     │
│                        ┌─────────────────────┐                          │
│                        │   lib/firebase.ts   │                          │
│                        │ (App, Auth, DB Init)│                          │
│                        └──────────┬──────────┘                          │
│                                   │                                     │
│                                   ▼                                     │
│                        ┌─────────────────────┐                          │
│                        │ lib/auth-context.tsx│                          │
│                        └──────────┬──────────┘                          │
│                                   │                                     │
│                ┌──────────────────┴──────────────────┐                  │
│                ▼                                     ▼                  │
│   ┌──────────────────────────┐          ┌──────────────────────────┐    │
│   │   components/            │          │   components/            │    │
│   │   AuthLoginView.tsx      │          │   TopHeader & Shell      │    │
│   │ - Eye / EyeOff Toggle    │          │ - Auth Status            │    │
│   │ - Confirm Password Match │          │ - Admin Verification     │    │
│   │ - Error Guide Banner     │          └──────────────────────────┘    │
│   └──────────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ৪. বাস্তবায়নের পর্যায়সমূহ (Implementation Phases)

1. **`lib/firebase.ts` ও `.env.example` আপডেট**:
   - `process.env.NEXT_PUBLIC_FIREBASE_*` থেকে পরিবেশ ভেরিয়েবল রিড করার লজিক এবং ফলব্যাক সমর্থন যোগ করা।
   - `.env.example` ফাইলে Firebase ভেরিয়েবলগুলোর বিস্তারিত ডকুমেন্টেশন ও ফরম্যাট যোগ করা।
2. **`components/AuthLoginView.tsx` আপডেট**:
   - `showPassword` এবং `showConfirmPassword` স্টেট যুক্ত করা।
   - `Eye` ও `EyeOff` আইকন বাটন ইমপ্লিমেন্ট করা।
   - সাইন-আপ ফর্মে **Confirm Password** ইনপুট ফিল্ড ও লাইভ ম্যাচিং ভ্যালিডেশন যোগ করা।
   - `auth/operation-not-allowed` এর জন্য বিশেষায়িত বাংলা ইউজার গাইড ও বিকল্প Google Sign-In অ্যাকশন প্যানেল যোগ করা।
3. **কম্পাইলেশন ও টেস্ট ভেরিফিকেশন**:
   - `compile_applet` এবং `lint_applet` চালিয়ে বিল্ড ভেরিফাই করা।
