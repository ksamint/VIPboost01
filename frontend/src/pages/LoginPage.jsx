import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    try {
      await login(username, password);
      navigate('/today');
    } catch (err) {
      // error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-800 to-space-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold-lg">
            <Shield className="w-10 h-10 text-space-900" />
          </div>
          <h1 className="text-3xl font-display font-bold gold-gradient-text mb-2">
            VIP Host AI
          </h1>
          <p className="text-space-400 text-sm">赋能一线公关团队</p>
        </div>

        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-space-200 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-space-200 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-space-400 hover:text-space-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-space-600 bg-space-800 text-gold-500 focus:ring-gold-500/30"
              />
              <span className="text-sm text-space-300">
                我已阅读并同意<a href="#" className="text-gold-500 hover:underline">《隐私政策》</a>和<a href="#" className="text-gold-500 hover:underline">《服务条款》</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !agreed}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gold-400 hover:to-gold-500 transition-all duration-200 shadow-gold"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>

      <div className="py-6 text-center">
        <p className="text-space-500 text-xs">VIP Host AI Copilot v1.0</p>
      </div>
    </div>
  );
}
