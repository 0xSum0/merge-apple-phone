'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import AuthApi from '@/lib/api/authApi';
import LocalPreferences from '@/utils/localPreferences';

export default function PhoneVerificationPage() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidCode = /^\d{6}$/.test(verificationCode);

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const confirmationResult = (window as any).confirmationResult;
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      const uid = user.uid;
      const number = user.phoneNumber;
      const email = user.email ?? "";
      const screenName = user.displayName ?? "";

      const res = await AuthApi.phoneNumberSignIn({ uid, email, screenName });
      if (!res || !uid) {
        console.error("❌ Invalid auth response:", res);
        return;
      }

      const appleUid = LocalPreferences.getUid() || '';
      const appleEmail = LocalPreferences.getEmail() || '';

      const res2 = await AuthApi.mergeApplePhone({ apple_uid: appleUid, apple_email: appleEmail, phone_uid: uid, phone_number: number });
      if (!res2 || !uid) {
        console.error("❌ Invalid auth response:", res);
        return;
      }

      console.log('User signed in:', user.uid);
      router.push('/complete');
    } catch (error) {
      console.error('Verification error:', error);
      alert('認証コードが正しくありません。もう一度お試しください。');
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
              認証コードを入力してください
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-base text-center tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={!isValidCode || loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 h-12 text-base font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '認証中...' : '認証する'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
