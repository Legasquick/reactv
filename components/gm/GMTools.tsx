import React, { useState } from 'react';
import { PartyMember } from '../../types';
import { StableInput, SvgIcon } from '../UIComponents';
import { SVG_ICONS } from '../../constants';

interface GMToolsProps {
  party: PartyMember[];
  onUpdateParty: (party: PartyMember[]) => void;
  handleQR: (type: string, payload: any) => void;
}

export const GMTools: React.FC<GMToolsProps> = ({ party, onUpdateParty, handleQR }) => {
  const [xpAmount, setXpAmount] = useState<string>('5');

  const addMember = () => {
      onUpdateParty([...party, { id: Date.now(), name: "Игрок", level: 1 }]);
  };

  const updateMember = (id: number, f: keyof PartyMember, v: any) => {
      onUpdateParty(party.map(m => m.id === id ? {...m, [f]: v} : m));
  };

  const removeMember = (id: number) => {
      onUpdateParty(party.filter(m => m.id !== id));
  };

  const generateXpQr = () => {
      const amount = parseInt(xpAmount);
      if (amount > 0) {
          handleQR('xp', { amount, name: `XP: ${amount}` });
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* XP Generator */}
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <div className="bg-amber-500 text-white p-1 rounded"><SvgIcon path={SVG_ICONS.xp} size={20} /></div>
                <h3 className="font-header font-bold text-lg text-stone-800">Выдача Опыта</h3>
            </div>
            
            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Количество (XP)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={xpAmount} 
                            onChange={e => setXpAmount(e.target.value)}
                            className="flex-1 bg-white border border-stone-300 rounded p-2 font-header font-bold text-xl text-center text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                </div>
                <button 
                    onClick={generateXpQr}
                    className="w-full bg-stone-800 text-white font-bold py-3 rounded-lg hover:bg-stone-700 flex justify-center items-center gap-2 shadow-lg"
                >
                    <SvgIcon path={SVG_ICONS.qr} size={20} />
                    Сгенерировать QR
                </button>
            </div>
        </div>

        {/* Party Tracker */}
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
             <div className="flex items-center justify-between gap-2 mb-4 border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-1 rounded"><SvgIcon path={SVG_ICONS.party} size={20} /></div>
                    <h3 className="font-header font-bold text-lg text-stone-800">Трекер Партии</h3>
                </div>
                <button onClick={addMember} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">+ Игрок</button>
            </div>
            
            <div className="space-y-2">
                {party.length === 0 && <div className="text-center text-stone-400 text-sm py-4">Нет игроков</div>}
                
                {party.map(member => (
                    <div key={member.id} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm border border-stone-100">
                        <StableInput 
                            value={member.name} 
                            onCommit={(v) => updateMember(member.id, 'name', v)} 
                            className="flex-1 font-bold text-stone-700 bg-transparent focus:outline-none"
                        />
                        <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
                            <span className="text-[10px] text-stone-400 font-bold uppercase">LVL</span>
                            <input 
                                type="number" 
                                value={member.level} 
                                onChange={(e) => updateMember(member.id, 'level', parseInt(e.target.value))}
                                className="w-10 text-center font-bold text-stone-800 border-b border-stone-200 focus:border-stone-800 bg-transparent focus:outline-none"
                            />
                        </div>
                        <button onClick={() => removeMember(member.id)} className="text-stone-300 hover:text-red-500 ml-2">
                            <SvgIcon path={SVG_ICONS.trash} size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};