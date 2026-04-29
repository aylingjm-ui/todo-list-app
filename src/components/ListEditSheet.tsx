import { useEffect, useState } from 'react';
import { List } from '../types';
import { getListColorOption, getListIconOption, LIST_COLOR_OPTIONS, LIST_ICON_OPTIONS } from '../utils';

type ListEditSheetProps = {
  open: boolean;
  list: List;
  onClose: () => void;
  onSave: (updates: Pick<List, 'name' | 'color' | 'icon'>) => void;
  onDelete: () => void;
};

export default function ListEditSheet({ open, list, onClose, onSave, onDelete }: ListEditSheetProps) {
  const [draftName, setDraftName] = useState(list.name);
  const [draftColor, setDraftColor] = useState(list.color);
  const [draftIcon, setDraftIcon] = useState(list.icon);

  useEffect(() => {
    setDraftName(list.name);
    setDraftColor(getListColorOption(list.color).key);
    setDraftIcon(getListIconOption(list.icon).toString());
  }, [list]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-slate-900/25">
      <button type="button" aria-label="Close list editor" onClick={onClose} className="absolute inset-0" />
      <div className="relative z-10 w-full rounded-t-[32px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 shadow-2xl">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Edit List</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a name, color, and icon.</p>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-900 focus:border-sky-300 focus:bg-white focus:outline-none"
          />
        </label>

        <div className="mb-5">
          <span className="mb-3 block text-sm font-medium text-slate-600">Color</span>
          <div className="grid grid-cols-4 gap-3">
            {LIST_COLOR_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setDraftColor(option.key)}
                className={`flex h-12 items-center justify-center rounded-2xl ${option.softClass} ${
                  draftColor === option.key ? 'ring-2 ring-slate-900/10' : ''
                }`}
              >
                <span className={`h-6 w-6 rounded-full ${option.badgeClass}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-3 block text-sm font-medium text-slate-600">Icon</span>
          <div className="grid grid-cols-6 gap-3">
            {LIST_ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setDraftIcon(icon)}
                className={`flex h-12 items-center justify-center rounded-2xl border text-lg ${
                  draftIcon === icon ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              onSave({
                name: draftName.trim() || list.name,
                color: draftColor,
                icon: draftIcon,
              })
            }
            className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
