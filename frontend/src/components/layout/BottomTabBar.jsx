import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, User } from 'lucide-react';

const tabs = [
  { path: '/today', label: '今日', icon: Home },
  { path: '/client', label: '客户', icon: Users },
  { path: '/profile', label: '我的', icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gold-500/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-gold-500' : 'text-space-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-gold-500' : 'text-space-300'}`}>
                {tab.label}
              </span>
              {isActive && <div className="tab-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
