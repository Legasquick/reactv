
import React, { useState } from 'react';
import { AppState, Adventure } from '../../types';
import { AdventureSelector } from '../gm/AdventureSelector';
import { GMDomainPool } from '../gm/GMDomainPool';
import { GMItemPool } from '../gm/GMItemPool';
import { GMMonsterPool } from '../gm/GMMonsterPool';
import { GMTools } from '../gm/GMTools';
import { AutoGrowTextarea } from '../UIComponents';

interface GMTabProps {
  state: AppState;
  updateState: (path: string, value: any) => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  handleQR: (type: string, payload: any, actionContext?: any) => void;
}

type SubTab = 'domains' | 'items' | 'monsters' | 'notes' | 'tools';

// Updated Order: Tools -> Notes -> Domains -> Items -> Monsters
const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'tools', label: 'Инструменты' },
    { id: 'notes', label: 'Заметки' },
    { id: 'domains', label: 'Домены' },
    { id: 'items', label: 'Предметы' },
    { id: 'monsters', label: 'Бестиарий' },
];

export const GMTab: React.FC<GMTabProps> = ({ state, updateState, setState, handleQR }) => {
  const [subTab, setSubTab] = useState<SubTab>('tools');

  const { adventures, currentAdventureId } = state;
  const currentAdventure = adventures?.find(a => a.id === currentAdventureId);

  // --- Adventure CRUD ---
  const createAdventure = (name: string) => {
      const newAdv: Adventure = {
          id: Date.now(),
          name,
          domains: [],
          items: [],
          monsters: [],
          party: [],
          notes: ''
      };
      setState(prev => ({
          ...prev,
          adventures: [...(prev.adventures || []), newAdv],
          currentAdventureId: newAdv.id
      }));
  };

  const deleteAdventure = (id: number) => {
      setState(prev => ({
          ...prev,
          adventures: prev.adventures.filter(a => String(a.id) !== String(id)),
          currentAdventureId: String(prev.currentAdventureId) === String(id) ? null : prev.currentAdventureId
      }));
  };

  const renameAdventure = (id: number, name: string) => {
      updateAdventure(id, { name });
  };

  const selectAdventure = (id: number) => {
      updateState('currentAdventureId', id);
  };

  // --- Helper to update current adventure ---
  const updateAdventure = (id: number, partial: Partial<Adventure>) => {
      setState(prev => ({
          ...prev,
          adventures: prev.adventures.map(a => a.id === id ? { ...a, ...partial } : a)
      }));
  };

  const handleExportAdventure = () => {
      if (!currentAdventure) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAdventure, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `adventure_${currentAdventure.name.replace(/\s+/g, '_').toLowerCase()}.json`;
      a.click();
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-full min-h-[80vh]">
      <h2 className="text-2xl font-header font-bold uppercase text-stone-800 border-b-4 border-stone-800 pb-2 mb-6">
          Панель Мастера
      </h2>

      <AdventureSelector 
          adventures={adventures || []} 
          currentId={currentAdventureId} 
          onCreate={createAdventure}
          onDelete={deleteAdventure}
          onSelect={selectAdventure}
          onRename={renameAdventure}
          onExport={handleExportAdventure}
      />

      {currentAdventure ? (
          <div className="flex-1 flex flex-col min-h-0">
              {/* Sub-tabs Navigation */}
              
              {/* Mobile: Select Dropdown */}
              <div className="block md:hidden mb-4">
                  <div className="relative">
                      <select 
                          value={subTab} 
                          onChange={(e) => setSubTab(e.target.value as SubTab)}
                          className="w-full appearance-none bg-stone-800 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                      >
                          {SUB_TABS.map(tab => (
                              <option key={tab.id} value={tab.id}>{tab.label}</option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                  </div>
              </div>

              {/* Desktop: Horizontal Tabs */}
              <div className="hidden md:flex gap-2 mb-4 border-b border-stone-200 overflow-x-auto pb-1 shrink-0 no-scrollbar">
                  {SUB_TABS.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setSubTab(tab.id as SubTab)}
                          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors whitespace-nowrap ${
                              subTab === tab.id 
                              ? 'bg-stone-800 text-white shadow-sm' 
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* Content Area - using flex-1 and min-h-0 to allow internal scrolling if needed */}
              <div className="flex-1 bg-white rounded-lg p-1">
                  {subTab === 'tools' && (
                      <div className="p-4">
                          <GMTools 
                              party={currentAdventure.party} 
                              onUpdateParty={(p) => updateAdventure(currentAdventure.id, { party: p })} 
                              handleQR={handleQR}
                          />
                      </div>
                  )}
                  {subTab === 'notes' && (
                      <div className="h-full flex flex-col p-4">
                          <label className="text-xs font-bold text-stone-400 uppercase mb-2">Сюжетные заметки</label>
                          <AutoGrowTextarea 
                              value={currentAdventure.notes} 
                              onChange={(e) => updateAdventure(currentAdventure.id, { notes: e.target.value })} 
                              className="w-full flex-1 p-4 bg-white border border-stone-300 rounded font-hand text-sm focus:border-stone-500 outline-none resize-none shadow-inner"
                              placeholder="Заметки о текущем приключении..."
                          />
                      </div>
                  )}
                  {subTab === 'domains' && (
                      <GMDomainPool 
                          domains={currentAdventure.domains} 
                          party={currentAdventure.party}
                          onUpdate={(d) => updateAdventure(currentAdventure.id, { domains: d })} 
                          handleQR={handleQR}
                      />
                  )}
                  {subTab === 'items' && (
                      <GMItemPool 
                          items={currentAdventure.items} 
                          onUpdate={(i) => updateAdventure(currentAdventure.id, { items: i })} 
                          handleQR={handleQR}
                      />
                  )}
                  {subTab === 'monsters' && (
                      <GMMonsterPool 
                          monsters={currentAdventure.monsters} 
                          onUpdate={(m) => updateAdventure(currentAdventure.id, { monsters: m })} 
                          handleQR={handleQR}
                      />
                  )}
              </div>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 rounded-lg border-2 border-dashed border-stone-200 text-stone-400 font-bold uppercase p-12 text-center">
              <span className="text-4xl mb-4 opacity-20">?</span>
              <p>Выберите приключение или создайте новое</p>
          </div>
      )}
    </div>
  );
};
