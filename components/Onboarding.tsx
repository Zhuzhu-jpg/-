import React, { useState } from 'react';
import { ActivityLevel, Gender, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: Gender.FEMALE,
    height: 165,
    weight: 60,
    targetWeight: 55,
    activityLevel: ActivityLevel.SEDENTARY
  });

  const calculateCalories = () => {
    const { gender, weight, height, age, activityLevel, targetWeight } = formData;
    if (!weight || !height || !age || !gender || !activityLevel || !targetWeight) return;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === Gender.MALE ? 5 : -161;

    let multiplier = 1.2;
    switch (activityLevel) {
      case ActivityLevel.LIGHTLY_ACTIVE: multiplier = 1.375; break;
      case ActivityLevel.MODERATELY_ACTIVE: multiplier = 1.55; break;
      case ActivityLevel.VERY_ACTIVE: multiplier = 1.725; break;
      case ActivityLevel.EXTRA_ACTIVE: multiplier = 1.9; break;
    }

    const tdee = Math.round(bmr * multiplier);
    
    let target = tdee;
    if (targetWeight < weight) {
      target = tdee - 500;
    } else if (targetWeight > weight) {
      target = tdee + 300;
    }

    const minCalories = gender === Gender.MALE ? 1500 : 1200;
    target = Math.max(minCalories, Math.round(target));

    const p = Math.round((target * 0.3) / 4);
    const c = Math.round((target * 0.4) / 4);
    const f = Math.round((target * 0.3) / 9);

    const fullProfile: UserProfile = {
      ...(formData as UserProfile),
      targetCalories: target,
      targetProtein: p,
      targetCarbs: c,
      targetFat: f,
      isOnboarded: true
    };

    onComplete(fullProfile);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-[2.5rem] shadow-sm mt-10 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">定制您的健康计划</h2>
      <p className="text-sm text-slate-400 text-center mb-8 font-medium">科学计算热量缺口，健康减脂不反弹</p>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">昵称</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition text-slate-900"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例如：小美"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">年龄</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition text-slate-900"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">性别</label>
            <select
              className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition bg-white text-slate-900"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
            >
              <option value={Gender.MALE}>男</option>
              <option value={Gender.FEMALE}>女</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">身高 (cm)</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition text-slate-900"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">当前体重 (kg)</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition text-slate-900"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
          <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">目标体重 (kg)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-xl border-pink-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition bg-white text-slate-900"
            value={formData.targetWeight}
            onChange={(e) => setFormData({...formData, targetWeight: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">日常活动量</label>
          <select
            className="mt-1 block w-full rounded-xl border-slate-200 border-2 p-3 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition bg-white text-sm text-slate-900"
            value={formData.activityLevel}
            onChange={(e) => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}
          >
            <option value={ActivityLevel.SEDENTARY}>久坐不动 (办公室工作)</option>
            <option value={ActivityLevel.LIGHTLY_ACTIVE}>轻度活动 (每周运动1-3次)</option>
            <option value={ActivityLevel.MODERATELY_ACTIVE}>中度活动 (每周运动3-5次)</option>
            <option value={ActivityLevel.VERY_ACTIVE}>高度活动 (每周运动6-7次)</option>
          </select>
        </div>
        
        <button
          onClick={calculateCalories}
          className="w-full bg-pink-300 text-white py-4 rounded-[1.5rem] font-bold shadow-lg shadow-pink-100 hover:bg-pink-400 hover:-translate-y-1 transition text-lg mt-4"
        >
          生成我的健康计划
        </button>
      </div>
    </div>
  );
};

export default Onboarding;