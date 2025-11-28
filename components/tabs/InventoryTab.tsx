import React, { useRef } from 'react';
import { AppState } from '../../types';
import { RpgCard } from '../RpgCard';
import { AutoGrowTextarea, SvgIcon } from '../UIComponents';
import { ABILITY_STYLES, SVG_ICONS } from '../../constants';

interface InventoryTabProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateState: (path: string, value: any) => void;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ state, setState, updateState, handleQR }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed addItem function to prevent card creation here

  const updateItem = (id: number, f: string, v: string) => setState(prev => ({...prev, inventory: prev.inventory.map(i => i.id === id ? {...i, [f]: v} : i)}));
  
  const deleteItem = (id: number) => setState(prev => ({...prev, inventory: prev.inventory.filter(i => i.id !== id)}));

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.inventory, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "inventory.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
            const newItems = json.map((i: any) => ({...i, id: i.id || Date.now() + Math.random()}));
            setState(prev => ({...prev, inventory: [...prev.inventory, ...newItems]}));
            alert(`Успешно импортировано ${newItems.length} предметов.`);
        } else {
            alert("Неверный формат JSON (ожидается массив).");
        }
      } catch (error) {
        alert("Ошибка чтения файла.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const handleItemQR = (type: string, data: any) => {
      const context = !state.gmMode ? { actionType: 'delete_item', id: data.id } : undefined;
      handleQR(type, data, context);
  };
  
  const handleAllQR = () => {
      const context = !state.gmMode ? { actionType: 'clear_inventory' } : undefined;
      handleQR('inventory', state.inventory, context);
  };

  return (
      <div className="space-y-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            accept=".json" 
            onChange={handleFileChange} 
          />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center print:hidden gap-4">
              <h2 className="text-2xl font-header font-bold uppercase text-stone-800">Инвентарь</h2>
              <div className="flex flex-wrap gap-2">
                  <button onClick={handleExport} className="bg-stone-200 text-stone-700 hover:bg-stone-300 px-3 py-1 rounded text-sm font-bold flex items-center gap-2">
                    <SvgIcon path={SVG_ICONS.download} size={16}/> JSON
                  </button>
                  <button onClick={handleImportClick} className="bg-stone-200 text-stone-700 hover:bg-stone-300 px-3 py-1 rounded text-sm font-bold flex items-center gap-2">
                    <SvgIcon path={SVG_ICONS.upload} size={16}/> Импорт
                  </button>
                  <div className="w-px bg-stone-300 mx-1"></div>
                  <button onClick={handleAllQR} className="bg-stone-800 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-2"><SvgIcon path={SVG_ICONS.qr} size={16}/> QR Все</button>
              </div>
          </div>

          <div className="bg-stone-50 p-4 rounded border border-stone-200">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Рюкзак (Список)</label>
              <AutoGrowTextarea value={state.inventoryText} onChange={e => updateState('inventoryText', e.target.value)} className="w-full text-sm font-hand min-h-[100px] ghost-input p-2" placeholder="Веревка, факел..." />
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
              {state.inventory.map(item => (
                  <RpgCard key={item.id} data={item} styleData={ABILITY_STYLES.item} isLocked={false} isPurchased={true}
                     onBuy={()=>{}} onEdit={(f, v) => updateItem(item.id, f, v)} onDelete={() => deleteItem(item.id)}
                     canQR={handleItemQR} qrType="item" gmMode={state.gmMode} mode="inventory"
                  />
              ))}
          </div>
      </div>
  );
};