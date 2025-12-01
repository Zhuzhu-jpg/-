import React, { useRef, useState } from 'react';
import { UserProfile, Gender } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const fileRef = useRef<HTMLInputElement>(null);

  const heightM = user.height / 100;
  const bmi = (user.weight / (heightM * heightM)).toFixed(1);
  const getBmiStatus = (b: number) => {
    if (b < 18.5) return { label: '偏瘦', color: 'text-blue-400', bg: 'bg-blue-50' };
    if (b < 25) return { label: '正常', color: 'text-green-500', bg: 'bg-green-50' };
    if (b < 30) return { label: '偏胖', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: '肥胖', color: 'text-red-400', bg: 'bg-red-50' };
  };
  const bmiStatus = getBmiStatus(parseFloat(bmi));

  const getStreak = () => {
    const start = new Date(user.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex justify-between items-end px-2 pt-2">
        <h1 className="text-3xl font-bold text-slate-900">个人中心</h1>
        <button 
          onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
          className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm ${isEditing ? 'bg-pink-300 text-white hover:bg-pink-400' : 'bg-slate-50 text-slate-500 hover:text-pink-300'}`}
        >
          {isEditing ? '完成' : '编辑'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center">
        <div className="relative cursor-pointer hover:scale-105 transition duration-300" onClick={() => isEditing && fileRef.current?.click()}>
           {formData.avatar ? (
             <img src={formData.avatar} className="w-28 h-28 rounded-full object-cover border-4 border-slate-50 shadow-lg shadow-slate-100" alt="Avatar" />
           ) : (
             <div className="w-28 h-28 rounded-full bg-slate-50 text-pink-300 flex items-center justify-center text-5xl font-bold border-4 border-white shadow-lg shadow-slate-100">
               {formData.name.charAt(0)}
             </div>
           )}
           <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatarUpload}/>
        </div>
        
        {isEditing ? (
           <input 
             value={formData.name}
             onChange={e => setFormData({...formData, name: e.target.value})}
             className="mt-4 text-center text-xl font-bold border-b-2 border-pink-100 focus:border-pink-300 outline-none bg-transparent py-1 text-slate-900"
           />
        ) : (
           <h2 className="mt-4 text-2xl font-bold text-slate-900">{user.name}</h2>
        )}
        <div className="flex items-center space-x-2 mt-3 bg-slate-50 px-4 py-1 rounded-full shadow-sm">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">坚持打卡</span>
           <span className="text-sm font-extrabold text-pink-300">{getStreak()} 天</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">当前 BMI</p>
          <div className="flex items-end mt-2">
             <span className="text-3xl font-bold text-slate-900">{bmi}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md mt-2 inline-block ${bmiStatus.bg} ${bmiStatus.color}`}>
             {bmiStatus.label}
          </span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">每日目标</p>
           <div className="flex items-end mt-2">
             <span className="text-3xl font-bold text-pink-300">{user.targetCalories}</span>
             <span className="text-xs text-pink-300 mb-1 ml-1 font-bold">kcal</span>
           </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-4">
         <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">身体数据</h3>
         
         <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <label className="text-sm font-bold text-slate-600">身高 (cm)</label>
            {isEditing ? (
              <input 
                type="number"
                value={formData.height}
                onChange={e => setFormData({...formData, height: parseFloat(e.target.value)})}
                className="w-20 text-right font-bold text-slate-900 bg-slate-50 rounded-lg p-2 outline-none"
              />
            ) : (
              <p className="text-lg font-bold text-slate-900">{user.height}</p>
            )}
         </div>
         <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <label className="text-sm font-bold text-slate-600">当前体重 (kg)</label>
            {isEditing ? (
              <input 
                type="number"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                className="w-20 text-right font-bold text-slate-900 bg-slate-50 rounded-lg p-2 outline-none"
              />
            ) : (
              <p className="text-lg font-bold text-slate-900">{user.weight}</p>
            )}
         </div>
         <div className="flex justify-between items-center py-2">
            <label className="text-sm font-bold text-slate-600">目标体重 (kg)</label>
            {isEditing ? (
              <input 
                type="number"
                value={formData.targetWeight || ''}
                onChange={e => setFormData({...formData, targetWeight: parseFloat(e.target.value)})}
                className="w-20 text-right font-bold text-pink-300 bg-slate-50 rounded-lg p-2 outline-none"
              />
            ) : (
              <p className="text-lg font-bold text-pink-300">{user.targetWeight || '--'}</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default Profile;