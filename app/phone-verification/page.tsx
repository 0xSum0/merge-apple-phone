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
    if (!isValidCode) return;

    setLoading(true);

    try {
      const confirmationResult = (window as any).confirmationResult;
      if (!confirmationResult) {
        alert("認証セッションが無効です。再度コード送信からやり直してください。");
        return;
      }

      // ① Firebase 認証
      let result;
      try {
        result = await confirmationResult.confirm(verificationCode);

      } catch (err: any) {
        console.error("Firebase verify error:", err);

        let message = "認証に失敗しました。";

        if (err.code) {
          switch (err.code) {
            case "auth/invalid-verification-code":
              message = "認証コードが正しくありません。もう一度ご確認ください。";
              break;
            case "auth/code-expired":
              message = "認証コードの有効期限が切れています。もう一度コードを送信してください。";
              break;
            case "auth/invalid-verification-id":
              message = "認証セッションが無効です。最初からやり直してください。";
              break;
            case "auth/too-many-requests":
              message = "試行回数が多すぎます。しばらく時間を置いて再度お試しください。";
              break;
            case "auth/network-request-failed":
              message = "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。";
              break;
            default:
              message = `予期しないエラーが発生しました（${err.code}）。`;
              break;
          }
        }

        alert(message);
        return;
      }

      const user = result.user;
      const uid = user.uid;
      const email = user.email ?? "";
      const screenName = user.displayName ?? "";
      const number = user.phoneNumber;

      // ② backend sign-in
      try {
        await AuthApi.phoneNumberSignIn({ uid, email, screenName });
      } catch (err) {
        console.error("phoneNumberSignIn error:", err);
        alert("ログイン処理でエラーが発生しました。もう一度最初からやり直してください。");
        return;
      }

      // ③ Apple と電話番号のマージ
      const appleUid = LocalPreferences.getUid() || "";
      const appleEmail = LocalPreferences.getEmail() || "";

      try {
        await AuthApi.mergeApplePhone({
          apple_uid: appleUid,
          apple_email: appleEmail,
          phone_uid: uid,
          phone_number: number,
        });
      } catch (err) {
        console.error("mergeApplePhone error:", err);
        alert("アカウント統合に失敗しました。もう一度最初からやり直してください。");
        return;
      }

      router.push("/complete");

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("予期しないエラーが発生しました。");
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
