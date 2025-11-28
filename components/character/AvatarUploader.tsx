import React, { useRef } from 'react';
import { SvgIcon } from '../UIComponents';
import { SVG_ICONS } from '../../constants';

interface AvatarUploaderProps {
  image?: string;
  onImageChange: (base64: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Resize to max 500px to save storage space
                const MAX_SIZE = 500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG 70% quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            const resizedBase64 = await resizeImage(file);
            onImageChange(resizedBase64);
        } catch (e) {
            console.error(e);
            alert("Ошибка обработки изображения");
        }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange('');
  };

  return (
    <div className="w-full aspect-square relative group mb-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{display: 'none'}} 
      />
      
      <div 
        onClick={handleClick}
        className={`
          w-full h-full rounded-xl border-2 overflow-hidden cursor-pointer transition-all
          ${image ? 'border-stone-800' : 'border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50'}
          flex items-center justify-center relative
        `}
      >
        {image ? (
            <>
                <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Изменить</span>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center gap-2 text-stone-400">
                <SvgIcon path={SVG_ICONS.image} size={32} />
                <span className="text-xs font-bold uppercase">Загрузить фото</span>
            </div>
        )}
      </div>

      {image && (
          <button 
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-white text-stone-400 hover:text-red-500 rounded-full p-1 shadow border border-stone-200 z-10"
            title="Удалить фото"
          >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
      )}
    </div>
  );
};
