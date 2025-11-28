
import React, { useState, useRef, useMemo } from 'react';
import { Domain, Ability, PartyMember } from '../../types';
import { DomainBlock } from '../domain/DomainBlock';
import { SvgIcon } from '../UIComponents';
import { SVG_ICONS } from '../../constants';

interface GMDomainPoolProps {
  domains: Domain[];
  party: PartyMember[];
  onUpdate: (updatedDomains: Domain[]) => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
}

export const GMDomainPool: React.FC<GMDomainPoolProps> = ({ domains, party, onUpdate, handleQR }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // selectedOwnerId: null = "Unassigned" (Shared), number = Party Member ID
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter domains based on selected owner
  const filteredDomains = useMemo(() => {
    return domains.filter(d => {
        if (selectedOwnerId === null) return d.assignedTo === null || d.assignedTo === undefined;
        return d.assignedTo === selectedOwnerId;
    });
  }, [domains, selectedOwnerId]);

  const activeDomain = domains.find(d => d.id === selectedId);

  const addDomain = () => {
    const newDomain: Domain = { 
        id: Date.now(), 
        name: "Новый Домен", 
        description: "...", 
        level: 0, 
        abilities: [],
        assignedTo: selectedOwnerId 
    };
    const updated = [...domains, newDomain];
    onUpdate(updated);
    setSelectedId(newDomain.id);
  };

  const updateDomain = (id: number, updater: (d: Domain) => Domain) => {
    onUpdate(domains.map(d => d.id === id ? updater(d) : d));
  };

  const removeDomain = (id: number) => {
    // String cast ensures deletion works even if IDs were imported as strings from JSON
    onUpdate(domains.filter(d => String(d.id) !== String(id)));
    if (String(selectedId) === String(id)) setSelectedId(null);
  };

  // Change Assignment
  const assignDomain = (domainId: number, ownerId: number | null) => {
      updateDomain(domainId, d => ({ ...d, assignedTo: ownerId }));
      // If we move it out of current view, deselect it
      if (ownerId !== selectedOwnerId) {
          setSelectedId(null);
      }
  };

  const changeLvl = (id: number, delta: number) => {
     updateDomain(id, d => {
         const newLvl = Math.max(0, Math.min(6, d.level + delta));
         return {...d, level: newLvl};
     });
  };

  const addAb = (id: number, lvl: number) => {
     const newAb: Ability = { 
         id: Date.now() + Math.random(), 
         name: "Способность", 
         description: "...", 
         type: "skill", 
         level: lvl, 
         apCost: "1", 
         inspCost: "0", 
         purchased: false 
     };
     updateDomain(id, d => ({...d, abilities: [...d.abilities, newAb]}));
  };

  const updAb = (dId: number, aId: number, f: string, v: string) => {
     updateDomain(dId, d => ({...d, abilities: d.abilities.map(a => a.id === aId ? {...a, [f]: v} : a)}));
  };

  const delAb = (dId: number, aId: number) => {
     updateDomain(dId, d => ({...d, abilities: d.abilities.filter(a => a.id !== aId)}));
  };

  const handleExport = () => {
    // Export only visible domains (filtered) or all? Let's export filtered for context utility
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredDomains, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `gm_domains_${selectedOwnerId ? 'char' : 'pool'}.json`;
    a.click();
    a.remove();
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
                 assignedTo: selectedOwnerId, // Import into current view
                 // Regenerate ability IDs if missing or reused
                 abilities: Array.isArray(d.abilities) 
                    ? d.abilities.map((a: any) => ({...a, id: Date.now() + Math.random()})) 
                    : []
             }));
             onUpdate([...domains, ...newDomains]);
             alert(`Импортировано ${newDomains.length} доменов в текущую категорию.`);
        } else if (json.name && json.abilities) {
             const newDomain = {
                 ...json,
                 id: Date.now(),
                 assignedTo: selectedOwnerId,
                 abilities: Array.isArray(json.abilities) 
                    ? json.abilities.map((a: any) => ({...a, id: Date.now() + Math.random()})) 
                    : []
             };
             onUpdate([...domains, newDomain]);
             alert(`Импортирован домен: ${json.name}`);
        } else {
             alert("Неверный формат JSON.");
        }
      } catch (error) { alert("Ошибка чтения файла."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
       <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />

       <div className="flex flex-col bg-stone-50 border-b border-stone-200 shrink-0">
           {/* Actions Toolbar */}
           <div className="flex flex-wrap items-center gap-2 p-4 border-b border-stone-200/50">
              <button onClick={addDomain} className="px-4 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 shadow-sm flex items-center gap-2 transition-all">
                  <span className="text-lg leading-none">+</span> Добавить
              </button>
              
              <div className="h-8 w-px bg-stone-300 mx-2 hidden md:block"></div>

              <button onClick={handleExport} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                 <SvgIcon path={SVG_ICONS.download} size={16}/> JSON
              </button>
              <button onClick={handleImportClick} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                 <SvgIcon path={SVG_ICONS.upload} size={16}/> Импорт
              </button>
           </div>
           
           {/* Character Filter Tabs */}
           <div className="flex gap-2 overflow-x-auto p-2 bg-stone-100 no-scrollbar border-b border-stone-200">
                <button
                    onClick={() => { setSelectedOwnerId(null); setSelectedId(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                        selectedOwnerId === null
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-white text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                >
                    Общий пул
                </button>
                {party.map(p => (
                    <button
                        key={p.id}
                        onClick={() => { setSelectedOwnerId(p.id); setSelectedId(null); }}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                            selectedOwnerId === p.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-stone-500 border-stone-300 hover:bg-blue-50'
                        }`}
                    >
                        {p.name}
                    </button>
                ))}
           </div>
           
           {/* Domains List */}
           <div className="flex gap-2 overflow-x-auto p-4 items-center no-scrollbar">
              {filteredDomains.length === 0 && <span className="text-stone-400 text-sm font-bold px-2">Список пуст</span>}
              
              {filteredDomains.map(d => (
                 <button 
                    key={d.id} 
                    onClick={() => setSelectedId(d.id)}
                    className={`shrink-0 px-4 py-2 rounded-lg font-bold text-sm border shadow-sm transition-all whitespace-nowrap ${
                        selectedId === d.id 
                        ? 'bg-stone-800 text-white border-stone-800 ring-2 ring-stone-300' 
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-white hover:border-stone-400'
                    }`}
                 >
                    {d.name}
                 </button>
              ))}
           </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 bg-stone-100/50">
          {activeDomain ? (
             <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 lg:p-8 max-w-5xl mx-auto">
                 <DomainBlock 
                    domain={activeDomain}
                    gmMode={true} 
                    isShopMode={true}
                    updateDomainName={(v) => updateDomain(activeDomain.id, d => ({...d, name: v}))}
                    updateDomainDesc={(v) => updateDomain(activeDomain.id, d => ({...d, description: v}))}
                    changeLvl={(d) => changeLvl(activeDomain.id, d)}
                    removeDomain={() => removeDomain(activeDomain.id)}
                    handleQR={handleQR}
                    addAb={(lvl) => addAb(activeDomain.id, lvl)}
                    toggleBuy={() => {}} 
                    updAb={(aId, f, v) => updAb(activeDomain.id, aId, f, v)}
                    delAb={(aId) => delAb(activeDomain.id, aId)}
                    onExport={() => handleExportSingle(activeDomain)}
                    allowAdd={true}
                    
                    // Props for Re-assignment
                    party={party}
                    onAssign={(ownerId) => assignDomain(activeDomain.id, ownerId)}
                 />
             </div>
          ) : (
             <div className="flex h-full items-center justify-center text-stone-300 font-bold uppercase tracking-widest text-lg">
                Выберите домен
             </div>
          )}
       </div>
    </div>
  );
};
