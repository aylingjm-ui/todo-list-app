import { List } from './types';

export const LIST_COLOR_OPTIONS = [
  { key: 'sky', badgeClass: 'bg-sky-500', softClass: 'bg-sky-50', textClass: 'text-sky-700', hex: '#38bdf8' },
  { key: 'emerald', badgeClass: 'bg-emerald-500', softClass: 'bg-emerald-50', textClass: 'text-emerald-700', hex: '#10b981' },
  { key: 'amber', badgeClass: 'bg-amber-400', softClass: 'bg-amber-50', textClass: 'text-amber-700', hex: '#f59e0b' },
  { key: 'rose', badgeClass: 'bg-rose-400', softClass: 'bg-rose-50', textClass: 'text-rose-700', hex: '#fb7185' },
  { key: 'violet', badgeClass: 'bg-violet-500', softClass: 'bg-violet-50', textClass: 'text-violet-700', hex: '#8b5cf6' },
  { key: 'cyan', badgeClass: 'bg-cyan-500', softClass: 'bg-cyan-50', textClass: 'text-cyan-700', hex: '#06b6d4' },
  { key: 'lime', badgeClass: 'bg-lime-500', softClass: 'bg-lime-50', textClass: 'text-lime-700', hex: '#84cc16' },
  { key: 'pink', badgeClass: 'bg-pink-500', softClass: 'bg-pink-50', textClass: 'text-pink-700', hex: '#ec4899' },
] as const;

export const LIST_ICON_OPTIONS = ['✦', '•', '◦', '✿', '◆', '✷', '☘', '♥', '★', '✓', '☼', '✎'] as const;

const legacyColorMap: Record<string, string> = {
  'bg-blue-500': 'sky',
  'bg-emerald-500': 'emerald',
  'bg-orange-400': 'amber',
  'bg-rose-400': 'rose',
  'bg-violet-500': 'violet',
  'bg-cyan-500': 'cyan',
  'bg-lime-500': 'lime',
  'bg-pink-500': 'pink',
};

const defaultListNames = [
  'Reminders',
  'Groceries',
  'Family',
  'Work',
  'Camping Trip',
  'Book Club',
  'Gardening',
  'Plants to get',
] as const;

const defaultTasks: Record<string, string[]> = {
  Reminders: ['Send rent transfer', 'Book dentist appointment'],
  Groceries: ['Avocados', 'Sparkling water', 'Pasta'],
  Family: ['Call Mum on Sunday'],
  Work: ['Review sprint notes', 'Plan next standup'],
  'Camping Trip': ['Check tent pegs', 'Buy trail snacks'],
  'Book Club': ['Pick April discussion book'],
  Gardening: ['Trim herbs', 'Water front planters'],
  'Plants to get': ['Snake plant', 'Rosemary'],
};

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export const createDefaultLists = (): List[] =>
  defaultListNames.map((name, index) => ({
    id: createId(),
    name,
    color: LIST_COLOR_OPTIONS[index % LIST_COLOR_OPTIONS.length].key,
    icon: LIST_ICON_OPTIONS[index % LIST_ICON_OPTIONS.length],
    tasks: (defaultTasks[name] ?? []).map((text) => ({
      id: createId(),
      text,
    })),
  }));

export const pickListStyle = (index: number) => ({
  color: LIST_COLOR_OPTIONS[index % LIST_COLOR_OPTIONS.length].key,
  icon: LIST_ICON_OPTIONS[index % LIST_ICON_OPTIONS.length],
});

export const getListColorOption = (colorKey: string) =>
  LIST_COLOR_OPTIONS.find((option) => option.key === colorKey) ?? LIST_COLOR_OPTIONS[0];

export const getListIconOption = (icon: string) =>
  LIST_ICON_OPTIONS.find((option) => option === icon) ?? LIST_ICON_OPTIONS[0];

export const normalizeLists = (value: unknown): List[] => {
  if (!Array.isArray(value)) {
    return createDefaultLists();
  }

  const lists = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as Partial<List>;
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || !Array.isArray(candidate.tasks)) {
        return null;
      }

      const normalizedColor =
        typeof candidate.color === 'string'
          ? legacyColorMap[candidate.color] ?? candidate.color
          : LIST_COLOR_OPTIONS[0].key;
      const color = getListColorOption(normalizedColor).key;
      const icon = getListIconOption(typeof candidate.icon === 'string' ? candidate.icon : '').toString();

      const list: List = {
        id: candidate.id,
        name: candidate.name,
        color,
        icon,
        tasks: candidate.tasks
          .map((task) =>
            task && typeof task === 'object' && typeof task.id === 'string' && typeof task.text === 'string'
              ? { id: task.id, text: task.text }
              : null,
          )
          .filter((task): task is List['tasks'][number] => task !== null),
      };

      return list;
    })
    .filter((list): list is List => list !== null);

  return lists.length > 0 ? lists : createDefaultLists();
};
