import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const questions = [
  {
    id: 'nickname',
    title: '设置您的昵称',
    subtitle: '这将显示在您的个人资料中',
    type: 'input',
    placeholder: '请输入昵称',
    validate: (v) => v.length >= 2,
  },
  {
    id: 'personality',
    title: '发现您的性格类型',
    subtitle: '选择最符合您工作风格的描述',
    type: 'single',
    options: [
      { id: 'TYPE_A', label: '积极进取型', desc: '喜欢挑战，追求卓越' },
      { id: 'TYPE_B', label: '稳健务实型', desc: '注重细节，稳中求胜' },
      { id: 'TYPE_C', label: '和谐包容型', desc: '善于协调，强调团队' },
      { id: 'TYPE_D', label: '创新突破型', desc: '敢于尝试，喜欢变化' },
      { id: 'TYPE_E', label: '服务导向型', desc: '重视客户体验，用心倾听' },
    ],
  },
  {
    id: 'experience',
    title: '您的工作经验',
    subtitle: '这有助于我们为您推荐合适的内容',
    type: 'single',
    options: [
      { id: 'JUNIOR', label: '1-3 年', desc: '初入职场，正在成长' },
      { id: 'MID', label: '3-5 年', desc: '经验丰富，积累深厚' },
      { id: 'SENIOR', label: '5-10 年', desc: '资深专家，行业精英' },
      { id: 'EXPERT', label: '10 年以上', desc: '行业领袖，传奇人物' },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    const answer = answers[question.id];
    if (!answer) return false;
    if (question.type === 'input') return answer.length >= 2;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        nickname: answers.nickname,
        personalityType: answers.personality,
        preferences: { experience: answers.experience },
        onboardingComplete: true,
      };

      await api.put('/auth/me/profile', profileData);
      updateUser({ ...profileData, onboardingComplete: true });
      navigate('/today');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-800 to-space-900 flex flex-col">
      <div className="p-4">
        <div className="h-1.5 rounded-full bg-space-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-space-400 text-xs mt-2">
          {currentStep + 1} / {questions.length}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gold-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              {question.title}
            </h2>
            <p className="text-space-400 text-sm">{question.subtitle}</p>
          </div>

          {question.type === 'input' && (
            <div className="space-y-4">
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder={question.placeholder}
                className="w-full px-5 py-4 rounded-xl bg-space-800 border border-space-600 text-white text-lg placeholder-space-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all"
                autoFocus
              />
            </div>
          )}

          {question.type === 'single' && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    answers[question.id] === option.id
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-space-600 bg-space-800 hover:border-space-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${answers[question.id] === option.id ? 'text-gold-500' : 'text-white'}`}>
                        {option.label}
                      </p>
                      <p className="text-sm text-space-400 mt-0.5">{option.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === option.id
                        ? 'border-gold-500 bg-gold-500'
                        : 'border-space-500'
                    }`}>
                      {answers[question.id] === option.id && (
                        <svg className="w-3 h-3 text-space-900" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-4">
          {!isFirstStep && (
            <button
              onClick={handleBack}
              className="p-4 rounded-xl bg-space-800 border border-space-600 text-space-300 hover:border-space-500 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-space-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gold-400 hover:to-gold-500 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              '完成中...'
            ) : isLastStep ? (
              <>
                完成并进入
                <Sparkles size={18} />
              </>
            ) : (
              <>
                下一步
                <ChevronRight size={24} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
