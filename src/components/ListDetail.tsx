import { useEffect, useState } from 'react';
import { List, Task } from '../types';
import AddTaskInput from './AddTaskInput';
import TaskItem from './TaskItem';

type ListDetailProps = {
  list: List;
  onBack: () => void;
  onAddTask: (listId: string, text: string) => void;
  onDeleteTask: (listId: string, taskId: string) => void;
  onUpdateTask: (listId: string, taskId: string, text: string) => void;
  onCompleteTask: (listId: string, task: Task) => void;
  onRenameList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
};

export default function ListDetail({
  list,
  onBack,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onCompleteTask,
  onRenameList,
  onDeleteList,
}: ListDetailProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.name);

  useEffect(() => {
    setTitleDraft(list.name);
  }, [list.id, list.name]);

  const submitTitle = () => {
    onRenameList(list.id, titleDraft);
    setEditingTitle(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onBack} className="mb-3 text-sm font-medium text-sky-600">
            ‹ My Lists
          </button>
          {editingTitle ? (
            <input
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={submitTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitTitle();
                }
              }}
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-3xl font-semibold tracking-tight text-slate-900 shadow-card"
            />
          ) : (
            <button type="button" onClick={() => setEditingTitle(true)} className="text-left">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-slate-900">{list.name}</h1>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onDeleteList(list.id);
            onBack();
          }}
          className="rounded-full bg-white px-3 py-2 text-sm text-rose-500 shadow-card"
        >
          Delete
        </button>
      </header>

      <AddTaskInput onAddTask={(text) => onAddTask(list.id, text)} />

      <section className="rounded-[28px] bg-white p-2 shadow-card">
        {list.tasks.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">No active reminders</div>
        ) : (
          list.tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              isLast={index === list.tasks.length - 1}
              onDelete={() => onDeleteTask(list.id, task.id)}
              onUpdate={(text) => onUpdateTask(list.id, task.id, text)}
              onComplete={() => onCompleteTask(list.id, task)}
            />
          ))
        )}
      </section>
    </div>
  );
}
