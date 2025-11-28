import React, { useState } from 'react';
import { SvgIcon } from '../UIComponents';
import { SVG_ICONS } from '../../constants';

interface GMPasswordModalProps {
  onUnlock: (password: string) => Promise<boolean>;
  onClose: () => void;
}

export const GMPasswordModal: React.FC<GMPasswordModalProps> = ({ onUnlock, onClose }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    const success = await onUnlock(pass);
    if (success) {
        onClose();
    } else {
        setError(true);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-6 z-[1000]" onClick={onClose}>
       <div className="w-full max-w-sm bg-stone-900 p-8 rounded-2xl shadow-2xl border border-stone-700" onClick={e => e.stopPropagation()}>
           <div className="flex justify-center mb-6 text-red-500">
               <SvgIcon path={SVG_ICONS.gm} size={48} />
           </div>
           
           <h2 className="text-xl font-header font-black text-white text-center uppercase mb-6 tracking-widest">
               Доступ к Панели Мастера
           </h2>
           
           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <input 
                 type="password" 
                 value={pass}
                 onChange={e => { setPass(e.target.value); setError(false); }}
                 placeholder="Пароль Мастера"
                 className={`
                    w-full bg-stone-800 border text-center text-white text-lg p-3 rounded-lg focus:outline-none focus:ring-2
                    ${error ? 'border-red-500 focus:ring-red-500' : 'border-stone-600 focus:ring-red-600'}
                 `}
                 autoFocus
               />
               
               {error && <div className="text-red-400 text-xs font-bold text-center uppercase tracking-wider animate-pulse">Неверный пароль</div>}

               <button 
                 type="submit"
                 disabled={loading || !pass}
                 className="w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors shadow-lg"
               >
                 {loading ? 'Проверка...' : 'Открыть доступ'}
               </button>
               
               <button 
                 type="button"
                 onClick={onClose}
                 className="w-full bg-transparent text-stone-500 font-bold py-2 rounded-lg hover:text-white transition-colors"
               >
                 Отмена
               </button>
           </form>
       </div>
    </div>
  );
};