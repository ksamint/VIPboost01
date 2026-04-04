import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Briefcase, MessageSquare, BookOpen, Zap, History, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const features = [
  {
    id: 'usps',
    title: '卖点',
    desc: '核心优势话术',
    icon: Briefcase,
    color: 'from-gold-500 to-gold-600',
    path: '/client/usps',
  },
  {
    id: 'cases',
    title: '案例库',
    desc: '成功案例参考',
    icon: BookOpen,
    color: 'from-purple-500 to-purple-600',
    path: '/client/cases',
  },
  {
    id: 'insights',
    title: 'AI 洞察',
    desc: '客户画像分析',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    path: '/client/insights',
  },
  {
    id: 'simulation',
    title: '模拟练习',
    desc: 'AI 对练提升',
    icon: Zap,
    color: 'from-green-500 to-green-600',
    path: '/client/simulation',
  },
];

export default function ClientPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      const response = await api.get('/ai/simulate/history');
      setRecentSessions(response.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioName = (scenario) => {
    const names = {
      VIP_COMPLAINT: 'VIP 客诉处理',
      HIGH_ROLLER_CONVERSION: '高净值转化',
      LOYALTY_RECOVERY: '忠诚度挽回',
      EMOTIONAL_SUPPORT: '情感支持',
      CROSS_SELL: '交叉销售',
    };
    return names[scenario] || scenario;
  };

  const getScenarioIcon = (scenario) => {
    const icons = {
      VIP_COMPLAINT: '😤',
      HIGH_ROLLER_CONVERSION: '💰',
      LOYALTY_RECOVERY: '❤️',
      EMOTIONAL_SUPPORT: '🤝',
      CROSS_SELL: '📈',
    };
    return icons[scenario] || '💬';
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-white">
          客户赋能中心
        </h2>
        <p className="text-space-400 text-sm mt-1">
          全面提升您的客户服务能力
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => {
                if (feature.id === 'simulation') {
                  navigate(feature.path);
                }
              }}
              className={`glass-card p-4 text-left animate-slide-up bg-gradient-to-br ${feature.color} border-0 opacity-90 hover:opacity-100 transition-opacity`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
              <p className="text-sm text-white/70 mt-0.5">{feature.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-gold-500" />
            <h3 className="font-semibold text-white">最近对练</h3>
          </div>
          <button
            onClick={() => navigate('/client/simulation')}
            className="text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1"
          >
            查看全部
            <ChevronRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-space-700" />
                <div className="flex-1">
                  <div className="h-4 bg-space-700 rounded w-1/2 mb-1" />
                  <div className="h-3 bg-space-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare size={32} className="mx-auto text-space-600 mb-2" />
            <p className="text-space-400 text-sm">暂无对练记录</p>
            <button
              onClick={() => navigate('/client/simulation')}
              className="mt-3 px-4 py-2 rounded-lg bg-gold-500/10 text-gold-500 text-sm hover:bg-gold-500/20 transition-colors"
            >
              开始首次对练
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-space-800/50 hover:bg-space-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-lg">
                  {getScenarioIcon(session.scenario)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {getScenarioName(session.scenario)}
                  </p>
                  <p className="text-xs text-space-400">
                    {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                {session.score && (
                  <div className={`px-2 py-1 rounded-lg text-sm font-medium ${
                    session.score >= 80
                      ? 'bg-green-500/20 text-green-400'
                      : session.score >= 60
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {session.score}分
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="font-semibold text-white mb-3">Quick Tips</h3>
        <div className="space-y-2 text-sm text-space-300">
          <p>Pro Tip: 在处理 VIP 投诉时，保持冷静并优先认可客户的情绪。</p>
          <p>定期进行模拟练习可以帮助您保持最佳服务状态。</p>
        </div>
      </div>
    </div>
  );
}
