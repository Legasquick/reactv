import React from 'react';
import { StableInput } from '../UIComponents';
import { AppState } from '../../types';

interface IdentitySectionProps {
  info: AppState['info'];
  background: AppState['background'];
  updateState: (path: string, value: any) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ info, background, updateState }) => (
  <>
    <div className="mb-8 bg-stone-50 p-6 rounded-xl border border-stone-200 relative">
      <div className="absolute -top-3 left-6 bg-white px-2 text-xs font-bold text-stone-400 uppercase tracking-widest">Внешность и История</div>
      <StableInput 
        isTextarea 
        value={info.desc} 
        onCommit={(v) => updateState('info.desc', v)} 
        className="w-full bg-transparent text-stone-800 text-base md:text-sm min-h-[80px]" 
        placeholder="Опишите внешность..." 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        {l:'Характер', k:'character', ph: 'Добрый...'}, 
        {l:'Эстетика', k:'aesthetic', ph: 'Плащ...'}, 
        {l:'Фишка', k:'feature', ph: 'Монета...'}
      ].map(f => (
        <div key={f.k} className="border-t-2 border-stone-300 pt-2">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{f.l}</label>
          <StableInput 
            isTextarea 
            value={background[f.k as keyof typeof background]} 
            onCommit={(v) => updateState(`background.${f.k}`, v)} 
            className="w-full bg-transparent font-hand text-sm" 
            placeholder={f.ph}
          />
        </div>
      ))}
    </div>
  </>
);