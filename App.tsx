import React, { useEffect, useState } from 'react';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import { AppState, DailyLog, FoodItem, UserProfile, View, Tab, Mood } from './types';

const getTodayString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: {
      name: '',
      age: 0,
      gender: '' as any,
      height: 0,
      weight: 0,
      targetWeight: 0,
      startDate: new Date().toISOString(),
      activityLevel: '' as any,
      targetCalories: 2000,
      targetProtein: 150,
      targetCarbs: 200,
      targetFat: 65,
      isOnboarded: false
    },
    logs: {},
    selectedDate: getTodayString()
  });

  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  useEffect(() => {
    const saved = localStorage.getItem('nutriflow_state_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if(!parsed.selectedDate) parsed.selectedDate = getTodayString();
      setState(parsed);
      if (parsed.user.isOnboarded) {
        setCurrentView(View.MAIN);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nutriflow_state_v6', JSON.stringify(state));
  }, [state]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setState(prev => ({ 
      ...prev, 
      user: { ...profile, startDate: new Date().toISOString() } 
    }));
    setCurrentView(View.MAIN);
  };

  const getLogForDate = (logs: Record<string, DailyLog>, date: string): DailyLog => {
    return logs[date] || { 
      date, 
      items: [], 
      totalCaloriesIn: 0, 
      mood: null 
    };
  };

  const handleAddItems = (items: FoodItem[]) => {
    const dateKey = state.selectedDate;
    const currentLog = getLogForDate(state.logs, dateKey);
    
    const newItems = [...currentLog.items, ...items];
    const newTotalIn = newItems.reduce((sum, item) => sum + item.calories, 0);

    setState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [dateKey]: {
          ...currentLog,
          items: newItems,
          totalCaloriesIn: newTotalIn
        }
      }
    }));
    setCurrentView(View.MAIN);
    setActiveTab(Tab.DASHBOARD);
  };

  const handleDeleteItem = (index: number) => {
    const dateKey = state.selectedDate;
    const currentLog = getLogForDate(state.logs, dateKey);

    const newItems = currentLog.items.filter((_, i) => i !== index);
    const newTotalIn = newItems.reduce((sum, item) => sum + item.calories, 0);

    setState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [dateKey]: {
          ...currentLog,
          items: newItems,
          totalCaloriesIn: newTotalIn
        }
      }
    }));
  };

  const handleUpdateMood = (date: string, mood: Mood) => {
    const currentLog = getLogForDate(state.logs, date);
    setState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [date]: { ...currentLog, mood }
      }
    }));
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const handleDateSelect = (date: string) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const currentLog = getLogForDate(state.logs, state.selectedDate);

  // --- STRICTLY UPDATED ICONS (No Fill) ---

  // Dashboard Icon: New Dog Design (Hand Drawn Style)
  const DogIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 100 100" className={`h-8 w-8 transition-transform duration-300 ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" strokeWidth={active ? "6" : "4"} strokeLinecap="round" strokeLinejoin="round">
       {/* Floppy Ears Dog Head */}
       <path d="M25,35 Q15,45 15,65 Q15,85 35,90 Q50,95 65,90 Q85,85 85,65 Q85,45 75,35" />
       {/* Top Head */}
       <path d="M25,35 Q50,20 75,35" />
       {/* Ears */}
       <path d="M25,35 Q10,30 15,55" />
       <path d="M75,35 Q90,30 85,55" />
       {/* Face Features */}
       <circle cx="35" cy="55" r="2" fill="currentColor" stroke="none"/>
       <circle cx="65" cy="55" r="2" fill="currentColor" stroke="none"/>
       <path d="M45,70 Q50,75 55,70" />
    </svg>
  );

  // Calendar Icon: Cat Head (Image 2 style)
  const CatIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 100 100" className={`h-8 w-8 transition-transform duration-300 ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" strokeWidth={active ? "6" : "4"} strokeLinecap="round" strokeLinejoin="round">
       <path d="M20,40 L20,25 L40,30 Q50,25 60,30 L80,25 L80,40 Q90,50 90,65 Q90,90 50,90 Q10,90 10,65 Q10,50 20,40" />
       <path d="M30,55 L30,60" strokeWidth="6"/>
       <path d="M70,55 L70,60" strokeWidth="6"/>
       <path d="M15,65 L30,65" />
       <path d="M15,75 L30,73" />
       <path d="M85,65 L70,65" />
       <path d="M85,75 L70,73" />
    </svg>
  );

  // Profile Icon: Pig (Image 3 style)
  const PigIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 100 100" className={`h-8 w-8 transition-transform duration-300 ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" strokeWidth={active ? "6" : "4"} strokeLinecap="round" strokeLinejoin="round">
       <path d="M20,35 Q15,20 30,20 L40,25 L60,25 L70,20 Q85,20 80,35 Q95,50 95,65 Q95,90 50,90 Q5,90 5,65 Q5,50 20,35" />
       <ellipse cx="50" cy="65" rx="15" ry="10" />
       <circle cx="45" cy="65" r="2" fill="currentColor" stroke="none"/>
       <circle cx="55" cy="65" r="2" fill="currentColor" stroke="none"/>
       <path d="M30,45 L40,48" />
       <path d="M60,48 L70,45" />
       <path d="M55,75 Q55,85 58,85 Q61,85 61,75 Q58,70 55,75" fill="#bae6fd" stroke="none" />
       <path d="M55,75 Q55,85 58,85 Q61,85 61,75 Q58,70 55,75" fill="none" stroke="#bae6fd" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-md min-h-screen shadow-[0_0_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col">
        
        {currentView === View.ONBOARDING ? (
          <div className="p-6">
             <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32 no-scrollbar">
               {activeTab === Tab.DASHBOARD && (
                 <Dashboard 
                   user={state.user} 
                   log={currentLog} 
                   selectedDate={state.selectedDate}
                   onLogFood={() => setCurrentView(View.LOG_FOOD)}
                   onDeleteFood={handleDeleteItem}
                 />
               )}
               {activeTab === Tab.CALENDAR && (
                 <CalendarView 
                    logs={state.logs}
                    currentDate={state.selectedDate}
                    targetCalories={state.user.targetCalories}
                    onDateSelect={handleDateSelect}
                    onUpdateMood={handleUpdateMood}
                 />
               )}
               {activeTab === Tab.PROFILE && (
                 <Profile 
                    user={state.user}
                    onUpdate={handleUpdateProfile}
                 />
               )}
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-8 w-full px-6 z-40">
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-50 flex justify-around items-center h-20 px-2">
                 <button 
                    onClick={() => setActiveTab(Tab.DASHBOARD)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${activeTab === Tab.DASHBOARD ? 'text-pink-300 -translate-y-2 scale-110' : 'text-slate-300 hover:text-pink-200'}`}
                 >
                    <DogIcon active={activeTab === Tab.DASHBOARD} />
                 </button>
                 
                 <button 
                    onClick={() => setActiveTab(Tab.CALENDAR)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${activeTab === Tab.CALENDAR ? 'text-pink-300 -translate-y-2 scale-110' : 'text-slate-300 hover:text-pink-200'}`}
                 >
                    <CatIcon active={activeTab === Tab.CALENDAR} />
                 </button>

                 <button 
                    onClick={() => setActiveTab(Tab.PROFILE)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${activeTab === Tab.PROFILE ? 'text-pink-300 -translate-y-2 scale-110' : 'text-slate-300 hover:text-pink-200'}`}
                 >
                    <PigIcon active={activeTab === Tab.PROFILE} />
                 </button>
              </div>
            </div>
          </>
        )}

        {/* Food Logger Modal */}
        {currentView === View.LOG_FOOD && (
          <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-sm flex items-end">
             <div className="w-full">
                <FoodLogger 
                  onAddItems={handleAddItems} 
                  onCancel={() => setCurrentView(View.MAIN)} 
                />
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;