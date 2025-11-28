'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CompletePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-8">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-32 h-32 relative">
            <Image
              src="/images/done.png"
              alt="Complete"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              認証が完了しました
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              アプリに戻り電話番号認証でログインできます
            </p>
          </div>
          {/*
          <Button
            onClick={() => window.location.href = 'pucre://'}
            className="group w-full relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 hover:from-slate-800 hover:to-slate-600 dark:hover:from-white dark:hover:to-slate-200 h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              アプリに戻る
            </span>
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          */}
        </div>
      </div>
    </div>
  );
}
