import React from 'react';
import { StableInput } from '../UIComponents';
import { AppState } from '../../types';

interface SheetHeaderProps {
  info: AppState['info'];
  updateState: (path: string, value: any) => void;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ info, updateState }) => (
  <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-stone-800 pb-4 mb-6">
    <div className="w-full md:w-1/2">
      <label className="text-[10px] font-bold text-stone-400 uppercase">Имя</label>
      <StableInput value={info.name} onCommit={(v) => updateState('info.name', v)} className="w-full text-3xl md:text-4xl font-header font-bold ghost-input" placeholder="ИМЯ" />
    </div>
    <div className="flex gap-4 w-full md:w-1/2 mt-4 md:mt-0 items-end">
      <div className="flex-1"><label className="text-[10px] font-bold text-stone-400 uppercase">Класс</label><StableInput value={info.class} onCommit={(v) => updateState('info.class', v)} className="w-full font-header font-bold ghost-input" /></div>
      <div className="flex-1"><label className="text-[10px] font-bold text-stone-400 uppercase">Раса</label><StableInput value={info.race} onCommit={(v) => updateState('info.race', v)} className="w-full font-header font-bold ghost-input" /></div>
    </div>
  </div>
);