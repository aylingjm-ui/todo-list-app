import { FormEvent, useState } from 'react';
import { Task } from '../types';

type TaskItemProps = {
  task: Task;
  isLast: boolean;
  onDelete: () => void;
  onUpdate: (text: string) => void;
  onComplete: () => void;
};

export default function TaskItem({
  task,
  isLast,
  onDelete,
  onUpdate,
  onComplete,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    onUpdate(draft);
    setEditing(false);
  };

  const handleComplete = () => {
    setIsCompleting(true);
    onComplete();
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-4 ${isLast ? '' : 'border-b border-slate-100'} ${
        isCompleting ? 'animate-task-fade' : ''
      }`}
    >
      <button
        type="button"
        aria-label={`Complete ${task.text}`}
        onClick={handleComplete}
        className="h-6 w-6 shrink-0 rounded-full border border-slate-300 transition hover:border-sky-400"
      />

      {editing ? (
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={handleSubmit}
            autoFocus
            className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-slate-800 focus:outline-none"
          />
          <button type="submit" className="text-sm font-medium text-sky-600">
            Save
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 text-left text-[15px] text-slate-800"
        >
          {task.text}
        </button>
      )}

      <button type="button" onClick={onDelete} className="text-sm text-slate-300 transition hover:text-rose-400">
        Delete
      </button>
    </div>
  );
}
