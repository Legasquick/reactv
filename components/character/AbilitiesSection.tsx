import React from 'react';
import { ABILITY_STYLES } from '../../constants';

interface AbilitiesSectionProps {
  abilities: string[];
  updateState: (path: string, value: any) => void;
}

export const AbilitiesSection: React.FC<AbilitiesSectionProps> = ({ abilities }) => {
  const displayAbilities = abilities.filter(a => a.trim() !== '');

  const getTypeColor = (text: string): string => {
      const match = text.match(/^\[(.*?)\]/);
      if (match) {
          const label = match[1];
          const found = Object.values(ABILITY_STYLES).find(style => style.label === label);
          if (found) return found.color;
      }
      return '#1c1917';
  };

  const parseGeneratedAbility = (text: string) => {
      const match = text.match(/^\[(.*?)\]\s*(.*?)((\s*\[OD:.*?\]|\s*\[VDH:.*?\])*):\s*(.*)$/s);
      
      if (match) {
          const rawStats = match[3];
          const apMatch = rawStats ? rawStats.match(/\[OD:(.*?)\]/) : null;
          const inspMatch = rawStats ? rawStats.match(/\[VDH:(.*?)\]/) : null;

          return {
              type: match[1],
              name: match[2],
              ap: apMatch ? apMatch[1] : null,
              insp: inspMatch ? inspMatch[1] : null,
              desc: match[5]
          };
      }
      const simpleMatch = text.match(/^\[(.*?)\]\s*(.*?):\s*(.*)$/s);
      if (simpleMatch) {
           return { type: simpleMatch[1], name: simpleMatch[2], ap: null, insp: null, desc: simpleMatch[3] };
      }

      return { type: '?', name: '', ap: null, insp: null, desc: text };
  };

  return (
    <div className="w-full md:w-[65%] flex flex-col gap-6 pl-0 md:pl-6 md:border-l border-stone-200 border-dashed">
      <div className="min-h-[400px]">
        <div className="flex justify-between items-center border-b-2 border-stone-200 pb-1 mb-4">
          <h3 className="font-header font-bold uppercase text-stone-800">Способности</h3>
        </div>
        
        <div className="flex flex-col gap-1">
          {displayAbilities.map((ab, i) => {
            const color = getTypeColor(ab);
            const parsed = parseGeneratedAbility(ab);

            return (
                <div key={i} className="flex gap-3 items-start group border-b border-stone-200 pb-2 mb-1 last:border-0">
                  <span 
                    className="mt-2.5 w-2 h-2 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: color }}
                  ></span>
                  
                  <div className="w-full text-sm font-hand p-1 leading-relaxed text-stone-900 select-text whitespace-pre-wrap">
                      {parsed.name ? (
                        <>
                           <div className="flex flex-wrap items-baseline gap-2 mb-1">
                               <span className="font-bold text-stone-800">[{parsed.type}] {parsed.name}</span>
                               {parsed.ap && (
                                   <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 text-stone-600">
                                       ОД: {parsed.ap}
                                   </span>
                               )}
                               {parsed.insp && (
                                   <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                                       ВДХ: {parsed.insp}
                                   </span>
                               )}
                               <span className="font-bold text-stone-800">:</span>
                           </div>
                           <span className="text-stone-700">{parsed.desc}</span>
                        </>
                      ) : (
                        <span className="text-stone-700">{parsed.desc}</span>
                      )}
                  </div>
                </div>
            );
          })}
          {displayAbilities.length === 0 && (
             <div className="text-center text-stone-400 text-sm italic py-12 bg-stone-50 rounded border border-dashed border-stone-200">
                 Способности отсутствуют. <br/>Приобретите их в разделе "Домены".
             </div>
          )}
        </div>
      </div>
    </div>
  );
};