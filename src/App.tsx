import { useEffect, useRef, useState } from 'react';
import MyLists from './components/MyLists';
import ListDetail from './components/ListDetail';
import Toast from './components/Toast';
import { List, PendingDeletion, Task } from './types';
import { createDefaultLists, createId, pickListStyle } from './utils';

const STORAGE_KEY = 'reminders-lite-data';
const TOAST_MS = 4000;
const COMPLETE_ANIMATION_MS = 180;

type ActiveToast = {
  id: string;
  message: string;
};

const loadLists = (): List[] => {
  if (typeof window === 'undefined') {
    return createDefaultLists();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultLists();
  }

  try {
    const parsed = JSON.parse(raw) as List[];
    if (!Array.isArray(parsed)) {
      return createDefaultLists();
    }
    return parsed;
  } catch {
    return createDefaultLists();
  }
};

export default function App() {
  const [lists, setLists] = useState<List[]>(loadLists);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;

  const scheduleToastExpiry = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setPendingDeletion(null);
      setToast(null);
      toastTimeoutRef.current = null;
    }, TOAST_MS);
  };

  const addList = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) => {
      const style = pickListStyle(current.length);
      return [
        ...current,
        {
          id: createId(),
          name: trimmed,
          color: style.color,
          icon: style.icon,
          tasks: [],
        },
      ];
    });
  };

  const renameList = (listId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) =>
      current.map((list) => (list.id === listId ? { ...list, name: trimmed } : list)),
    );
  };

  const deleteList = (listId: string) => {
    setLists((current) => current.filter((list) => list.id !== listId));
    setSelectedListId((current) => (current === listId ? null : current));
  };

  const addTask = (listId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: [...list.tasks, { id: createId(), text: trimmed }],
            }
          : list,
      ),
    );
  };

  const updateTask = (listId: string, taskId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) => (task.id === taskId ? { ...task, text: trimmed } : task)),
            }
          : list,
      ),
    );
  };

  const deleteTask = (listId: string, taskId: string) => {
    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) }
          : list,
      ),
    );
  };

  const completeTask = (listId: string, task: Task) => {
    const list = lists.find((entry) => entry.id === listId);
    if (!list) {
      return;
    }

    const index = list.tasks.findIndex((entry) => entry.id === task.id);
    if (index === -1) {
      return;
    }

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setTimeout(() => {
      setLists((current) =>
        current.map((entry) =>
          entry.id === listId
            ? { ...entry, tasks: entry.tasks.filter((item) => item.id !== task.id) }
            : entry,
        ),
      );
      setPendingDeletion({ task, listId, index });
      setToast({ id: createId(), message: `"${task.text}" completed` });
      scheduleToastExpiry();
    }, COMPLETE_ANIMATION_MS);
  };

  const undoCompletion = () => {
    if (!pendingDeletion) {
      return;
    }

    const { listId, task, index } = pendingDeletion;
    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) {
          return list;
        }

        const tasks = [...list.tasks];
        tasks.splice(index, 0, task);
        return { ...list, tasks };
      }),
    );

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setPendingDeletion(null);
    setToast(null);
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setPendingDeletion(null);
    setToast(null);
  };

  const addNewReminder = () => {
    const targetListId = lists[0]?.id;
    if (!targetListId) {
      return;
    }
    setSelectedListId(targetListId);
  };

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-6">
        {selectedList ? (
          <ListDetail
            list={selectedList}
            onBack={() => setSelectedListId(null)}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onCompleteTask={completeTask}
            onRenameList={renameList}
            onDeleteList={deleteList}
          />
        ) : (
          <MyLists
            lists={lists}
            onOpenList={setSelectedListId}
            onAddList={addList}
            onNewReminder={addNewReminder}
          />
        )}
      </main>

      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        actionLabel="Undo"
        onAction={undoCompletion}
        onClose={dismissToast}
      />
    </div>
  );
}
