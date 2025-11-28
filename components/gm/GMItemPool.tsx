import React, { useRef } from 'react';
import { InventoryItem } from '../../types';
import { RpgCard } from '../RpgCard';
import { ABILITY_STYLES, SVG_ICONS } from '../../constants';
import { SvgIcon } from '../UIComponents';

interface GMItemPoolProps {
  items: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
}

export const GMItemPool: React.FC<GMItemPoolProps> = ({ items, onUpdate, handleQR }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => {
      const newItem: InventoryItem = { id: Date.now(), name: "Предмет", description: "...", type: "item", apCost: "1", inspCost: "0" };
      onUpdate([...items, newItem]);
  };

  const updateItem = (id: number, f: string, v: string) => {
      onUpdate(items.map(i => i.id === id ? {...i, [f]: v} : i));
  };

  const deleteItem = (id: number) => {
      onUpdate(items.filter(i => i.id !== id));
  };

  // --- Export / Import ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "gm_items_pool.json";
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
             // Import Array
             const newItems = json.map((i: any) => ({...i, id: i.id || Date.now() + Math.random()}));
             onUpdate([...items, ...newItems]);
             alert(`Импортировано ${newItems.length} предметов.`);
        } else if (json.name && json.type === 'item') {
             // Import Single Item (from Character Sheet export)
             const newItem = { ...json, id: Date.now() };
             onUpdate([...items, newItem]);
             alert(`Импортирован предмет: ${json.name}`);
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
               <h3 className="font-bold text-stone-600 uppercase text-sm whitespace-nowrap">Библиотека Предметов ({items.length})</h3>
               <div className="flex gap-2">
                   <button onClick={handleExport} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 shadow-sm">
                     <SvgIcon path={SVG_ICONS.download} size={14}/> JSON
                   </button>
                   <button onClick={handleImportClick} className="bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 shadow-sm">
                     <SvgIcon path={SVG_ICONS.upload} size={14}/> Импорт
                   </button>
               </div>
           </div>
           
           <button onClick={addItem} className="w-full md:w-auto justify-center bg-stone-800 text-white px-4 py-2 rounded font-bold text-sm hover:bg-stone-700 flex items-center gap-2 shadow-sm transition-colors">
               <span>+</span> Создать
           </button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-stone-100/30">
           <div className="flex flex-wrap gap-6 justify-center content-start">
               {items.map(item => (
                   <RpgCard 
                      key={item.id} 
                      data={item} 
                      styleData={ABILITY_STYLES.item} 
                      isLocked={false} 
                      isPurchased={true}
                      onBuy={()=>{}} 
                      onEdit={(f, v) => updateItem(item.id, f, v)} 
                      onDelete={() => deleteItem(item.id)}
                      canQR={handleQR} 
                      qrType="item" 
                      gmMode={true} 
                      mode="inventory"
                   />
               ))}
               {items.length === 0 && (
                   <div className="py-20 text-stone-300 font-bold uppercase text-center w-full text-lg">
                       Список пуст
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};