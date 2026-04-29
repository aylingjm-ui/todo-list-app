import { FormEvent, useEffect, useRef, useState } from 'react';
import { Task } from '../types';

type TaskItemProps = {
  task: Task;
  isLast: boolean;
  onDelete: () => void;
  onSwipeDelete: () => void;
  onUpdate: (text: string) => void;
  onComplete: () => void;
};

export default function TaskItem({
  task,
  isLast,
  onDelete,
  onSwipeDelete,
  onUpdate,
  onComplete,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    setDraft(task.text);
  }, [task.text]);

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    onUpdate(draft);
    setEditing(false);
  };

  const triggerAction = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    setOffsetX(direction === 'right' ? 72 : -72);
    window.setTimeout(() => {
      if (direction === 'right') {
        onComplete();
      } else {
        onSwipeDelete();
      }
    }, 180);
  };

  const resetSwipe = () => {
    setIsDragging(false);
    setOffsetX(0);
    startXRef.current = null;
    startYRef.current = null;
    pointerIdRef.current = null;
  };

  const handleComplete = () => {
    triggerAction('right');
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (editing || exitDirection) {
      return;
    }

    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null || startYRef.current === null || pointerIdRef.current !== event.pointerId || editing) {
      return;
    }

    const deltaX = event.clientX - startXRef.current;
    const deltaY = event.clientY - startYRef.current;

    if (!isDragging && Math.abs(deltaY) > Math.abs(deltaX)) {
      resetSwipe();
      return;
    }

    setIsDragging(true);
    setOffsetX(Math.max(-96, Math.min(96, deltaX)));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    if (offsetX > 72) {
      triggerAction('right');
      return;
    }

    if (offsetX < -72) {
      triggerAction('left');
      return;
    }

    resetSwipe();
  };

  const isSwipingRight = offsetX > 0;
  const backgroundClass = isSwipingRight ? 'bg-emerald-50' : offsetX < 0 ? 'bg-rose-50' : 'bg-white';
  const hintText = isSwipingRight ? 'Complete' : offsetX < 0 ? 'Delete' : '';

  return (
    <div className={`relative overflow-hidden ${isLast ? '' : 'border-b border-slate-100'}`}>
      <div className={`absolute inset-0 flex items-center justify-between px-5 text-xs font-semibold uppercase tracking-[0.18em] ${backgroundClass}`}>
        <span className={`transition ${offsetX > 8 ? 'opacity-100 text-emerald-600' : 'opacity-0'}`}>Complete</span>
        <span className={`transition ${offsetX < -8 ? 'opacity-100 text-rose-500' : 'opacity-0'}`}>Delete</span>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetSwipe}
        className="relative flex touch-pan-y items-center gap-3 bg-white px-4 py-4"
        style={{
          transform: `translateX(${offsetX}px)`,
          opacity: exitDirection ? 0 : 1,
          transition: isDragging ? 'none' : 'transform 180ms ease, opacity 180ms ease',
        }}
      >
        <button
          type="button"
          aria-label={`Complete ${task.text}`}
          onClick={handleComplete}
          className="h-6 w-6 shrink-0 rounded-full border border-slate-300 transition hover:border-sky-400"
        >
          <span className="sr-only">{hintText}</span>
        </button>

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
    </div>
  );
}
