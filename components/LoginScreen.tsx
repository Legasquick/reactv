import React, { useState } from 'react';
import { SvgIcon } from './UIComponents';
import { SVG_ICONS } from '../constants';

interface LoginScreenProps {
  onUnlock: (password: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onUnlock }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Simulate async feeling for security theater
    await new Promise(r => setTimeout(r, 500));
    
    const success = await onUnlock(pass);
    if (!success) {
        setError(true);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col items-center justify-center p-6 z-[9999]">
       <div className="w-full max-w-sm bg-stone-800 p-8 rounded-2xl shadow-2xl border border-stone-700">
           <div className="flex justify-center mb-6 text-stone-300">
               <SvgIcon path={SVG_ICONS.lock} size={48} />
           </div>
           
           <h1 className="text-2xl font-header font-black text-white text-center uppercase mb-8 tracking-widest">
               Доступ Запрещен
           </h1>
           
           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <input 
                 type="password" 
                 value={pass}
                 onChange={e => setPass(e.target.value)}
                 placeholder="Пароль доступа"
                 className={`
                    w-full bg-stone-900 border text-center text-white text-lg p-3 rounded-lg focus:outline-none focus:ring-2
                    ${error ? 'border-red-500 focus:ring-red-500 animate-shake' : 'border-stone-600 focus:ring-emerald-500'}
                 `}
                 autoFocus
               />
               
               {error && <div className="text-red-400 text-xs font-bold text-center uppercase tracking-wider">Неверный пароль</div>}

               <button 
                 type="submit"
                 disabled={loading || !pass}
                 className="w-full bg-white text-stone-900 font-bold py-3 rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors"
               >
                 {loading ? 'Проверка...' : 'Войти'}
               </button>
           </form>
           
           <div className="mt-8 text-center text-stone-600 text-xs font-mono">
               SYS_LOCK_ACTIVE: SECURE_V2
           </div>
       </div>
    </div>
  );
};