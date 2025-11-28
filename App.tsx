import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { decodeQrData, assembleChunks } from './qrCodec';

import { AppState, QrPayload } from './types';
import { DEFAULT_STATE, ABILITY_STYLES, APP_LOCK_HASH, GM_LOCK_HASH } from './constants';
import { CharacterSheetPage1, CharacterSheetPage2 } from './components/CharacterSheet';
import { InventoryTab } from './components/tabs/InventoryTab';
import { DomainsTab } from './components/tabs/DomainsTab';
import { JournalTab } from './components/tabs/JournalTab';
import { GMTab } from './components/tabs/GMTab';
import { Menu } from './components/Menu';
import { QrDisplayModal, QrScannerModal } from './components/QrModals';
import { NotificationOverlay, NotificationData } from './components/NotificationOverlay';
import { LoginScreen } from './components/LoginScreen';
import { GMPasswordModal } from './components/modals/GMPasswordModal';

export default function App() {
  // --- Состояние ---
  const loadState = (): AppState => { 
    try { 
        const saved = localStorage.getItem('vitruviy_stable_data');
        return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE; 
    } catch { return DEFAULT_STATE; } 
  };

  const [state, setState] = useState<AppState>(loadState);
  const [qrData, setQrData] = useState<QrPayload | null>(null); 
  const [showScanner, setShowScanner] = useState(false); 
  const [notification, setNotification] = useState<NotificationData | null>(null);
  
  // Security States
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [showGmLoginModal, setShowGmLoginModal] = useState(false);
  
  // Multipart Scan Buffer: { [transferId]: { total: number, chunks: { [index]: string } } }
  const scanBuffer = useRef<Record<string, { total: number, chunks: (string | null)[], receivedCount: number }>>({});
  const [scanProgress, setScanProgress] = useState<{current: number, total: number} | null>(null);
  
  // Автосохранение
  useEffect(() => { localStorage.setItem('vitruviy_stable_data', JSON.stringify(state)); }, [state]);

  // Check Local Storage Auth on Mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('vitruviy_auth');
    if (savedAuth === APP_LOCK_HASH) {
        setIsAppUnlocked(true);
    }
  }, []);

  // Security Logic
  const checkPassword = async (input: string, hash: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === hash;
  };

  const unlockApp = async (pass: string) => {
      const valid = await checkPassword(pass, APP_LOCK_HASH);
      if (valid) {
          setIsAppUnlocked(true);
          localStorage.setItem('vitruviy_auth', APP_LOCK_HASH);
      }
      return valid;
  };

  const toggleGmModeSecure = () => {
      const savedGmAuth = localStorage.getItem('vitruviy_gm_auth');
      
      if (savedGmAuth === GM_LOCK_HASH) {
          // If already auth'd in this browser session, just toggle
          updateState('gmMode', !state.gmMode);
      } else {
          if (state.gmMode) {
              updateState('gmMode', false);
          } else {
              setShowGmLoginModal(true);
          }
      }
  };

  const unlockGmMode = async (pass: string) => {
      const valid = await checkPassword(pass, GM_LOCK_HASH);
      if (valid) {
          localStorage.setItem('vitruviy_gm_auth', GM_LOCK_HASH);
          updateState('gmMode', true);
      }
      return valid;
  };

  // --- Хелпер обновления глубокого стейта ---
  const updateState = useCallback((path: string, value: any) => {
    setState(prev => {
      const next = { ...prev };
      let curr: any = next;
      const keys = path.split('.');
      keys.slice(0, -1).forEach(k => curr = curr[k]);
      curr[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const finishScanning = (data: any) => {
      handleScannedData(data);
      setShowScanner(false);
      setScanProgress(null);
      // The scanner will be stopped by useEffect cleanup when showScanner becomes false
  };

  // --- QR СКАНЕР LOGIC ---
  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    let isMounted = true;

    // Reset buffer on open
    scanBuffer.current = {}; 
    setScanProgress(null);

    if (showScanner) {
        const timer = setTimeout(() => {
            const html5QrCode = new Html5Qrcode("reader");
            scanner = html5QrCode;

            html5QrCode.start({ facingMode: "environment" }, { fps: 15, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (!isMounted) return;

                    try {
                        const result = decodeQrData(decodedText);
                        
                        if (result.status === 'error') {
                            // Silent fail for noise
                            return;
                        }

                        if (result.status === 'partial') {
                            // Обработка частичного QR (Чанка)
                            const { id, index, total, chunkData } = result;
                            
                            if (!scanBuffer.current[id]) {
                                scanBuffer.current[id] = { total, chunks: new Array(total).fill(null), receivedCount: 0 };
                            }
                            
                            const buffer = scanBuffer.current[id];
                            
                            // Если этого чанка еще нет, сохраняем
                            if (buffer.chunks[index] === null) {
                                buffer.chunks[index] = chunkData;
                                buffer.receivedCount++;
                                
                                // Update UI progress
                                setScanProgress({ current: buffer.receivedCount, total: buffer.total });

                                // Check if complete
                                if (buffer.receivedCount === buffer.total) {
                                    // Assemble
                                    const assembledResult = assembleChunks(buffer.chunks);
                                    if (assembledResult.status === 'complete') {
                                        finishScanning(assembledResult.data);
                                    } else {
                                        setNotification({ type: 'xp', title: "Ошибка", subtitle: "Сбой сборки данных", amount: 0 });
                                        setScanProgress(null);
                                        delete scanBuffer.current[id];
                                    }
                                }
                            }
                            // Если чанк уже есть, ничего не делаем, продолжаем сканировать
                            return; 
                        }

                        if (result.status === 'complete') {
                             finishScanning(result.data);
                        }

                    } catch(e) { 
                        console.error(e);
                    }
                }, 
                () => {} 
            ).catch(err => {
                console.error("Scanner start failed", err);
                if(isMounted) setShowScanner(false);
            });
        }, 50);

        return () => {
             clearTimeout(timer);
             isMounted = false;
             if(scanner) {
                 // Use a flag or check strict mode to avoid double-stop issues if react strict mode is on
                 scanner.stop().then(() => scanner?.clear()).catch(() => {});
             }
        };
    }
  }, [showScanner]);

  const handleScannedData = (data: QrPayload) => {
      if(!data || !data.type) return;

      // Check unique ID for one-time use
      if (data.uniqueId) {
          if (state.scannedIds && state.scannedIds.includes(data.uniqueId)) {
               setNotification({ type: 'error', title: 'Ошибка', subtitle: 'Этот QR код уже был использован.' });
               return;
          }
          // Add to used list
          setState(prev => ({
              ...prev,
              scannedIds: [...(prev.scannedIds || []), data.uniqueId!]
          }));
      }
      
      if (data.type === 'xp') {
          // Обработка получения опыта
          const amount = data.payload.amount;
          if (typeof amount === 'number') {
              setState(prev => ({
                  ...prev,
                  xp: { ...prev.xp, total: prev.xp.total + amount },
                  tab: 'sheet' // Switch to sheet to see XP
              }));
              setNotification({ type: 'xp', title: 'Опыт получен', amount });
          }
      } else if (data.type === 'domain') {
          // ID удален при сжатии, генерируем новый здесь для Домена и ВСЕХ Способностей
          const timestamp = Date.now();
          const newDomain = {
              ...data.payload, 
              id: timestamp,
              level: 0,
              abilities: Array.isArray(data.payload.abilities) 
                  ? data.payload.abilities.map((a: any, idx: number) => ({
                      ...a, 
                      id: timestamp + idx + Math.random(), // IMPORTANT: Generate new unique ID for ability
                      purchased: false
                    })) 
                  : []
          };
          
          setState(prev => ({
              ...prev, 
              domains: [...prev.domains, newDomain],
              tab: 'domains' // Switch to domains
          }));
          setNotification({ type: 'domain', title: newDomain.name, subtitle: 'Новый домен добавлен' });
      } else if (data.type === 'inventory') {
           const newItems = data.payload.map((i: any) => ({...i, id: Date.now() + Math.random()}));
           setState(prev => ({
               ...prev, 
               inventory: [...prev.inventory, ...newItems],
               tab: 'inventory' // Switch to inventory
           }));
           setNotification({ type: 'item', title: 'Груз получен', subtitle: `Добавлено ${newItems.length} предметов` });
      } else if (data.type === 'item') {
          setState(prev => ({
              ...prev, 
              inventory: [...prev.inventory, {...data.payload, id: Date.now()}],
              tab: 'inventory' // Switch to inventory
           }));
           setNotification({ type: 'item', title: data.payload.name, subtitle: 'Предмет добавлен' });
      } else if (data.type === 'ability') {
           const typeLabel = ABILITY_STYLES[data.payload.type as keyof typeof ABILITY_STYLES]?.label || "Способность";
           setState(prev => ({
               ...prev, 
               abilities: [...prev.abilities, `[${typeLabel}] ${data.payload.name}: ${data.payload.description}`],
               tab: 'sheet' // Switch to sheet to see ability list
           }));
           setNotification({ type: 'ability', title: data.payload.name, subtitle: typeLabel });
      }
  };

  const handleQR = (type: string, payload: any, actionContext?: any) => {
      setQrData({
          type: type as any, 
          payload,
          actionContext
      });
  };

  const handleQrAction = (context: any) => {
      if (context?.actionType === 'delete_item' && context.id) {
          // Find item name for notification
          const item = state.inventory.find(i => i.id === context.id);
          if (item) {
              setNotification({ type: 'item-sent', title: item.name });
          }
          setState(prev => ({...prev, inventory: prev.inventory.filter(i => i.id !== context.id)}));
      } else if (context?.actionType === 'clear_inventory') {
          setNotification({ type: 'item-sent', title: "Весь инвентарь" });
          setState(prev => ({...prev, inventory: []}));
      }
      setQrData(null);
  };

  // --- Lock Screen ---
  if (!isAppUnlocked) {
      return <LoginScreen onUnlock={unlockApp} />;
  }

  // --- Рендер ---
  const containerClass = `w-full lg:max-w-6xl transition-all`;

  return (
    <div className="min-h-screen py-4 flex flex-col items-center relative">
       
       <NotificationOverlay data={notification} onClose={() => setNotification(null)} />
       
       {showGmLoginModal && (
          <GMPasswordModal 
            onUnlock={unlockGmMode} 
            onClose={() => setShowGmLoginModal(false)} 
          />
       )}

       {qrData && <QrDisplayModal data={qrData} onClose={() => setQrData(null)} onConfirmAction={handleQrAction} />}
       {showScanner && <QrScannerModal onClose={() => setShowScanner(false)} scanProgress={scanProgress} />}

       <Menu 
          activeTab={state.tab}
          gmMode={state.gmMode}
          onTabChange={(tab) => updateState('tab', tab)}
          onGmToggle={toggleGmModeSecure}
          onScan={() => setShowScanner(true)}
          onDownload={() => {const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const l=document.createElement('a');l.href=URL.createObjectURL(blob);l.download='char.json';l.click();}}
       />

       {/* --- КОНТЕНТ --- */}
       <div className={`${containerClass} ${state.tab === 'sheet' ? 'block' : 'hidden'}`}>
          <CharacterSheetPage1 state={state} updateState={updateState} />
          <CharacterSheetPage2 state={state} updateState={updateState} />
       </div>

       <div className={`${containerClass} ${state.tab === 'domains' ? 'block' : 'hidden'} bg-stone-50 shadow-2xl p-4 md:p-12 min-h-[80vh] rounded-none md:rounded-lg`}>
          <DomainsTab state={state} setState={setState} updateState={updateState} handleQR={handleQR} />
       </div>

       <div className={`${containerClass} ${state.tab === 'inventory' ? 'block' : 'hidden'} bg-white shadow-2xl p-4 md:p-12 min-h-[80vh] rounded-none md:rounded-lg`}>
          <InventoryTab state={state} setState={setState} updateState={updateState} handleQR={handleQR} />
       </div>

       <div className={`${containerClass} ${state.tab === 'journal' ? 'block' : 'hidden'} bg-stone-50 shadow-2xl p-4 md:p-12 min-h-[80vh] rounded-none md:rounded-lg`}>
          <JournalTab state={state} updateState={updateState} />
       </div>

       {state.gmMode && (
           <div className={`${containerClass} ${state.tab === 'gm_adventure' ? 'block' : 'hidden'} bg-stone-100 shadow-2xl p-4 md:p-12 min-h-[80vh] rounded-none md:rounded-lg`}>
               <GMTab state={state} updateState={updateState} setState={setState} handleQR={handleQR} />
           </div>
       )}

    </div>
  );
}