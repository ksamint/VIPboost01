import { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Award } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const response = await api.get('/admin/team/stats');
      setStats(response.data.summary);
      setMembers(response.data.members || []);
    } catch (err) {
      console.error('Failed to fetch team stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-space-700 rounded w-1/2 mb-2" />
              <div className="h-8 bg-space-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-gold-500" />
                <span className="text-sm text-space-400">团队人数</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.totalMembers || 0}</p>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} className="text-green-400" />
                <span className="text-sm text-space-400">今日活跃</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.activeToday || 0}</p>
              <p className="text-xs text-space-400 mt-1">
                {stats?.activeRate?.toFixed(0) || 0}% 活跃率
              </p>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-blue-400" />
                <span className="text-sm text-space-400">本周人均对练</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {stats?.avgSimulationsPerWeek?.toFixed(1) || '0.0'}
              </p>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-purple-400" />
                <span className="text-sm text-space-400">完成率</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {stats?.activeRate?.toFixed(0) || 0}%
              </p>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-4">团队成员</h3>

            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-space-600 mb-2" />
                <p className="text-space-400">暂无团队成员</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-space-800/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-space-900 font-semibold">
                      {member.nickname?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{member.nickname || 'Unknown'}</p>
                      <p className="text-xs text-space-400">
                        上次登录: {formatLastLogin(member.lastLogin)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.personalityComplete ? (
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                          已完成测评
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                          待测评
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
