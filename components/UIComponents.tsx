import React, { useState, useEffect, memo, useRef, useLayoutEffect } from 'react';

// --- Компонент иконки SVG ---
interface SvgIconProps {
  path: string;
  size?: number;
  className?: string;
}

export const SvgIcon: React.FC<SvgIconProps> = ({ path, size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    dangerouslySetInnerHTML={{__html: path}} 
  />
);

// --- Стабильное поле ввода ---
interface StableInputProps {
  value: string | number;
  onCommit: (val: string) => void;
  className?: string;
  placeholder?: string;
  isTextarea?: boolean;
}

export const StableInput = memo(({ value, onCommit, className, placeholder, isTextarea = false }: StableInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => { setLocalValue(value); }, [value]);

  // Auto-resize logic for textarea
  useLayoutEffect(() => {
    if (isTextarea && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [localValue, isTextarea]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalValue(e.target.value);
  const handleBlur = () => { if (localValue !== value) onCommit(String(localValue)); };

  if (isTextarea) {
       return <textarea ref={textareaRef} value={localValue} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} className={`resize-none overflow-hidden ${className}`} />;
  }
  return <input type="text" value={localValue} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} className={className} />;
});

// --- Автоматически растущее текстовое поле ---
interface AutoGrowTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}

export const AutoGrowTextarea = memo(({ value, onChange, placeholder, className, minRows = 1 }: AutoGrowTextareaProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  
  return <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder} rows={minRows} className={`resize-none overflow-hidden ${className}`} />;
});

// --- Кнопка меню с тултипом ---
interface MenuButtonProps {
  onClick: () => void;
  iconPath: string;
  label: string;
  active?: boolean;
  colorClass?: string;
  activeClass?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick, iconPath, label, active, colorClass = "bg-white", activeClass = "bg-stone-800 text-white" }) => (
  <button onClick={onClick} className={`p-3 flex justify-center items-center rounded-xl shadow-md transition-all active:scale-95 group relative border border-stone-200 ${active ? activeClass : colorClass + " text-stone-600 hover:text-stone-900"}`}>
      <SvgIcon path={iconPath} size={20} />
      <span className="hidden lg:block absolute right-full mr-4 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-[100] transition-opacity duration-200 border border-stone-700">
          {label}
          <span className="absolute top-1/2 right-[-4px] -mt-1 border-4 border-transparent border-l-stone-900"></span>
      </span>
  </button>
);

// --- Блок характеристики (стата) ---
interface StatBlockProps {
  label: string;
  val: number;
  onInc: () => void;
  onDec: () => void;
}

export const StatBlock: React.FC<StatBlockProps> = ({ label, val, onInc, onDec }) => (
  <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-lg border border-stone-200 h-24">
     <span className="text-[10px] uppercase font-bold text-stone-500 mb-1">{label}</span>
     <div className="flex items-center gap-3">
       {val > 1 && (
         <button onClick={onDec} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-red-100 text-stone-600 hover:text-red-600 flex items-center justify-center transition-colors shadow-sm">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
       )}
       {val <= 1 && <div className="w-8 h-8"></div>} {/* Spacer */}
       
       <div className="text-4xl font-header font-bold text-stone-800 w-8 text-center">{val}</div>
       
       {val < 6 && (
         <button onClick={onInc} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-emerald-100 text-stone-600 hover:text-emerald-600 flex items-center justify-center transition-colors shadow-sm">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
       )}
       {val >= 6 && <div className="w-8 h-8"></div>} {/* Spacer */}
     </div>
  </div>
);