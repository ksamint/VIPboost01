import { useState, useEffect } from 'react';
import { Upload, Image, Video, FileText, Send, X, Users } from 'lucide-react';
import api from '../services/api';

const materialTypes = [
  { id: 'IMAGE', label: '图片', icon: Image },
  { id: 'VIDEO', label: '视频', icon: Video },
  { id: 'TEXT', label: '文案', icon: FileText },
];

export default function MaterialPushPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('IMAGE');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pushHistory, setPushHistory] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchPushHistory();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setAvailableUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchPushHistory = async () => {
    try {
      const response = await api.get('/admin/push-logs');
      setPushHistory(response.data || []);
    } catch (err) {
      console.error('Failed to fetch push logs:', err);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(availableUsers.map((u) => u.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入素材标题');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/admin/materials', {
        type,
        title,
        content: type === 'TEXT' ? content : null,
        mediaUrl: mediaUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        publishDate,
        targetUsers: selectedUsers.length > 0 ? selectedUsers : null,
      });

      alert('素材推送成功！');
      setTitle('');
      setContent('');
      setMediaUrl('');
      setThumbnailUrl('');
      setSelectedUsers([]);
      fetchPushHistory();
    } catch (err) {
      console.error('Failed to push material:', err);
      alert('推送失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-4 space-y-4">
          <h3 className="font-semibold text-white">创建素材</h3>

          <div className="flex gap-2">
            {materialTypes.map((mt) => {
              const Icon = mt.icon;
              return (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => setType(mt.id)}
                  className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                    type === mt.id
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-space-600 bg-space-800 text-space-300 hover:border-space-500'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{mt.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm text-space-400 mb-2">素材标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入素材标题"
              className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          {type === 'TEXT' && (
            <div>
              <label className="block text-sm text-space-400 mb-2">文案内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入文案内容"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50 resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-space-400 mb-2">媒体链接</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={type === 'IMAGE' ? '图片 URL' : type === 'VIDEO' ? '视频 URL' : '素材 URL'}
              className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-space-400 mb-2">缩略图链接</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="缩略图 URL (可选)"
              className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-space-400 mb-2">发布日期</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">推送目标</h3>
            <button
              type="button"
              onClick={selectAllUsers}
              className="text-sm text-gold-500 hover:text-gold-400"
            >
              {selectedUsers.length === availableUsers.length ? '取消全选' : '全选'}
            </button>
          </div>

          {availableUsers.length === 0 ? (
            <p className="text-space-400 text-sm text-center py-4">暂无可推送用户</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-gold-500/10 border border-gold-500/30'
                      : 'bg-space-800 hover:bg-space-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 rounded border-space-600 bg-space-800 text-gold-500"
                  />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-space-900 text-sm font-semibold">
                    {user.nickname?.[0]?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <p className="text-white text-sm">{user.nickname || 'Unknown'}</p>
                    <p className="text-xs text-space-400">{user.role}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <p className="text-sm text-space-400">
            已选择 {selectedUsers.length} / {availableUsers.length} 人
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gold-400 hover:to-gold-500 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            '推送中...'
          ) : (
            <>
              <Send size={18} />
              立即推送
            </>
          )}
        </button>
      </form>

      {pushHistory.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="font-semibold text-white mb-4">推送记录</h3>
          <div className="space-y-3">
            {pushHistory.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-space-800/50">
                <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                  <Image size={18} className="text-gold-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{log.material?.title || '素材'}</p>
                  <p className="text-xs text-space-400">
                    {new Date(log.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  log.status === 'created'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-space-700 text-space-400'
                }`}>
                  {log.status === 'created' ? '已推送' : log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
