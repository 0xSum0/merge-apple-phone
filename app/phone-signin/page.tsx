'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function PhoneSignInPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
      });
    }
  }, []);

  const isValidJapanPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(0[789]0\d{8}|0\d{9})$/.test(cleaned);
  };

  const isValid = isValidJapanPhone(phoneNumber);

  const handleSendSMS = async () => {
    setLoading(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = '+81' + phoneNumber.substring(1);
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      (window as any).confirmationResult = confirmationResult;
      router.push('/phone-verification');
    } catch (error) {
      console.error('SMS send error:', error);
      alert('SMSの送信に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <div className="p-4 relative z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          type="button"
          className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">戻る</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center p-8 pt-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-base text-slate-600 dark:text-slate-100">
              電話番号を入力してください
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="09012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <Button
              onClick={handleSendSMS}
              disabled={!isValid || loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 h-12 text-base font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '送信中...' : 'SMSを送る'}
            </Button>
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
