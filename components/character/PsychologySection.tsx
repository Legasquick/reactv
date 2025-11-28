import React from 'react';
import { StableInput, SvgIcon } from '../UIComponents';
import { AppState } from '../../types';
import { SVG_ICONS } from '../../constants';

interface PsychologySectionProps {
  background: AppState['background'];
  updateState: (path: string, value: any) => void;
}

export const PsychologySection: React.FC<PsychologySectionProps> = ({ background, updateState }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    {/* Drivers */}
    <div className="space-y-6">
      <h3 className="font-header font-bold text-stone-800 text-lg border-b border-stone-200 pb-1">Драйверы</h3>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <label className="text-xs font-bold text-stone-500 uppercase">Мотивация</label>
        </div>
        <StableInput 
            isTextarea 
            value={background.motivation} 
            onCommit={(v) => updateState('background.motivation', v)} 
            className="w-full italic text-stone-700 pl-4 border-l-2 border-stone-100 text-sm bg-transparent" 
            placeholder="Цель..." 
        />
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <label className="text-xs font-bold text-stone-500 uppercase">Конфликт</label>
        </div>
        <StableInput 
            isTextarea 
            value={background.conflict} 
            onCommit={(v) => updateState('background.conflict', v)} 
            className="w-full italic text-stone-700 pl-4 border-l-2 border-stone-100 text-sm bg-transparent" 
            placeholder="Преграда..." 
        />
      </div>
      
      <div className="pt-4">
         <div className="flex items-center gap-2 mb-1 text-stone-800">
            <SvgIcon path={SVG_ICONS.lock} size={14} />
            <label className="text-xs font-bold uppercase">Тайна</label>
         </div>
         <div className="bg-stone-100 p-3 rounded border border-stone-200">
            <StableInput 
                isTextarea 
                value={background.secret} 
                onCommit={(v) => updateState('background.secret', v)} 
                className="w-full text-stone-800 text-sm bg-transparent" 
                placeholder="Секрет..." 
            />
         </div>
      </div>
    </div>
    
    {/* Psychology */}
    <div className="bg-stone-800 text-stone-200 p-6 rounded-xl shadow-inner h-full">
      <h3 className="font-header font-bold text-white/90 text-lg border-b border-stone-600 pb-1 mb-6">Глубинная Психология</h3>
      
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Осознанное Желание</label>
        <StableInput 
            isTextarea 
            value={background.conscious} 
            onCommit={(v) => updateState('background.conscious', v)} 
            className="w-full text-sm font-hand text-white placeholder-stone-600 bg-transparent" 
            placeholder="Я хочу..." 
        />
      </div>
      
      <div className="mb-8">
        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Неосознанное Желание</label>
        <StableInput 
            isTextarea 
            value={background.unconscious} 
            onCommit={(v) => updateState('background.unconscious', v)} 
            className="w-full text-sm font-hand text-white placeholder-stone-600 bg-transparent" 
            placeholder="Мне нужно..." 
        />
      </div>
      
      <div className="border-t border-stone-600 pt-4 mt-auto">
        <div className="flex items-center gap-2 text-red-400 mb-2">
            <SvgIcon path={SVG_ICONS.heart} size={16} />
            <label className="text-xs font-bold uppercase">Слабость</label>
        </div>
        <StableInput 
            isTextarea 
            value={background.weakness} 
            onCommit={(v) => updateState('background.weakness', v)} 
            className="w-full text-sm font-hand text-red-200 placeholder-red-900/30 bg-transparent" 
            placeholder="Уязвимость..." 
        />
      </div>
    </div>
  </div>
);