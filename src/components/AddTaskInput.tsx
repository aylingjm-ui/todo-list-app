import { FormEvent, useRef, useState } from 'react';

type AddTaskInputProps = {
  onAddTask: (text: string) => void;
  className?: string;
};

export default function AddTaskInput({ onAddTask, className = '' }: AddTaskInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    onAddTask(draft);
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`rounded-[24px] bg-white p-3 shadow-card ${className}`}>
      <label className="sr-only" htmlFor="task-input">
        Add reminder
      </label>
      <div className="flex items-center gap-3">
        <input
          id="task-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="New Reminder"
          enterKeyHint="done"
          autoCapitalize="sentences"
          autoCorrect="on"
          className="min-w-0 flex-1 border-none bg-transparent px-2 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition active:scale-[0.98]"
        >
          Add
        </button>
      </div>
    </form>
  );
}
