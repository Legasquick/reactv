import { AbilityStyle, AbilityType, AppState } from './types';

// SVG пути для иконок (сохранены оригинальные пути из исходника)
export const SVG_ICONS = {
  qr: '<path d="M3 3h6v6H3z"/><path d="M15 3h6v6h-6z"/><path d="M3 15h6v6H3z"/><path d="M15 15h1v1h-1z"/><path d="M17 15h1v1h-1z"/><path d="M19 15h2v1h-2z"/><path d="M15 17h1v1h-1z"/><path d="M17 17h1v1h-1z"/><path d="M19 17h2v1h-2z"/><path d="M15 21h1v1h-1z"/><path d="M17 21h1v1h-1z"/><path d="M19 21h2v1h-2z"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
  trash: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
  knowledge: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  trait: '<path d="M12 2l9 4.5-3.5 10.5L12 22 4.5 17 1 6.5z"/><circle cx="12" cy="12" r="3"/>',
  mastery: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  skill: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  source: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  technique: '<path d="M12 20.5c-4.6 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5c2.3 0 4.5 1 6 2.5"/><path d="M12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4c1.1 0 2.2.5 3 1.2"/>',
  item: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  char: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  domains: '<path d="M12 2l10 5-10 5-10-5 10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>',
  journal: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
  gm: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
  identity: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/>',
  lock: '<path d="M12 17h.01M10 21h4a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm2-10V7a4 4 0 1 0-8 0v4" />',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />',
  monster: '<path d="M12 2c-4 0-8 3-8 8 0 3 2 5 2 8h12c0-3 2-5 2-8 0-5-4-8-8-8z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M10 16a2 2 0 0 0 4 0"/>',
  adventure: '<path d="M2 22l2.5-10 2.5 10 2.5-10 2.5 10 2.5-10 2.5 10 2.5-10 2.5 10"/><path d="M12 2L2 22"/><path d="M12 2l10 20"/>',
  xp: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  party: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  gif: '<path d="M6 18h12V6H6v12zM21 6v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M10 10l4 2-4 2V10z" />',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'
};

// Стили и метаданные для типов способностей
export const ABILITY_STYLES: Record<AbilityType, AbilityStyle> = {
  knowledge: { label: "Знание", icon: SVG_ICONS.knowledge, color: '#4a4a4a', subColor: '#78716c' },
  trait: { label: "Черта", icon: SVG_ICONS.trait, color: '#064e3b', subColor: '#065f46' },
  mastery: { label: "Мастерство", icon: SVG_ICONS.mastery, color: '#713f12', subColor: '#854d0e' },
  skill: { label: "Навык", icon: SVG_ICONS.skill, color: '#1c1917', subColor: '#44403c' },
  source: { label: "Источник", icon: SVG_ICONS.source, color: '#581c87', subColor: '#6b21a8' },
  technique: { label: "Приём", icon: SVG_ICONS.technique, color: '#be185d', subColor: '#db2777' },
  item: { label: "Предмет", icon: SVG_ICONS.item, color: '#0f172a', subColor: '#334155' },
  monster: { label: "Монстр", icon: SVG_ICONS.monster, color: '#7f1d1d', subColor: '#991b1b' }
};

// Стоимость перехода на уровень (индекс = целевой уровень)
export const DOMAIN_LEVEL_COSTS = [0, 4, 4, 8, 12, 16, 20];

// Стоимость повышения характеристики
export const STAT_COST = 4;

// Начальное состояние приложения
export const DEFAULT_STATE: AppState = {
  tab: 'sheet',
  gmMode: false,
  xp: { total: 0, spent: 0 },
  stats: { physique: 1, attention: 1, movement: 1, thinking: 1, influence: 1, will: 1 },
  trackers: { hp: 6, inspiration: 6 },
  info: { name: '', class: '', race: '', desc: '', avatar: '' },
  background: { character: '', aesthetic: '', feature: '', motivation: '', conflict: '', secret: '', conscious: '', unconscious: '', weakness: '' },
  abilities: [],
  domains: [],
  inventory: [],
  inventoryText: "",
  journal: "",
  adventures: [],
  currentAdventureId: null,
  scannedIds: [] // Track used QR codes
};

// HASHES FOR SECURITY
// "сизамоткройся!" SHA-256
export const APP_LOCK_HASH = "356dd5cc458d39c9854031f7f57663754ce5a3b6eaf01abd7df9aa080c25ed72"; 
// "мастервсегдаправ!" SHA-256
export const GM_LOCK_HASH = "4d695dc1df2188ea3c0f82aef729ae8e11cc683e3e86a1b9e97233c380cd2fbf";
