
import React, { useState } from 'react';
import { Adventure } from '../../types';
import { StableInput, SvgIcon } from '../UIComponents';
import { SVG_ICONS } from '../../constants';

interface AdventureSelectorProps {
  adventures: Adventure[];
  currentId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onExport: () => void;
}

export const AdventureSelector: React.FC<AdventureSelectorProps> = ({ adventures, currentId, onSelect, onCreate, onDelete, onRename, onExport }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const currentAdventure = adventures.find(a => a.id === currentId);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Left: Current Adventure Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full lg:w-auto flex-1">
          <div className="bg-stone-800 p-2 rounded text-white shrink-0 hidden md:block"><SvgIcon path={SVG_ICONS.adventure} size={24} /></div>
          
          {currentAdventure ? (
             <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Текущее Приключение</label>
                <StableInput 
                   value={currentAdventure.name} 
                   onCommit={(v) => onRename(currentAdventure.id, v)} 
                   className="font-header font-bold text-xl w-full px-2 py-1 bg-white border border-stone-300 rounded focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all shadow-inner text-stone-800"
                />
             </div>
          ) : (
             <div className="text-stone-400 font-bold italic py-2">Приключение не выбрано...</div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
           <select 
             className="bg-stone-50 border border-stone-300 rounded px-3 py-2 text-sm font-bold w-full md:w-48 text-stone-700 focus:border-stone-500 outline-none h-[42px]"
             value={currentId || ''}
             onChange={(e) => onSelect(Number(e.target.value))}
           >
              <option value="" disabled>-- Список --</option>
              {adventures.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
           </select>

           <div className="flex gap-2">
               <button 
                 onClick={() => setIsCreating(true)} 
                 className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 h-[42px] flex items-center justify-center rounded shadow-sm transition-colors"
                 title="Создать новое"
               >
                 <SvgIcon path='<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' size={20} />
               </button>
               
               {currentId && (
                  <>
                     <button 
                       onClick={onExport} 
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 h-[42px] flex items-center justify-center rounded shadow-sm transition-colors"
                       title="Экспорт JSON"
                     >
                       <SvgIcon path={SVG_ICONS.download} size={20} />
                     </button>

                     <button 
                       type="button"
                       onClick={(e) => { 
                           e.preventDefault(); 
                           e.stopPropagation(); 
                           onDelete(currentId); 
                       }} 
                       className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 px-3 h-[42px] flex items-center justify-center rounded shadow-sm transition-colors"
                       title="Удалить"
                     >
                       <SvgIcon path={SVG_ICONS.trash} size={20} />
                     </button>
                  </>
               )}
           </div>
        </div>
      </div>

      {isCreating && (
        <div className="mt-4 p-4 bg-stone-50 rounded border border-stone-200 flex flex-col md:flex-row gap-3 items-end animate-fade-in shadow-inner">
           <div className="flex-1 w-full">
             <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Название нового приключения</label>
             <input 
               autoFocus
               type="text" 
               value={newName} 
               onChange={e => setNewName(e.target.value)} 
               className="w-full border border-stone-300 p-2 rounded bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
               placeholder="Например: Тёмная Башня"
               onKeyDown={e => e.key === 'Enter' && handleCreate()}
             />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleCreate} className="flex-1 md:flex-none bg-stone-800 text-white px-6 py-2 rounded font-bold hover:bg-stone-900">Создать</button>
                <button onClick={() => setIsCreating(false)} className="flex-1 md:flex-none bg-white border border-stone-300 text-stone-600 px-4 py-2 rounded font-bold hover:bg-stone-100">Отмена</button>
           </div>
        </div>
      )}
    </div>
  );
};
