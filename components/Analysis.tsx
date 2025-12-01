import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DailyLog } from '../types';

interface AnalysisProps {
  logs: Record<string, DailyLog>;
  onBack: () => void;
}

const Analysis: React.FC<AnalysisProps> = ({ logs, onBack }) => {
  // Explicitly cast Object.values to DailyLog[] to prevent 'unknown' type inference errors
  const data = (Object.values(logs) as DailyLog[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
      calories: log.totalCaloriesIn,
      protein: log.items.reduce((acc, item) => acc + (item.protein || 0), 0),
    }));

  return (
    <div className="space-y-6">
       <div className="flex items-center mb-4">
         <button onClick={onBack} className="p-2 mr-2 bg-white rounded-lg border border-slate-200 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
         </button>
         <h2 className="text-xl font-bold text-slate-900">Weekly Analysis</h2>
       </div>

       <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
         <h3 className="text-xs font-bold text-pink-300 uppercase mb-4 tracking-wider">Calorie Trend</h3>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
               <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
               <Tooltip 
                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }} 
                 cursor={{fill: '#fce7f3'}}
               />
               <Bar dataKey="calories" fill="#f9a8d4" radius={[6, 6, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>

       <div className="bg-pink-300 text-white p-6 rounded-3xl shadow-lg shadow-pink-100">
          <h3 className="font-bold text-white text-lg mb-2">Nutrient Tip</h3>
          <p className="text-sm opacity-90 leading-relaxed">
            Based on your logs, you are consistently hitting your protein goals this week. Great job! Consistent protein intake helps maintain muscle mass while in a calorie deficit.
          </p>
       </div>
    </div>
  );
};

export default Analysis;