
import React from 'react';
import { Domain, PartyMember } from '../../types';
import { StableInput, SvgIcon } from '../UIComponents';
import { SVG_ICONS, DOMAIN_LEVEL_COSTS } from '../../constants';
import { DomainLevel } from './DomainLevel';

interface DomainBlockProps {
  domain: Domain;
  gmMode: boolean;
  isShopMode?: boolean; 
  updateDomainName: (val: string) => void;
  updateDomainDesc: (val: string) => void;
  changeLvl: (delta: number) => void;
  removeDomain: () => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
  addAb: (lvl: number) => void;
  toggleBuy: (aId: number) => void;
  updAb: (aId: number, f: string, v: string) => void;
  delAb: (aId: number) => void;
  onExport: () => void;
  allowAdd?: boolean;
  
  // New props for assignment
  party?: PartyMember[];
  onAssign?: (ownerId: number | null) => void;
}

export const DomainBlock: React.FC<DomainBlockProps> = (props) => {
  const { 
      domain, gmMode, isShopMode, updateDomainName, updateDomainDesc, 
      changeLvl, removeDomain, handleQR, onExport, allowAdd,
      party, onAssign 
  } = props;

  const nextLevelCost = domain.level < 6 ? DOMAIN_LEVEL_COSTS[domain.level + 1] : 0;

  return (
    <div className="relative">
      <div className="flex flex-col border-b-4 border-stone-800 mb-6 pb-2">
        <div className="flex justify-between items-end mb-2 gap-4 relative">
          {gmMode ? (
            <StableInput className="text-3xl font-header font-black uppercase bg-transparent flex-1 min-w-0 ghost-input relative z-0" value={domain.name} onCommit={updateDomainName} />
          ) : (
            <h3 className="text-3xl font-header font-black uppercase text-stone-800">{domain.name}</h3>
          )}
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            {isShopMode && <button onClick={onExport} className="text-stone-400 hover:text-stone-600" title="Export JSON"><SvgIcon path={SVG_ICONS.download} size={20}/></button>}
            <button onClick={() => handleQR('domain', domain)} className="text-stone-400 hover:text-stone-800" title="QR Домена"><SvgIcon path={SVG_ICONS.qr} size={24}/></button>
            {/* Delete button (Trash) - Only for GM OR Shop Mode */}
            {(gmMode || isShopMode) && (
                 <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeDomain(); }} 
                    className="bg-white hover:bg-red-50 text-stone-400 hover:text-red-500 border border-stone-200 px-2 py-1 rounded shadow-sm transition-colors cursor-pointer" 
                    title="Удалить домен"
                 >
                    <SvgIcon path={SVG_ICONS.trash} size={20} />
                 </button>
            )}
          </div>
        </div>

        {/* Assignment Dropdown for GM */}
        {gmMode && party && onAssign && (
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Владелец:</span>
                <select 
                    value={domain.assignedTo === undefined || domain.assignedTo === null ? "" : domain.assignedTo}
                    onChange={(e) => onAssign(e.target.value === "" ? null : Number(e.target.value))}
                    className="text-xs font-bold text-stone-600 border border-stone-200 rounded px-2 py-1 bg-stone-50 focus:outline-none focus:border-stone-400"
                >
                    <option value="">-- Общий пул --</option>
                    {party.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
        )}

        {gmMode ? (
          <StableInput isTextarea className="w-full text-sm italic bg-transparent ghost-input mb-4" value={domain.description} onCommit={updateDomainDesc} />
        ) : (
          <p className="text-stone-500 italic text-sm max-w-2xl mb-4">{domain.description}</p>
        )}
        
        <div className="flex flex-wrap justify-between items-center bg-stone-100 p-2 rounded-lg border border-stone-200 print:hidden">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Уровень Домена</span>
                
                <div className="flex items-center bg-white rounded shadow-sm border border-stone-200">
                    <button 
                        onClick={() => changeLvl(-1)} 
                        disabled={domain.level <= 0}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500 border-r border-stone-100 transition-colors"
                    >
                        <SvgIcon path='<line x1="5" y1="12" x2="19" y2="12"></line>' size={16} />
                    </button>
                    
                    <div className="w-10 text-center font-header font-black text-xl text-stone-800 leading-none pt-1">
                        {domain.level}
                    </div>

                    <button 
                        onClick={() => changeLvl(1)} 
                        disabled={domain.level >= 6}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-emerald-500 hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500 border-l border-stone-100 transition-colors"
                    >
                        <SvgIcon path='<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' size={16} />
                    </button>
                </div>

                {domain.level < 6 && (
                    <div className="flex items-center text-xs font-bold text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded shadow-sm">
                        След. уровень: <span className="text-stone-800 ml-1">{nextLevelCost} XP</span>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {[1, 2, 3, 4, 5, 6].map(lvl => (
        <DomainLevel 
          key={lvl}
          level={lvl}
          abilities={domain.abilities.filter(a => a.level === lvl)}
          isLocked={domain.level < lvl}
          gmMode={gmMode}
          domainId={domain.id}
          addAb={(dId, l) => props.addAb(l)}
          toggleBuy={(dId, aId) => props.toggleBuy(aId)}
          updAb={(dId, aId, f, v) => props.updAb(aId, f, v)}
          delAb={(dId, aId) => props.delAb(aId)}
          handleQR={handleQR}
          allowAdd={allowAdd}
        />
      ))}
    </div>
  );
};
