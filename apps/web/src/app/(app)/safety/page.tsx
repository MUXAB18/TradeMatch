'use client';

import { ShieldAlert, ShieldCheck, AlertCircle, FileWarning, EyeOff, Lock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function SafetyPage() {
  const safetyTips = [
    {
      icon: <ShieldAlert className="text-red-500" size={24} />,
      title: "Never pay to apply",
      description: "Legitimate employers and verified recruitment agencies will never ask you to pay for a job offer, visa processing, or an interview. If someone asks for money, it is a scam."
    },
    {
      icon: <EyeOff className="text-orange-500" size={24} />,
      title: "Don't share passwords",
      description: "Never share your TradeMatch password, email password, or any OTPs (One Time Passwords) sent to your phone. We will never ask for them."
    },
    {
      icon: <ShieldCheck className="text-green-500" size={24} />,
      title: "Look for the verified badge",
      description: "When an agency messages you, check if their profile has a 'Verified Agency' badge. This means TradeMatch has confirmed their business license."
    },
    {
      icon: <FileWarning className="text-blue-500" size={24} />,
      title: "Read before you sign",
      description: "Always read the full employment contract. Make sure the salary, working hours, and benefits match what was discussed. Do not sign anything you don't understand."
    },
    {
      icon: <Lock className="text-purple-500" size={24} />,
      title: "Protect your documents",
      description: "Only upload your documents (ID, passport, certificates) directly on the TradeMatch platform. Do not send photos of your passport over WhatsApp to unverified recruiters."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <ShieldAlert size={28} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Worker Safety Guide</h1>
      </div>
      <p className="text-gray-500 text-lg mb-10 mt-2">
        Your safety is our top priority. Read these guidelines to protect yourself from scams and fake job offers.
      </p>

      <div className="grid gap-6">
        {safetyTips.map((tip, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
              {tip.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
              <p className="text-gray-600 leading-relaxed">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center flex flex-col items-center max-w-2xl mx-auto">
        <HelpCircle size={32} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Need to report suspicious activity?</h2>
        <p className="text-gray-600 mb-6 max-w-xl leading-relaxed">
          If you encounter a recruiter asking for money or exhibiting suspicious behavior, please report them immediately so we can investigate.
        </p>
        <button className="h-12 px-6 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-full hover:border-gray-300 transition-colors shadow-sm">
          Report an Issue
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link href="/home" className="text-blue-600 font-bold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
