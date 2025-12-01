'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import LocalPreferences from '@/utils/localPreferences';
import AuthApi from '@/lib/api/authApi';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider('apple.com');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;
      const email = user.email ?? "";
      const screenName = user.displayName ?? "";

      // AuthApi
      try {
        await AuthApi.AppleSignIn({ uid, email, screenName });
      } catch (apiError: any) {
        console.error("Backend AppleSignIn error:", apiError);
        alert("ログイン処理中に問題が発生しました。時間をおいて再度お試しください。");
        return;
      }

      // Local save
      LocalPreferences.setUid(uid);
      LocalPreferences.setEmail(email);

      router.push('/phone-signin');

    } catch (err: any) {
      console.error("Apple sign-in error:", err);

      // Firebase OAuth エラー分岐
      let message = "ログインに失敗しました。もう一度お試しください。";

      switch (err.code) {
        case "auth/popup-closed-by-user":
          message = "ログインがキャンセルされました。続行する場合はもう一度お試しください。";
          break;
        case "auth/cancelled-popup-request":
          message = "複数のログインウィンドウが開かれました。もう一度お試しください。";
          break;
        case "auth/network-request-failed":
          message = "ネットワークエラーが発生しました。接続を確認して再度お試しください。";
          break;
        case "auth/operation-not-allowed":
          message = "Appleでのログインが許可されていません。サポートにお問い合わせください。";
          break;
        case "auth/account-exists-with-different-credential":
          message = "このメールアドレスは別のログイン方法で登録されています。";
          break;
        default:
          message = `エラーが発生しました（${err.code ?? 'unknown'}）。`;
          break;
      }

      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white dark:bg-slate-950 p-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-8 text-center max-w-lg">
          <div className="w-48 h-48 relative mx-auto">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-4 px-6">
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              このページは、Appleのみで登録されている方(まだ電話番号を設定していない方)向けのご案内です。
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ※すでに電話番号を登録済みの方はこの手順を進めなくて大丈夫です。アプリで電話番号認証して進めてください。
              {/* この手順を進めても、既存アカウントに支障はありませんのでご安心ください。 */}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 pb-8">
        <Button
          onClick={handleAppleSignIn}
          className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 h-12 text-base font-medium rounded-xl"
        >
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Sign in with Apple
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 px-4">
          続行することで、{' '}
          <Link
            href="https://pucre.life/term"
            className="underline hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            利用規約
          </Link>{' '}
          および{' '}
          <Link
            href="https://pucre.life/privacy"
            className="underline hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            プライバシーポリシー
          </Link>
          に同意したものとみなされます
        </p>
      </div>
    </div>
  );
}
