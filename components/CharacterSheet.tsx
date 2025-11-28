import React from 'react';
import { SvgIcon } from './UIComponents';
import { AppState } from '../types';
import { SVG_ICONS } from '../constants';

import { SheetHeader } from './character/SheetHeader';
import { StatsSection } from './character/StatsSection';
import { AbilitiesSection } from './character/AbilitiesSection';
import { IdentitySection } from './character/IdentitySection';
import { PsychologySection } from './character/PsychologySection';

interface CharacterSheetProps {
  state: AppState;
  updateState: (path: string, value: any) => void;
}

// Страница 1: Основные характеристики
export const CharacterSheetPage1: React.FC<CharacterSheetProps> = ({ state, updateState }) => {
  return (
    <div className="bg-white shadow-2xl p-4 md:p-12 min-h-[297mm] rounded-none md:rounded-lg mb-8 relative">
        <SheetHeader info={state.info} updateState={updateState} />
        
        <div className="flex flex-col md:flex-row gap-8">
            <StatsSection state={state} updateState={updateState} />
            <AbilitiesSection abilities={state.abilities} updateState={updateState} />
        </div>
    </div>
  );
};

// Страница 2: Личное дело (Бэкграунд)
export const CharacterSheetPage2: React.FC<CharacterSheetProps> = ({ state, updateState }) => {
  return (
    <div className="sheet-page bg-white shadow-2xl p-4 md:p-12 min-h-[auto] md:min-h-[297mm] rounded-none md:rounded-lg">
        <div className="flex items-center gap-4 mb-8 pb-2 border-b-4 border-stone-800">
            <div className="bg-stone-800 text-white p-2 rounded"><SvgIcon path={SVG_ICONS.identity} size={24} /></div>
            <h2 className="font-header font-black text-2xl md:text-3xl text-stone-800 uppercase">Личное Дело</h2>
            <div className="hidden md:block ml-auto text-sm text-stone-400 font-header uppercase tracking-widest">Конфиденциально</div>
        </div>
        
        <IdentitySection info={state.info} background={state.background} updateState={updateState} />
        <PsychologySection background={state.background} updateState={updateState} />
    </div>
  );
};