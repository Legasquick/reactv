import React, { useRef } from 'react';
import { Monster } from '../../types';
import { RpgCard } from '../RpgCard';
import { ABILITY_STYLES, SVG_ICONS } from '../../constants';
import { SvgIcon } from '../UIComponents';

interface GMMonsterPoolProps {
  monsters: Monster[];
  onUpdate: (monsters: Monster[]) => void;
  handleQR: (type: string, payload: any) => void;
}

export const GMMonsterPool: React.FC<GMMonsterPoolProps> = ({ monsters, onUpdate, handleQR }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMonster = () => {
      const newMonster: Monster = { 
          id: Date.now(), 
          name: "Монстр", 
          description: "HP: 10 | ATK: 2\nОсобенности: ...", 
          type: "monster", 
          apCost: "10", 
          inspCost: "1" 
      };
      onUpdate([...monsters, newMonster]);
  };

  const updateMonster = (id: number, f: string, v: string) => {
      onUpdate(monsters.map(m => m.id === id ? {...m, [f]: v} : m));
  };

  const deleteMonster = (id: number) => {
      onUpdate(monsters.filter(m => m.id !== id));
  };

  // --- Export / Import ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(monsters, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "gm_monsters_pool.json";
    a.click();
    a.remove();
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
             const newMonsters = json.map((m: any) => ({...m, id: m.id || Date.now() + Math.random()}));
             onUpdate([...monsters, ...newMonsters]);
             alert(`Импортировано ${newMonsters.length} монстров.`);
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

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 p-4 border-b border-stone-200 shrink-0">
           <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
               <h3 className="font-bold text-stone-600 uppercase text-sm whitespace-nowrap">Бестиарий ({monsters.length})</h3>
               <div className="flex gap-2">
                   <button onClick={handleExport} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 shadow-sm">
                     <SvgIcon path={SVG_ICONS.download} size={14}/> JSON
                   </button>
                   <button onClick={handleImportClick} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 shadow-sm">
                     <SvgIcon path={SVG_ICONS.upload} size={14}/> Импорт
                   </button>
               </div>
           </div>

           <button onClick={addMonster} className="w-full md:w-auto justify-center bg-red-800 text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-900 flex items-center gap-2 shadow-sm transition-colors">
               <span>+</span> Создать
           </button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-stone-100/30">
           <div className="flex flex-wrap gap-6 justify-center content-start">
               {monsters.map(m => (
                   <RpgCard 
                      key={m.id} 
                      data={m} 
                      styleData={ABILITY_STYLES.monster} 
                      isLocked={false} 
                      isPurchased={true}
                      onBuy={()=>{}} 
                      onEdit={(f, v) => updateMonster(m.id, f, v)} 
                      onDelete={() => deleteMonster(m.id)}
                      canQR={handleQR} 
                      qrType="item" 
                      gmMode={true} 
                      mode="inventory"
                   />
               ))}
               {monsters.length === 0 && (
                   <div className="py-20 text-stone-300 font-bold uppercase text-center w-full text-lg">
                       Бестиарий пуст
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};