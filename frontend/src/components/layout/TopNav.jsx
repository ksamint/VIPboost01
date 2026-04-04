import { useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function TopNav({ title, showBack, user }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vip-host-auth');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-gold-500/10">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-space-300 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-display font-semibold text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 text-space-300 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-space-900 font-semibold text-sm"
            >
              {user?.nickname?.[0]?.toUpperCase() || 'V'}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl py-2 shadow-xl animate-fade-in">
                <div className="px-4 py-2 border-b border-gold-500/10">
                  <p className="text-sm font-medium text-white">{user?.nickname || 'VIP Host'}</p>
                  <p className="text-xs text-space-400">{user?.role || 'VIP_HOST'}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-space-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} />
                  设置
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
