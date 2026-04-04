import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import api from '../services/api';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  useEffect(() => {
    fetchMaterialsForDate(selectedDate);
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      const response = await api.get('/materials/calendar', {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        },
      });
      setCalendarData(response.data.data || {});
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
    }
  };

  const fetchMaterialsForDate = async (date) => {
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await api.get(`/materials/date/${dateStr}`);
      setSelectedMaterials(response.data || []);
    } catch (err) {
      console.error('Failed to fetch materials for date:', err);
      setSelectedMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay() || 7;
  const paddingDays = Array(firstDayOfWeek - 1).fill(null);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const hasMaterials = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarData[dateKey] && calendarData[dateKey].length > 0;
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-space-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-space-300" />
          </button>
          <h3 className="text-lg font-semibold text-white">
            {format(currentMonth, 'yyyy 年 M 月', { locale: zhCN })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-space-700 transition-colors"
          >
            <ChevronRight size={20} className="text-space-300" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-space-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, index) => (
            <div key={`pad-${index}`} className="aspect-square" />
          ))}

          {daysInMonth.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const isSelected = isSameDay(date, selectedDate);
            const today = isToday(date);
            const hasData = hasMaterials(date);

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-gold-500 text-space-900'
                    : today
                    ? 'bg-space-700 text-white'
                    : 'hover:bg-space-700 text-space-300'
                }`}
              >
                <span className="text-sm font-medium">{format(date, 'd')}</span>
                {hasData && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-space-900' : 'bg-gold-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-3">
          {format(selectedDate, 'M 月 d 日', { locale: zhCN })} 素材
        </h4>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-space-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-space-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : selectedMaterials.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <FileText size={24} className="mx-auto text-space-500 mb-2" />
            <p className="text-space-400">暂无素材</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedMaterials.map((material) => (
              <div key={material.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  {material.thumbnailUrl ? (
                    <img
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-space-800 flex items-center justify-center">
                      <FileText size={20} className="text-space-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-white truncate">{material.title}</h5>
                    <p className="text-sm text-space-400">{material.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
