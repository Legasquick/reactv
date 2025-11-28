
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Domain, Ability } from '../../types';
import { DomainBlock } from '../domain/DomainBlock';
import { ABILITY_STYLES, DOMAIN_LEVEL_COSTS, SVG_ICONS } from '../../constants';
import { SvgIcon } from '../UIComponents';
import { RpgCard } from '../RpgCard';

interface DomainsTabProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateState: (path: string, value: any) => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
}

const ROMAN_REGEX = /\s+(I|II|III|IV|V|VI)$/i;

const getAbilityCost = (level: number) => {
    switch(level) {
        case 1: return 2;
        case 2: return 4;
        case 3: return 8;
        case 4: return 14;
        case 5: return 22;
        case 6: return 32;
        default: return 0;
    }
};

const getBaseName = (name: string): string | null => {
    const match = name.match(ROMAN_REGEX);
    if (!match) return null;
    return name.replace(ROMAN_REGEX, '').trim().toLowerCase();
};

const calculateDynamicCost = (domain: Domain, ability: Ability, simulatedPurchases: Ability[] = []): { cost: number; originalCost: number; isDiscounted: boolean } => {
    const originalCost = getAbilityCost(ability.level);
    
    const baseName = getBaseName(ability.name);
    if (!baseName) {
        return { cost: originalCost, originalCost, isDiscounted: false };
    }

    const previousVersions = domain.abilities.filter(a => 
        a.id !== ability.id &&
        (a.purchased || simulatedPurchases.find(sim => sim.id === a.id)) &&
        a.level < ability.level &&
        getBaseName(a.name) === baseName
    );

    if (previousVersions.length === 0) {
        return { cost: originalCost, originalCost, isDiscounted: false };
    }

    const maxPrevCost = Math.max(...previousVersions.map(a => getAbilityCost(a.level)));
    const finalCost = Math.max(0, originalCost - maxPrevCost);

    return { cost: finalCost, originalCost, isDiscounted: true };
};

