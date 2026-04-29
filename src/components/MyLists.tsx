import { FormEvent, useState } from 'react';
import { List } from '../types';
import ListItemRow from './ListItemRow';

type MyListsProps = {
  lists: List[];
  onOpenList: (listId: string) => void;
  onAddList: (name: string) => void;
  onNewReminder: () => void;
};

export default function MyLists({
  lists,
  onOpenList,
  onAddList,
  onNewReminder,
}: MyListsProps) {
  const [draftName, setDraftName] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddList(draftName);
    setDraftName('');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="px-1">
        <p className="text-sm font-medium text-slate-500">Lists</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">My Lists</h1>
      </header>

      <section className="rounded-[28px] bg-white p-2 shadow-card">
        {lists.map((list, index) => (
          <ListItemRow
            key={list.id}
            list={list}
            isLast={index === lists.length - 1}
            onOpen={() => onOpenList(list.id)}
          />
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onNewReminder}
          className="rounded-2xl bg-white px-4 py-4 text-left shadow-card transition active:scale-[0.98]"
        >
          <span className="block text-sm font-medium text-sky-600">New Reminder</span>
          <span className="mt-1 block text-sm text-slate-500">Quickly add to Reminders</span>
        </button>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-3 shadow-card">
          <label className="sr-only" htmlFor="new-list-name">
            Add List
          </label>
          <input
            id="new-list-name"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Add List"
            className="w-full border-none bg-transparent px-1 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
          >
            Create List
          </button>
        </form>
      </section>
    </div>
  );
}
