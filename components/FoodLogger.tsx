import React, { useState, useRef } from 'react';
import { FoodItem } from '../types';
import { analyzeFoodImage, analyzeFoodText } from '../services/geminiService';

interface FoodLoggerProps {
  onAddItems: (items: FoodItem[]) => void;
  onCancel: () => void;
}

const FoodLogger: React.FC<FoodLoggerProps> = ({ onAddItems, onCancel }) => {
  const [mode, setMode] = useState<'text' | 'camera'>('camera');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [dishName, setDishName] = useState('');
  const [detectedItems, setDetectedItems] = useState<FoodItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setIsLoading(true);
    setDetectedItems([]);
    setDishName('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      setPreviewUrl(reader.result as string);
      
      try {
        const result = await analyzeFoodImage(base64String);
        setDishName(result.dishName);
        setDetectedItems(result.items);
      } catch (err) {
        alert("识别失败，请重试");
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeFoodText(inputText);
      setDishName(result.dishName);
      setDetectedItems(result.items);
    } catch (err) {
      alert("无法理解该描述");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setDetectedItems(prev => prev.map((item, i) => {
      if (i === index) {
        const calPerUnit = item.caloriesPerUnit || (item.calories / (item.quantity || 1));
        return {
          ...item,
          quantity: newQuantity,
          calories: Math.round(newQuantity * calPerUnit)
        };
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (detectedItems.length === 0) return;

    const totalCals = detectedItems.reduce((acc, i) => acc + i.calories, 0);
    const totalProtein = detectedItems.reduce((acc, i) => acc + (i.protein || 0), 0);
    const totalCarbs = detectedItems.reduce((acc, i) => acc + (i.carbs || 0), 0);
    const totalFat = detectedItems.reduce((acc, i) => acc + (i.fat || 0), 0);
    
    const mergedItem: FoodItem = {
      name: dishName || "未命名餐点",
      unit: '份',
      quantity: 1,
      calories: totalCals,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      image: previewUrl || undefined,
    };

    onAddItems([mergedItem]);
  };

  return (
    <div className="bg-white w-full h-[85vh] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8 relative flex flex-col animate-slide-up border border-slate-50">
      <div className="flex justify-between items-center mb-6 flex-none">
        <h2 className="text-2xl font-bold text-slate-900">记录饮食</h2>
        <button onClick={onCancel} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-pink-300 hover:bg-slate-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!detectedItems.length && !isLoading && (
        <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6 flex-none">
          <button 
            onClick={() => setMode('camera')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${mode === 'camera' ? 'bg-white text-pink-300 shadow-sm' : 'text-slate-400'}`}
          >
            📷 拍照
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${mode === 'text' ? 'bg-white text-pink-300 shadow-sm' : 'text-slate-400'}`}
          >
            📝 文字
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isLoading ? (
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-200 mb-6"></div>
              <p className="text-pink-300 font-bold animate-pulse">正在识别中...</p>
           </div>
        ) : detectedItems.length === 0 ? (
          // Input Mode
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {mode === 'camera' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[2rem] h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group bg-white"
              >
                 <div className="bg-slate-50 p-5 rounded-full mb-4 group-hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </div>
                 <p className="text-slate-500 font-bold">点击拍摄美食</p>
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   accept="image/*"
                   capture="environment"
                   className="hidden"
                   onChange={handleImageUpload}
                 />
              </div>
            )}
            
            {mode === 'text' && (
              <div className="flex flex-col space-y-4">
                <textarea
                  className="w-full border-2 border-slate-200 rounded-[1.5rem] p-5 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none h-48 resize-none text-slate-900 bg-white"
                  placeholder="例如：一碗牛肉面，两个荷包蛋，一份烫青菜..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  onClick={handleTextSubmit}
                  disabled={!inputText.trim()}
                  className="bg-pink-300 text-white py-4 rounded-[1.5rem] font-bold disabled:opacity-50 shadow-lg shadow-pink-100 hover:bg-pink-400 transition text-lg"
                >
                  分析热量 ✨
                </button>
              </div>
            )}
          </div>
        ) : (
          // Confirmation Mode
          <div className="flex flex-col h-full overflow-hidden">
             <div className="flex-none">
                {previewUrl && (
                  <div className="h-40 rounded-[2rem] overflow-hidden mb-6 shrink-0 relative shadow-sm border border-slate-100">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-xs font-bold text-pink-300 uppercase mb-2 tracking-wider">菜品名称</label>
                  <input 
                    type="text" 
                    className="w-full text-2xl font-bold text-slate-900 border-b-2 border-slate-100 focus:border-pink-300 outline-none py-2 bg-transparent"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                  />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
               {detectedItems.map((item, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-slate-900">{item.name}</span>
                       <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-1">
                          <input 
                            type="number"
                            className="w-12 bg-transparent text-center font-bold text-slate-900 outline-none"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-slate-400 font-bold pr-2">{item.unit}</span>
                       </div>
                       <span className="font-bold text-pink-300 text-sm bg-pink-50 px-2 py-1 rounded-md">{item.calories} kcal</span>
                    </div>
                 </div>
               ))}
             </div>

             <div className="flex-none mt-6 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-end mb-6">
                   <span className="text-slate-400 font-bold text-sm">总热量</span>
                   <span className="text-3xl font-extrabold text-pink-300 leading-none">
                      {detectedItems.reduce((acc, i) => acc + i.calories, 0)} <span className="text-sm text-pink-200">kcal</span>
                   </span>
                </div>
                <button 
                  onClick={handleConfirm}
                  className="w-full bg-pink-300 text-white py-4 rounded-[1.5rem] font-bold shadow-xl shadow-pink-100 hover:-translate-y-1 transition text-lg"
                >
                  确认保存
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodLogger;