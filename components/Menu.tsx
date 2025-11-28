import React from 'react';
import { MenuButton } from './UIComponents';
import { SVG_ICONS } from '../constants';
import { AppState } from '../types';

interface MenuProps {
  activeTab: AppState['tab'];
  gmMode: boolean;
  onTabChange: (tab: AppState['tab']) => void;
  onGmToggle: () => void;
  onScan: () => void;
  onDownload: () => void;
}

export const Menu: React.FC<MenuProps> = ({ activeTab, gmMode, onTabChange, onGmToggle, onScan, onDownload }) => (
  <div className={`
      fixed z-50 transition-opacity 
      bottom-4 left-4 right-4 
      lg:top-4 lg:right-4 lg:left-auto lg:bottom-auto lg:w-auto 
      bg-white/90 backdrop-blur border border-stone-300 rounded-2xl shadow-xl 
      p-2 
      grid grid-cols-4 gap-2 
      lg:flex lg:flex-col
  `}>
    {/* Navigation Tabs (Row 1 on Mobile/Tablet) */}
    <MenuButton iconPath={SVG_ICONS.char} label="Персонаж" active={activeTab === 'sheet'} onClick={() => onTabChange('sheet')} />
    <MenuButton iconPath={SVG_ICONS.domains} label="Домены" active={activeTab === 'domains'} onClick={() => onTabChange('domains')} />
    <MenuButton iconPath={SVG_ICONS.item} label="Инвентарь" active={activeTab === 'inventory'} onClick={() => onTabChange('inventory')} />
    <MenuButton iconPath={SVG_ICONS.journal} label="Дневник" active={activeTab === 'journal'} onClick={() => onTabChange('journal')} />
    
    {gmMode && (
         <MenuButton iconPath={SVG_ICONS.adventure} label="Мастер" active={activeTab === 'gm_adventure'} onClick={() => onTabChange('gm_adventure')} colorClass="bg-stone-100" />
    )}

    {/* Desktop Divider (Hidden on Mobile/Tablet) */}
    <div className="hidden lg:block w-full h-px bg-stone-300 mx-1 lg:my-1 flex-shrink-0"></div>
    
    {/* Tools & Actions (Row 2 on Mobile/Tablet) */}
    <MenuButton iconPath={SVG_ICONS.scan} label="Сканировать QR" onClick={onScan} colorClass="bg-blue-50" />
    <MenuButton iconPath={SVG_ICONS.download} label="Скачать JSON" onClick={onDownload} />
    
    {/* Desktop Divider (Hidden on Mobile/Tablet) */}
    <div className="hidden lg:block w-full h-px bg-stone-300 mx-1 lg:my-1 flex-shrink-0"></div>
    
    {/* GM Mode (End of Row 2 on Mobile/Tablet) */}
    <MenuButton iconPath={SVG_ICONS.gm} label="Режим Мастера" active={gmMode} onClick={onGmToggle} colorClass="bg-red-50" activeClass="bg-red-600 text-white" />
  </div>
);