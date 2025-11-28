import React from 'react';
import { StatBlock, StableInput } from '../UIComponents';
import { AppState } from '../../types';
import { AvatarUploader } from './AvatarUploader';

interface StatsSectionProps {
  state: AppState;
  updateState: (path: string, value: any) => void;
}

const STAT_LABELS: Record<string, string> = {
  physique: 'Телосложение',
  attention: 'Внимание',
  movement: 'Движение',
  thinking: 'Мышление',
  influence: 'Влияние',
  will: 'Воля'
};

// Вспомогательный компонент для трекеров (Здоровье, Вдохновение)
const TrackerControl = ({ 
  label, 
  value, 
  maxValue, 
  colorClass, 
  textClass, 
  onInc, 
  onDec, 
  suffix
}: {
  label: string, 
  value: number, 
  maxValue?: number, 
  colorClass: string, 
  textClass: string,
  onInc?: () => void,
  onDec?: () => void,
  suffix?: string
}) => (
  <div className={`p-2 rounded-lg border ${colorClass} text-center flex flex-col justify-center h-full`}>
    <span className={`text-[10px] uppercase font-bold opacity-70 mb-1 ${textClass.replace('text-', 'text-opacity-70 text-')}`}>{label}</span>
    <div className="flex justify-center items-center gap-2 md:gap-3">
       {onDec && (
         <button onClick={onDec} className={`w-6 h-6 rounded hover:bg-black/10 flex items-center justify-center ${textClass}`}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
       )}
        <div className={`text-2xl font-header font-black ${textClass}`}>
          {value} {maxValue !== undefined && <span className="text-sm font-normal opacity-60">/ {maxValue}</span>} {suffix}
        </div>
       {onInc && (
         <button onClick={onInc} className={`w-6 h-6 rounded hover:bg-black/10 flex items-center justify-center ${textClass}`}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
       )}
    </div>
  </div>
);

export const StatsSection: React.FC<StatsSectionProps> = ({ state, updateState }) => {
  const availableXP = state.xp.total - state.xp.spent;

  const handleStatChange = (stat: keyof AppState['stats'], delta: number) => {
      const currentVal = state.stats[stat];
      const newVal = currentVal + delta;

      // Ограничения статов (1-6)
      if (newVal < 1 || newVal > 6) return; 

      // Функция применения изменений (чтобы не дублировать код в ветках)
      const applyChange = () => {
         updateState(`stats.${stat}`, newVal);
         
         // Если меняем Телосложение, обновляем текущее Здоровье до нового Максимума
         if (stat === 'physique') {
             const newMaxHp = newVal * 6;
             updateState('trackers.hp', newMaxHp);
         }
      };

      if (state.gmMode) {
          applyChange();
          return;
      }

      if (delta > 0) {
          // Повышение
          // Стоимость = Текущее_значение * 4
          const cost = currentVal * 4;

          if (availableXP >= cost) {
              updateState('xp.spent', state.xp.spent + cost);
              applyChange();
          } else {
              alert(`Недостаточно опыта для повышения характеристики! Требуется ${cost} XP.`);
          }
      } else {
          // Понижение (Возврат)
          const refund = (currentVal - 1) * 4;
          
          updateState('xp.spent', Math.max(0, state.xp.spent - refund));
          applyChange();
      }
  };

  const changeHp = (delta: number) => {
    const maxHp = state.stats.physique * 6;
    const newVal = state.trackers.hp + delta;
    
    // Нельзя меньше 0 и больше Максимума
    if (newVal < 0 || newVal > maxHp) return;
    
    updateState('trackers.hp', newVal);
  };

  const changeInsp = (delta: number) => {
    const maxInsp = 6; // Максимум вдохновения
    const newVal = state.trackers.inspiration + delta;
    
    // Нельзя меньше 0 и больше Максимума
    if (newVal < 0 || newVal > maxInsp) return;
    
    updateState('trackers.inspiration', newVal);
  };

  const maxLoad = state.stats.physique * 20;

  return (
    <div className="w-full md:w-[35%] flex flex-col gap-4">
      {/* Avatar */}
      <AvatarUploader 
        image={state.info.avatar} 
        onImageChange={(val) => updateState('info.avatar', val)} 
      />

      {/* Trackers */}
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
            <TrackerControl 
                label="Здоровье" 
                value={state.trackers.hp} 
                maxValue={state.stats.physique * 6} 
                colorClass="bg-red-50 border-red-200" 
                textClass="text-red-900"
                onDec={() => changeHp(-1)}
                onInc={() => changeHp(1)}
            />
        </div>
        <TrackerControl 
            label="Вдохновение" 
            value={state.trackers.inspiration} 
            maxValue={6}
            colorClass="bg-amber-50 border-amber-200" 
            textClass="text-amber-900"
            onDec={() => changeInsp(-1)}
            onInc={() => changeInsp(1)}
        />
        <div className="p-2 rounded-lg border bg-blue-50 border-blue-200 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-blue-800/70">Скорость</span>
            <div className="text-2xl font-header font-black text-blue-900">{state.stats.movement * 2}м</div>
        </div>
        
        {/* Load Tracker */}
        <div className="col-span-2 p-2 rounded-lg border bg-stone-100 border-stone-200 text-center flex justify-between items-center px-4">
             <span className="text-[10px] uppercase font-bold text-stone-500">Нагрузка</span>
             <div className="text-xl font-header font-bold text-stone-700">{maxLoad} <span className="text-sm font-sans font-normal text-stone-400">кг</span></div>
        </div>
      </div>
      
      {/* XP Block */}
      <div className="bg-stone-800 text-white rounded-lg p-3 shadow-lg">
        <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Осталось ОО</span><span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Всего</span></div>
        <div className="flex justify-between items-baseline">
            <span className="text-3xl font-header font-bold text-white">{state.xp.total - state.xp.spent}</span>
            {state.gmMode ? (
                <div className="flex items-center gap-1">
                   <button onClick={() => updateState('xp.total', Math.max(0, state.xp.total - 1))} className="text-stone-500 hover:text-white px-1">-</button>
                   <StableInput
                      value={state.xp.total}
                      onCommit={(v) => updateState('xp.total', parseInt(v) || 0)}
                      className="text-xl font-header font-bold text-stone-500 w-12 text-center bg-transparent border-b border-stone-600 focus:text-white"
                   />
                   <button onClick={() => updateState('xp.total', state.xp.total + 1)} className="text-stone-500 hover:text-white px-1">+</button>
                </div>
            ) : (
                <span className="text-xl font-header font-bold text-stone-500">{state.xp.total}</span>
            )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(state.stats) as Array<keyof AppState['stats']>).map(k => (
          <StatBlock 
            key={k} 
            label={STAT_LABELS[k] || k} 
            val={state.stats[k]} 
            onInc={() => handleStatChange(k, 1)}
            onDec={() => handleStatChange(k, -1)}
          />
        ))}
      </div>
    </div>
  );
};