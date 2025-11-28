
import LZString from 'lz-string';

// Константы для чанкинга
const CHUNK_SIZE = 380; 
const CHUNK_PREFIX = 'VIT^';

/**
 * Рекурсивно удаляет поле 'id' из объекта, оставляя остальные данные нетронутыми.
 * Это предотвращает конфликты ID при импорте.
 */
const stripIds = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(stripIds);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key === 'id') continue; // Удаляем ID
      newObj[key] = stripIds(obj[key]);
    }
    return newObj;
  }
  return obj;
};

/**
 * Кодирует данные. 
 * 1. Удаляет ID
 * 2. Превращает в JSON
 * 3. Сжимает LZString
 * 4. Разбивает на чанки, если нужно
 */
export const encodeQrData = (data: any): string[] => {
  try {
    // Очищаем от ID, но не сокращаем ключи
    const cleanData = stripIds(data);
    
    const json = JSON.stringify(cleanData);
    const compressed = LZString.compressToBase64(json);

    if (compressed.length <= CHUNK_SIZE) {
        return [compressed];
    }

    // Разбиваем на части
    const chunks: string[] = [];
    const totalLength = compressed.length;
    const transferId = Math.floor(Math.random() * 10000).toString(36); // Short ID for this transfer session
    const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalLength);
        const chunkData = compressed.substring(start, end);
        // Format: VIT^ID^INDEX^TOTAL^DATA
        const chunk = `${CHUNK_PREFIX}${transferId}^${i}^${totalChunks}^${chunkData}`;
        chunks.push(chunk);
    }

    return chunks;
  } catch (e) {
    console.error("QR Encode Error", e);
    return [];
  }
};

/**
 * Декодирует строку. 
 * Возвращает:
 * { status: 'complete', data: any } - если это обычный QR или завершенный чанк
 * { status: 'partial', id: string, index: number, total: number, data: string } - если это кусок
 * { status: 'error' }
 */
export const decodeQrData = (str: string): any => {
  try {
    // Проверяем, является ли это чанком
    if (str.startsWith(CHUNK_PREFIX)) {
        const parts = str.split('^');
        // VIT^ID^INDEX^TOTAL^DATA
        if (parts.length >= 5) {
            return {
                status: 'partial',
                id: parts[1],
                index: parseInt(parts[2]),
                total: parseInt(parts[3]),
                chunkData: parts.slice(4).join('^') // Join back in case data had ^
            };
        }
    }

    // Обычная обработка (single QR)
    const decompressed = LZString.decompressFromBase64(str);
    if (!decompressed) {
         // Попытка распарсить как raw JSON (если не сжато LZ - обратная совместимость)
        try {
            return { status: 'complete', data: JSON.parse(str) };
        } catch {
            throw new Error("LZ fail");
        }
    }
    
    const json = JSON.parse(decompressed);
    return { status: 'complete', data: json };
  } catch (e) {
      return { status: 'error' };
  }
};

/**
 * Собирает чанки в единый объект
 */
export const assembleChunks = (chunks: (string | null)[]): any => {
    try {
        const fullString = chunks.join('');
        return decodeQrData(fullString);
    } catch (e) {
        return { status: 'error' };
    }
};

/**
 * Removes descriptions from data to reduce size (Fallback utility)
 */
export const stripDescriptions = (data: any): any => {
   if (Array.isArray(data)) return data.map(stripDescriptions);
   if (data !== null && typeof data === 'object') {
       const newObj: any = {};
       for (const k in data) {
           if (k === 'description') continue;
           newObj[k] = stripDescriptions(data[k]);
       }
       return newObj;
   }
   return data;
};
