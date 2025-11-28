import React, { useEffect, useState } from 'react';
import { SvgIcon } from './UIComponents';
import { SVG_ICONS } from '../constants';

export interface NotificationData {
  type: 'xp' | 'item' | 'domain' | 'ability' | 'item-sent' | 'error';
  title: string;
  subtitle?: string;
  amount?: number;
}

interface NotificationOverlayProps {
  data: NotificationData | null;
  onClose: () => void;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ data, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 2500); // Display duration
      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  if (!data && !visible) return null;

  // Render logic based on type
  const renderContent = () => {
    if (!data) return null;

    if (data.type === 'error') {
        return (
            <div className="anim-shake flex flex-col items-center bg-red-900/90 backdrop-blur-md p-6 rounded-2xl border border-red-500 shadow-2xl max-w-sm text-center">
                <div className="bg-red-800 p-4 rounded-full mb-4 shadow-lg border-2 border-red-400">
                    <SvgIcon path={SVG_ICONS.lock} size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-header uppercase drop-shadow-sm">{data.title}</h3>
                {data.subtitle && <p className="text-red-200 text-sm font-hand italic">{data.subtitle}</p>}
            </div>
        );
    }

    if (data.type === 'xp') {
      return (
        <div className="relative flex flex-col items-center justify-center anim-float-up pointer-events-none">
           <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-20 anim-burst"></div>
           <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg filter font-header">
              +{data.amount}
           </div>
           <div className="text-2xl md:text-3xl font-bold text-yellow-100 mt-2 uppercase tracking-widest font-header drop-shadow-md">
              Опыт Получен
           </div>
        </div>
      );
    }

    if (data.type === 'item' || data.type === 'ability') {
        return (
            <div className="anim-pop-in flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-2xl max-w-sm text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-stone-800 p-4 rounded-full mb-4 shadow-lg border-2 border-stone-600">
                    <SvgIcon path={data.type === 'item' ? SVG_ICONS.item : SVG_ICONS.skill} size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-header uppercase drop-shadow-sm">{data.title}</h3>
                {data.subtitle && <p className="text-white/80 text-sm font-hand italic">{data.subtitle}</p>}
                <div className="mt-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                    {data.type === 'item' ? 'Добавлено в рюкзак' : 'Способность изучена'}
                </div>
            </div>
        );
    }

    if (data.type === 'item-sent') {
        return (
            <div className="anim-float-out flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-red-500 p-6 rounded-full shadow-2xl mb-2">
                    <SvgIcon path={SVG_ICONS.item} size={64} className="text-white" />
                </div>
                <h3 className="text-3xl font-header font-black text-red-500 uppercase tracking-widest drop-shadow-sm">Отдано</h3>
                <p className="text-white font-bold text-lg">{data.title}</p>
            </div>
        );
    }

    if (data.type === 'domain') {
        return (
            <div className="anim-pop-in relative w-full max-w-md mx-4">
                 <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 animate-pulse"></div>
                 <div className="relative bg-stone-900 p-6 rounded-lg border border-stone-700 shadow-2xl flex flex-col items-center text-center">
                    <div className="mb-2 text-purple-400">
                        <SvgIcon path={SVG_ICONS.domains} size={64} />
                    </div>
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-[0.2em] mb-1">Новое знание открыто</div>
                    <h2 className="text-3xl font-header font-black text-white uppercase mb-2">{data.title}</h2>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent my-2"></div>
                    <p className="text-stone-400 text-sm italic">{data.subtitle}</p>
                 </div>
            </div>
        );
    }

    return null;
  };

  return (
    <div 
        className={`fixed inset-0 z-[150] flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
    >
        {renderContent()}
    </div>
  );
};