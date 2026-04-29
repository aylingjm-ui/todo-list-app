import { List } from './types';

const palette = [
  { color: 'bg-blue-500', icon: '✦' },
  { color: 'bg-emerald-500', icon: '•' },
  { color: 'bg-orange-400', icon: '◦' },
  { color: 'bg-rose-400', icon: '✿' },
  { color: 'bg-violet-500', icon: '◆' },
  { color: 'bg-cyan-500', icon: '✷' },
  { color: 'bg-lime-500', icon: '☘' },
  { color: 'bg-pink-500', icon: '♥' },
];

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
    color: palette[index % palette.length].color,
    icon: palette[index % palette.length].icon,
    tasks: (defaultTasks[name] ?? []).map((text) => ({
      id: createId(),
      text,
    })),
  }));

export const pickListStyle = (index: number) => palette[index % palette.length];
