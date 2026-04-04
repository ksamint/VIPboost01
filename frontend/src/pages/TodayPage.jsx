import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Copy, Share2, Image, Video, FileText, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function TodayPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [greeting, setGreeting] = useState('');
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayMaterials();
  }, []);

  const fetchTodayMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/materials/today');
      setGreeting(response.data.greeting);
      setMaterials(response.data.materials || []);
      setError(null);
    } catch (err) {
      setError('加载素材失败，请稍后重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'IMAGE':
        return <Image size={20} className="text-gold-500" />;
      case 'VIDEO':
        return <Video size={20} className="text-purple-500" />;
      case 'TEXT':
        return <FileText size={20} className="text-blue-500" />;
      default:
        return <FileText size={20} />;
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content || '');
  };

  const handleShare = async (material) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: material.title,
          text: material.content,
          url: material.mediaUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy(material.content);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-white leading-relaxed">
          {greeting || `你好，${user?.nickname || '贵宾专员'}。欢迎回来！`}
        </h2>
        <p className="text-space-400 text-sm mt-1">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      <button
        onClick={() => navigate('/calendar')}
        className="w-full p-4 rounded-xl glass-card flex items-center justify-between hover:border-gold-500/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
            <Calendar size={20} className="text-gold-500" />
          </div>
          <div className="text-left">
            <p className="font-medium text-white">日历视图</p>
            <p className="text-sm text-space-400">查看历史与未来素材</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-space-400 group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">今日素材</h3>
        <button
          onClick={fetchTodayMaterials}
          className="p-2 text-space-400 hover:text-gold-500 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading && materials.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-space-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-space-700 rounded w-3/4" />
                  <div className="h-3 bg-space-700 rounded w-1/2" />
                  <div className="h-3 bg-space-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTodayMaterials}
            className="px-4 py-2 rounded-lg bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors"
          >
            重试
          </button>
        </div>
      ) : materials.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-space-800 flex items-center justify-center">
            <FileText size={24} className="text-space-500" />
          </div>
          <p className="text-space-400">今日暂无新素材</p>
          <p className="text-space-500 text-sm mt-1">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => (
            <div
              key={material.id}
              className="glass-card p-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                {material.thumbnailUrl || material.mediaUrl ? (
                  <div className="w-20 h-20 rounded-xl bg-space-800 overflow-hidden flex-shrink-0">
                    <img
                      src={material.thumbnailUrl || material.mediaUrl}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-space-800 flex items-center justify-center flex-shrink-0">
                    {getMaterialIcon(material.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-white truncate">{material.title}</h4>
                    {getMaterialIcon(material.type)}
                  </div>

                  {material.content && (
                    <p className="text-sm text-space-400 mt-1 line-clamp-2">
                      {material.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleCopy(material.content || material.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-800 text-space-300 hover:text-gold-500 hover:bg-gold-500/10 transition-colors text-sm"
                    >
                      <Copy size={14} />
                      复制
                    </button>
                    <button
                      onClick={() => handleShare(material)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors text-sm"
                    >
                      <Share2 size={14} />
                      转发
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
