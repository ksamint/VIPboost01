import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  FileText,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [dailyTasks, setDailyTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      const response = await api.get('/tasks/daily');
      setDailyTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      VIP_HOST: { label: 'VIP 公关', color: 'bg-gold-500/20 text-gold-500' },
      TEAM_MANAGER: { label: '团队管理', color: 'bg-purple-500/20 text-purple-400' },
      SYSTEM_ADMIN: { label: '系统管理', color: 'bg-blue-500/20 text-blue-400' },
    };
    return badges[role] || badges.VIP_HOST;
  };

  const menuItems = [
    {
      section: '工具',
      items: [
        { icon: FileText, label: '我的测评记录', path: '/profile/assessments' },
        { icon: MessageSquare, label: '提交建议', path: '/profile/feedback' },
        { icon: Calendar, label: '每日任务', path: '/profile/tasks' },
      ],
    },
    {
      section: '系统',
      items: [
        { icon: Settings, label: '设置', path: '/profile/settings' },
        { icon: HelpCircle, label: '帮助与反馈', path: '/profile/help' },
        { icon: Shield, label: '隐私政策', path: '/profile/privacy' },
      ],
    },
  ];

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-space-900 text-2xl font-bold">
            {user?.nickname?.[0]?.toUpperCase() || 'V'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">{user?.nickname || 'VIP Host'}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-space-400 text-sm mt-1">@{user?.username || 'user'}</p>
          </div>
          <button className="p-2 rounded-lg bg-space-800 text-space-300 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-semibold text-white mb-3">今日进度</h3>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-3 rounded-xl bg-space-800">
                <div className="h-4 bg-space-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-space-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl text-center ${
                  task.completed
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-space-800'
                }`}
              >
                <div className={`text-lg font-bold ${
                  task.completed ? 'text-green-400' : 'text-space-300'
                }`}>
                  {task.completed ? '✓' : '○'}
                </div>
                <p className={`text-xs mt-1 ${
                  task.completed ? 'text-green-400' : 'text-space-400'
                }`}>
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {(user?.role === 'TEAM_MANAGER' || user?.role === 'SYSTEM_ADMIN') && (
        <div className="glass-card p-4">
          <h3 className="font-semibold text-white mb-3">管理功能</h3>
          <div className="space-y-2">
            {user?.role === 'TEAM_MANAGER' && (
              <button
                onClick={() => navigate('/admin/team')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-space-800 hover:bg-space-700 transition-colors"
              >
                <Users size={20} className="text-purple-400" />
                <span className="flex-1 text-left text-white">团队数据看板</span>
                <ChevronRight size={18} className="text-space-400" />
              </button>
            )}
            {user?.role === 'SYSTEM_ADMIN' && (
              <button
                onClick={() => navigate('/admin/materials')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-space-800 hover:bg-space-700 transition-colors"
              >
                <BarChart3 size={20} className="text-blue-400" />
                <span className="flex-1 text-left text-white">素材推送</span>
                <ChevronRight size={18} className="text-space-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {menuItems.map((section) => (
        <div key={section.section} className="glass-card p-4">
          <h3 className="font-semibold text-white mb-3">{section.section}</h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <button
                key={item.path}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-space-800 transition-colors"
              >
                <item.icon size={20} className="text-space-400" />
                <span className="flex-1 text-left text-white">{item.label}</span>
                <ChevronRight size={18} className="text-space-400" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <LogOut size={20} />
        退出登录
      </button>

      <p className="text-center text-space-500 text-xs">VIP Host AI Copilot v1.0</p>
    </div>
  );
}
