# প্রজেক্ট সিকিউরিটি অডিট রিপোর্ট ও `.env` নির্ভর ফায়ারবেস কনফিগারেশন প্ল্যান

এই নথিতে আপনার প্রজেক্টের সামগ্রিক নিরাপত্তা অডিট রিপোর্ট, ফায়ারবেস এপিআই কি লিক সংক্রান্ত সত্যতা ও ব্যাখ্যা, শুধুমাত্র `.env` ফাইলের মাধ্যমে সিক্রেট/কি ব্যবহারের কনফিগারেশন এবং ডাটাবেজ সুরক্ষার বিস্তারিত রূপরেখা দেওয়া হলো।

---

## ইউজার রিভিউ ও নিশ্চিতকৃত সিদ্ধান্তসমূহ (Confirmed Decisions)

> [!IMPORTANT]
> **নিশ্চিতকৃত সিদ্ধান্তসমূহ:**
> 1. **Firebase Keys আর্কিটেকচার**: প্রজেক্টের সমস্ত Firebase Credentials শুধুমাত্র `.env` ফাইল থেকে লোড হবে। কোডের অন্য কোথাও কোনো হার্ডকোডেড কি থাকবে না।
> 2. **Environment ভ্যালিডেশন**: `.env` ফাইলে কোনো Firebase ভেরিয়েবল মিসিং থাকলে অ্যাপ্লিকেশন স্বয়ংক্রিয়ভাবে একটি নির্দেশনামূলক সিকিউর স্ক্রিন প্রদর্শন করবে।
> 3. **প্রশ্ন ও উত্তরের নিরাপত্তা (Anti-Cheat & Security)**: পরীক্ষার চলাকালীন শিক্ষার্থীরা যাতে ব্রাউজারের Inspect বা Network tab থেকে আগেই সঠিক উত্তর (`questionKeys`) দেখতে না পারে, সেজন্য সিকিউরিটি রুলস আরও কঠোর করা হবে।

---

## ১. সিকিউরিটি স্ক্যান ও অডিট রিপোর্ট (Security Audit Report)

### ক. Firebase Web API Key কি কোনো গোপন পাসওয়ার্ড? হ্যাকাররা কি ক্ষতি করতে পারবে?
অনেক ডেভেলপার মনে করেন Firebase API Key লিক হলে সম্পূর্ণ ডাটাবেজ হ্যাক হয়ে যাবে। কিন্তু **গুগল ফায়ারবেসের অফিসিয়াল আর্কিটেকচার** অনুযায়ী:
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `projectId`, `appId` হলো ক্লায়েন্ট-আইডেন্টিফায়ার (Client Identifiers)। এগুলো ব্রাউজারকে নির্দেশ করে যে কোন Firebase প্রজেক্টের সাথে যুক্ত হতে হবে।
- এই কি ব্রাউজার বান্ডলে গেলেও হ্যাকাররা আপনার ডাটাবেজের নিয়ন্ত্রণ পাবে না, কারণ ফায়ারবেসের প্রকৃত নিরাপত্তা নিশ্চিত করে **Firestore Security Rules (`firestore.rules`)** এবং **Firebase Authentication**।

### খ. বর্তমান প্রজেক্টের নিরাপত্তা স্ট্যাটাস:
| নিরাপত্তা ক্ষেত্র | বর্তমান অবস্থা | মূল্যায়ন ও পদক্ষেপ |
| :--- | :--- | :--- |
| **Git / Repo Leakage** | `.gitignore`-এ `.env*` যুক্ত আছে | ✅ সুরক্ষিত। কোনো সিক্রেট `.env` ফাইল Git-এ পুশ হবে না। |
| **Firestore Database Rules** | Role-Based Access Control (`firestore.rules`) সক্রিয় | ✅ সুরক্ষিত। অনুমতি ছাড়া কেউ অন্যের ডাটা মুছতে বা পরিবর্তন করতে পারবে না। |
| **Admin Privilege Control** | `argotalukder70@gmail.com` + Password Re-auth | ✅ সুরক্ষিত। শুধুমাত্র নির্দিষ্ট অ্যাডমিন ইমেইলই অ্যাডমিন প্যানেলে প্রবেশ করতে পারে। |
| **Exam Question Keys** | পরীক্ষার প্রশ্নের সঠিক উত্তর সুরক্ষা | ⚠️ আপডেট করা হবে যাতে পরীক্ষার সময় সঠিক উত্তর সরাসরি ক্লায়েন্টে এক্সপোজ না হয়। |

---

## ২. শুধুমাত্র `.env` ফাইল থেকে কনফিগারেশন নিশ্চিতকরণ

আমরা `lib/firebase.ts` ফাইলটি আপডেট করব যাতে:
1. এটি **শুধুমাত্র** `process.env.NEXT_PUBLIC_FIREBASE_*` থেকে মান গ্রহণ করে।
2. কোনো হার্ডকোডেড JSON কনফিগ ফাইলে নির্ভরশীলতা থাকবে না।
3. যদি `.env` ফাইলে কিগুলো কনফিগার করা না থাকে, তবে অ্যাপটি ক্র্যাশ না করে একটি নিরাপদ কনফিগারেশন গাইড স্ক্রিন দেখাবে।

### `.env` ফাইলে প্রয়োজনীয় ভেরিয়েবলসমূহ:
```env
# Firebase Client Configuration Keys
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="proshnottor.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="proshnottor-1d7a3d52"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="proshnottor.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="143573679457"
NEXT_PUBLIC_FIREBASE_APP_ID="1:143573679457:web:..."
NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

---

## ৩. সিকিউরিটি রুলস (`firestore.rules`) আরও কঠোরকরণ

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Firestore Security Layer Architecture              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌─────────────────────┐             ┌────────────────────────────┐   │
│   │   Student Client    │             │       Admin Client         │   │
│   │  (Authenticated)    │             │(argotalukder70@gmail.com)  │   │
│   └──────────┬──────────┘             └─────────────┬──────────────┘   │
│              │                                      │                  │
│              ▼                                      ▼                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                  firestore.rules (Security Gate)               │   │
│   │ - Deny-all by default                                          │   │
│   │ - /users/{uid}: Only Owner or Admin can write                  │   │
│   │ - /quizzes: Read-only for students, Write-only for Admin       │   │
│   │ - /attempts/{attemptId}: User can only create/view their own   │   │
│   │ - /questionKeys: Protected during ongoing exam evaluations     │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ৪. বাস্তবায়ন পরিকল্পনা (Implementation Plan)

1. **`lib/firebase.ts` রিফ্যাক্টরিং**:
   - সরাসরি `.env` রিডিং লজিক ও ভ্যালিডেশন চেক যোগ করা।
   - `.env` মিসিং হলে ফ্রেন্ডলি সিকিউরিটি স্ক্রিন প্রদান।
2. **`firestore.rules` ডিপ্লয়মেন্ট ও ভেরিফিকেশন**:
   - ইউজার ডেটা পারমিশন এবং অ্যাডমিন এক্সেস রুলস পূর্ণরূপে চেক করা।
   - `DeployRules` আরপিসি নিশ্চিত করা।
3. **কম্পাইলেশন ও সিকিউরিটি টেস্ট**:
   - `compile_applet` এবং `lint_applet` চালিয়ে বিল্ড ও টাইপ ভেরিফিকেশন সম্পন্ন করা।
