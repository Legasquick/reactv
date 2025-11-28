import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrPayload } from '../types';
import { encodeQrData, stripDescriptions } from '../qrCodec';
import { SvgIcon } from './UIComponents';
import { SVG_ICONS } from '../constants';

interface QrDisplayModalProps {
  data: QrPayload;
  onClose: () => void;
  onConfirmAction?: (context: any) => void;
}

export const QrDisplayModal: React.FC<QrDisplayModalProps> = ({ data, onClose, onConfirmAction }) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Inject Unique ID (One-time usage)
  const [uniqueData] = useState<QrPayload>(() => ({
      ...data,
      uniqueId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }));
  
  // Timer for rotating chunks on the display canvas
  useEffect(() => {
      let interval: any;
      if (chunks.length > 1) {
          // Adaptive speed
          const speed = chunks.length > 10 ? 300 : chunks.length > 5 ? 500 : 800;
          
          interval = setInterval(() => {
              setCurrentChunkIndex(prev => (prev + 1) % chunks.length);
          }, speed);
      }
      return () => clearInterval(interval);
  }, [chunks]);

  // Initial Encoding
  useEffect(() => {
    const processData = (payload: any, allowStrip: boolean) => {
        try {
            const encodedChunks = encodeQrData(payload);
            
            // Если чанков ОЧЕНЬ много (> 50), пробуем сжать, убрав описания
            if (encodedChunks.length > 50 && allowStrip) {
                 const stripped = JSON.parse(JSON.stringify(payload));
                 if (stripped.payload) stripped.payload = stripDescriptions(stripped.payload);
                 setWarning("Данные слишком велики. Описания удалены для оптимизации.");
                 processData(stripped, false); // Retry once
                 return;
            }
            
            setChunks(encodedChunks);
        } catch (e) {
            console.error("Encoding failed", e);
            setWarning("Ошибка кодирования данных.");
        }
    };

    processData(uniqueData, true);
  }, [uniqueData]);

  // Render Display QR Canvas
  useEffect(() => {
      const el = document.getElementById("qrcode-container");
      if (!el || chunks.length === 0) return;

      const currentData = chunks[currentChunkIndex];
      el.innerHTML = "";
      
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, currentData, { width: 256, margin: 1, errorCorrectionLevel: 'L' }, (err) => {
           if (!err) {
               el.appendChild(canvas);
           }
      });
  }, [chunks, currentChunkIndex]);


  const showActionBtn = !!data.actionContext;
  const isAll = data.actionContext?.actionType === 'clear_inventory';

  // --- Download PNG (Current Frame) ---
  const handleDownloadPng = () => {
      const container = document.getElementById("qrcode-container");
      const canvas = container?.querySelector('canvas');
      if (canvas) {
          const url = canvas.toDataURL("image/png");
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr_code_${data.type}_part${currentChunkIndex+1}.png`;
          a.click();
      }
  };

  // --- Record Video (WebM) for Multi-part ---
  const handleDownloadVideo = async () => {
      if (chunks.length === 0) return;
      setIsRecording(true);

      try {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          // Capture stream at 25 FPS
          const stream = canvas.captureStream(25);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          const chunksData: BlobPart[] = [];

          recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunksData.push(e.data);
          };

          recorder.onstop = () => {
              const blob = new Blob(chunksData, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `qr_code_${data.type}_animated.webm`;
              a.click();
              setIsRecording(false);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
          };

          recorder.start();

          // Adaptive speed: faster rotation if many chunks
          const delay = chunks.length > 10 ? 300 : chunks.length > 5 ? 500 : 800;

          // Loop through all chunks once
          for (const chunk of chunks) {
              await new Promise<void>((resolve) => {
                  QRCode.toCanvas(canvas, chunk, { width: 256, margin: 1, errorCorrectionLevel: 'L' }, () => {
                       // Wait for delay to let it be recorded
                       setTimeout(resolve, delay);
                  });
              });
          }
          
          recorder.stop();

      } catch (e) {
          console.error("Video recording error", e);
          setIsRecording(false);
          alert("Ваш браузер не поддерживает запись видео из Canvas.");
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center w-full">
            <div id="qrcode-container" className="rounded overflow-hidden min-h-[256px] flex items-center justify-center bg-stone-100 transition-all border border-stone-100"></div>
            
            {/* Progress Badge for Multi-part */}
            {chunks.length > 1 && (
                <div className="mt-3 bg-stone-800 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                    Часть {currentChunkIndex + 1} из {chunks.length}
                </div>
            )}
        </div>
        
        {warning && (
            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded border border-amber-200 text-center animate-pulse">
                {warning}
            </div>
        )}
        
        {chunks.length > 1 && !warning && (
            <div className="text-stone-500 text-xs text-center font-bold">
                Сканируйте, удерживая камеру неподвижно. <br/>Данные передаются кадрами.
            </div>
        )}

        <p className="font-header font-bold uppercase text-center max-w-xs">{data.payload.name || (isAll ? "Инвентарь" : "Экспорт")}</p>
        
        <div className="flex flex-col gap-2 w-full">
            {/* Download Buttons */}
            <div className="flex gap-2">
                 <button 
                    onClick={handleDownloadPng}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                    <SvgIcon path={SVG_ICONS.image} size={16} />
                    PNG
                </button>
                
                {chunks.length > 1 && (
                    <button 
                        onClick={handleDownloadVideo}
                        disabled={isRecording}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                        <SvgIcon path={SVG_ICONS.video} size={16} />
                        {isRecording ? 'Запись...' : 'Видео'}
                    </button>
                )}
            </div>

            {showActionBtn && onConfirmAction && (
                <button 
                    onClick={() => onConfirmAction(data.actionContext)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm"
                >
                    {isAll ? 'Я отдал предметы' : 'Я отдал предмет'}
                </button>
            )}
            
            <button onClick={onClose} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2 rounded-lg text-sm">
                {showActionBtn ? 'Я передумал' : 'Закрыть'}
            </button>
        </div>
      </div>
    </div>
  );
};

interface QrScannerModalProps {
  onClose: () => void;
  scanProgress?: { current: number, total: number } | null;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, scanProgress }) => (
  <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-stone-900 p-4 rounded-xl relative">
      <div id="reader" className="bg-black rounded-lg overflow-hidden min-h-[250px]"></div>
      
      {/* Overlay progress for Multipart */}
      {scanProgress && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 bg-black/80 backdrop-blur rounded-xl p-4 flex flex-col items-center justify-center border border-white/20 shadow-2xl z-10">
              <div className="text-white font-header font-bold text-2xl mb-2">{Math.round((scanProgress.current / scanProgress.total) * 100)}%</div>
              <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                  ></div>
              </div>
              <div className="text-stone-400 text-xs font-bold mt-2 uppercase tracking-widest">Загрузка данных...</div>
          </div>
      )}

      <button onClick={onClose} className="w-full mt-4 bg-red-600 text-white py-2 rounded font-bold">Закрыть</button>
    </div>
  </div>
);