export const DomainsTab: React.FC<DomainsTabProps> = ({ state, setState, updateState, handleQR }) => {
  const [showShop, setShowShop] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.domains.length > 0) {
        if (selectedDomainId === null || !state.domains.find(d => d.id === selectedDomainId)) {
            setSelectedDomainId(state.domains[0].id);
        }
    } else {
        setSelectedDomainId(null);
    }
  }, [state.domains, selectedDomainId]);

  const regenerateGlobalAbilities = (domains: Domain[]) => {
      const allAbilitiesText: string[] = [];

      domains.forEach(domain => {
          const purchased = domain.abilities.filter(a => a.purchased);
          const groups: Record<string, Ability[]> = {};
          const singles: Ability[] = [];

          purchased.forEach(ab => {
              const baseName = getBaseName(ab.name);
              if (baseName) {
                  if (!groups[baseName]) groups[baseName] = [];
                  groups[baseName].push(ab);
              } else {
                  singles.push(ab);
              }
          });

          const formatAbilityString = (ab: Ability) => {
             let statsStr = "";
             const type = ab.type;
             if (type === 'technique' && ab.apCost) {
                 statsStr += ` [OD:${ab.apCost}]`;
             }
             if ((type === 'mastery' || type === 'technique') && ab.inspCost) {
                 statsStr += ` [VDH:${ab.inspCost}]`;
             }
             return `[${ABILITY_STYLES[ab.type].label}] ${ab.name}${statsStr}: ${ab.description}`;
          };

          singles.forEach(ab => {
               allAbilitiesText.push(formatAbilityString(ab));
          });

          Object.values(groups).forEach(group => {
              if (group.length > 0) {
                  group.sort((a, b) => b.level - a.level);
                  const best = group[0];
                  allAbilitiesText.push(formatAbilityString(best));
              }
          });
      });

      updateState('abilities', allAbilitiesText);
  };

  const removeDomain = (id: number) => {
    setState(prev => ({...prev, domains: prev.domains.filter(d => d.id !== id)}));
  };

  const changeLvl = (id: number, delta: number) => {
    const domain = state.domains.find(d => d.id === id);
    if (!domain) return;

    const currentLevel = domain.level;
    const targetLevel = currentLevel + delta;

    if (targetLevel < 0 || targetLevel > 6) return;

    if (state.gmMode) {
      const updatedDomains = state.domains.map(dom => dom.id === id ? {...dom, level: targetLevel} : dom);
      setState(prev => ({...prev, domains: updatedDomains}));
      return;
    }

    if (delta > 0) {
      if (currentLevel > 0) {
          const hasPurchasedCard = domain.abilities.some(a => a.level === currentLevel && a.purchased);
          if (!hasPurchasedCard) {
              alert(`Для перехода на уровень ${targetLevel} необходимо изучить (купить) хотя бы одну способность ${currentLevel} уровня.`);
              return;
          }
      }

      const cost = DOMAIN_LEVEL_COSTS[targetLevel];
      const availableXP = state.xp.total - state.xp.spent;

      if (availableXP >= cost) {
        updateState('xp.spent', state.xp.spent + cost);
        setState(prev => ({...prev, domains: prev.domains.map(dom => dom.id === id ? {...dom, level: targetLevel} : dom)}));
      } else {
        alert(`Недостаточно опыта! Для повышения до уровня ${targetLevel} нужно ${cost} XP.`);
      }
    } else {
      const refundLevelCost = DOMAIN_LEVEL_COSTS[currentLevel];
      const abilitiesToRefund = domain.abilities.filter(a => a.level === currentLevel && a.purchased);
      
      let refundAbilitiesCost = 0;
      abilitiesToRefund.forEach(ab => {
          const { cost } = calculateDynamicCost(domain, ab);
          refundAbilitiesCost += cost;
      });
      
      const totalRefund = refundLevelCost + refundAbilitiesCost;
      updateState('xp.spent', Math.max(0, state.xp.spent - totalRefund));

      const updatedDomains = state.domains.map(dom => dom.id === id ? {
          ...dom, 
          level: targetLevel,
          abilities: dom.abilities.map(a => a.level === currentLevel ? {...a, purchased: false} : a)
      } : dom);

      setState(prev => {
          regenerateGlobalAbilities(updatedDomains);
          return {...prev, domains: updatedDomains};
      });
    }
  };
  
  const addAb = (dId: number, lvl: number) => setState(prev => ({...prev, domains: prev.domains.map(d => d.id === dId ? {...d, abilities: [...d.abilities, { id: Date.now()+Math.random(), name: "Способность", description: "...", type: "skill", level: lvl, apCost: "1", inspCost: "0", purchased: false }]} : d)}));
  const updAb = (dId: number, aId: number, f: string, v: string) => setState(prev => ({...prev, domains: prev.domains.map(d => d.id === dId ? {...d, abilities: d.abilities.map(a => a.id === aId ? {...a, [f]: v} : a)} : d)}));
  const delAb = (dId: number, aId: number) => setState(prev => ({...prev, domains: prev.domains.map(d => d.id === dId ? {...d, abilities: d.abilities.filter(a => a.id !== aId)} : d)}));
  
  const toggleBuy = (dId: number, aId: number) => {
       const dom = state.domains.find(d => d.id === dId);
       if (!dom) return;
       const targetAb = dom.abilities.find(a => a.id === aId);
       if (!targetAb) return;
       
       if (!showShop && !state.gmMode) return;

       if(!targetAb.purchased) {
           const baseName = getBaseName(targetAb.name);
           let purchaseChain: Ability[] = [targetAb];

           if (baseName) {
               const lowerLevels = dom.abilities.filter(a => 
                   !a.purchased &&
                   a.level < targetAb.level &&
                   getBaseName(a.name) === baseName
               ).sort((a,b) => a.level - b.level);
               purchaseChain = [...lowerLevels, targetAb];
           }

           let totalChainCost = 0;
           let simulatedPurchased: Ability[] = []; 

           for (const ab of purchaseChain) {
               if (dom.level < ab.level && !state.gmMode) {
                   alert(`Уровень домена (${dom.level}) слишком низок для способности "${ab.name}" (Lvl ${ab.level}).`);
                   return;
               }
               const { cost } = calculateDynamicCost(dom, ab, simulatedPurchased);
               totalChainCost += cost;
               simulatedPurchased.push(ab);
           }

           if (state.gmMode || (state.xp.total - state.xp.spent) >= totalChainCost) {
               if (!state.gmMode) {
                   updateState('xp.spent', state.xp.spent + totalChainCost);
               }

               const chainIds = purchaseChain.map(a => a.id);
               const updatedDomains = state.domains.map(d => d.id === dId ? {
                   ...d, 
                   abilities: d.abilities.map(a => chainIds.includes(a.id) ? {...a, purchased: true} : a)
               } : d);

               setState(prev => {
                   regenerateGlobalAbilities(updatedDomains);
                   return {...prev, domains: updatedDomains};
               });
           } else {
               alert(`Недостаточно опыта! Нужно ${totalChainCost} XP.`);
           }

       } else {
           if (!state.gmMode && dom.level > targetAb.level) {
                const purchasedAtLevel = dom.abilities.filter(a => a.level === targetAb.level && a.purchased);
                if (purchasedAtLevel.length <= 1) {
                    alert(`Нельзя продать последнюю способность уровня ${targetAb.level}, так как уровень домена (${dom.level}) выше.`);
                    return;
                }
           }

           const baseName = getBaseName(targetAb.name);
           if (baseName) {
               const higherLevelUpgrade = dom.abilities.find(a => 
                   a.purchased && 
                   a.level > targetAb.level && 
                   getBaseName(a.name) === baseName
               );
               if (higherLevelUpgrade && !state.gmMode) {
                   alert(`Нельзя продать "${targetAb.name}", так как куплено улучшение "${higherLevelUpgrade.name}".`);
                   return;
               }
           }

           const { cost } = calculateDynamicCost(dom, targetAb);

           if(!state.gmMode) {
               updateState('xp.spent', Math.max(0, state.xp.spent - cost));
           }

           const updatedDomains = state.domains.map(d => d.id === dId ? {
               ...d, 
               abilities: d.abilities.map(a => a.id === aId ? {...a, purchased: false} : a)
           } : d);
           
           setState(prev => {
               regenerateGlobalAbilities(updatedDomains);
               return {...prev, domains: updatedDomains};
           });
       }
  };

  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.domains, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "domains_all.json";
    a.click();
  };

  const handleExportSingle = (domain: Domain) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(domain, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `domain_${domain.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
             const newDomains = json.map((d: any) => ({
                 ...d, 
                 id: d.id || Date.now() + Math.random(),
                 level: 0,
                 abilities: Array.isArray(d.abilities) 
                    ? d.abilities.map((a: any) => ({...a, id: Date.now() + Math.random(), purchased: false})) 
                    : []
             }));
             setState(prev => ({...prev, domains: [...prev.domains, ...newDomains]}));
             alert(`Импортировано ${newDomains.length} доменов (уровни сброшены).`);
        } else if (json.name && json.abilities) {
             const newDomain = {
                 ...json, 
                 id: Date.now(),
                 level: 0,
                 abilities: Array.isArray(json.abilities) 
                    ? json.abilities.map((a: any) => ({...a, id: Date.now() + Math.random(), purchased: false})) 
                    : []
             };
             setState(prev => ({...prev, domains: [...prev.domains, newDomain]}));
             alert(`Домен "${json.name}" импортирован (уровень сброшен).`);
        } else {
             alert("Неизвестный формат JSON.");
        }
      } catch (error) { alert("Ошибка чтения файла."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (showShop || state.gmMode) {
      const activeDomain = state.domains.find(d => d.id === selectedDomainId);

      return (
        <div className="space-y-6 pb-20">
           <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
           
           <div className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur py-4 border-b border-stone-200">
               <div className="flex flex-col gap-4">
                   <div className="flex flex-wrap justify-between items-center print:hidden gap-2">
                       <div className="flex items-center gap-4">
                           <button onClick={() => setShowShop(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                               <SvgIcon path='<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>' size={16} /> Назад
                           </button>
                           <h2 className="text-xl md:text-2xl font-header font-bold uppercase text-stone-800">Магазин</h2>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="bg-stone-800 text-white px-3 py-1 rounded text-sm font-bold mr-2 whitespace-nowrap">XP: {state.xp.total - state.xp.spent}</div>
                          <button onClick={handleExportAll} className="bg-stone-200 text-stone-600 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300 flex items-center gap-1" title="Скачать JSON">
                              <SvgIcon path={SVG_ICONS.download} size={14}/> <span className="hidden sm:inline">JSON</span>
                          </button>
                          <button onClick={handleImportClick} className="bg-stone-200 text-stone-600 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300 flex items-center gap-1" title="Импорт">
                              <SvgIcon path={SVG_ICONS.upload} size={14}/> <span className="hidden sm:inline">Импорт</span>
                          </button>
                       </div>
                   </div>

                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full items-center">
                        {state.domains.map(d => (
                            <button 
                                key={d.id}
                                onClick={() => setSelectedDomainId(d.id)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all shadow-sm border ${
                                    selectedDomainId === d.id 
                                    ? 'bg-stone-800 text-white border-stone-800 scale-105' 
                                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                                }`}
                            >
                                {d.name}
                            </button>
                        ))}
                   </div>
               </div>
           </div>

           {activeDomain ? (
                <DomainBlock 
                    key={activeDomain.id}
                    domain={activeDomain}
                    gmMode={state.gmMode}
                    isShopMode={true}
                    updateDomainName={(val) => setState(prev => ({...prev, domains: prev.domains.map(d => d.id === activeDomain.id ? {...d, name: val} : d)}))}
                    updateDomainDesc={(val) => setState(prev => ({...prev, domains: prev.domains.map(d => d.id === activeDomain.id ? {...d, description: val} : d)}))}
                    changeLvl={(delta) => changeLvl(activeDomain.id, delta)}
                    removeDomain={() => removeDomain(activeDomain.id)}
                    handleQR={handleQR}
                    addAb={(lvl) => addAb(activeDomain.id, lvl)}
                    toggleBuy={(aId) => toggleBuy(activeDomain.id, aId)}
                    updAb={(aId, f, v) => updAb(activeDomain.id, aId, f, v)}
                    delAb={(aId) => delAb(activeDomain.id, aId)}
                    onExport={() => handleExportSingle(activeDomain)}
                    allowAdd={false} // Disable card creation in this view!
                />
           ) : (
               <div className="text-center py-20 text-stone-400 font-header font-bold uppercase">
                   Выберите или создайте домен
               </div>
           )}
        </div>
      );
  }

  const hasAnyDomains = state.domains.length > 0;
  
  return (
     <div className="space-y-8">
         <div className="flex justify-between items-center border-b-4 border-stone-800 pb-4">
             <h2 className="text-2xl font-header font-bold uppercase text-stone-800">Мои Домены</h2>
             <button onClick={() => setShowShop(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-lg font-bold flex items-center gap-2">
                 <SvgIcon path='<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>' size={20} />
                 Магазин / Прокачка
             </button>
         </div>

         {!hasAnyDomains && (
             <div className="text-center py-12 text-stone-400">
                 <p className="mb-4">У вас пока нет доменов.</p>
                 <button onClick={() => setShowShop(true)} className="underline hover:text-stone-600">Перейти в магазин</button>
             </div>
         )}

         {state.domains.map(domain => {
             const purchasedAbilities = domain.abilities.filter(a => a.purchased);
             if (purchasedAbilities.length === 0) return null;

             const visibleAbilities: Ability[] = [];
             const groups: Record<string, Ability[]> = {};
             
             purchasedAbilities.forEach(ab => {
                 const baseName = getBaseName(ab.name);
                 if (baseName) {
                     if (!groups[baseName]) groups[baseName] = [];
                     groups[baseName].push(ab);
                 } else {
                     visibleAbilities.push(ab);
                 }
             });

             Object.values(groups).forEach(group => {
                 group.sort((a,b) => b.level - a.level);
                 if (group[0]) visibleAbilities.push(group[0]);
             });
             
             visibleAbilities.sort((a,b) => a.level - b.level);

             return (
                 <div key={domain.id} className="mb-8">
                     <div className="flex justify-between items-end border-b border-stone-300 pb-2 mb-4">
                         <h3 className="text-xl font-header font-bold uppercase text-stone-800">{domain.name}</h3>
                         <div className="text-2xl font-header font-black text-stone-300">LVL {domain.level}</div>
                     </div>
                     <div className="flex flex-wrap gap-6 justify-center">
                         {visibleAbilities.map(ability => (
                             <RpgCard 
                                key={ability.id} 
                                data={ability} 
                                styleData={ABILITY_STYLES[ability.type] || ABILITY_STYLES.skill}
                                isLocked={false} 
                                isPurchased={true}
                                onBuy={() => {}} 
                                onEdit={() => {}} 
                                onDelete={() => {}}
                                canQR={handleQR} 
                                qrType="ability" 
                                gmMode={false} 
                                mode="domain"
                             />
                         ))}
                     </div>
                 </div>
             );
         })}
     </div>
  );
};
