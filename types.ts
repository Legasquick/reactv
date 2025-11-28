

// Типы для системы способностей и предметов
export type AbilityType = 'knowledge' | 'trait' | 'mastery' | 'skill' | 'source' | 'technique' | 'item' | 'monster';

// Интерфейс стиля способности (цвет, иконка)
export interface AbilityStyle {
  label: string;
  icon: string;
  color: string;
  subColor: string;
}

// Базовый интерфейс для сущности с ID (способность, предмет)
export interface BaseEntity {
  id: number;
  name: string;
  description: string;
  apCost?: string; // Стоимость в Очках Действия
  inspCost?: string; // Стоимость во Вдохновении
}

// Способность в домене
export interface Ability extends BaseEntity {
  type: AbilityType;
  level: number;
  purchased: boolean;
}

// Домен (группа способностей)
export interface Domain {
  id: number;
  name: string;
  description: string;
  level: number;
  abilities: Ability[];
  assignedTo?: number | null; // ID участника партии или null (общий пул)
}

// Предмет инвентаря
export interface InventoryItem extends BaseEntity {
  type: 'item';
}

// Монстр
export interface Monster extends BaseEntity {
  type: 'monster';
}

// Участник партии (для трекера)
export interface PartyMember {
  id: number;
  name: string;
  level: number;
  isUnlocked?: boolean; // deprecated logic, kept for structure
}

// Приключение (ГМ)
export interface Adventure {
  id: number;
  name: string;
  domains: Domain[];
  items: InventoryItem[];
  monsters: Monster[];
  notes: string;
  party: PartyMember[];
}

// Глобальное состояние приложения
export interface AppState {
  tab: 'sheet' | 'domains' | 'inventory' | 'journal' | 'gm_adventure';
  gmMode: boolean; // Режим Мастера (редактирование всего)
  xp: {
    total: number;
    spent: number;
  };
  stats: {
    physique: number;
    attention: number;
    movement: number;
    thinking: number;
    influence: number;
    will: number;
  };
  trackers: {
    hp: number;
    inspiration: number;
  };
  info: {
    name: string;
    class: string;
    race: string;
    desc: string;
    avatar?: string; // Base64 image
  };
  background: {
    character: string;
    aesthetic: string;
    feature: string;
    motivation: string;
    conflict: string;
    secret: string;
    conscious: string;
    unconscious: string;
    weakness: string;
  };
  abilities: string[]; // Текстовый список купленных способностей для листа
  domains: Domain[];
  inventory: InventoryItem[];
  inventoryText: string;
  journal: string;
  
  // GM Section
  adventures: Adventure[];
  currentAdventureId: number | null;
  
  // Security & History
  scannedIds: string[]; // List of unique IDs of scanned QR codes to prevent reuse
}

// Данные для QR кода
export interface QrPayload {
  type: 'domain' | 'inventory' | 'item' | 'ability' | 'xp';
  payload: any;
  uniqueId?: string; // Unique identifier for one-time use
  actionContext?: {
    id?: number;
    actionType: 'delete_item' | 'clear_inventory';
  };
}