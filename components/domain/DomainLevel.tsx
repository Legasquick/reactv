import React from 'react';
import { RpgCard } from '../RpgCard';
import { ABILITY_STYLES } from '../../constants';
import { Ability } from '../../types';

interface DomainLevelProps {
  level: number;
  abilities: Ability[];
  isLocked: boolean;
  gmMode: boolean;
  domainId: number;
  addAb: (dId: number, lvl: number) => void;
  toggleBuy: (dId: number, aId: number) => void;
  updAb: (dId: number, aId: number, f: string, v: string) => void;
  delAb: (dId: number, aId: number) => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
  allowAdd?: boolean; // New prop to control creation ability
}

export const DomainLevel: React.FC<DomainLevelProps> = ({ 
  level, abilities, isLocked, gmMode, domainId, 
  addAb, toggleBuy, updAb, delAb, handleQR, allowAdd = true 
}) => {
  if (abilities.length === 0 && !gmMode) return null;
  
  const lockedStyle = isLocked && !gmMode ? 'filter blur-[3px] grayscale pointer-events-none select-none opacity-60' : '';

  return (
    <div className={`mb-8 transition-all duration-300 ${lockedStyle}`}>
      <div className="flex items-center gap-4 mb-2">
        <div className="h-px bg-stone-300 flex-1"></div>
        <span className="font-header font-bold text-stone-400 text-sm uppercase tracking-widest">LVL {level}</span>
        <div className="h-px bg-stone-300 flex-1"></div>
        {/* Only show Add button if GM Mode AND allowAdd is true */}
        {gmMode && allowAdd && (
            <button onClick={() => addAb(domainId, level)} className="text-xs bg-stone-200 px-2 rounded hover:bg-stone-300 pointer-events-auto">+</button>
        )}
      </div>
      
      <div 
        className="
          flex items-center gap-6 py-6 px-4 -mx-4 md:mx-0 md:px-1 
          overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden
          lg:flex-wrap lg:overflow-visible lg:justify-center lg:mx-0 lg:px-0 lg:snap-none
        "
        style={{ scrollbarWidth: 'none' }}
      >
        {abilities.map(ability => {
            const isUnlockedButUnpurchased = !isLocked && !ability.purchased && !gmMode;
            const cardOpacityClass = isUnlockedButUnpurchased ? 'opacity-50 hover:opacity-100 transition-opacity' : '';

            return (
              <div key={ability.id} className={`snap-center shrink-0 ${cardOpacityClass}`}>
                <RpgCard data={ability} styleData={ABILITY_STYLES[ability.type] || ABILITY_STYLES.skill}
                  isLocked={isLocked} isPurchased={ability.purchased}
                  onBuy={() => toggleBuy(domainId, ability.id)}
                  onEdit={(f, v) => updAb(domainId, ability.id, f, v)}
                  onDelete={() => delAb(domainId, ability.id)}
                  canQR={handleQR} qrType="ability" gmMode={gmMode} mode="domain"
                />
              </div>
            );
        })}
        <div className="w-1 shrink-0 lg:hidden"></div>
      </div>
    </div>
  );
};