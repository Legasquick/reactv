import React from 'react';
import { AppState } from '../../types';
import { AutoGrowTextarea } from '../UIComponents';

interface JournalTabProps {
  state: AppState;
  updateState: (path: string, value: any) => void;
}

export const JournalTab: React.FC<JournalTabProps> = ({ state, updateState }) => (
    <div className="space-y-4 h-full">
        <h2 className="text-2xl font-header font-bold uppercase text-stone-800 border-b-4 border-stone-800 pb-2">Личный Дневник</h2>
        <div className="bg-white p-6 rounded-lg shadow-inner min-h-[500px] border border-stone-200 flex flex-col">
            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2">Записи</label>
            <AutoGrowTextarea 
                value={state.journal} 
                onChange={e => updateState('journal', e.target.value)} 
                className="w-full flex-1 text-base font-hand leading-relaxed ghost-input p-2" 
                placeholder="Напишите здесь историю вашего персонажа..." 
            />
        </div>
    </div>
);