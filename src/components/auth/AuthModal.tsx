import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    isConfigured,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    sendMagicLink,
  } = useAuth();

  const [mode, setMode] = useState<'sign_in' | 'sign_up' | 'magic_link'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const { error } = await signInWithOAuth(provider);
    if (error) {
      setErrorMessage(error.message || '第三方登录发起失败，请重试');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!email) {
      setErrorMessage('请输入邮箱地址');
      setLoading(false);
      return;
    }

    if (mode === 'magic_link') {
      const { error } = await sendMagicLink(email);
      setLoading(false);
      if (error) {
        setErrorMessage(error.message || '发送登录邮件失败，请检查邮箱');
      } else {
        setSuccessMessage('登录链接已发送至您的邮箱，请点击邮件中的链接完成登录！');
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('密码长度不能少于 6 位');
      setLoading(false);
      return;
    }

    if (mode === 'sign_in') {
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMessage(error.message === 'Invalid login credentials' ? '邮箱或密码不正确' : error.message);
      } else {
        onClose();
      }
    } else {
      const { error } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMessage(error.message || '注册失败，请重试');
      } else {
        setSuccessMessage('注册成功！若开启了邮箱验证，请检查邮件后完成验证；否则已直接登录。');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden relative p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#6d54f5] to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-200 mb-2.5">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {mode === 'sign_in' ? '欢迎回来' : mode === 'sign_up' ? '创建新账号' : '免密魔法链接'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            登录后可在手机、平板及电脑间自动同步练习集
          </p>
        </div>

        {/* Unconfigured Warning Alert */}
        {!isConfigured && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-relaxed">
              <span className="font-bold">开发提示：</span>
              尚未检测到 Supabase 环境变量（<code className="bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code>）。
              请在 <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code> 或 Vercel 中配置后启用完整云端功能。
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Quick OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          {/* Apple Sign-In */}
          <button
            type="button"
            onClick={() => handleOAuthLogin('apple')}
            disabled={loading}
            className="w-full h-11 px-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            {/* Apple Logo SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.9-12-14.58-6.19-9.59-10.9-20.48-14.13-32.65-3.24-12.18-4.86-23.77-4.86-34.79 0-14.07 3.42-25.9 10.26-35.48 6.84-9.59 15.65-14.48 26.43-14.69 5.26 0 11.14 1.37 17.65 4.12 6.5 2.76 10.36 4.19 11.58 4.29 1.03 0 5.09-1.53 12.19-4.58 7.09-3.05 13.06-4.38 17.91-3.99 13.62 1.09 24.36 6.33 32.22 15.72-11.88 7.18-17.63 17.15-17.25 29.91.33 10.15 4.22 18.66 11.66 25.53 7.44 6.87 16.32 10.74 26.65 11.61-2.45 7.42-5.74 15.08-9.87 22.98zM119.22 33.64c0-7.39 2.66-14.41 7.98-21.06 5.33-6.65 11.96-10.99 19.89-13.02.43 1.96.65 3.91.65 5.87 0 7.39-2.76 14.53-8.29 21.41-5.52 6.88-12.26 11.23-20.23 13.05-.43-2.17-.65-4.25-.65-6.25z" />
            </svg>
            <span>使用 Apple 账号登录</span>
          </button>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full h-11 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            {/* Google Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>使用 Google 账号登录</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">或使用邮箱</span>
          </div>
        </div>

        {/* 2. Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">电子邮箱</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6d54f5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {mode !== 'magic_link' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">密码</label>
                {mode === 'sign_in' && (
                  <button
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className="text-[11px] text-[#6d54f5] hover:underline"
                  >
                    忘记密码？免密登录
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位密码"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6d54f5] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
          >
            <span>{loading ? '处理中...' : mode === 'sign_in' ? '登 录' : mode === 'sign_up' ? '注 册' : '发送登录链接'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'sign_in' ? (
            <span>
              还没有账号？{' '}
              <button
                type="button"
                onClick={() => setMode('sign_up')}
                className="text-[#6d54f5] font-bold hover:underline"
              >
                立即注册
              </button>
            </span>
          ) : (
            <span>
              已有账号？{' '}
              <button
                type="button"
                onClick={() => setMode('sign_in')}
                className="text-[#6d54f5] font-bold hover:underline"
              >
                返回登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
