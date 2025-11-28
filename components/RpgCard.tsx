import React, { memo, useRef, useLayoutEffect } from 'react';
import { StableInput, SvgIcon } from './UIComponents';
import { AbilityStyle, AbilityType, BaseEntity } from '../types';
import { ABILITY_STYLES, SVG_ICONS } from '../constants';

interface RpgCardProps {
  data: BaseEntity & { type: string; level?: number; purchased?: boolean };
  styleData: AbilityStyle;
  isLocked: boolean;
  isPurchased?: boolean;
  onBuy: () => void;
  onEdit: (field: string, value: string) => void;
  onDelete: () => void;
  canQR: (type: string, data: any) => void;
  qrType: 'item' | 'ability';
  gmMode: boolean;
  mode: 'domain' | 'inventory';
}

// Компонент игровой карточки
export const RpgCard = memo(({ data, styleData, isLocked, isPurchased, onBuy, onEdit, onDelete, canQR, qrType, gmMode, mode }: RpgCardProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLElement>(null);

  // Допустимые типы для селекта в режиме редактирования
  const allowedTypes = mode === 'inventory' 
    ? ['item'] 
    : Object.keys(ABILITY_STYLES).filter(k => k !== 'item');

  // Логика уменьшения шрифта
  const performResize = (element: HTMLElement | null, isTitle: boolean) => {
      if (!element) return;
      
      const maxFontSize = isTitle ? 16 : 9; // Исходные размеры из CSS
      const minFontSize = isTitle ? 10 : 7;
      
      // Сброс на максимум перед измерением
      element.style.fontSize = `${maxFontSize}px`;

      const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight || '1.2');
      // Целевая высота: 2 строки для заголовка, ~2 для подзаголовка
      const targetMaxHeight = (lineHeight * 2) + 2; 

      const checkForOverflow = () => {
         // Проверка: текст не влезает по ширине (одно длинное слово) или по высоте (много строк)
         return (element.scrollWidth > element.clientWidth) || (element.scrollHeight > targetMaxHeight);
      };

      let currentSize = maxFontSize;
      while (checkForOverflow() && currentSize > minFontSize) {
        currentSize--;
        element.style.fontSize = `${currentSize}px`;
      }
  };

  useLayoutEffect(() => {
    if (titleRef.current) {
        // Если элемент не в фокусе (мы не печатаем прямо сейчас), обновляем текст из пропсов
        if (document.activeElement !== titleRef.current) {
            titleRef.current.innerText = data.name;
        }
        performResize(titleRef.current, true);
    }
    
    // Для подзаголовка (если он не select)
    if (subtitleRef.current) {
        performResize(subtitleRef.current, false);
    }
  }, [data.name, styleData.label, gmMode]);

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
      performResize(e.currentTarget, true);
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const text = e.currentTarget.innerText;
      if (text !== data.name) {
          onEdit('name', text);
      }
  };

  // --- Logic for displaying Stats (AP / Insp) ---
  const typeKey = data.type as AbilityType;
  const showAP = typeKey === 'technique';
  const showInsp = typeKey === 'mastery' || typeKey === 'technique';
  const hasStats = showAP || showInsp;

  return (
    <div 
         onClick={onBuy}
         className={`rpg-card w-[220px] shrink-0 cursor-pointer relative ${isPurchased ? 'purchased' : ''} ${isLocked && !gmMode ? 'locked' : ''}`}
    >
        {/* Шапка карточки */}
        <div className="card-header" style={{backgroundColor: styleData.color, borderColor: '#1c1917'}}>
            {/* 
                Используем contentEditable div вместо input для поддержки переноса строк 
                и динамического изменения размера шрифта при вводе 
            */}
            <div 
                ref={titleRef}
                className={`card-title outline-none min-w-[50px] ${gmMode ? 'cursor-text border-b border-white/30 hover:bg-white/10' : ''}`}
                contentEditable={gmMode}
                onInput={handleTitleInput}
                onBlur={handleTitleBlur}
                suppressContentEditableWarning={true}
                spellCheck={false}
            >
                {data.name}
            </div>
            
            <div className="card-icon">
               <SvgIcon path={styleData.icon} size={18} />
            </div>
        </div>

        {/* Подзаголовок (Тип и QR) */}
        <div className="card-subtitle flex justify-between items-center" style={{backgroundColor: styleData.subColor, borderColor: '#1c1917'}}>
            {gmMode && mode !== 'inventory' ? (
                <select 
                  className="bg-transparent text-white w-24 text-[9px] border border-white/30 rounded" 
                  value={data.type} 
                  onClick={e=>e.stopPropagation()} 
                  onChange={e=>onEdit('type', e.target.value)}
                >
                    {allowedTypes.map(k => <option key={k} value={k} className="text-black">{ABILITY_STYLES[k as AbilityType].label}</option>)}
                </select>
            ) : (
                <span ref={subtitleRef}>{styleData.label}</span>
            )}
            
            {/* Кнопка QR (видна GM или если куплено) */}
            {(gmMode || isPurchased) && (
                <button onClick={(e) => { e.stopPropagation(); canQR(qrType, data); }} className="ml-auto text-white/80 hover:text-white" title="QR Код">
                    <SvgIcon path={SVG_ICONS.qr} size={14} />
                </button>
            )}
        </div>
        
        {/* Стоимость (ОД/Вдх) - Показываем только если тип подразумевает это */}
        {hasStats && (
            <div className="bg-stone-100 text-[9px] px-2 py-1 flex justify-between items-center text-stone-600 border-b border-stone-200">
                {showAP && (
                    <div className="flex items-center gap-1">
                        <span>ОД:</span>
                        {gmMode ? (
                            <StableInput 
                                className="w-6 std-input text-[9px] text-center p-0" 
                                placeholder="-" 
                                value={data.apCost || ''} 
                                onCommit={(v)=>onEdit('apCost', v)} 
                            />
                        ) : (
                            <span>{data.apCost || '-'}</span>
                        )}
                    </div>
                )}
                
                {showInsp && (
                    <div className="flex items-center gap-1 ml-auto">
                        <span>Вдх:</span>
                        {gmMode ? (
                            <StableInput 
                                className="w-6 std-input text-[9px] text-center p-0" 
                                placeholder="-" 
                                value={data.inspCost || ''} 
                                onCommit={(v)=>onEdit('inspCost', v)} 
                            />
                        ) : (
                            <span>{data.inspCost || '-'}</span>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Контент карточки */}
        <div className="card-content">
            {gmMode ? (
                // Режим редактирования (GM)
                <>
                    <StableInput 
                        isTextarea 
                        className="w-full text-[10px] bg-white p-1 std-input min-h-[100px]" 
                        value={data.description} 
                        onCommit={(v)=>onEdit('description', v)} 
                    />
                    
                    {/* Кнопка удаления в GM режиме */}
                    <div className="flex justify-end mt-2 pt-2 border-t border-stone-100">
                        <button className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded border border-red-200" onClick={(e) => {e.stopPropagation(); onDelete();}} title="Удалить">
                            <SvgIcon path={SVG_ICONS.trash} size={16} />
                        </button>
                    </div>
                </>
            ) : (
                // Режим просмотра (Игрок)
                <div className="whitespace-pre-wrap flex-1">{data.description}</div>
            )}

            {/* Кнопка удаления для ИГРОКОВ в инвентаре (выбросить предмет) */}
            {!gmMode && mode === 'inventory' && (
                 <div className="mt-auto pt-2 flex justify-end border-t border-stone-100">
                     <button className="text-stone-400 hover:text-red-500 p-1" onClick={(e) => {e.stopPropagation(); onDelete();}} title="Выбросить">
                          <SvgIcon path={SVG_ICONS.trash} size={14} />
                      </button>
                 </div>
            )}
            
            {/* Цена покупки способности (если не куплено и не инвентарь) */}
            {!gmMode && !isPurchased && !isLocked && mode !== 'inventory' && data.level !== undefined && (
                <div className="mt-auto pt-2 text-center text-xs font-bold text-stone-400 uppercase border-t border-stone-100">
                    Купить: {data.level === 0 ? '-' : (data.level === 1 ? 2 : data.level === 2 ? 4 : data.level === 3 ? 8 : data.level === 4 ? 14 : data.level === 5 ? 22 : 32)} XP
                </div>
            )}
        </div>
    </div>
  );
});