import React from 'react';
import { DailyLog, UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
  log: DailyLog;
  selectedDate: string;
  onLogFood: () => void;
  onDeleteFood: (index: number) => void;
}

const CatPawProgress: React.FC<{ progress: number }> = ({ progress }) => {
  // Cat Paw Outline Path
  // Starts at bottom of main pad, loops around 4 toes.
  const pathData = "M 50,85 C 30,85 20,70 20,55 C 20,40 35,35 35,35 C 30,25 25,15 35,10 C 42,6 48,15 50,25 C 52,15 58,6 65,10 C 75,15 70,25 65,35 C 65,35 80,40 80,55 C 80,70 70,85 50,85 Z";
  
  // Adjusted path to look like a paw print contour (Main pad + toes connected or outlined)
  // Let's create a continuous line that traces a paw shape.
  // Main Pad Bottom -> Left Side -> Toe 1 -> Toe 2 -> Toe 3 -> Toe 4 -> Right Side -> Main Pad Bottom
  const pawPath = "M 30,60 Q 20,60 20,50 Q 20,40 30,40 Q 35,40 35,45 L 35,40 Q 30,25 40,20 Q 48,16 50,25 L 50,20 Q 50,10 60,10 Q 70,10 70,20 L 70,25 Q 80,15 90,20 Q 100,25 90,40 L 90,45 Q 95,40 100,45 Q 105,55 95,60 Q 90,65 85,60 L 85,70 Q 90,85 70,90 Q 50,95 30,90 Q 10,85 15,70 L 15,60 Q 20,65 30,60";
  
  // Simplified continuous contour for progress animation
  const simplePawPath = "M 25,65 Q 15,55 15,45 Q 15,35 25,30 Q 35,25 40,35 Q 40,25 45,20 Q 50,15 55,20 Q 60,25 60,35 Q 65,25 75,20 Q 85,15 90,25 Q 95,35 85,45 Q 95,50 95,60 Q 95,75 80,80 Q 50,95 20,80 Q 15,75 25,65";

  const pathLength = 300; 
  const strokeDashoffset = pathLength - (pathLength * Math.min(progress, 100)) / 100;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 110 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="pawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" /> {/* Pink-400 */}
            <stop offset="100%" stopColor="#ffffff" /> {/* White */}
          </linearGradient>
        </defs>
        
        {/* Background Track */}
        <path 
          d={simplePawPath} 
          fill="none" 
          stroke="#f3f4f6" // slate-100
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Progress Fill with Gradient */}
        <path 
          d={simplePawPath} 
          fill="none" 
          stroke="url(#pawGradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Pads (Static Decoration) */}
        <g fill="#fce7f3">
           {/* Toes */}
           <ellipse cx="30" cy="35" rx="6" ry="8" transform="rotate(-20 30 35)" />
           <ellipse cx="50" cy="25" rx="6" ry="9" />
           <ellipse cx="70" cy="25" rx="6" ry="9" />
           <ellipse cx="90" cy="35" rx="6" ry="8" transform="rotate(20 90 35)" />
           {/* Main Pad */}
           <path d="M 35,55 Q 60,45 85,55 Q 90,75 60,85 Q 30,75 35,55" />
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col pt-8">
         <span className="text-xl font-bold text-pink-300">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user, log, selectedDate, onLogFood, onDeleteFood }) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  const totalFood = log.totalCaloriesIn || 0;
  const remaining = Math.max(0, user.targetCalories - totalFood);
  const progress = Math.min(100, (totalFood / user.targetCalories) * 100);
  
  const consumedProtein = log.items.reduce((sum, item) => sum + (item.protein || 0), 0);
  const consumedCarbs = log.items.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const consumedFat = log.items.reduce((sum, item) => sum + (item.fat || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end px-2 pt-2">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isToday ? "嗨！" : selectedDate}
          </h1>
          <p className="text-pink-300 text-sm mt-1 font-bold tracking-wide flex items-center">
            {isToday ? "小狗宝正在盯着你哦" : "历史记录"}
          </p>
        </div>
        <div className="relative animate-float">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shadow-slate-100" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-pink-300 font-bold border-2 border-slate-50 shadow-sm">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Main Calorie Card - White with Pink Accents */}
      <div className="relative bg-white rounded-[2.5rem] p-8 overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">今日剩余热量</p>
              <h2 className="text-5xl font-bold text-pink-300 mb-6">{remaining}</h2>
              
              <div className="flex items-center space-x-6">
                 <div>
                   <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">目标</span>
                   <span className="text-slate-900 font-bold text-lg">{user.targetCalories}</span>
                 </div>
                 <div>
                   <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">已吃</span>
                   <span className="text-slate-900 font-bold text-lg">{totalFood}</span>
                 </div>
              </div>
            </div>
            
            {/* Custom Cat Paw Progress */}
            <div className="w-36 h-36 relative flex-shrink-0 -mr-4">
               <CatPawProgress progress={progress} />
            </div>
          </div>
      </div>

      {/* Macro Breakdown - Specific Pale Colors */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 mb-4 px-2 uppercase tracking-wider">营养摄入</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Protein - Pale Purple */}
          <div className="bg-purple-50 rounded-[1.8rem] p-4 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xl">🥩</span>
              <span className="text-[10px] font-bold text-purple-300 uppercase">蛋白质</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1 mb-2">
                <span className="text-xl font-bold text-purple-300">{Math.round(consumedProtein)}</span>
                <span className="text-[10px] text-purple-300 opacity-70">g</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-purple-300" style={{ width: `${Math.min(100, (consumedProtein/user.targetProtein)*100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Carbs - Pale Yellow */}
          <div className="bg-yellow-50 rounded-[1.8rem] p-4 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xl">🍚</span>
              <span className="text-[10px] font-bold text-yellow-400 uppercase">碳水</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1 mb-2">
                <span className="text-xl font-bold text-yellow-400">{Math.round(consumedCarbs)}</span>
                <span className="text-[10px] text-yellow-400 opacity-70">g</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${Math.min(100, (consumedCarbs/user.targetCarbs)*100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Fat - Pale Blue */}
          <div className="bg-blue-50 rounded-[1.8rem] p-4 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xl">🥑</span>
              <span className="text-[10px] font-bold text-blue-300 uppercase">脂肪</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1 mb-2">
                <span className="text-xl font-bold text-blue-300">{Math.round(consumedFat)}</span>
                <span className="text-[10px] text-blue-300 opacity-70">g</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-300" style={{ width: `${Math.min(100, (consumedFat/user.targetFat)*100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 mb-24">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">今日记录</h3>
          {isToday && (
            <button onClick={onLogFood} className="text-slate-900 text-xs font-bold flex items-center bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100 transition">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
              添加
            </button>
          )}
        </div>
        
        {log.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-300 text-sm font-bold">还没吃东西呢</p>
          </div>
        ) : (
          <div className="space-y-3">
            {log.items.map((item, idx) => (
              <div key={`food-${idx}`} className="flex justify-between items-center p-2 rounded-2xl hover:bg-slate-50 transition duration-300">
                <div className="flex items-center space-x-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">{item.name}</p>
                    <p className="text-xs text-pink-300 font-bold mt-0.5">{item.calories} kcal</p>
                  </div>
                </div>
                <button onClick={() => onDeleteFood(idx)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 rounded-full transition">
                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;