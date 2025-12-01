
import React, { useState } from 'react';
import { DailyLog, Mood } from '../types';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CalendarViewProps {
  logs: Record<string, DailyLog>;
  currentDate: string;
  targetCalories: number;
  onDateSelect: (date: string) => void;
  onUpdateMood: (date: string, mood: Mood) => void;
}

const RabbitDateFrame: React.FC<{ children: React.ReactNode; isActive: boolean; hasData: boolean; mood?: Mood }> = ({ children, isActive, hasData, mood }) => {
  // Determine Fill Color based on Mood
  let fillClass = "fill-transparent";
  
  if (hasData) {
    switch (mood) {
      case 'HAPPY':
        fillClass = "fill-yellow-100"; // Pale Yellow
        break;
      case 'SAD':
        fillClass = "fill-blue-100"; // Pale Blue
        break;
      case 'ANGRY':
        fillClass = "fill-red-100"; // Pale Red
        break;
      case 'BORED':
        fillClass = "fill-green-100"; // Pale Green
        break;
      default:
        fillClass = "fill-pink-50"; // Default Pale Pink
        break;
    }
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
      {/* Filled Rabbit Silhouette SVG */}
      {hasData && (
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full transition-colors duration-300 ${fillClass}`}
        >
          {/* Cute Round Rabbit Silhouette */}
          <path d="M30 35 Q25 5 45 10 Q50 12 55 10 Q75 5 70 35 Q85 45 85 65 Q85 90 50 90 Q15 90 15 65 Q15 45 30 35 Z" />
        </svg>
      )}
      
      {/* Number: Gray by default, Darker if active */}
      <span className={`relative z-10 text-sm font-bold mt-1 ${isActive ? 'text-slate-600' : 'text-gray-400'}`}>
        {children}
      </span>
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ logs, currentDate, targetCalories, onDateSelect, onUpdateMood }) => {
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(today);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const getFirstDayPadding = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Array.from({ length: day }, () => null);
  };

  const days = getDaysInMonth(displayMonth);
  const padding = getFirstDayPadding(displayMonth);

  const prevMonth = () => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
  const nextMonth = () => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));

  const handleDayClick = (dateStr: string) => {
    onDateSelect(dateStr);
    setIsModalOpen(true);
  };

  const getFeedback = (log: DailyLog | undefined) => {
    if (!log || log.totalCaloriesIn === 0) return { msg: "今天还没有记录哦，我在这里等你~" };
    const diffPercent = ((log.totalCaloriesIn - targetCalories) / targetCalories) * 100;
    if (diffPercent >= -5 && diffPercent <= 5) return { msg: "老婆今天好棒₍^˶ ╸𖥦  ╸˵^₎⟆" };
    if (diffPercent < -10) return { msg: "小宝宝要好好吃饭呀T^T" };
    if (diffPercent > 10) return { msg: "小宝今天有点馋(ꐦ ^-^)" };
    return { msg: "今天也保持得不错，继续加油！" };
  };

  const selectedLog = logs[currentDate];
  const feedback = getFeedback(selectedLog);

  const moodList = [
    { k: 'HAPPY', icon: '៷>ᴗ<៷', label: '开心' },
    { k: 'ANGRY', icon: '(◦`~´◦)', label: '生气' },
    { k: 'SAD', icon: 'ɵ̷̥̥᷄᎔ɵ̷̥̥᷅', label: '伤心' },
    { k: 'BORED', icon: '˘ᜊ˘ᶻᶻᶻ', label: '无聊' },
  ];

  // Prepare Chart Data
  const chartData = days.map(d => {
      const dStr = d.toISOString().split('T')[0];
      return {
          day: d.getDate(),
          cals: logs[dStr]?.totalCaloriesIn || 0
      }
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between px-2 pt-2">
        <h1 className="text-3xl font-bold text-slate-900">打卡日历</h1>
      </div>
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_5px_20px_-5px_rgba(0,0,0,0.05)] p-6 border border-slate-50">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="text-lg font-bold text-slate-900">
            {displayMonth.getFullYear()}年 {displayMonth.getMonth() + 1}月
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-300">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {padding.map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const log = logs[dateStr];
            const hasData = log && log.items.length > 0;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const mood = log?.mood;

            return (
              <button key={dateStr} onClick={() => handleDayClick(dateStr)} className="w-full aspect-square relative focus:outline-none">
                <RabbitDateFrame isActive={isToday} hasData={hasData} mood={mood}>
                  {date.getDate()}
                </RabbitDateFrame>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calorie Trend Chart */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider pl-2">热量摄入趋势</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                     itemStyle={{ color: '#f9a8d4', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="cals" stroke="#f9a8d4" strokeWidth={3} dot={{ r: 3, fill: '#f9a8d4', strokeWidth: 0 }} />
               </LineChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 transition-all">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-slide-up shadow-2xl border border-slate-50">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h2 className="text-2xl font-bold text-slate-900">{currentDate}</h2>
                 <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">每日总结</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-3 rounded-full text-slate-400 hover:bg-slate-100 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex items-start space-x-4 mb-8">
               <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl shadow-sm border border-slate-50 flex-shrink-0">
                  🐶
               </div>
               <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4 text-sm text-slate-700 shadow-sm relative flex-1">
                  <p className="font-bold leading-relaxed">{feedback.msg}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">目标</p>
                  <p className="font-bold text-slate-700 text-lg">{targetCalories}</p>
               </div>
               <div className="bg-pink-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider mb-1">摄入</p>
                  <p className="font-bold text-pink-300 text-lg">{selectedLog?.totalCaloriesIn || 0}</p>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">达成</p>
                  <p className="font-bold text-slate-700 text-lg">
                    {selectedLog?.totalCaloriesIn ? Math.round((selectedLog.totalCaloriesIn / targetCalories) * 100) : 0}%
                  </p>
               </div>
            </div>

            <div>
              <p className="text-xs font-bold text-center text-slate-300 uppercase tracking-widest mb-4">记录心情</p>
              <div className="flex justify-between px-1">
                {moodList.map(m => (
                  <button
                    key={m.k}
                    onClick={() => onUpdateMood(currentDate, m.k as Mood)}
                    className={`
                      flex flex-col items-center p-2 rounded-2xl transition w-16 group
                      ${selectedLog?.mood === m.k ? 'bg-pink-50 ring-2 ring-pink-100 scale-105' : 'hover:bg-slate-50'}
                    `}
                  >
                    <span className="text-sm mb-2 font-bold text-slate-900 whitespace-nowrap">{m.icon}</span>
                    <span className={`text-[10px] font-bold ${selectedLog?.mood === m.k ? 'text-pink-300' : 'text-slate-400'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
