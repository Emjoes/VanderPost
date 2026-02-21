import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INPUT_LIMITS, GOOGLE_URL } from '../../config';
import useIsMounted from '../../hooks/useIsMounted';

interface LoginProps {
  onLogin: (data: {
    email: string; 
    password: string;
  }) => void;
  onSwitchToSignUp: () => void;
}

interface SocialLoginOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
}

export function Login({ onLogin, onSwitchToSignUp }: LoginProps) {
  const { t } = useTranslation();
  const isMounted = useIsMounted();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const socialLogins: SocialLoginOption[] = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({email, password});
  };

  const handleSocialLogin = async () => {
    window.location.href = GOOGLE_URL;
  };

  return (
    <div className={`min-h-screen app-bg-pattern flex items-center justify-center p-2 ${isMounted ? '' : 'not-mounted'}`}>
      <div className="w-full max-w-[32rem]">
        {/* Logo + Text */}
        <div className="flex flex-col items-center mb-3 relative">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {t("signin-title")}
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {t("signin-description")}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="in-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("global-email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="in-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  maxLength={INPUT_LIMITS.authEmail}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="in-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("global-password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="in-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  maxLength={INPUT_LIMITS.authPassword}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-blue-600"
                />
                <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">{t("signin-remember-me")}</span>
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t("signin-forgot-password")}?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {t("global-signin")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-sm bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                {t("global-continue-with")}
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2">
            {socialLogins.map((social) => (
              <button
                key={social.id}
                type="button"
                onClick={() => handleSocialLogin()}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${social.bgColor}`}
              >
                {social.icon}
                {social.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 mt-3">
          {t("signin-no-account")}?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {t("global-signup")}
          </button>
        </p>
      </div>
    </div>
  );
}
