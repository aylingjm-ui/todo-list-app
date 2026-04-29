import { List } from '../types';

type ListItemRowProps = {
  list: List;
  isLast: boolean;
  onOpen: () => void;
};

export default function ListItemRow({ list, isLast, onOpen }: ListItemRowProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition active:scale-[0.99] ${
        isLast ? '' : 'border-b border-slate-100'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${list.color}`}
      >
        {list.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-slate-900">{list.name}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{list.tasks.length}</span>
        <span className="text-lg text-slate-300">›</span>
      </div>
    </button>
  );
}
