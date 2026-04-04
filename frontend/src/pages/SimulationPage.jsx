import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Star, MessageSquare } from 'lucide-react';
import api from '../services/api';

const scenarios = [
  { id: 'VIP_COMPLAINT', name: 'VIP 客诉处理', desc: '处理愤怒客户的投诉', icon: '😤' },
  { id: 'HIGH_ROLLER_CONVERSION', name: '高净值转化', desc: '说服潜力客户成为高赌注玩家', icon: '💰' },
  { id: 'LOYALTY_RECOVERY', name: '忠诚度挽回', desc: '赢回流失的 VIP 客户', icon: '❤️' },
  { id: 'EMOTIONAL_SUPPORT', name: '情感支持', desc: '为经历困境的客户提供支持', icon: '🤝' },
  { id: 'CROSS_SELL', name: '交叉销售', desc: '推广非核心业务服务', icon: '📈' },
];

export default function SimulationPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [step, setStep] = useState('select');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/simulate', { scenario: scenario.id });
      setSessionId(response.data.sessionId);
      setMessages(response.data.messages || []);
      setStep('chat');
    } catch (err) {
      console.error('Failed to start simulation:', err);
      alert('启动模拟失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { sender: 'user', message: userMessage, timestamp: new Date().toISOString() }]);

    setIsLoading(true);

    try {
      const response = await api.post(`/ai/simulate/${sessionId}/message`, { message: userMessage });
      setMessages((prev) => [...prev, response.data.message]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [...prev, { sender: 'ai', message: '抱歉，发生了错误。请重试。', timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    setIsLoading(true);

    try {
      const response = await api.post(`/ai/simulate/${sessionId}/end`);
      setFeedback(response.data.feedback);
      setStep('feedback');
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedScenario(null);
    setMessages([]);
    setInputValue('');
    setFeedback(null);
    setSessionId(null);
  };

  if (step === 'select') {
    return (
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">AI 模拟对练</h2>
          <p className="text-space-400 text-sm mt-1">选择场景，开始高压练习</p>
        </div>

        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario)}
              className="w-full glass-card p-4 text-left flex items-center gap-4 hover:border-gold-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-2xl">
                {scenario.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{scenario.name}</h3>
                <p className="text-sm text-space-400">{scenario.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'feedback' && feedback) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center">
            <Star className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">对练完成</h2>
          <p className="text-space-400 text-sm mt-1">您的表现评估</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${
              feedback.overallScore >= 80
                ? 'text-green-400'
                : feedback.overallScore >= 60
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {feedback.overallScore}
            </div>
            <p className="text-space-400 text-sm mt-1">综合得分</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-space-800 text-center">
              <div className="text-2xl font-bold text-white">{feedback.emotionalScore}</div>
              <p className="text-xs text-space-400 mt-1">情绪管理</p>
            </div>
            <div className="p-4 rounded-xl bg-space-800 text-center">
              <div className="text-2xl font-bold text-white">{feedback.professionalScore}</div>
              <p className="text-xs text-space-400 mt-1">专业度</p>
            </div>
            <div className="p-4 rounded-xl bg-space-800 text-center">
              <div className="text-2xl font-bold text-white">{feedback.resolutionScore}</div>
              <p className="text-xs text-space-400 mt-1">问题解决</p>
            </div>
            <div className="p-4 rounded-xl bg-space-800 text-center">
              <div className="text-2xl font-bold text-green-400">↑</div>
              <p className="text-xs text-space-400 mt-1">提升空间</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">优点</h4>
            <ul className="space-y-1">
              {feedback.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                  <span>✓</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">待改进</h4>
            <ul className="space-y-1">
              {feedback.improvements?.map((im, i) => (
                <li key={i} className="text-sm text-yellow-400 flex items-start gap-2">
                  <span>!</span> {im}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBackToSelect}
            className="flex-1 py-3 rounded-xl bg-space-800 text-white font-medium hover:bg-space-700 transition-colors"
          >
            返回选择
          </button>
          <button
            onClick={() => handleSelectScenario(selectedScenario)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 font-semibold hover:from-gold-400 hover:to-gold-500 transition-colors"
          >
            再练一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="glass-card mx-4 mt-4 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedScenario?.icon}</span>
          <div>
            <p className="font-medium text-white text-sm">{selectedScenario?.name}</p>
            <p className="text-xs text-space-400">{messages.length} 条消息</p>
          </div>
        </div>
        <button
          onClick={handleEndSession}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
        >
          结束对练
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 rounded-br-md'
                  : 'bg-space-800 text-white rounded-bl-md'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === 'user' ? 'text-space-700' : 'text-space-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-space-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-space-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-space-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-space-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 glass border-t border-gold-500/10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入您的回复..."
            className="flex-1 px-4 py-3 rounded-xl bg-space-800 border border-space-600 text-white placeholder-space-400 focus:outline-none focus:border-gold-500/50"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 disabled:opacity-50 disabled:cursor-not-allowed hover:from-gold-400 hover:to-gold-500 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
