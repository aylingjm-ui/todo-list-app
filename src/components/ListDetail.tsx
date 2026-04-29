import { useState } from 'react';
import { List, Task } from '../types';
import AddTaskInput from './AddTaskInput';
import ListEditSheet from './ListEditSheet';
import TaskItem from './TaskItem';
import { getListColorOption } from '../utils';

type ListDetailProps = {
  list: List;
  onBack: () => void;
  onAddTask: (listId: string, text: string) => void;
  onDeleteTask: (listId: string, task: Task) => void;
  onSwipeDeleteTask: (listId: string, task: Task) => void;
  onUpdateTask: (listId: string, taskId: string, text: string) => void;
  onCompleteTask: (listId: string, task: Task) => void;
  onUpdateList: (listId: string, updates: Pick<List, 'name' | 'color' | 'icon'>) => void;
  onDeleteList: (listId: string) => void;
};

export default function ListDetail({
  list,
  onBack,
  onAddTask,
  onDeleteTask,
  onSwipeDeleteTask,
  onUpdateTask,
  onCompleteTask,
  onUpdateList,
  onDeleteList,
}: ListDetailProps) {
  const [isEditingList, setIsEditingList] = useState(false);

  const color = getListColorOption(list.color);

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 pb-28">
        <header className="px-1">
          <button type="button" onClick={onBack} className="mb-4 text-sm font-medium text-sky-600">
            ‹ My Lists
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-white shadow-sm ${color.badgeClass}`}>
                {list.icon}
              </div>
              <h1 className="truncate text-3xl font-semibold tracking-tight text-slate-900">{list.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{list.tasks.length} active {list.tasks.length === 1 ? 'task' : 'tasks'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingList(true)}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-card"
            >
              Edit
            </button>
          </div>
        </header>

        <section className="rounded-[28px] bg-white p-2 shadow-card">
          {list.tasks.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No active reminders</div>
          ) : (
            list.tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                isLast={index === list.tasks.length - 1}
                onDelete={() => onDeleteTask(list.id, task)}
                onSwipeDelete={() => onSwipeDeleteTask(list.id, task)}
                onUpdate={(text) => onUpdateTask(list.id, task.id, text)}
                onComplete={() => onCompleteTask(list.id, task)}
              />
            ))
          )}
        </section>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md bg-gradient-to-t from-[#f3f4f6] via-[#f3f4f6] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5">
          <AddTaskInput
            onAddTask={(text) => onAddTask(list.id, text)}
            className="pointer-events-auto border border-white/80"
          />
        </div>
      </div>

      <ListEditSheet
        open={isEditingList}
        list={list}
        onClose={() => setIsEditingList(false)}
        onSave={(updates) => {
          onUpdateList(list.id, updates);
          setIsEditingList(false);
        }}
        onDelete={() => {
          onDeleteList(list.id);
          setIsEditingList(false);
          onBack();
        }}
      />
    </>
  );
}
